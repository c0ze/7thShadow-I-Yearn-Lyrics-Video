import {
	AbsoluteFill,
	useCurrentFrame,
	useVideoConfig,
	interpolate,
	random,
	Img,
	staticFile,
} from 'remotion';
import { loadFont } from '@remotion/fonts';
import { lrcContent } from './lyricsData';
import { useMemo } from 'react';

// Load the local fonts
loadFont({
    family: 'Amstrong',
    url: staticFile('fonts/Amstrong.otf'),
    weight: '400',
});
loadFont({
    family: 'CinzelDecorative',
    url: staticFile('fonts/CinzelDecorative-Regular.ttf'),
    weight: '400',
});

const bannerFont = 'Amstrong';
const lyricsFont = 'CinzelDecorative';

// --- Types ---
interface LyricLine {
	startFrame: number;
	text: string;
}

// --- Helpers ---
const parseLrc = (lrc: string, fps: number): LyricLine[] => {
	const lines = lrc.split('\n');
    // Relaxed regex to match [mm:ss.xx] or [mm:ss.xxx]
	const regex = /\[(\d+):(\d+)\.(\d+)\](.*)/;
	const parsed: LyricLine[] = [];

	for (const line of lines) {
		const match = line.trim().match(regex);
		if (match) {
			const minutes = parseInt(match[1], 10);
			const seconds = parseInt(match[2], 10);
			const centiseconds = parseInt(match[3], 10);
			const text = match[4].trim();

			const totalSeconds = minutes * 60 + seconds + centiseconds / 100;
			const startFrame = Math.round(totalSeconds * fps);

			parsed.push({ startFrame, text });
		}
	}
    
    // Group lines by frame to handle duplicate timestamps
    const grouped: LyricLine[] = [];
    parsed.sort((a, b) => a.startFrame - b.startFrame);
    
    for (const line of parsed) {
        const last = grouped[grouped.length - 1];
        if (last && last.startFrame === line.startFrame) {
            last.text += '\n' + line.text;
        } else {
            grouped.push(line);
        }
    }
    
	return grouped;
};

// --- Sub-components ---

const Scanlines = ({ intensity }: { intensity: number }) => {
	const frame = useCurrentFrame();
	
	const offsetY = (frame * 2) % 100; // Moving scanline
    const opacity = random(frame) * 0.1 * intensity + 0.05 * intensity;

	return (
		<AbsoluteFill
			style={{
				pointerEvents: 'none',
				zIndex: 10,
                opacity: opacity,
				background: `linear-gradient(to bottom, transparent 50%, rgba(0, 0, 0, 0.5) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.06), rgba(0, 255, 0, 0.02), rgba(0, 0, 255, 0.06))`,
				backgroundSize: '100% 4px, 6px 100%',
                transform: `translateY(${offsetY}px)`
			}}
		/>
	);
};

const LyricText = ({ text, isActive, frameOffset, duration, shouldDecompose }: { text: string, isActive: boolean, frameOffset: number, duration: number, shouldDecompose: boolean }) => {
    
    // Hide after calculated duration
    if (frameOffset > duration) {
        return null;
    }
    
    let transform = 'translate(0, 0)';
    let opacity = 1;
    let filter = 'none';
    let letterSpacing = '0em';
    let color = '#ffffff'; // Explicit white

    if (isActive) {
        // Subtle Fade In (0 -> 1 over 20 frames)
        opacity = interpolate(frameOffset, [0, 20], [0, 1]);
        
        // Exit Animation
        if (frameOffset > duration - 20) {
            // Standard Fade Out
             opacity = interpolate(frameOffset, [duration - 20, duration], [1, 0]);
             
             // Decompose Effect (Blur + Spread)
             if (shouldDecompose) {
                 const blurAmount = interpolate(frameOffset, [duration - 20, duration], [0, 8]);
                 const spacing = interpolate(frameOffset, [duration - 20, duration], [0, 0.5]); // em
                 
                 filter = `blur(${blurAmount}px)`;
                 letterSpacing = `${spacing}em`;
             }
        }

        // Special styling for keywords (always active if present)
        if (text.toLowerCase().includes('rust') || text.toLowerCase().includes('decay')) {
            // Add a slight sepia tint but respect the blur if it's happening
            const baseFilter = shouldDecompose && frameOffset > duration - 20 ? filter : `sepia(0.6)`;
            filter = baseFilter;
            color = '#DAA520'; // Amber/Rust color
        }
    } else {
        return null; 
    }

    return (
        <h1
            style={{
                fontFamily: lyricsFont,
                color,
                fontSize: '3.5rem', 
                textAlign: 'center',
                transform,
                opacity,
                filter,
                letterSpacing,
                textShadow: '0 0 10px rgba(0, 255, 0, 0.3)', // Subtle digital glow
                whiteSpace: 'pre-wrap',
                maxWidth: '80%',
                transition: 'letter-spacing 0.1s ease-out', // smooth out frame jumps if any
            }}
        >
            {text}
        </h1>
    );
}


