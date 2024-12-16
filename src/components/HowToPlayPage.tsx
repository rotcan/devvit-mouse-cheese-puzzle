import { Context,Devvit } from "@devvit/public-api";
import Settings from "../settings.json"   with { type: "json" };
import { Cell } from "./Cell.js";

interface HowToPlayPageProps {
    context: Context,
    onClose: () => void;
  }

  
export const HowToPlayPage = (props: HowToPlayPageProps, ): JSX.Element => (
    <vstack width="100%" height="100%">
      <spacer height="24px" />
  
      {/* Header */}
      <hstack width="100%" alignment="middle">
        <spacer width="24px" />
        <text>
          How to play
        </text>
        <spacer grow />
        <button
          appearance="primary"
           
          width="32px"
          height="32px"
          onPress={props.onClose}
        >Back</button>
        <spacer width="20px" />
      </hstack>
      <spacer height="20px" />
  
      <hstack grow>
        <spacer width="24px" />
        <zstack alignment="start top" grow>
          {/* Shadow */}
          <vstack width="100%" height="100%">
            <spacer height="4px" />
            <hstack grow>
              <spacer width="4px" />
              <hstack grow backgroundColor={Settings.theme.shadow} />
            </hstack>
          </vstack>
  
          {/* Card */}
          <vstack width="100%" height="100%">
            <hstack grow>
              <vstack grow  >
                <spacer height="4px" />
                <vstack grow alignment="center middle">
                  <text>Mouse & Cheese</text>
                  <spacer height="4px" />
                  <text>Place the mice on the block where you think the cheese is placed</text>
                  <hstack width="100%" alignment="center" height="25px">
                    {Cell(20, 20, 1, Settings.fartherPointColor, () => { })}<text alignment="middle"> : Mice is farther from cheese compared to last position</text></hstack>
                <hstack width="100%" alignment="center" height="25px">
                    {Cell(20, 20, 1, Settings.closerPointColor, () => { })}<text alignment="middle"> : Mice is closer to cheese compared to last position</text></hstack>
                <hstack width="100%" alignment="center" height="25px">
                    {Cell(20, 20, 1, Settings.equiDistantColor, () => { })}<text alignment="middle"> : Mice is at same distance from cheese compared to last position</text></hstack><spacer height="16px" />
                  <text >Earn points if they cannot reach the cheese</text>
                  
                </vstack>
                <spacer height="4px" />
              </vstack>
              <spacer width="4px" />
            </hstack>
            <spacer height="4px" />
          </vstack>
        </zstack>
        <spacer width="20px" />
      </hstack>
  
      <spacer height="20px" />
    </vstack>
  );
  