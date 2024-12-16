export const calculateScore=({pointCount,time}:{pointCount: number, time: number})=>{
    const points=Math.max(0,pointCount-1);
    const score = Math.max(0, 1000 - points*50 - time);
    return score;
}