import { Context, Devvit, StateSetter, useState } from "@devvit/public-api";
import { Point, PointType } from "../types/GameTypes.js";
import { Cell } from "./Cell.js";
import Settings from "../settings.json"  with { type: "json" }
import { Legend } from "./Legend.js";
import { MoveCountList } from "./MoveCountList.js";
import { CellImage } from "./CellImage.js";

export const defaultPoint: Point = { x: -1, y: -1 };

interface BoardProps {
  rowCount: number,
  colCount: number,
  context: Context
  startPoint?: Point,
  treasurePoint?: Point,
  
  minMoveCount: number,
  maxMoveCount: number,
  moveCount: number,
  // setTreasurePoint?: StateSetter<Point>,
  // setStartPoint?: StateSetter<Point>
  setPointPosition: (pointType: PointType, pointPosition: Point)=>void;
  editorMode: boolean,
  playerMode: boolean,
  setMoveCountValue: (mc: number)=>void;
}
const Board = (props: BoardProps): JSX.Element => {
  const totalWidth = props.context.dimensions?.width;
  const totalHeight = props.context.dimensions?.height;

  // const [treasurePoint, setTreasurePoint] = useState<Point>(defaultPoint);
  // const [startPoint, setStartPoint] = useState<Point>(startPointValue ?? defaultPoint);
  const [pointType, setPointType] = useState<PointType>(PointType.Treasure);
  const totalGridWidth = totalWidth ? totalWidth > 250 ? 250 : totalWidth : 250;
  const totalGridHeight = totalHeight ? totalHeight > 250 ? 250 : totalHeight : 250;


  // console.log("totalWidth", totalWidth)
  const paddingValue = 1;
  const rows: JSX.Element[] = [];

  const totalRows = props.rowCount;
  const totalColumns = props.colCount;
  const cellWidth = totalGridWidth / props.colCount - paddingValue * 2;
  const cellHeight = totalGridHeight / props.rowCount - paddingValue * 2;

  const setPointLocation=(pointType: PointType, i:number,j:number)=>{
    if(props.editorMode){
      props.setPointPosition(pointType,{x:i,y:j} as Point);
      
    }
  }

  //for(var i=0;i<totalRows;i++){
  Array.from(Array(totalRows).keys()).map((i) => {
    const columns: JSX.Element[] = [];
    // for(var j=0;j<totalColumns;j++){
    Array.from(Array(totalColumns).keys()).map((j) => {
      let color = "white";
      // if (props.treasurePoint && i === props.treasurePoint.x && j === props.treasurePoint.y)
      //   color = Settings.treasurePointColor;
      // if (props.startPoint && i === props.startPoint.x && j === props.startPoint.y)
      //   color = Settings.playerPointColor;
      if (props.treasurePoint && i === props.treasurePoint.x && j === props.treasurePoint.y){
        columns.push(CellImage(cellWidth, cellHeight, paddingValue, color,Settings.images.cheese.image,+20, +16, () => {
          setPointLocation(pointType,i,j);
        },false));
      }else  if (props.startPoint && i === props.startPoint.x && j === props.startPoint.y){
        columns.push(CellImage(cellWidth, cellHeight, paddingValue, color,Settings.images.mouse.image,+20, +19, () => {
          setPointLocation(pointType,i,j);
        },false));
      }else{
        columns.push(Cell(cellWidth, cellHeight, paddingValue, color, () => {
          setPointLocation(pointType,i,j);
        }));
      }
      
    });
    rows.push(<hstack width="100%" alignment="center">{columns}</hstack>)
  });
  //}
  if(props.editorMode===true){
    //Add legend
    rows.push(Legend(setPointType,pointType))
    rows.push(MoveCountList(props.setMoveCountValue,props.minMoveCount,props.maxMoveCount,props.moveCount))
  }

  return rows.length > 0 ? rows : <hstack />
}

interface MazeProps {
  startPoint?: Point;
  treasurePoint?: Point;
  context: Context;
  rowCount: number,
  colCount: number,
  setPointPosition: (pointType: PointType, pointPosition: Point)=>void;
  editorMode: boolean;
  playerMode: boolean;
  minMoveCount: number,
  moveCount: number,
  maxMoveCount: number,
  setMoveCountValue: (mc: number)=>void;
}
export const MazeEditor = (props: MazeProps,): JSX.Element => {

  return (
    <>
      <Board {...props}   />
    </>
  )
}
