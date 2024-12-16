import { Devvit, useState } from "@devvit/public-api";
import { Cell } from "./Cell.js";

export const MoveCountList = (setMoveCountValue: (val: number) => void, minCount: number,maxCount: number,selectedValue: number): JSX.Element => {
    const [selected,setSelected]=useState<number>(selectedValue);
    const jsx: JSX.Element[]= [];
    // console.log("MoveCountList",maxCount-minCount);
    Array.from(Array(maxCount-minCount+1)).map((_,index)=>minCount+index).map((m)=>{
        // console.log("moevcount",m);
        jsx.push( Cell(20, 20, 1, "white", () => { setSelected(m); setMoveCountValue(m) },""+m, m===selected))
    })
    return (
        <><hstack height={"2px"} width="100%"></hstack>
            <hstack width="40%" minWidth="200px" alignment="center">
                <text>Move Counts:</text>
                <spacer grow />
                {jsx}
            </hstack>
            <hstack height={"2px"} width="100%"></hstack>
        </>
    );
}
