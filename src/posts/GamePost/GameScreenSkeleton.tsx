import { Context, Devvit } from "@devvit/public-api";
import { Point } from "../../types/GameTypes.js";
import { abbreviateNumber } from "../../utils/abbreviateNumber.js";
import { MazeSkeleton } from "../../components/MazeSkeleton.js";
import Settings from "../../settings.json" with {type:"json"};

interface GameScreenSkeletonProps {
    startPoint: Point;
    treasurePoint?: Point;
    playerCount?: number;
    winPercentage?: number;
    context: Context;
}
export const GameScreenSkeleton = (props: GameScreenSkeletonProps,  ): JSX.Element => {

    const { playerCount = 0, winPercentage = 0, } = props;
    // console.log("GameScreenSkeleton")
    return (
        <blocks height="tall">
            <zstack width="100%" height="100%" alignment="top start">
            <image
                url={Settings.images.background.image}
                imageHeight={+Settings.images.background.height}
                imageWidth={+Settings.images.background.width}
                width="100%"
                height="100%"
                resizeMode="cover"
            />
                <vstack height="100%" width="100%" alignment="center middle">
                    <spacer height="24px" />
                    <spacer grow />
                    <MazeSkeleton context={props.context}  startPoint={props.startPoint} treasurePoint={props.treasurePoint} editorMode={false} playerMode={false}/>
                    <spacer grow />
                    <text>{`${abbreviateNumber(playerCount)} player${playerCount === 1 ? '' : 's'} tried`}</text>
                    <spacer grow />
                    <button>Solve the maze</button>
                    <button>Give up</button>
                </vstack>
            </zstack>
        </blocks>
    )

}
