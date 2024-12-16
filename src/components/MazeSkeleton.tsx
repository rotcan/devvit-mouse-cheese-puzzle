import { Context, Devvit } from "@devvit/public-api";
import { Point } from "../types/GameTypes.js";

import Settings from "../settings.json"  with { type: "json" }
interface BoardProps {
    cellRowCount: number,
    cellColumnCount: number,
    context: Context
    startPoint?: Point,
    treasurePoint?: Point,
     editorMode: boolean,
    playerMode: boolean
  }
  const Board = (props: BoardProps): JSX.Element => {
    const totalWidth = props.context.dimensions?.width;
    const totalHeight = props.context.dimensions?.height;
  
     const totalGridWidth = totalWidth ? totalWidth > 250 ? 250 : totalWidth : 250;
    const totalGridHeight = totalHeight ? totalHeight > 250 ? 250 : totalHeight : 250;
  
  
    // console.log("totalWidth", totalWidth)
    const paddingValue = 1;
    const rows: JSX.Element[] = [];
  
    const totalRows = props.cellRowCount;
    const totalColumns = props.cellColumnCount;
    const cellWidth = totalGridWidth / props.cellColumnCount - paddingValue * 2;
    const cellHeight = totalGridHeight / props.cellRowCount - paddingValue * 2;
  
    
  
    //for(var i=0;i<totalRows;i++){
    Array.from(Array(totalRows).keys()).map((i) => {
      const columns: JSX.Element[] = [];
      // for(var j=0;j<totalColumns;j++){
      Array.from(Array(totalColumns).keys()).map((j) => {
        let color = "white";
        // if (props.treasurePoint && i === props.treasurePoint.x && j === props.treasurePoint.y)
        //   color = "blue";
        // if (props.startPoint && i === props.startPoint.x && j === props.startPoint.y)
        //   color = "red";
        if (props.startPoint && i === props.startPoint.x && j === props.startPoint.y)
          columns.push(Cell(cellWidth, cellHeight, paddingValue, color,Settings.images.mouse.image,+Settings.images.mouse.width, +Settings.images.mouse.height));
        else
        columns.push(Cell(cellWidth, cellHeight, paddingValue, color,undefined,0,0));
      });
      rows.push(<hstack width="100%" alignment="center">{columns}</hstack>)
    });
    //}
    
  
    return rows.length > 0 ? rows : <hstack />
  }
  
  interface MazeProps {
    startPoint?: Point;
    treasurePoint?: Point;
    context: Context;
     
    editorMode: boolean;
    playerMode: boolean;
  
  }

  export const MazeSkeleton = (props: MazeProps,): JSX.Element => {

    return (
      <>
        <Board {...props} cellColumnCount={Settings.columnCount} cellRowCount={Settings.rowCount} />
      </>
    )
  }
  

  
const Cell = (totalWidth: number, totalHeight: number, paddingValue: number, color: string,  image: string | undefined,
  imageWidth: number, imageHeight: number,
): JSX.Element => {
    const height: Devvit.Blocks.SizeString = `${totalHeight}px`;
    const width: Devvit.Blocks.SizeString = `${totalWidth}px`;
    const padding: Devvit.Blocks.SizeString = `${paddingValue}px`;
    return (
      <>
        <vstack height={height} width={padding}  />
        <vstack >
          <hstack width={width} height={padding}   />
          <zstack>
            <hstack
              border={"thick"}
              alignment={"middle center"}
              cornerRadius={"small"}
              width={width}
              height={height}
              backgroundColor={color}
              
            >
              {image && 
                <image
                url={image}
                width="95%"
                height="95%"
                imageHeight={imageHeight}
                imageWidth={imageWidth}
            />
              }
            </hstack>
          </zstack>
          <hstack width={width} height={padding}   />
        </vstack>
        <vstack height={height} width={padding} />
      </>
    )
  };