export const SeventhShadowComp = () => {
	const frame = useCurrentFrame();
	const { fps } = useVideoConfig();

	const parsedLyrics = useMemo(() => parseLrc(lrcContent, fps), [fps]);

    // Determine current line
    // We find the last line that has started
    let currentLineIndex = -1;
    for (let i = parsedLyrics.length - 1; i >= 0; i--) {
        if (frame >= parsedLyrics[i].startFrame) {
            currentLineIndex = i;
            break;
        }
    }

    const currentLine = currentLineIndex !== -1 ? parsedLyrics[currentLineIndex] : null;
    const nextLine = currentLineIndex !== -1 && currentLineIndex < parsedLyrics.length - 1 ? parsedLyrics[currentLineIndex + 1] : null;

    // Calculate duration for the current line
    // If there is a next line, the duration is the gap between them.
    // If not, we default to 150 frames (5s).
    // CAP THE DURATION: If the gap is longer than 6 seconds (180 frames), limit it to 180 frames.
    let duration = 150;
    if (currentLine && nextLine) {
        duration = nextLine.startFrame - currentLine.startFrame;
        if (duration > 180) {
            duration = 180;
        }
    }
    
    // Determine if we should decompose (randomly or by keyword)
    // We use a deterministic random based on the startFrame so it doesn't flicker
    const shouldDecompose = useMemo(() => {
        if (!currentLine) return false;
        const text = currentLine.text.toLowerCase();
        if (text.includes('rust') || text.includes('decay') || text.includes('fade') || text.includes('dust')) return true;
        return random(currentLine.startFrame) > 0.7; // 30% chance
    }, [currentLine]);


    // Debug log to trace lyric updates
    if (frame % 30 === 0) { // Log once per second roughly
        console.log(`Frame: ${frame}, Current Line: ${currentLine ? currentLine.text : 'None'}, Duration: ${duration}`);
    }
    
    // Determine if we are in a chorus (simple check for repeated phrase or high intensity sections)
    // "I yearn to be free" marks the chorus start usually
    const isChorus = currentLine?.text.toLowerCase().includes('yearn') || false;

    // Scanline intensity
    const scanlineIntensity = isChorus ? 2.5 : 1.0;

    // Ken Burns effect on background
    const scale = interpolate(frame, [0, 8400], [1.1, 1.3], { extrapolateRight: 'clamp' });
    const translateBackground = interpolate(frame, [0, 8400], [0, -50], { extrapolateRight: 'clamp' });

	return (
		<AbsoluteFill style={{ backgroundColor: '#000' }}>
            {/* Background Layer */}
			<AbsoluteFill style={{ overflow: 'hidden' }}>
                <Img
                    src={staticFile('7thShadow/cover_16_9.jpg')}
                    style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        transform: `scale(${scale}) translateY(${translateBackground}px)`,
                        filter: 'desaturate(80%) brightness(0.6)', // Heavy desaturation
                    }}
                />
            </AbsoluteFill>

            {/* Effects Layer */}
            <Scanlines intensity={scanlineIntensity} />
            
            {/* Digital Vignette */}
             <AbsoluteFill
                style={{
                    background: 'radial-gradient(circle, transparent 40%, #000 100%)',
                    zIndex: 5,
                }}
            />

            {/* Band Banner */}
            <AbsoluteFill
                style={{
                    justifyContent: 'flex-start',
                    alignItems: 'flex-start',
                    paddingTop: '40px',
                    paddingLeft: '40px',
                    zIndex: 25,
                }}
            >
                <h1
                    style={{
                        fontFamily: bannerFont,
                        color: '#ffffff',
                        fontSize: '5rem',
                        textShadow: '0 0 20px rgba(255, 255, 255, 0.5)',
                        opacity: 0.9,
                        letterSpacing: '0.1em',
                        margin: 0,
                    }}
                >
                    The Seventh Shadow
                </h1>
            </AbsoluteFill>

            {/* Lyrics Layer */}
			<AbsoluteFill
				style={{
					justifyContent: 'flex-end', // Subtitle position
					alignItems: 'center',
                    paddingBottom: '80px', // Space from bottom
                    zIndex: 20,
				}}
			>
                {currentLine && (
                    <LyricText 
                        key={currentLine.startFrame} // Re-mount on new line to trigger effects
                        text={currentLine.text} 
                        isActive={true} 
                        frameOffset={frame - currentLine.startFrame}
                        duration={duration}
                        shouldDecompose={shouldDecompose}
                    />
                )}
			</AbsoluteFill>
		</AbsoluteFill>
	);
};