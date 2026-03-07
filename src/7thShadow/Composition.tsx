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
			const frac = match[3];
			const text = match[4].trim();

			const totalSeconds = minutes * 60 + seconds + parseInt(frac, 10) / Math.pow(10, frac.length);
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

const PARTICLE_COUNT = 40;

const DustParticles = () => {
	const frame = useCurrentFrame();

	const particles = useMemo(() => {
		return Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
			x: random(`dust-x-${i}`) * 100,
			y: random(`dust-y-${i}`) * 100,
			size: random(`dust-s-${i}`) * 3 + 1,
			speed: random(`dust-sp-${i}`) * 0.3 + 0.05,
			drift: random(`dust-d-${i}`) * 0.2 - 0.1,
			opacity: random(`dust-o-${i}`) * 0.3 + 0.1,
		}));
	}, []);

	return (
		<AbsoluteFill style={{ pointerEvents: 'none', zIndex: 8 }}>
			{particles.map((p, i) => {
				const y = (p.y - frame * p.speed) % 120;
				const x = p.x + Math.sin(frame * 0.02 + i) * 3 + frame * p.drift;
				// Flicker: vary opacity per frame deterministically
				const flicker = random(frame * 7 + i) * 0.4 + 0.6;

				return (
					<div
						key={i}
						style={{
							position: 'absolute',
							left: `${((x % 100) + 100) % 100}%`,
							top: `${((y % 120) + 120) % 120}%`,
							width: p.size,
							height: p.size,
							borderRadius: '50%',
							backgroundColor: 'rgba(255, 255, 255, 1)',
							opacity: p.opacity * flicker,
						}}
					/>
				);
			})}
		</AbsoluteFill>
	);
};

const LyricText = ({ text, frameOffset, duration, shouldDecompose, isChorus }: { text: string, frameOffset: number, duration: number, shouldDecompose: boolean, isChorus: boolean }) => {

    // Hide after calculated duration
    if (frameOffset > duration) {
        return null;
    }

    let opacity = 1;
    let filter = 'none';
    let letterSpacing = '0em';
    let color = '#ffffff';

    // Fade in with upward drift
    opacity = interpolate(frameOffset, [0, 25], [0, 1], { extrapolateRight: 'clamp' });
    const translateY = interpolate(frameOffset, [0, 25], [12, 0], { extrapolateRight: 'clamp' });

    // Exit Animation
    if (frameOffset > duration - 20) {
        opacity = interpolate(frameOffset, [duration - 20, duration], [1, 0]);

        // Decompose Effect (Blur + Spread)
        if (shouldDecompose) {
            const blurAmount = interpolate(frameOffset, [duration - 20, duration], [0, 8]);
            const spacing = interpolate(frameOffset, [duration - 20, duration], [0, 0.5]);

            filter = `blur(${blurAmount}px)`;
            letterSpacing = `${spacing}em`;
        }
    }

    // Special styling for keywords
    const lowerText = text.toLowerCase();
    if (lowerText.includes('rust') || lowerText.includes('decay') || lowerText.includes('fade') || lowerText.includes('dust')) {
        color = '#DAA520';
        filter = filter === 'none' ? 'sepia(0.6)' : `sepia(0.6) ${filter}`;
    }

    // Chromatic aberration: render offset red/blue shadows during chorus
    const aberration = isChorus ? interpolate(frameOffset, [0, 10], [0, 1.5], { extrapolateRight: 'clamp' }) : 0;

    const glowColor = isChorus ? 'rgba(0, 255, 0, 0.5)' : 'rgba(0, 255, 0, 0.3)';
    const textShadow = aberration > 0
        ? `0 0 10px ${glowColor}, ${-aberration}px 0 rgba(255, 0, 0, 0.4), ${aberration}px 0 rgba(0, 100, 255, 0.4)`
        : `0 0 10px ${glowColor}`;

    return (
        <h1
            style={{
                fontFamily: lyricsFont,
                color,
                fontSize: '3.5rem',
                textAlign: 'center',
                opacity,
                filter,
                letterSpacing,
                textShadow,
                whiteSpace: 'pre-wrap',
                maxWidth: '80%',
                transform: `translateY(${translateY}px)`,
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


    // Determine if we are in a chorus (simple check for repeated phrase or high intensity sections)
    // "I yearn to be free" marks the chorus start usually
    const isChorus = currentLine?.text.toLowerCase().includes('yearn') || false;

    // Scanline intensity
    const scanlineIntensity = isChorus ? 2.5 : 1.0;

    // Ken Burns effect on background
    const scale = interpolate(frame, [0, 8400], [1.1, 1.3], { extrapolateRight: 'clamp' });
    const translateBackground = interpolate(frame, [0, 8400], [0, -50], { extrapolateRight: 'clamp' });

    // Color temperature shift: cold blue → neutral → warm over the song
    const hueShift = interpolate(frame, [0, 4200, 8400], [-10, 0, 15], { extrapolateRight: 'clamp' });
    const warmth = interpolate(frame, [0, 4200, 8400], [1.1, 1.0, 0.9], { extrapolateRight: 'clamp' }); // saturation multiplier

    // Breathing vignette: tighter during chorus
    const vignetteBase = isChorus ? 30 : 40;
    const vignetteBreathe = Math.sin(frame * 0.03) * 3;
    const vignetteSize = vignetteBase + vignetteBreathe;

    // Banner fade-in over first 2 seconds
    const bannerOpacity = interpolate(frame, [0, 60], [0, 0.9], { extrapolateRight: 'clamp' });

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
                        filter: `saturate(${0.2 * warmth}) brightness(0.6) hue-rotate(${hueShift}deg)`,
                    }}
                />
            </AbsoluteFill>

            {/* Dust Particles */}
            <DustParticles />

            {/* Effects Layer */}
            <Scanlines intensity={scanlineIntensity} />

            {/* Breathing Vignette */}
             <AbsoluteFill
                style={{
                    background: `radial-gradient(circle, transparent ${vignetteSize}%, #000 100%)`,
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
                        opacity: bannerOpacity,
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
					justifyContent: 'flex-end',
					alignItems: 'center',
                    paddingBottom: '80px',
                    zIndex: 20,
				}}
			>
                {currentLine && (
                    <LyricText
                        key={currentLine.startFrame}
                        text={currentLine.text}
                        frameOffset={frame - currentLine.startFrame}
                        duration={duration}
                        shouldDecompose={shouldDecompose}
                        isChorus={isChorus}
                    />
                )}
			</AbsoluteFill>
		</AbsoluteFill>
	);
};