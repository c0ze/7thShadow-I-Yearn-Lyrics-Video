import "./index.css";
import { Composition } from "remotion";
import { PaganIntro } from "./PaganIntro";
import { SeventhShadowComp } from "./7thShadow/Composition";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="PaganIntro"
        component={PaganIntro}
        durationInFrames={150} // 5 seconds at 30fps
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="SeventhShadow"
        component={SeventhShadowComp}
        durationInFrames={8400} // ~4:40 at 30fps
        fps={30}
        width={1920}
        height={1080}
      />
    </>
  );
};
