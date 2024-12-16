import { Context, Devvit, useAsync, useInterval, useState } from "@devvit/public-api";
import { GameSettings } from "../../types/GameSettings.js";
import { MazePostData } from "../../types/PostData.js";
import { UserData } from "../../types/UserData.js";
import { Service } from "../../service/Service.js";
import { Point } from "../../types/GameTypes.js";
import { PlayScreen } from "./PlayScreen.js";
import { LoadingState } from "../../components/LoadingState.js";
import { calculateGridColor, DistanceType, getMoveText } from "../../utils/colorCalculation.js";
import { ResultsScreen } from "./ResultScreen.js";
import { EditorPage } from "../../components/EditorPage.js";
import { calculateScore } from "../../utils/calculateScore.js";
import { LeaderboardPage } from "../../components/LeaderboardPage.js";
import { LandingScreen } from "./LandingScreen.js";

interface GamePostProps {
  postData: MazePostData;
  userData: UserData;
  username: string | null;
  gameSettings: GameSettings;
  context: Context,

}

enum GameSteps{
  Start="start",
  Prompt="prompt",
  Result="result",
  Editor="editor",
  Leaderboard="leaderboard",
}

export const GamePost = (props: GamePostProps): JSX.Element => {
  const service = new Service(props.context);

  const isAuthor = props.postData.authorUsername === props.username;// false;//
  const isExpired = props.postData.expired;
  const isSolved = !!props.userData.solved;
  const isSkipped = !!props.userData.skipped;
  const isAttempted = props.userData.correct >0 ? true : false;

  
  
  const { data, loading: loading } = useAsync<{ points: Point[],time : number, colors: string[], startPoint: Point, bestScore: number,userScore:number,distanceType: DistanceType | null }>(async () => {
      const userData = await service.getUserMoveAndTimeData(props.username!, props.postData.postId);
      const userScore=await service.getPostUserScore({postData:props.postData, username: props.username!});
      const points=userData.points;
      const {data:gridColors, distanceType} = calculateGridColor(props.postData.rowCount, props.postData.colCount, props.postData.treasurePoint,
          props.postData.startPoint, [props.postData.startPoint, ...points]);
 
      const point=points.length>0 ? points[points.length-1] : props.postData.startPoint;

      return { points, colors: gridColors, startPoint: point,time: userData.time ?? 0 , bestScore: 0, userScore: userScore.score,distanceType: distanceType ?? null };
  });
  
   
  if (data === null || loading) {
      return <LoadingState />;
  }
  const stage=isAuthor || isExpired || isSolved || isSkipped || isAttempted ;
  const [currentStep, setCurrentStep] = useState<GameSteps>(
    stage? GameSteps.Result : data.points.length>0 ? GameSteps.Prompt : GameSteps.Start
  );
  const [timer, setTimer] = useState(data.time);
  const [lastDistanceType,setLastDistanceType]=useState<DistanceType | null>(data.distanceType);
  const [pointsEarned, setPointsEarned] = useState(data.userScore);
  const [mazeSolved,setMazeSolved]=useState<boolean>(false);
  const [isMazeAttemped,setIsMazeAttempted]=useState<boolean>(isAttempted);

  const updateInterval = useInterval(() => {
    setTimer((timer) => timer + 1);
  }, 1000);
  
  if(currentStep===GameSteps.Prompt && props.username !== null)
    updateInterval.start();
  const [currentPosition,setCurrentPosition]=useState<Point>(data.startPoint);
 
  const gridColors = data.colors;
  const points = data.points;

  const [currentGridColors, setCurrentGridColors] = useState<string[]>(gridColors);
  const [userPoints, setUserPoints] = useState<Point[]>(points);
   
  const { data: _d, loading: _l, error: _e } = useAsync(
      async () => {
    
          // console.log("saved to redis");
          await service.saveAllUserMovesData(props.username!, props.postData.postId, {points: userPoints,time: timer} );
          return userPoints.length;
      },
      { depends: [userPoints] }
  );

  const {} = useAsync(
    async()=>{
      if(currentPosition.x===props.postData.treasurePoint.x && currentPosition.y===props.postData.treasurePoint.y && isAttempted ===false){
        await service.saveScore({correct:mazeSolved,postData: props.postData, score: pointsEarned, username: props.username!});
      }
      return 0;
    },
    {depends: [pointsEarned]}
  )
  
  function updatePosition(position: Point) {
      if(position.x===currentPosition.x && position.y===currentPosition.y){
          props.context.ui.showToast('Cannot move to same position');
          return;
      }
      const p=userPoints;
      p.push(position);
      setUserPoints(p);
      // await service.saveUserMoveData(props.username!, props.postData.postId, position);
      const {data:gridColors,distanceType} = calculateGridColor(props.postData.rowCount, props.postData.colCount, props.postData.treasurePoint, props.postData.startPoint,
          [props.postData.startPoint, ...p]);
      setCurrentGridColors(gridColors);
      setLastDistanceType(distanceType ?? null);
      setCurrentPosition(position);
      if(position.x===props.postData.treasurePoint.x && position.y===props.postData.treasurePoint.y){
        calculateEnd(true);
        
       
      }else{
        const txt=getMoveText(distanceType ?? null);
        props.context.ui.showToast(txt);
      }
      if(p.length===props.postData.moveCount){
        calculateEnd(false);
      }
  }

  function calculateEnd(solved: boolean){
    setMazeSolved(solved);
    
    const score=calculateScore({pointCount: userPoints.length,time: timer});
    props.context.ui.showToast('Congratulations!! Your score = '+score);
    //console.log("calculateEnd",score)
    onStep(GameSteps.Result,score)
  }

  function onStep(step: GameSteps, points: number){
    setPointsEarned(points)
    setIsMazeAttempted(true);
    setCurrentStep(step);
  }

  function onLeave() {
    props.context.ui.showToast('Moved to new position');
  }

  // Steps map
  const steps: Record<GameSteps, JSX.Element> = {
    [GameSteps.Start]:(
      <LandingScreen {...props} onNext={()=>{setCurrentStep(GameSteps.Prompt)}} onShowLeaderboard={()=>{setCurrentStep(GameSteps.Leaderboard)}}/>
    ),
    [GameSteps.Prompt]: (
      <PlayScreen {...props} onLeave={onLeave} 
      //setPosition={setPosition} currentPosition={userPoints.length > 0 ? userPoints[userPoints.length - 1] : props.postData.startPoint}
         currentPoint={currentPosition} updatePosition={updatePosition}  time={timer} playerMoves={userPoints.length}
        rowCount={props.postData.rowCount} colCount={props.postData.colCount} currentGridColors={currentGridColors} />
    ),
    [GameSteps.Result]: (
      <ResultsScreen
        {...props}
        isAttempted={isMazeAttemped}
        points={pointsEarned}
        bestScore={data.bestScore < pointsEarned ? pointsEarned : data.bestScore}
        onNewMaze={() => setCurrentStep(GameSteps.Editor)}
        onLeaderBoard={()=>setCurrentStep(GameSteps.Leaderboard)}
      />
      //
    ),
    [GameSteps.Leaderboard]:(
      <LeaderboardPage {...props} onClose={()=>{
        const step=stage? GameSteps.Result : userPoints.length>0 ? GameSteps.Prompt : GameSteps.Start;
        setCurrentStep(step);
      }} rowCount={10} onCreateMaze={()=>{setCurrentStep(GameSteps.Editor)}} showClose={userPoints.length===0? true: false} global={false}/>
    ),
    [GameSteps.Editor]:(
      <EditorPage {...props} onCancel={()=>{setCurrentStep(GameSteps.Result)}} />
    )
    // Editor: <EditorPage {...props} onCancel={() => setCurrentStep('Results')} />,
  };


  return (
    <vstack width="100%" height="100%">
      {steps[currentStep] || <text>Error: Step not found</text>}
    </vstack>
  )
}