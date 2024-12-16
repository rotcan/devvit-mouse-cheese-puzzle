import { RedditAPIClient, RedisClient, Scheduler, ZRangeOptions } from "@devvit/public-api";
import { GameSettings } from "../types/GameSettings.js";
import Settings from '../settings.json' with {type:"json"};
import { Leaderboard, MAX_LEADERBOARD_ROWS, MazePostData, PinnedPostData, PlayerPostData, PostData } from "../types/PostData.js";
import { UserData } from "../types/UserData.js";
import { ScoreBoardEntry } from "../types/ScoreBoardEntry.js";
import { getLevelByScore } from "../utils/progression.js";
import { Point } from "../types/GameTypes.js";

export class Service {
  readonly redis: RedisClient;
  readonly reddit?: RedditAPIClient;
  readonly scheduler?: Scheduler;

  constructor(context: { redis: RedisClient; reddit?: RedditAPIClient; scheduler?: Scheduler }) {
    this.redis = context.redis;
    this.reddit = context.reddit;
    this.scheduler = context.scheduler;
  }

  // Game settings
  getGameSettingsKey(): string {
    return 'game-settings';
  }

  async storeGameSettings(settings: { [field: string]: string }): Promise<void> {
    const key = this.getGameSettingsKey();
    await this.redis.hSet(key, settings);
  }

  async getGameSettings(): Promise<GameSettings> {
    const key = this.getGameSettingsKey();
    return (await this.redis.hGetAll(key)) as GameSettings;
  }
  readonly #postDataKey = (postId: string): string => `post:${postId}`;


  /*
   * Pinned Post
   */

  async savePinnedPost(postId: string): Promise<void> {
    const key = this.#postDataKey(postId);
    await this.redis.hSet(key, {
      postId: postId,
      postType: 'pinned',
    });
  }

  async getPinnedPost(postId: string): Promise<PinnedPostData> {
    const key = this.#postDataKey(postId);
    const postType = await this.redis.hGet(key, 'postType');
    return {
      postId: postId,
      postType: postType ?? 'pinned',
    };
  }



  async getPostType(postId: string): Promise<string> {
    const key = this.#postDataKey(postId);
    const postType = await this.redis.hGet(key, 'postType');
    const defaultPostType = 'maze';
    return postType ?? defaultPostType;
  }

  readonly #postUserGuessCounterKey = (postId: string) => `user-guess-counter:${postId}`;
  readonly #postCorrectGuessesKey = () => `guesses-correct`;

  /*
   * Submit Guess
   */

  async getCorrectAnswerForPost(postId: string): Promise<number | undefined> {
    const key = this.#postCorrectGuessesKey();
    const res = await this.redis.hGet(key, postId);
    return res ? +res : 0;
  }

  async setCorrectAnswerForPost(postId: string): Promise<number | undefined> {
    const key = this.#postCorrectGuessesKey();
    const res = await this.redis.hIncrBy(key, postId, 1);
    return res ? +res : 0;
  }

  // async submitGuess(event: {
  //   postData: MazePostData;
  //   username: string;
  //   guess: Point;
  // }): Promise<number> {
  //   if (!this.reddit || !this.scheduler) {
  //     console.error('Reddit API client or Scheduler not available in Service');
  //     return 0;
  //   }

  //   // Increment the counter for this guess
  //   const correctGuessCount = await this.getCorrectAnswerForPost(event.postData.postId);

  //   // Increment how many guesses the user has made for this post
  //   await this.redis.zIncrBy(
  //     this.#postUserGuessCounterKey(event.postData.postId),
  //     event.username,
  //     1
  //   );


  //   const isCorrect = event.postData.treasurePoint.x===event.guess.x && event.postData.treasurePoint.y===event.guess.y ;
  //   const isFirstSolve = isCorrect && correctGuessCount === 1;
  //   const userPoints = isCorrect
  //     ? isFirstSolve
  //       ? Settings.guesserRewardForSolve + Settings.guesserRewardForFirstSolve
  //       : Settings.guesserRewardForSolve
  //     : 0;


