import { Context, Devvit, useAsync } from '@devvit/public-api';
import { Service } from '../service/Service.js';
import Settings from '../settings.json' with { type: "json" };
import { PostData } from '../types/PostData.js';
import { ScoreBoardEntry } from '../types/ScoreBoardEntry.js';
import { LeaderboardRow } from './LeaderboardRow.js';
import { LoadingState } from './LoadingState.js';

const availableHeight = 418;
const dividerHeight = 10;


const Layout = (props: { children: JSX.Element; onClose: () => void,onCreateMaze:()=>void,showClose : boolean }): JSX.Element => (
    <vstack width="100%" height="100%" >
      <spacer height="24px" />
      <hstack width="100%" alignment="middle">
        <spacer width="24px" />
        <text>
          Leaderboard
        </text>
        <spacer grow />
    {props.showClose ?  <button
           
           onPress={props.onClose}
         >Back</button> : 
         <button
           
         onPress={props.onCreateMaze}
       >Create New Maze</button>}
       
        <spacer width="20px" />
      </hstack>
      <spacer height="24px" />
  
      <hstack grow >
        <spacer width="24px" />
        <zstack alignment="start top" grow>
          {/* Shadow */}
          <vstack width="100%" height="100%">
            <spacer height="4px" />
            <hstack grow>
              <spacer width="4px" />
              <hstack grow backgroundColor={Settings.theme.shadow} />
            </hstack>
          </vstack>
  
          {/* Card */}
          <vstack width="100%" height="100%" >
            <hstack grow>
              <vstack grow backgroundColor="black">
                <spacer height="4px" />
                {props.children}
                <spacer height="4px" />
              </vstack>
              <spacer width="4px" />
            </hstack>
            <spacer height="4px" />
          </vstack>
        </zstack>
        <spacer width="20px" />
      </hstack>
  
      <spacer height="20px" />
    </vstack>
  );
export interface LeaderboardPageProps {
//    setPage: (page: Page) => void;
//    openUserPage: (username: string) => void | Promise<void>;
    //leaderboard: Leaderboard;
    postData: PostData;
    context: Context,
    username: string | null;
    rowCount: number ;
    showClose: boolean;
    global: boolean;
    onCreateMaze: ()=>void;
     onClose: () => void;
  }
  
  export const LeaderboardPage = (props: LeaderboardPageProps): JSX.Element => {
    const {    username  } = props;
    const service = new Service(props.context);
    const { data, loading } = useAsync<{
        leaderboard: ScoreBoardEntry[];
        user: {
          rank: number;
          score: number;
        };
      }>(async () => {
        try {
          const leaderboard=props.global ? await service.getScores({  maxLength:10})
          : await service.getLeaderboardState({postData: props.postData, username: props.username!})
          return {
            leaderboard: leaderboard,
            user: props.global ? await service.getUserScore(  props.username! ):
            await service.getPostUserScore({postData: props.postData,username: props.username!}),
          };
        } catch (error) {
          if (error) {
            console.error('Error loading leaderboard data', error);
          }
          return {
            leaderboard: [],
            user: { rank: -1, score: 0 },
          };
        }
      });

       
  if (data === null || loading) {
    return <LoadingState />;
}

// console.log("leaderboad data",data.leaderboard);
const isUserInTheTop = data.user.rank < props.rowCount;
const numberOfScoresToInclude = !loading && data?.user && isUserInTheTop ? 10 : 9;
const rowHeight : Devvit.Blocks.SizeString = isUserInTheTop
    ? `${(availableHeight - dividerHeight) / props.rowCount}px`
    : `${availableHeight / props.rowCount}px`;

    const leaderboardRows = data.leaderboard.map((row, index) => {
        if (index >= numberOfScoresToInclude) {
          return null;
        }
        return (
          <LeaderboardRow
            rank={row.rank}
            height={rowHeight}
            name={row.name}
            score={row.score}
            isCurrentUser={row.name===username}
            onPress={() => props.context.ui.navigateTo(`https://reddit.com/u/${row.name}`)}
          />
        );
      });
    
      const footer = (
        <>
          {/* Divider */}
          <vstack>
            <spacer height="4px" />
            <hstack>
              <spacer width="12px" />
              <hstack grow height="2px" backgroundColor={Settings.theme.shadow} />
              <spacer width="12px" />
            </hstack>
            <spacer height="4px" />
          </vstack>
    
          {/* User */}
          <LeaderboardRow
            rank={data.user.rank}
            height={rowHeight}
            name={props.username ?? 'Unknown'}
            score={data.user.score}
            onPress={() => props.context.ui.navigateTo(`https://reddit.com/u/${props.username}`)}
          />
        </>
      );
    
      return (
        <Layout onClose={props.onClose} onCreateMaze={props.onCreateMaze} showClose={props.showClose}>
          {leaderboardRows}
          {/* Append the user to the bottom if they are out of view */}
          {!isUserInTheTop && footer}
        </Layout>
      );
  };
  