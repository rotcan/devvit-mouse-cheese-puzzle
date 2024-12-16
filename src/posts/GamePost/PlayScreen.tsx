import { Context, Devvit, useForm, useState } from "@devvit/public-api";

import { MazePlayer } from "../../components/MazePlayer.js";
import { Point, PointType } from "../../types/GameTypes.js";
import { MazePostData } from "../../types/PostData.js";
import { Cell } from "../../components/Cell.js";
import Settings from "../../settings.json" with {type: "json"};

interface PlayerScreenProps {
    context: Context,
    postData: MazePostData;
    username: string | null;
    updatePosition: (point: Point) => void;
    currentPoint: Point,
    onLeave: () => void;
    // currentPosition: Point,
    currentGridColors: string[],
    rowCount: number,
    colCount: number,
    time: number,
    playerMoves: number,

}
export const PlayScreen = (props: PlayerScreenProps): JSX.Element => {

    const [newPosition, setNewPosition] = useState<Point>(props.currentPoint);
    const setPointPosition = (pointType: PointType, position: Point) => {
        if (pointType === PointType.StartPoint) {
            setNewPosition(position);
        } else {
            props.context.ui.showToast('Select position for player');
        }
    }

    const cancelConfirmationForm = useForm(
        {
            title: 'Are you sure?',
            description:
                "Canceling your maze means it won't be saved or shared, so no points earned this time. But don't worry, you can create more mazes whenever you like!",
            acceptLabel: 'Cancel Maze',
            cancelLabel: 'Back',
            fields: [],
        },
        async () => {
            props.onLeave();
        }
    );

    const confirmationForm = useForm(
        {
            title: 'Are you sure?',
            description:
                "You wish to move to this position!",
            acceptLabel: 'Accept',
            cancelLabel: 'Back',
            fields: [],
        },
        async () => {
            //props.context.ui.showToast('Select position for player');
            //props.setPosition(newPosition);
            props.updatePosition(newPosition)
        }
    )




    return (<>
        <vstack width="100%" height="100%" alignment="center top" padding="large">
            {/* Header */}
            <hstack width="100%" alignment="middle">
                <text>Mouse & Cheese!</text>
                <spacer grow />
                <text>Moves : {props.playerMoves}/{props.postData.moveCount}</text>
                <spacer size="small" />
                <text>Time Spent: {props.time} s</text>

            </hstack>
            <MazePlayer {...props} setPointPosition={setPointPosition} currentPoint={props.currentPoint}
                editorMode={false} playerMode={true} newPoint={newPosition} gridColors={props.currentGridColors} />
            {/* <hstack><text>Chances: {userPoints.length}</text></hstack> */}
            {/* {createBoard()} */}
            
             
                <hstack width="100%" alignment="center" height="25px">
                    {Cell(20, 20, 1, Settings.fartherPointColor, () => { })}<text alignment="middle"> : Mice is farther from cheese compared to last position</text></hstack>
                <hstack width="100%" alignment="center" height="25px">
                    {Cell(20, 20, 1, Settings.closerPointColor, () => { })}<text alignment="middle"> : Mice is closer to cheese compared to last position</text></hstack>
                <hstack width="100%" alignment="center" height="25px">
                    {Cell(20, 20, 1, Settings.equiDistantColor, () => { })}<text alignment="middle"> : Mice is at same distance from cheese compared to last position</text></hstack>

            

            {/* Footer */}
            <hstack alignment="center" width="100%">
                <button onPress={() => { props.context.ui.showForm(cancelConfirmationForm) }}>Leave</button>
                <spacer grow />
                <button onPress={() => { props.context.ui.showForm(confirmationForm) }}>CONFIRM</button>
            </hstack>

        </vstack>
    </>)
}