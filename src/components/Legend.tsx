import { Devvit, StateSetter } from "@devvit/public-api";
import { PointType } from "../types/GameTypes.js";
 
import Settings from "../settings.json" with { type: "json" };
import { CellImage } from "./CellImage.js";

export const Legend=(  setPointType: StateSetter<PointType>,currentPointType: PointType):JSX.Element=>{
    const baseColor="white";
    const treasurePositionJsx=CellImage(20,20,1,baseColor,Settings.images.cheese.image,+20, +17,
        ()=>{setPointType(PointType.Treasure)},currentPointType===PointType.Treasure ? true: false);
    const startPositionJsx=CellImage(20,20,1,baseColor,Settings.images.mouse.image,+19, +20,
        ()=>{setPointType(PointType.StartPoint)},currentPointType===PointType.StartPoint ? true: false);
    const jsx=<>
    <hstack height={"2px"} width="100%"></hstack>
    <hstack width="100%" alignment="center"><text>Cheese Positon:   </text>{treasurePositionJsx} <spacer size="small" /><text>Start Positon:   </text>{startPositionJsx}</hstack>
    <hstack height={"2px"} width="100%"></hstack>
    </>
    
    return jsx;
    }
    