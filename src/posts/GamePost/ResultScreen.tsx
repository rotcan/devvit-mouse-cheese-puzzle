import { Context, Devvit, useAsync, useState } from '@devvit/public-api'
import { MazePostData } from '../../types/PostData.js';
import { LeaderboardPage } from '../../components/LeaderboardPage.js';
import { Service } from '../../service/Service.js';
import { LoadingState } from '../../components/LoadingState.js';

interface ResultProps {
    postData: MazePostData;
    context: Context,
    username: string  | null,
    onNewMaze: () => void,
    onLeaderBoard: ()=>void,
    points: number,
    bestScore: number,
    isAttempted: boolean;
}
export const ResultsScreen = (props: ResultProps): JSX.Element => {
 const service = new Service(props.context);

 const { data, loading: loading } = useAsync<{ bestScore: number,userScore:number }>(async () => {
    const userScore=props.postData.authorUsername === props.username?
    (await service.getUserScore( props.username!)).score:
    (await service.getPostUserScore({postData:props.postData, username: props.username!})).score;
    const bestScore=await service.getBestPostScore({postData:props.postData});
     
    // console.log("bestScore",bestScore,userScore);
    return {userScore,bestScore}
 });
 
 if (data === null || loading) {
      return <LoadingState />;
  }
  const [playerScore,setPlayerScore]=useState<number>(data.userScore ?? props.points);
  const currentPlayerScore= data.userScore > 0 ? data.userScore : props.points;
  const bestScore=props.postData.authorUsername === props.username ? data.bestScore : data.bestScore > currentPlayerScore ? data.bestScore: currentPlayerScore;
  const jsx=():JSX.Element=>{
    if(props.postData.authorUsername === props.username){
        return (<text>Your total score: {playerScore}</text>)
    }
    if(playerScore>0 || props.isAttempted )
        return (<text>Your score for this game: {playerScore>0 ? playerScore : props.points}</text>)
    return (<text>Game Ended.</text>)
  }

    return (
        <vstack width="100%" height="100%" alignment="center top" padding="large">
            
            <hstack gap="medium" alignment="center middle">
                <text>Maze  {`By u/${props.postData.authorUsername}`}</text>
            </hstack>
            {/* List */}
            <hstack width="100%" grow>
                <spacer width="24px" />
                <vstack grow gap="small">
                    {jsx()}
                    <text>Best score for this game: {bestScore}</text>
                </vstack>
                <spacer width="24px" />
            </hstack>
            <spacer height="24px" />

            <hstack width="100%" alignment='center' grow>
            <button onPress={() => props.onNewMaze()}>Create New Maze</button>
            <spacer size='small'/>
            <button onPress={() => props.onLeaderBoard()}>Leaderboard</button>
            </hstack>
        </vstack>)
}