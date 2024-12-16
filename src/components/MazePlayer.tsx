import { Context, Devvit, StateSetter, useState } from "@devvit/public-api";
import { Point, PointType } from "../types/GameTypes.js";
import { Cell } from "./Cell.js";
import Settings from "../settings.json" with { type: "json" }
import { Legend } from "./Legend.js";
import { CellImage } from "./CellImage.js";

 
interface BoardProps {
  startPoint?: Point;
  treasurePoint?: Point;
  context: Context;
  
  setPointPosition: (pointType: PointType, pointPosition: Point)=>void;
  editorMode: boolean;
  playerMode: boolean;
  rowCount: number;
  colCount: number;
  currentPoint: Point,
  newPoint: Point,
  gridColors: string[],
}
const Board = (props: BoardProps): JSX.Element => {
  const totalWidth = props.context.dimensions?.width;
  const totalHeight = props.context.dimensions?.height;

  // const [treasurePoint, setTreasurePoint] = useState<Point>(defaultPoint);
  // const [startPoint, setStartPoint] = useState<Point>(startPointValue ?? defaultPoint);
  const [pointType, setPointType] = useState<PointType>(PointType.StartPoint);
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
    if(props.playerMode && pointType===PointType.StartPoint){
      props.setPointPosition(pointType,{x:i,y:j} as Point)
    }
  }
  // console.log("MazePlayerBoard props.gridColors",props.gridColors.length);
  //for(var i=0;i<totalRows;i++){
  Array.from(Array(totalRows).keys()).map((i) => {
    const columns: JSX.Element[] = [];
    // for(var j=0;j<totalColumns;j++){
    Array.from(Array(totalColumns).keys()).map((j) => {
      const index=i*totalColumns+j;
      let color = props.gridColors[index];
      
      // if (props.currentPoint && i === props.currentPoint.x && j === props.currentPoint.y)
      //   color = Settings.playerPointColor;
      // if(props.newPoint && i===props.newPoint.x && props.newPoint.y===j){
      //   color = Settings.newPlayerPointColor;
      // }
      // // console.log("color",color);
      // columns.push(Cell(cellWidth, cellHeight, paddingValue, color, () => {
      //   setPointLocation(pointType,i,j);
      // }));
      if (props.currentPoint && i === props.currentPoint.x && j === props.currentPoint.y){
        columns.push(CellImage(cellWidth, cellHeight, paddingValue, color,Settings.images.mouse.image,+Settings.images.mouse.width, +Settings.images.mouse.height, () => {
          setPointLocation(pointType,i,j);
        },false));
      }else  if (props.newPoint && i === props.newPoint.x && j === props.newPoint.y){
        columns.push(CellImage(cellWidth, cellHeight, paddingValue, color,Settings.images.mouse_active.image,+Settings.images.mouse_active.width,
           +Settings.images.mouse_active.height, () => {
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
  }

  return rows.length > 0 ? rows : <hstack />
}
 

interface MazeProps {
  startPoint?: Point;
  treasurePoint?: Point;
  context: Context;
  
  setPointPosition: (pointType: PointType, pointPosition: Point)=>void;
  editorMode: boolean;
  playerMode: boolean;
  rowCount: number;
  colCount: number;
  currentPoint: Point,
  newPoint: Point,
  gridColors: string[],

}
export const MazePlayer = (props: MazeProps,): JSX.Element => {

  return (
    <>
      <Board {...props}   />
    </>
  )
}
