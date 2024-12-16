//

import { Context, Devvit, useAsync } from "@devvit/public-api";
import { Service } from "../service/Service.js";
import { GameSettings } from "../types/GameSettings.js";
import Settings from "../settings.json" with {type:"json"};
import { MazePostData, PinnedPostData, PostData } from "../types/PostData.js";
import { UserData } from "../types/UserData.js";
import { LoadingState } from "../components/LoadingState.js";
import {PinnedPost} from "./PinnedPost/PinnedPost.js";
import { GamePost } from "./GamePost/GamePost.js";

export const Router: Devvit.CustomPostComponent = (context: Context) => {
    const service = new Service(context);


    const { data: username, loading: usernameLoading } = useAsync(
        async () => {
            if (!context.userId) return null; // Return early if no userId
            const cacheKey = 'cache:userId-username';
            const cache = await context.redis.hGet(cacheKey, context.userId);
            if (cache) {
                return cache;
            } else {
                const user = await context.reddit.getUserById(context.userId);
                if (user) {
                    await context.redis.hSet(cacheKey, {
                        [context.userId]: user.username,
                    });
                    return user.username;
                }
            }
            return null;
        },
        {
            depends: [],
        }
    );


    const { data: gameSettings, loading: gameSettingsLoading } = useAsync<GameSettings>(async () => {
        return await service.getGameSettings();
    });


    const { data: postData, loading: postDataLoading } = useAsync<
        PinnedPostData | MazePostData
    >(async () => {
        const postType = await service.getPostType(context.postId!);
        switch (postType) {
            case 'pinned':
                return await service.getPinnedPost(context.postId!);
            case 'maze':
            default:
                return await service.getMazePost(context.postId!);
        }
    });


    const { data: userData, loading: userDataLoading } = useAsync<UserData>(
        async () => {
            return await service.getUser(username!, context.postId!);
        },
        {
            depends: [username],
        }
    );


    if (
        username ===null ||
        usernameLoading ||
        gameSettings === null ||
        gameSettingsLoading ||
        postData === null ||
        postDataLoading ||
        userData === null ||
        userDataLoading
    ) {
        return <LoadingState />;
    }

    const postType = postData.postType;
    const postTypes: Record<string, JSX.Element> = {
        maze: (
            <GamePost
              postData={postData as MazePostData}
              username={username}
              gameSettings={gameSettings}
              userData={userData}
              context={context}
            />
          ),
        pinned: (
        <PinnedPost
            postData={postData as PinnedPostData}
            userData={userData}
            username={username}
            gameSettings={gameSettings}
            context={context}
        />
        ),
    };

    
  return (
    <zstack width="100%" height="100%" alignment="top start">
      <image
        url={Settings.images.background.image}
        imageHeight={+Settings.images.background.height}
        imageWidth={+Settings.images.background.width}
        width="100%"
        height="100%"
        resizeMode="cover"
      />
      {/* Menu */}
      {postTypes[postType] || (
        <vstack alignment="center middle" grow>
          <text>Error: Unknown post type</text>
        </vstack>
      )}
    </zstack>
  );
}