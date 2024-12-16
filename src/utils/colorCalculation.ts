import { Point } from "../types/GameTypes.js";
import Settings from "../settings.json" with {type:"json"};

export enum DistanceType{
    Near="near",
    Far="far",
    Equidistant="equidistant",
    Same="same"
}
 
export const getMoveText=(distanceType: DistanceType | null): string=>{
    if(distanceType===null){
        return "Moved to new position"
    }else{
        switch(distanceType){
            case DistanceType.Far: return "Mouse is farther from cheese as compared to last position"
           
            case DistanceType.Near:return  "Mouse is closer to cheese as compared to last position"
             
            case DistanceType.Equidistant:return  "Mouse is at same distance from cheese as compared to last position"
            
            case DistanceType.Same:return "Mouse reach the cheese!"
            
            
        }
    }
}

export const calculateGridColor=(rowCount: number, colCount: number, treasurePoint: Point, startPoint: Point, userPoints: Point[]):
 {data:string[],distanceType: DistanceType | undefined}=>{
    const farColor=Settings.fartherPointColor;
    const closeColor=Settings.closerPointColor;
    const eqColor=Settings.equiDistantColor;
    const neutralColor="white";
    let data:string[]=[];
    for(var i=0;i<rowCount;i++){
        for(var j=0;j<colCount;j++){
            const index=i*colCount+j;
            data[index]=neutralColor;
        }
    }
    let lastPoint=startPoint;
    let isSearchFinished=false;
    let finalDistanceType: DistanceType | undefined=undefined;
    for(var z=1;z<userPoints.length;z++){
        let currentPoint=userPoints[z];
        const distanceType=pointDistance(treasurePoint,lastPoint,currentPoint);
        finalDistanceType=distanceType;
        // console.log("distanceType",{distanceType,treasurePoint,lastPoint,currentPoint,userPoints: userPoints[z],z});
        if(isSearchFinished===true)
            break;
        if(distanceType===DistanceType.Same)
            isSearchFinished=true;
        let colorsChanged=0;
        for(var i=0;i<rowCount;i++){
            for(var j=0;j<colCount;j++){
                const index=i*colCount+j;
                if(distanceType===DistanceType.Same){
                    
                    if(i===currentPoint.x && j===currentPoint.y){
                        colorsChanged++;
                        data[index]=Settings.treasurePointColor;
                    }else{
                        colorsChanged++;
                        data[index]=farColor;
                    }
                    
                }else{
                    const pType=pointDistance({x:i,y:j},lastPoint,currentPoint);
                    if(distanceType === DistanceType.Equidistant){
                        if(data[index]===neutralColor){
                            if(pType===DistanceType.Equidistant ){
                                colorsChanged++;
                                data[index]=eqColor;
                            }else{
                                colorsChanged++;
                                data[index]=farColor
                            }
                        }else{
                            if(pType!==DistanceType.Equidistant  && data[index]!==farColor ){
                                colorsChanged++;
                                data[index]=farColor;
                            }
                            if(pType===DistanceType.Equidistant && data[index]!==farColor){
                                data[index]=eqColor;
                            }
                        }
                        
                    }else if(distanceType === DistanceType.Near){
                        if(data[index]===neutralColor){
                            if(pType!==DistanceType.Far  )
                                data[index]=closeColor;
                            else
                                data[index]=farColor;
                            colorsChanged++;
                        }else{
                            
                            if(pType===DistanceType.Far && data[index]!==farColor ){
                                colorsChanged++;
                                data[index]=farColor;
                            } 
                        }
                        
                    }else if(distanceType === DistanceType.Far){
                        if(data[index]===neutralColor){
                            if(pType!==DistanceType.Far)
                                data[index]=farColor;
                            else
                                data[index]=closeColor;
                            colorsChanged++;
                        }else{
                            if(pType!==DistanceType.Far && data[index]!==farColor ){
                                colorsChanged++;
                                data[index]=farColor;
                                
                            } 
                        }
                        
                    }
                }
                
                  
                
                
            }
        }
        lastPoint=currentPoint;
        // console.log("farColor count",data.filter((m)=>m===farColor).length)
        // console.log("neutral count",data.filter((m)=>m===neutralColor).length)
        // console.log("close count",data.filter((m)=>m===closeColor).length)
        // console.log("equi count",data.filter((m)=>m===eqColor).length)
        // console.log("colorsChanged",colorsChanged);
        
    }
    
    
    return {data,distanceType:finalDistanceType};
}

const sqDistance=(p1: Point,p2: Point):number=>{
    return (p1.x-p2.x)*(p1.x-p2.x) + (p1.y-p2.y)*(p1.y-p2.y) 
}

const pointDistance=(refPoint:Point,oldPoint: Point, newPoint: Point):DistanceType=>{
    // const d1=Math.abs(oldPoint.x-refPoint.x)+Math.abs(oldPoint.y-refPoint.y);
    // const d2=Math.abs(newPoint.x-refPoint.x)+Math.abs(newPoint.y-refPoint.y);
    const d1=sqDistance(oldPoint,refPoint);
    const d2=sqDistance(newPoint,refPoint);
    if(d2===0){
        return DistanceType.Same
    }else if (d2>d1){
        return DistanceType.Far
    }else if(d2<d1){
        return DistanceType.Near
    }
    return DistanceType.Equidistant;
}