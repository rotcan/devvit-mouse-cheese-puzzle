import { Context, Devvit, useAsync, useState } from "@devvit/public-api";
import { GameSettings } from "../../types/GameSettings.js";
import { PostData } from "../../types/PostData.js";
import { UserData } from "../../types/UserData.js";
import { Service } from "../../service/Service.js";
import { LoadingState } from "../../components/LoadingState.js";
import { getLevelByScore } from "../../utils/progression.js";
import { EditorPage } from "../../components/EditorPage.js";
import { LeaderboardPage } from "../../components/LeaderboardPage.js";
import { HowToPlayPage } from "../../components/HowToPlayPage.js";

interface PinnedPostProps {
    postData: PostData;
    userData: UserData;
    username: string | null;
    gameSettings: GameSettings;
    context: Context;
}

export const PinnedPost = (props: PinnedPostProps,): JSX.Element => {
    const service = new Service(props.context);
    const [page, setPage] = useState('menu');
    const buttonWidth = '256px';
    const buttonHeight = '48px';


    const { data: user, loading } = useAsync<{
        rank: number;
        score: number;
    }>(async () => {
        return await service.getUserScore(props.username);
    });


    if (user === null || loading) {
        return <LoadingState />;
    }
    const level = getLevelByScore(user?.score ?? 0);
    const percentage = Math.round(
        Math.min(100, Math.max(0, (((user?.score ?? 0) - level.min) / (level.max - level.min)) * 100))
    );

    const Menu = (
        <vstack width="100%" height="100%" alignment="center middle">
            <spacer grow />
            {/* Logo */}
            <spacer height="16px" />
            <text
                selectable={false}
                weight="bold"
            >{"Mouse & Cheese"}</text>
            <spacer grow />
            {/* Menu */}
            <vstack alignment="center middle" gap="small">
            <button  onPress={() => setPage('create-maze')}>Create Maze</button>
            <button  onPress={() => setPage('leaderboard')}>Leaderboard</button>
            <button  onPress={() => setPage('how-to-play')}>How to play</button>
            </vstack>
        </vstack>
    )

    
    const onClose = (): void => {
        setPage('menu');
    };

    const pages: Record<string, JSX.Element> = {
        menu: Menu,
        'create-maze': <EditorPage {...props} onCancel={onClose} />,
        'leaderboard': <LeaderboardPage {...props} onClose={onClose} rowCount={10} onCreateMaze={()=>{}} showClose={true} postData={props.postData} global={true} />,
        'how-to-play': <HowToPlayPage  {...props} onClose={onClose} />,
        // level: (
        //   <LevelPage {...props} user={user} percentage={percentage} level={level} onClose={onClose} />
        // ),
      };
    return pages[page] || Menu;
}