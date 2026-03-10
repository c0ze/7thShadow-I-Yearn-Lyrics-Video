import type { ComponentType } from "react";
import { LyricVideoComposition } from "../../lyricVideo/Composition";
import type { LyricVideoProject, LyricVideoTrack } from "../../lyricVideo/types";
import trackManifest from "./tracks.json";

export const paganAcolytesTracks = trackManifest as LyricVideoTrack[];

export const paganAcolytesProject: LyricVideoProject = {
  projectId: "Pagan/Acolytes",
  displayName: "Pagan - Acolytes",
  tracks: paganAcolytesTracks,
  component:
    LyricVideoComposition as unknown as ComponentType<Record<string, unknown>>,
  video: {
    fps: 60,
    width: 1920,
    height: 1080,
  },
  baseProps: {
    bannerText: "PAGAN",
    theme: {
      accentKeywords: [],
      accentLyricColor: "#f3f3f0",
      bannerFontFamily: "GazelleRegular",
      backgroundBrightness: 0.7,
      backgroundContrast: 1,
      backgroundHueShift: [0, 0, 0],
      backgroundSaturation: 0.5,
      baseLyricColor: "#f3f3f0",
      chorusGlowColor: "rgba(243, 243, 240, 0.3)",
      chorusKeywords: [],
      lyricsFontFamily: "WhiteTTNormRegular",
      lyricsFontSize: "4.6rem",
      neutralGlowColor: "rgba(243, 243, 240, 0.16)",
      scanlineBaseIntensity: 1.2,
      scanlineChorusIntensity: 2.2,
      vignetteAlpha: 0.42,
      vignetteBaseSize: 60,
      vignetteChorusSize: 52,
      vignetteColor: [40, 0, 0],
      warmthRange: [1, 1, 1],
      particleColor: "rgba(255, 120, 40, 1)",
      mistEnabled: true,
      mistColor: "rgba(180, 160, 140, 0.4)",
    },
  },
};
