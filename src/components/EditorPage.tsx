import { GameSettings } from "../types/GameSettings.js";
import { Point } from "../types/GameTypes.js";
import { UserData } from "../types/UserData.js";
import { Context, Devvit, useState } from "@devvit/public-api";
import { defaultPoint } from "./MazeEditor.js";
import { EditorPageMazeStep } from "./EditorPageMazeStep.js";
import { EditorPageReviewStep } from "./EditorPageReviewStep.js";
import Settings from "../settings.json"  with { type: "json" };

interface EditorPageProps {
    username: string | null;
    gameSettings: GameSettings;
    userData: UserData;
    onCancel: () => void;
    context: Context;
}

export const EditorPage = (props: EditorPageProps,
): JSX.Element => {
const defaultStep = 'editor';
  const [currentStep, setCurrentStep] = useState<string>(defaultStep);
  const [startPoint,setStartPoint]=useState<Point>(defaultPoint);
  const [treasurePoint,setTreasurePoint]=useState<Point>(defaultPoint);
  const minMoveCount=8;
  const maxMoveCount=10;
  const [moveCount,setMoveCount]=useState<number>(maxMoveCount);
  //Todo based on level change row/col size
  const rowCount=Settings.rowCount;
  const colCount=Settings.columnCount
  const steps: Record<string, JSX.Element> = {
     
    'editor': (
      <EditorPageMazeStep
        {...props}
        colCount={colCount}
        rowCount={rowCount}
        onNext={(startPoint: Point, treasurePoint: Point, mc: number ) => {
          if( treasurePoint.x ===-1){
            props.context.ui.showToast("Please set treasure location point in grid");
            return;
          }
          if(startPoint.x===-1){
            props.context.ui.showToast("Please set player start point in grid");
            return;
          }
          if(mc===undefined){
            props.context.ui.showToast("Please set move count");
            return;
          }
            setStartPoint(startPoint);
            setTreasurePoint(treasurePoint);
            setMoveCount(mc);
            setCurrentStep('review');
        }}
        maxMoveCount={maxMoveCount}
        minMoveCount={minMoveCount}
        moveCount={moveCount}
        onBack={props.onCancel}
        startPoint={startPoint}
        treasurePoint={treasurePoint}
      />
    ),
    
    'review': (
      <EditorPageReviewStep
        {...props}
        startPoint={startPoint}
        treasurePoint={treasurePoint}
        colCount={colCount}
        rowCount={rowCount}
        onCancel={() => {
          props.onCancel();
        }}
        onBack={()=>{
          setCurrentStep('editor');
        }}
        moveCount={moveCount}
      />
    ),
  };

  return (
    <vstack width="100%" height="100%">
      {steps[currentStep] || <text>Error: Step not found</text>}
    </vstack>
  );
}