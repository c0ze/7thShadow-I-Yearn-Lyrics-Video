import type { ComponentType } from "react";
import { LyricVideoComposition } from "../lyricVideo/Composition";
import type { LyricVideoProject, LyricVideoTrack } from "../lyricVideo/types";
import trackManifest from "./tracks.json";

export type SeventhShadowTrack = LyricVideoTrack;

export const seventhShadowTracks = trackManifest as SeventhShadowTrack[];

export const seventhShadowProject: LyricVideoProject = {
  projectId: "7thShadow",
  displayName: "The Seventh Shadow",
  tracks: seventhShadowTracks,
  component:
    LyricVideoComposition as unknown as ComponentType<Record<string, unknown>>,
  video: {
    fps: 60,
    width: 1920,
    height: 1080,
  },
  baseProps: {
    bannerText: "The Seventh Shadow",
    theme: {
      accentKeywords: ["rust", "decay", "fade", "dust"],
      accentLyricColor: "#d7b166",
      backgroundBrightness: 0.78,
      backgroundContrast: 0.92,
      backgroundHueShift: [-10, 0, 15],
      backgroundSaturation: 0.38,
      baseLyricColor: "#ffffff",
      chorusGlowColor: "rgba(80, 255, 170, 0.5)",
      chorusKeywords: ["yearn"],
      neutralGlowColor: "rgba(180, 240, 210, 0.24)",
      scanlineBaseIntensity: 1,
      scanlineChorusIntensity: 2.5,
      vignetteAlpha: 0.82,
      warmthRange: [1.1, 1, 0.9],
    },
  },
};