  //   if (isCorrect) {
  //     // Persist that the user has solved the post
  //     await this.redis.zAdd(this.#postSolvedKey(event.postData.postId), {
  //       member: event.username,
  //       score: Date.now(),
  //     });

  //     //Store correct guess count
  //     await this.setCorrectAnswerForPost(event.postData.postId);

  //     // Give points to drawer
  //     // if guess < 5 then give points to creator
  //     await this.incrementUserScore(
  //       event.postData.authorUsername,
  //       Settings.authorRewardForCorrectGuess
  //     );

  //     // Give points to guesser
  //     await this.incrementUserScore(event.username, userPoints);
  //   }

  //   // Leave a comment to give props to the first solver.
  //   // Delayed 5 minutes to reduce spoiling risk.
  //   if (isFirstSolve) {
  //     const in5Min = new Date(Date.now() + 5 * 60 * 1000);
  //     await this.scheduler.runJob({
  //       name: 'FIRST_SOLVER_COMMENT',
  //       data: {
  //         postId: event.postData.postId,
  //         username: event.username,
  //       },
  //       runAt: in5Min,
  //     });
  //   }

  //   return userPoints;
  // }

  readonly #postSolvedKey = (postId: string): string => `solved:${postId}`;
  readonly #leaderKey = (postId: string): string => `leaderboard:${postId}`;
  readonly #postCorrectSolvedKey = (postId: string): string => `correct:${postId}`;
  
  async saveScore(event: {
    postData: MazePostData;
    username: string;
    score: number;
    correct: boolean; 
  }) {
    if (!this.reddit || !this.scheduler) {
      console.error('Reddit API client or Scheduler not available in Service');
      return 0;
    }

    //Save Score to Post leaderboard
    const leaderboardKey = this.#leaderKey(event.postData.postId);
    void this.redis.zAdd(leaderboardKey, { member: event.username, score: event.score });

    await this.redis.zAdd(this.#postCorrectSolvedKey(event.postData.postId), {
      member: event.username,
      score: event.correct ? 2 : 1,
    });

    if (event.correct) {
      await this.redis.zAdd(this.#postSolvedKey(event.postData.postId), {
        member: event.username,
        score: Date.now(),
      });

      await this.incrementUserScore(
        event.username,
        event.score 
      );
      
