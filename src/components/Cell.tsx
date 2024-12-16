import { Devvit } from "@devvit/public-api";
import Settings from '../settings.json' with {type:"json"};

export const Cell = (totalWidth: number, totalHeight: number, paddingValue: number, color: string, onPressHandler: Devvit.Blocks.OnPressEventHandler,
  value?: string, selected?: boolean
): JSX.Element => {
    const height: Devvit.Blocks.SizeString = `${totalHeight}px`;
    const width: Devvit.Blocks.SizeString = `${totalWidth}px`;
    const padding: Devvit.Blocks.SizeString = `${paddingValue}px`;
    return (
      <>
        <vstack height={height} width={padding}  />
        <vstack borderColor={selected===true? Settings.cellSelected : "#00000000"} border={"thick"}>
          <hstack width={width} height={padding}   />
          <zstack>
            <hstack
              border={"thick"}
              alignment={"middle center"}
              cornerRadius={"small"}
              width={width}
              height={height}
              backgroundColor={color}
              onPress={onPressHandler}
            >
              <text color="black">{value}</text>
            </hstack>
          </zstack>
          <hstack width={width} height={padding}   />
        </vstack>
        <vstack height={height} width={padding} />
      </>
    )
  };