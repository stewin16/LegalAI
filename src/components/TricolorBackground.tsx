import { motion } from "framer-motion";

interface TricolorBackgroundProps {
    intensity?: "subtle" | "medium" | "strong";
    showOrbs?: boolean;
}

/**
 * Premium Indian Tricolor Gradient Background
 * MUCH DARKER AND MORE VISIBLE - as per user request
 */
const TricolorBackground = ({
    intensity = "strong",
    showOrbs = true
}: TricolorBackgroundProps) => {

    // VERY DARK and visible opacity values
    const opacityMap = {
        subtle: { saffron: 0.25, green: 0.2 },
        medium: { saffron: 0.4, green: 0.35 },
        strong: { saffron: 0.5, green: 0.45 }
    };

    const opacity = opacityMap[intensity];

    return (
        <>
            {/* Base white background */}
            <div
                className="fixed inset-0 -z-30 bg-white"
                aria-hidden="true"
            />

            {/* Main tricolor gradient - MUCH MORE VISIBLE */}
            <div
                className="fixed inset-0 -z-20 overflow-hidden pointer-events-none"
                aria-hidden="true"
            >
                {/* Saffron gradient - top portion - STRONGER */}
                <div
                    className="absolute top-0 left-0 right-0 h-1/2"
                    style={{
                        background: `linear-gradient(180deg, 
              rgba(255, 153, 51, ${opacity.saffron}) 0%, 
              rgba(255, 153, 51, ${opacity.saffron * 0.5}) 40%,
              transparent 100%
            )`,
                    }}
                />

                {/* Green gradient - bottom portion - STRONGER */}
                <div
                    className="absolute bottom-0 left-0 right-0 h-1/2"
                    style={{
                        background: `linear-gradient(0deg, 
              rgba(19, 136, 8, ${opacity.green}) 0%, 
              rgba(19, 136, 8, ${opacity.green * 0.5}) 40%,
              transparent 100%
            )`,
                    }}
                />
            </div>

            {/* Light overlay to keep text readable */}
            <div
                className="fixed inset-0 -z-10 pointer-events-none"
                aria-hidden="true"
                style={{
                    background: 'rgba(255, 255, 255, 0.6)',
                }}
            />

            {/* Animated accent orbs for premium feel */}
            {showOrbs && (
                <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none" aria-hidden="true">
                    {/* Large Saffron orb - top right */}
                    <motion.div
                        className="absolute -top-20 -right-20 w-[600px] h-[500px]"
                        style={{
                            background: `radial-gradient(ellipse at center, rgba(255, 153, 51, ${opacity.saffron * 0.6}) 0%, transparent 60%)`,
                            filter: 'blur(60px)',
                        }}
                        animate={{
                            x: [0, 30, 0],
                            y: [0, 20, 0],
                            scale: [1, 1.1, 1],
                        }}
                        transition={{
                            duration: 15,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
                    />

                    {/* Large Green orb - bottom left */}
                    <motion.div
                        className="absolute -bottom-20 -left-20 w-[600px] h-[500px]"
                        style={{
                            background: `radial-gradient(ellipse at center, rgba(19, 136, 8, ${opacity.green * 0.6}) 0%, transparent 60%)`,
                            filter: 'blur(60px)',
                        }}
                        animate={{
                            x: [0, -30, 0],
                            y: [0, -20, 0],
                            scale: [1, 1.05, 1],
                        }}
                        transition={{
                            duration: 18,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
                    />
                </div>
            )}
        </>
    );
};

export default TricolorBackground;
