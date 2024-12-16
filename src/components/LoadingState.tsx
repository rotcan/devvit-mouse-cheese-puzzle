import { Devvit } from '@devvit/public-api';
import Settings from "../settings.json" with {type: "json"}

export const LoadingState = (): JSX.Element => (
  <zstack width="100%" height="100%" alignment="center middle">
    <image
      imageHeight={1024}
      imageWidth={1500}
      height="100%"
      width="100%"
      url={Settings.images.background.image}
      description="Striped blue background"
      resizeMode="cover"
    />
    <image
      url="spinner.gif"
      description="Loading ..."
      imageHeight={1080}
      imageWidth={1080}
      width="128px"
      height="128px"
      resizeMode="scale-down"
    />
  </zstack>
);