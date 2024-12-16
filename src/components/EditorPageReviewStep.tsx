import { Context, Devvit, useForm } from "@devvit/public-api";
import { GameSettings } from "../types/GameSettings.js";
import { Service } from "../service/Service.js";
import { GameScreenSkeleton } from "../posts/GamePost/GameScreenSkeleton.js";
import { Point } from "../types/GameTypes.js";
import { MazeEditor } from "./MazeEditor.js";

interface EditorPageReviewStepProps {
    username: string | null;
    gameSettings: GameSettings;
    startPoint: Point,
    treasurePoint: Point,
    onCancel: () => void;
    onBack: ()=>void;
    context: Context;
    rowCount: number,
    colCount: number,
    moveCount: number,
}



export const EditorPageReviewStep = (
    props: EditorPageReviewStepProps
): JSX.Element => {
    const service = new Service(props.context);


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
            props.onCancel();
            props.context.ui.showToast('Maze canceled');
        }
    );

    
    async function onPostHandler() {
        if (!props.username || !props.gameSettings.activeFlairId) {
            props.context.ui.showToast('Please log in to post');
            return;
        }
        const lockKey = `locked:${props.username}`;
        const locked = await props.context.redis.get(lockKey);
        if (locked === 'true') return;
        const lockoutPeriod = 20000; // 20 seconds
        await props.context.redis.set(lockKey, 'true', {
            nx: true,
            expiration: new Date(Date.now() + lockoutPeriod),
        });

        // The back-end is configured to run this app's submitPost calls as the user
        const post = await service.reddit!.submitPost({
            title: 'Get to the cheese',
            subredditName: props.gameSettings.subredditName,
            preview: (
                <GameScreenSkeleton
                    context={props.context}
                    startPoint={props.startPoint}

                />
            ),
        });

        service.submitPost({
            postId: post.id,
            data: [],
            authorUsername: props.username,
            subreddit: props.gameSettings.subredditName,
            flairId: props.gameSettings.activeFlairId,
            startPoint: props.startPoint,
            treasurePoint: props.treasurePoint,
            rowCount: props.rowCount,
            colCount: props.colCount,
            moveCount: props.moveCount
        });
        props.context.ui.navigateTo(post);
        props.context.ui.showToast('Maze posted');

    }

    return (
        <vstack width="100%" height="100%" alignment="center">
            <spacer height="24px" />
            {/* Title */}
            <text>Do you want to submit maze?</text>
            <spacer height="24px" />
            {/* Maze */}
            <MazeEditor {...props} editorMode={false} playerMode={false} setPointPosition={() => { }} setMoveCountValue={() => { }} maxMoveCount={0} minMoveCount={0} />
            <spacer height="24px" />
             
            {/* Footer */}
            <hstack alignment="center" width="100%">
                <button onPress={() => { props.onBack() }}>BACK</button>
                <spacer size="small" />
                <button onPress={() => { props.context.ui.showForm(cancelConfirmationForm) }}>CANCEL</button>
                <spacer size="small" />
                <button onPress={onPostHandler}>POST</button>
            </hstack>
        </vstack>

    )
}