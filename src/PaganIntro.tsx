import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, random } from 'remotion';
import { loadFont } from '@remotion/google-fonts/MetalMania';

const { fontFamily } = loadFont();

export const PaganIntro = () => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();

    // Heavy spring bounce
    // High mass makes it feel heavy. Low damping allows it to oscillate.
    const scale = spring({
        frame,
        fps,
        config: {
            damping: 12,
            stiffness: 100,
            mass: 2.5,
        },
    });

    // Flicker effect mimicking old film projector
    // We vary opacity slightly randomly
    const flickerOpacity = random(frame) * 0.2 + 0.8; // 0.8 to 1.0

    // Random jitter for the background noise to make it feel alive
    const grainX = random(frame) * 10 - 5;
    const grainY = random(frame + 100) * 10 - 5;

    return (
        <AbsoluteFill style={{ backgroundColor: '#050505', overflow: 'hidden' }}>
            
            {/* Grain/Noise Background */}
            <AbsoluteFill 
                style={{
                    transform: `translate(${grainX}px, ${grainY}px)`,
                    opacity: 0.2,
                }}
            >
                <div
                    style={{
                        width: '110%', // slightly larger to cover jitter
                        height: '110%',
                        position: 'absolute',
                        top: '-5%',
                        left: '-5%',
                        // eslint-disable-next-line @remotion/no-background-image
                        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
                        backgroundSize: '200px 200px', // repeat pattern
                    }}
                />
            </AbsoluteFill>

            {/* Vignette for dark atmosphere */}
             <AbsoluteFill
                style={{
                    background: 'radial-gradient(circle, transparent 30%, black 100%)',
                }}
            />

            {/* Main Text */}
            <AbsoluteFill
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}
            >
                <h1
                    style={{
                        fontFamily,
                        color: '#dcdcdc',
                        fontSize: '12rem',
                        transform: `scale(${scale})`,
                        opacity: flickerOpacity,
                        letterSpacing: '0.2em',
                        textShadow: '0 0 15px rgba(0, 0, 0, 0.8)',
                        margin: 0,
                    }}
                >
                    PAGAN
                </h1>
            </AbsoluteFill>

             {/* Occasional vertical scratch (Old Film Artifact) */}
             {random(frame * 2) > 0.97 && (
                <div style={{
                    position: 'absolute',
                    left: `${random(frame) * 100}%`,
                    top: 0,
                    height: '100%',
                    width: '1px',
                    background: 'rgba(255, 255, 255, 0.2)',
                    boxShadow: '0 0 2px rgba(255,255,255,0.1)',
                }} />
             )}

        </AbsoluteFill>
    );
};