      //Post comment
      try {
        await this.reddit.submitComment({
          id: event.postData.postId,
          text: `u/${event.username} solved the maze and scored ` + event.score + ` points`,
        });
      } catch (error) {
        console.error('Failed to submit comment:', error);
      }


    }else{
      await this.incrementUserScore(
        event.postData.authorUsername,
        Settings.authorRewardForFailure
      );

    }
    console.log("scoreSaved",event.score,event.correct);
  }


  async getLeaderboardState(
    event: {
      postData: PostData,
      username: string | undefined
    }
  ): Promise<ScoreBoardEntry[]> {

    const leaderboardKey = this.#leaderKey(event.postData.postId);
    const top9users = await this.redis.zRange(leaderboardKey, 0, MAX_LEADERBOARD_ROWS - 1, {
      reverse: true,
      by: 'rank',
    });
    const top9UsersWithRank = top9users.map((entry, index) => ({
      name: entry.member,
      score: entry.score,
      rank: index + 1,
    }));

    return top9UsersWithRank;

    // if (!username || !!top9UsersWithRank.find((entry) => entry.name === username)){
    //     return top9UsersWithRank;
    // }
    // TODO check current user's rank and add to the list if they are not in the leaderboard
    // return top9UsersWithRank[...]
  };

  async incrementUserScore(username: string, amount: number): Promise<number> {
    if (this.scheduler === undefined) {
      console.error('Scheduler not available in Service');
      return 0;
    }
    const key = this.scoresKey;
    const prevScore = (await this.redis.zScore(key, username)) ?? 0;
    const nextScore = await this.redis.zIncrBy(key, username, amount);
    // const prevLevel = getLevelByScore(prevScore);
    // const nextLevel = getLevelByScore(nextScore);
    // if (nextLevel.rank > prevLevel.rank) {
    //   await this.scheduler.runJob({
    //     name: 'USER_LEVEL_UP',
    //     data: {
    //       username,
    //       score: nextScore,
    //       prevLevel,
    //       nextLevel,
    //     },
    //     runAt: new Date(),
    //   });
    // }

    return nextScore;
  }


  readonly #postSkippedKey = (postId: string): string => `skipped:${postId}`;

  async getMazePost(postId: string): Promise<MazePostData> {
    const postData = await this.redis.hGetAll(this.#postDataKey(postId));
    const solvedCount = await this.redis.zCard(this.#postSolvedKey(postId));
    const skippedCount = await this.redis.zCard(this.#postSkippedKey(postId));
    return {
      postId: postId,
      authorUsername: postData.authorUsername,
      startPoint: JSON.parse(postData.startPoint),
      treasurePoint: JSON.parse(postData.treasurePoint),
      data: JSON.parse(postData.data),
      date: parseInt(postData.date),
      expired: JSON.parse(postData.expired),
      solves: solvedCount,
      skips: skippedCount,
      postType: postData.postType,
      rowCount: +postData.rowCount,
      colCount: +postData.colCount,
      moveCount: +postData.moveCount,
    };
  }


  readonly scoresKeyTag: string = 'default';
  readonly scoresKey: string = `maze:${this.scoresKeyTag}`;

  async getPostScores(event:{postData:PostData, maxLength:number}): Promise<ScoreBoardEntry[]> {
    const leaderboardKey = this.#leaderKey(event.postData.postId);
    const options: ZRangeOptions = { reverse: true, by: 'rank' };
    const top9users = await this.redis.zRange(leaderboardKey, 0, MAX_LEADERBOARD_ROWS - 1, options);
    const top9UsersWithRank = top9users.map((entry, index) => ({
      name: entry.member,
      score: entry.score,
      rank: index + 1,
    }));
    return top9UsersWithRank;
  }

  async getScores(event:{ maxLength:number}): Promise<ScoreBoardEntry[]> {
   const key = this.scoresKey;;
    const options: ZRangeOptions = { reverse: true, by: 'rank' };
    const top9users = await this.redis.zRange(key, 0, event.maxLength - 1, options);
    const top9UsersWithRank = top9users.map((entry, index) => ({
      name: entry.member,
      score: entry.score,
      rank: index + 1,
    }));
    return top9UsersWithRank;
  }

  
async getPostUserScore  (
  event:{
    postData: PostData,
    username: string
  }
): Promise<{
  rank: number;
  score: number;
}> {
  const leaderboardKey = this.#leaderKey(event.postData.postId);
  const userScore = (await this.redis.zScore(leaderboardKey, event.username)) ?? 0;
  const [rank, score] = await Promise.all([
    this.redis.zRank(leaderboardKey, event.username),
    // TODO: Remove .zScore when .zRank supports the WITHSCORE option
    this.redis.zScore(leaderboardKey, event.username),
  ]);
  return {
    rank: rank === undefined ? -1 : rank,
    score: score === undefined ? 0 : score,
  };
};

async getBestPostScore  (
  event:{
    postData: PostData,
    
  }
) {
  const leaderboardKey = this.#leaderKey(event.postData.postId);
  const topUser = await this.redis.zRange(leaderboardKey, 0, 1, {
    reverse: true,
    by: 'rank',
  });
   return topUser.length>0 ? topUser[0].score : 0;
};

  async getUserScore(username: string | null): Promise<{
    rank: number;
    score: number;
  }> {
    const defaultValue = { rank: -1, score: 0 };
    if (!username) return defaultValue;
    try {
      const [rank, score] = await Promise.all([
        this.redis.zRank(this.scoresKey, username),
        // TODO: Remove .zScore when .zRank supports the WITHSCORE option
        this.redis.zScore(this.scoresKey, username),
      ]);
      return {
        rank: rank === undefined ? -1 : rank,
        score: score === undefined ? 0 : score,
      };
    } catch (error) {
      if (error) {
        console.error('Error fetching user score board entry', error);
      }
      return defaultValue;
    }
  }


  readonly #userMoveDataKey = (username: string,) => `users-moves:${username} `;
  // readonly #userTimeDataKey = (username: string, ) => `users-time:${username} `;

  async saveAllUserMovesData(
    username: string,
    postId: string, playerData: PlayerPostData
  ): Promise<void> {
    const key = this.#userMoveDataKey(username);
    // const parsedData=await this.getUserMoveData(username,postId);
    // parsedData.push(point);
    const data = { points: playerData.points, time: playerData.time };
    await this.redis.hSet(key, { [postId]: JSON.stringify(data) });
  }


  async getUserMoveAndTimeData(username: string, postId: string): Promise<PlayerPostData> {
    const key = this.#userMoveDataKey(username);
    const data = await this.redis.hGet(key, postId);
    // console.log("getUserMoveData",{key,username,postId,data});
    return data ? JSON.parse(data) : { points: [], time: 0 }
  }
 
  /*
   * User Data and State Persistence
   */

  readonly #userDataKey = (username: string) => `users:${username}`;

  async saveUserData(
    username: string,
    data: { [field: string]: string | number | boolean }
  ): Promise<void> {
    const key = this.#userDataKey(username);
    const stringConfig = Object.fromEntries(
      Object.entries(data).map(([key, value]) => [key, String(value)])
    );
    await this.redis.hSet(key, stringConfig);
  }

  async getUser(username: string, postId: string): Promise<UserData> {
    const data = await this.redis.hGetAll(this.#userDataKey(username));
    const solved = !!(await this.redis.zScore(this.#postSolvedKey(postId), username));
    const skipped = !!(await this.redis.zScore(this.#postSkippedKey(postId), username));
    const correct = (await this.redis.zScore(this.#postCorrectSolvedKey(postId), username)) ?? 0;
    const user = await this.getUserScore(username);
    const level = getLevelByScore(user.score);
    const parsedData: UserData = {
      score: user.score,
      levelRank: data.levelRank ? parseInt(data.levelRank) : level.rank,
      levelName: data.levelName ?? level.name,
      solved,
      skipped,
      correct  
    };
    return parsedData;
  }


  async expirePost(postId: string): Promise<void> {
    const key = this.#postDataKey(postId);
    await this.redis.hSet(key, { expired: 'true' });
  }


  async submitPost(data: {
    postId: string;
    data: number[];
    authorUsername: string;
    subreddit: string;
    startPoint: Point,
    treasurePoint: Point,
    rowCount: number,
    colCount: number,
    moveCount: number,
    flairId: string;
  }): Promise<void> {
    if (!this.scheduler || !this.reddit) {
      console.error('submitDrawing: Scheduler/Reddit API client not available');
      return;
    }

    const key = this.#postDataKey(data.postId);

    // Save post object
    await this.redis.hSet(key, {
      postId: data.postId,
      data: JSON.stringify(data.data),
      authorUsername: data.authorUsername,
      date: Date.now().toString(),
      expired: 'false',
      postType: 'maze',
      startPoint: JSON.stringify(data.startPoint),
      treasurePoint: JSON.stringify(data.treasurePoint),
      playerPoints: JSON.stringify([]),
      rowCount: "" + data.rowCount,
      colCount: "" + data.colCount,
      moveCount: "" + data.moveCount,
    });

    // Save the post to the user's games

    // Schedule post expiration
    this.scheduler.runJob({
      name: 'PostExpiration',
      data: {
        postId: data.postId,
        answer: JSON.stringify(data.treasurePoint),
      },
      runAt: new Date(Date.now() + Settings.postLiveSpan),
    });

    // Give points to the user for posting
    this.incrementUserScore(data.authorUsername, Settings.authorRewardForSubmit);

    this.reddit.setPostFlair({
      subredditName: data.subreddit,
      postId: data.postId,
      flairTemplateId: data.flairId,
    });

  }
}