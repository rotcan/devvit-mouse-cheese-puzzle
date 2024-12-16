import { Context, Devvit, useForm, useState } from "@devvit/public-api";
import { MazePostData } from "../../types/PostData.js";
import { MazeSkeleton } from "../../components/MazeSkeleton.js";

interface LandingScreenProps {
    postData: MazePostData;
    context: Context;
    onNext: () => void;
    onShowLeaderboard: ()=>void;
}
export const LandingScreen = (props: LandingScreenProps): JSX.Element => {
    return (
        <vstack width="100%" height="100%" alignment="center top" padding="large">
             <hstack gap="medium" alignment="center middle">
                <text>Maze  {`By u/${props.postData.authorUsername}`}</text>
            </hstack>
            <spacer height="12px" />
            <MazeSkeleton context={props.context} startPoint={props.postData.startPoint} treasurePoint={props.postData.treasurePoint} editorMode={false} playerMode={false} />
            <spacer height="12px" />
            <hstack width="100%" alignment="center">
            <button onPress={props.onNext}>Start/Continue</button>
            <button onPress={props.onShowLeaderboard}>Leaderboard</button>
            </hstack>
        </vstack>
    )
}