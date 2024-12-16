import { Context, useState } from "@devvit/public-api";
import { UserData } from "../types/UserData.js";
import { Devvit } from "@devvit/public-api";
import { Point, PointType } from "../types/GameTypes.js";
import { defaultPoint, MazeEditor } from "./MazeEditor.js";

interface EditorPageMazeStepProps {
    username: string | null;
    userData: UserData;
    context: Context;
    onNext: (startPoint: Point, treasurePoint: Point, moveCount: number) => void;
    onBack: ()=>void;
    rowCount: number,
    colCount: number,
    minMoveCount: number,
    maxMoveCount: number,
    moveCount: number,
    startPoint: Point,
    treasurePoint: Point,
}

export const EditorPageMazeStep = (
    props: EditorPageMazeStepProps,
): JSX.Element => {
    const [startPoint, setStartPoint] = useState<Point>(props.startPoint);
    const [treasurePoint, setTreasurePoint] = useState<Point>(props.treasurePoint);
    const [moveCount,setMoveCount]=useState<number>(props.moveCount)
    const setPointPosition=(pointType: PointType, position: Point)=>{
        if(pointType===PointType.StartPoint){
            setStartPoint(position);
        }else if(pointType===PointType.Treasure){
            setTreasurePoint(position);
        }else{
            props.context.ui.showToast({ text: 'Select start position or Cheese position' });
        }
    }

    const setMoveCountValue=(mc: number)=>{
        setMoveCount(mc);
    }
    return (
        <>
            <vstack width="100%" height="100%" alignment="center top" padding="large">
                {/* Header */}
                <hstack width="100%" alignment="middle">
                    <text>Maze Editor</text>
                    <spacer grow/>
                    <button onPress={() => { props.onNext(startPoint, treasurePoint,moveCount); }}>Confirm</button>
                     <button onPress={() => {  props.onBack()}}>Back</button>

                </hstack>
                 <MazeEditor {...props} startPoint={startPoint} treasurePoint={treasurePoint} setPointPosition={setPointPosition}
                editorMode={true} playerMode={false} setMoveCountValue={setMoveCountValue} maxMoveCount={props.maxMoveCount} minMoveCount={props.minMoveCount}/>
                
            </vstack>
        </>
    )
}