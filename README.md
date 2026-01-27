# The Seventh Shadow - "I Yearn" Lyrics Video

This project is a [Remotion](https://www.remotion.dev/) video composition for the song "I Yearn" by The Seventh Shadow. It programmatically generates a lyrics video with custom animations, effects, and synchronized text.

## Project Structure

*   `src/7thShadow/Composition.tsx`: Main video composition logic.
*   `src/7thShadow/lyricsData.ts`: Lyrics data (parsed from LRC).
*   `public/7thShadow/`: Static assets (cover art).
*   `public/fonts/`: Custom fonts (Amstrong, Cinzel Decorative).

## Prerequisites

*   Node.js (v16+)
*   npm

## Setup

1.  Clone the repository:
    ```bash
    git clone git@github.com:c0ze/7thShadow-I-Yearn-Lyrics-Video.git
    cd 7thShadow-I-Yearn-Lyrics-Video
    ```

2.  Install dependencies:
    ```bash
    npm install
    ```

## Usage

### Preview

Start the Remotion Studio to preview the video in your browser:

```bash
npm run dev
```

### Render

Render the final video to an MP4 file:

```bash
npx remotion render SeventhShadow out.mp4
```

## Credits

*   **Music:** The Seventh Shadow
*   **Fonts:**
    *   Amstrong (Band Logo)
    *   Cinzel Decorative (Lyrics)
*   **Video Framework:** Remotion