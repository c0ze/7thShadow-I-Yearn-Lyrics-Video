import "./index.css";
import { getAudioDurationInSeconds } from "@remotion/media-utils";
import { Composition } from "remotion";
import { staticFile } from "remotion";
import { PaganIntro } from "./PaganIntro";
import {
  getCompositionDurationInFrames,
  loadLyricsText,
  parseLrc,
} from "./lyricVideo/lyrics";
import type { LyricVideoProps } from "./lyricVideo/types";
import { lyricVideoProjects } from "./projects";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="PaganIntro"
        component={PaganIntro}
        durationInFrames={300} // 5 seconds at 60fps
        fps={60}
        width={1920}
        height={1080}
      />
      {lyricVideoProjects.flatMap((project) =>
        project.tracks.map((track) => (
          <Composition
            key={`${project.projectId}-${track.trackId}`}
            id={track.compositionId}
            component={project.component}
            defaultProps={
              {
                ...project.baseProps,
                coverImageFile: track.coverImageFile,
                lyricsText: "",
              } satisfies LyricVideoProps
            }
            fps={project.video.fps}
            width={project.video.width}
            height={project.video.height}
            calculateMetadata={async ({ abortSignal }) => {
              const [lyricsText, audioDurationInSeconds] = await Promise.all([
                loadLyricsText(track.lyricsFile, abortSignal),
                getAudioDurationInSeconds(staticFile(track.audioFile)).catch(
                  () => {
                    return undefined;
                  },
                ),
              ]);
              const parsedLyrics = parseLrc(lyricsText, project.video.fps);

              return {
                durationInFrames: getCompositionDurationInFrames(
                  parsedLyrics,
                  project.video.fps,
                  audioDurationInSeconds,
                ),
                props: {
                  ...project.baseProps,
                  coverImageFile: track.coverImageFile,
                  lyricsText,
                },
              };
            }}
          />
        )),
      )}
    </>
  );
};
