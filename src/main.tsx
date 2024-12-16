import './jobs/postExpiration.js';
import './jobs/userLeveledUp.js';
// Learn more at developers.reddit.com/docs
import { Devvit, StateSetter, useState } from '@devvit/public-api';
import { Router } from './posts/Router.js';
import { installGame } from './actions/InstallGame.js';
import { newPinnedPost } from './actions/newPinnedPost.js';

Devvit.configure({
  redditAPI: true,
  redis: true,
  media: true,
});


/*
 * Custom Post
 */

Devvit.addCustomPostType({
  name: 'Mouse & Cheese',
  description: 'Use calculative guess to find the cheese!',
  height: 'tall',
  render: Router,
});


/*
 * Menu Actions
 */

// Subreddit
Devvit.addMenuItem(installGame); // Mod
Devvit.addMenuItem(newPinnedPost);

// Add a menu item to the subreddit menu for instantiating the new experience post
// Devvit.addMenuItem({
//   label: 'Add my post',
//   location: 'subreddit',
//   forUserType: 'moderator',
//   onPress: async (_event, context) => {
//     const { reddit, ui } = context;
//     const subreddit = await reddit.getCurrentSubreddit();
//     await reddit.submitPost({
//       title: 'My devvit post',
//       subredditName: subreddit.name,
//       // The preview appears while the post loads
//       preview: (
//         <vstack height="100%" width="100%" alignment="middle center">
//           <text size="large">Loading ...</text>
//         </vstack>
//       ),
//     });
//     ui.showToast({ text: 'Created post!' });
//   },
// });

// Devvit.addCustomPostType({
//   name: 'Name',
//   render: _context => {
//     return (
//       <blocks>
//         <vstack alignment="center middle" grow>
//           <Board cellRowCount={8} cellColumnCount={8} totalWidth={_context.dimensions?.width} totalHeight={_context.dimensions?.height} context={_context} />
//         </vstack>
//       </blocks>
//     )
//   }
// })

// type Point = {
//   x: number, y: number,
// }


// enum PointType{
//   Treasure,
//   StartPoint,
//   None
// }


// export const defaultPoint: Point = { x: -1, y: -1 };

// export const Board = ({ cellRowCount, cellColumnCount, totalWidth, totalHeight, context }: { cellRowCount: number, cellColumnCount: number, totalWidth: number | undefined, totalHeight: number | undefined, context: Devvit.Context }) => {

//   const [treasurePoint, setTreasurePoint] = useState<Point>(defaultPoint);
//   const [startPoint, setStartPoint] = useState<Point>(defaultPoint);
//   const [pointType,setPointType]=useState<PointType>(PointType.None);
//    const totalGridWidth = totalWidth ? totalWidth > 250 ? 250 : totalWidth : 250;
//   const totalGridHeight = totalHeight ? totalHeight > 250 ? 250 : totalHeight : 250;


//   console.log("totalSize", totalWidth)
//   const paddingValue = 1;
//   const rows: JSX.Element[] = [];

//   const totalRows = cellRowCount;
//   const totalColumns = cellColumnCount;
//   const cellWidth = totalGridWidth / cellColumnCount - paddingValue * 2;
//   const cellHeight = totalGridHeight / cellRowCount - paddingValue * 2;


//   //for(var i=0;i<totalRows;i++){
//   Array.from(Array(totalRows).keys()).map((i) => {
//     const columns: JSX.Element[] = [];
//     // for(var j=0;j<totalColumns;j++){
//     Array.from(Array(totalColumns).keys()).map((j) => {
//       let color = "white";
//       if (i === treasurePoint.x && j === treasurePoint.y)
//         color = "blue";
//       if (i === startPoint.x && j === startPoint.y)
//         color = "red";
//       columns.push(Cell(cellWidth, cellHeight, paddingValue, color, () => {
//         if(pointType===PointType.StartPoint){
//           setStartPoint(current => ({ ...current, x: i, y: j }))
//         }else if(pointType===PointType.Treasure){
//           setTreasurePoint(current => ({ ...current, x: i, y: j }))
//         }else{
//           context.ui.showToast({ text: 'Select start position or treasure position' });
//         }
        
//       }));
//     });
//     rows.push(<hstack width="100%" alignment="center">{columns}</hstack>)
//   });
//   //}
//   //Add legend
//   rows.push(Legend(setPointType))

//   return rows.length > 0 ? rows : <hstack />
// }



// export const Legend=(  setPointType: StateSetter<PointType>):JSX.Element=>{
  
// const treasurePositionJsx=Cell(20,20,1,"blue",()=>{setPointType(PointType.Treasure)});
// const startPositionJsx=Cell(20,20,1,"red",()=>{setPointType(PointType.StartPoint)});
// const jsx=<><hstack width="100%" alignment="center">{treasurePositionJsx}{startPositionJsx}</hstack></>
// return jsx;
// }

// export const Cell = (totalWidth: number, totalHeight: number, paddingValue: number, color: string, onPressHandler: Devvit.Blocks.OnPressEventHandler) => {
//   const height: Devvit.Blocks.SizeString = `${totalHeight}px`;
//   const width: Devvit.Blocks.SizeString = `${totalWidth}px`;
//   const padding: Devvit.Blocks.SizeString = `${paddingValue}px`;
//   return (
//     <>
//       <vstack height={height} width={padding} />
//       <vstack>
//         <hstack width={width} height={padding} />
//         <zstack>
//           <hstack
//             border={"thick"}
//             alignment={"middle center"}
//             cornerRadius={"small"}
//             width={width}
//             height={height}
//             backgroundColor={color}
//             onPress={onPressHandler}
//           />
//         </zstack>
//         <hstack width={width} height={padding} />
//       </vstack>
//       <vstack height={height} width={padding} />
//     </>
//   )
// };
export default Devvit