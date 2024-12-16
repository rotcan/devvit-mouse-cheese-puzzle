import { Devvit } from "@devvit/public-api";
import Settings from '../settings.json' with {type:"json"};

export const CellImage = (totalWidth: number, totalHeight: number, paddingValue: number,  color: string, image: string,
   imageWidth: number, imageHeight: number, onPressHandler: Devvit.Blocks.OnPressEventHandler,
   selected:boolean
): JSX.Element => {
    const height: Devvit.Blocks.SizeString = `${totalHeight}px`;
    const width: Devvit.Blocks.SizeString = `${totalWidth}px`;
    const padding: Devvit.Blocks.SizeString = `${paddingValue}px`;
    return (
      <>
        <vstack height={height} width={padding}  />
        <vstack   borderColor={selected===true? Settings.cellSelected : "#00000000"} border={"thick"}>
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
             <image
                url={image}
                width="95%"
                height="95%"
                imageHeight={imageHeight}
                imageWidth={imageWidth}
            />
            </hstack>
          </zstack>
          <hstack width={width} height={padding}   />
        </vstack>
        <vstack height={height} width={padding} />
      </>
    )
  };