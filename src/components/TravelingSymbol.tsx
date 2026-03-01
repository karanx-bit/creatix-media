"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import Image from "next/image";

interface Props {
    containerRef: React.RefObject<HTMLDivElement>;
}

export default function TravelingSymbol({ containerRef }: Props) {
    const { scrollYProgress } = useScroll({
        target: containerRef,
        // start tracking when the container top hits the center of viewport
        // end tracking when container bottom hits bottom
        offset: ["start center", "end end"]
    });

    // The symbol starts hidden (opacity 0) during the initial Hero Canvas push
    // It fades in right as the Hero Canvas finishes its 240 frames
    // The PostSequence container starts immediately after the Hero Canvas
    const opacity = useTransform(scrollYProgress, [0, 0.05, 0.95, 1], [0, 1, 1, 1]);

    // Motion Behaviors mapped to scroll passing through the sections
    // Starts centered roughly, moves in a controlled zigzag

    // X Position: Center -> Left -> Right -> Center
    const x = useTransform(
        scrollYProgress,
        [0.05, 0.3, 0.6, 0.95],
        ["0%", "-30%", "30%", "0%"]
    );

    // Y parallax effect: It stays relatively fixed to the screen via sticky,
    // but we add a subtle vertical drift to make it feel alive
    const y = useTransform(
        scrollYProgress,
        [0.05, 0.3, 0.6, 0.95],
        ["-10%", "5%", "-5%", "20%"]
    );

    // Rotation: Subtle, professional (No exaggerated spins - max 15deg)
    const rotate = useTransform(
        scrollYProgress,
        [0.05, 0.3, 0.6, 0.95],
        [0, -10, 15, 0]
    );

    // Scale: Depth scaling (parallax feeling)
    const scale = useTransform(
        scrollYProgress,
        [0.05, 0.3, 0.6, 0.95],
        [1, 0.8, 1.2, 1.5]
    );

    return (
        <div className="fixed inset-0 pointer-events-none z-30 flex items-center justify-center">
            <motion.div
                style={{
                    opacity,
                    x,
                    y,
                    rotate,
                    scale,
                }}
                className="w-64 h-64 md:w-96 md:h-96 relative flex items-center justify-center"
            >
                <Image
                    src="/images/creatix-symbol.png"
                    alt="Creatix Traveling Mark"
                    fill
                    className="object-contain drop-shadow-2xl"
                    priority
                />
            </motion.div>
        </div>
    );
}
