"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { brandData } from "../data/brand";

interface Props {
    containerRef: React.RefObject<HTMLDivElement>;
}

export default function TextOverlays({ containerRef }: Props) {
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end end"]
    });

    // Calculate opacity maps for 5 overlays
    // They should appear sequentially during the 240 frame sequence
    // Container is h-[700vh], meaning a long scroll.

    // Overlay 1: 0% - 15%
    const opacity1 = useTransform(scrollYProgress, [0.02, 0.05, 0.12, 0.15], [0, 1, 1, 0]);
    const y1 = useTransform(scrollYProgress, [0.02, 0.15], [20, -20]);

    // Overlay 2: 18% - 33%
    const opacity2 = useTransform(scrollYProgress, [0.18, 0.21, 0.28, 0.33], [0, 1, 1, 0]);
    const y2 = useTransform(scrollYProgress, [0.18, 0.33], [20, -20]);

    // Overlay 3: 36% - 51%
    const opacity3 = useTransform(scrollYProgress, [0.36, 0.39, 0.46, 0.51], [0, 1, 1, 0]);
    const y3 = useTransform(scrollYProgress, [0.36, 0.51], [20, -20]);

    // Overlay 4: 55% - 70%
    const opacity4 = useTransform(scrollYProgress, [0.55, 0.58, 0.65, 0.70], [0, 1, 1, 0]);
    const y4 = useTransform(scrollYProgress, [0.55, 0.70], [20, -20]);

    // Overlay 5: 75% - 90%
    const opacity5 = useTransform(scrollYProgress, [0.75, 0.78, 0.85, 0.90], [0, 1, 1, 0]);
    const y5 = useTransform(scrollYProgress, [0.75, 0.90], [20, -20]);

    const overlays = [
        { text: brandData.overlays[0], opacity: opacity1, y: y1 },
        { text: brandData.overlays[1], opacity: opacity2, y: y2 },
        { text: brandData.overlays[2], opacity: opacity3, y: y3 },
        { text: brandData.overlays[3], opacity: opacity4, y: y4 },
        { text: brandData.overlays[4], opacity: opacity5, y: y5 },
    ];

    return (
        <div className="fixed inset-0 pointer-events-none flex items-center justify-center z-20">
            {overlays.map((overlay, index) => (
                <motion.div
                    key={index}
                    style={{ opacity: overlay.opacity, y: overlay.y }}
                    className="absolute text-center px-4 w-full"
                >
                    <h2 className="text-white font-bebas text-5xl md:text-7xl lg:text-9xl tracking-tight uppercase drop-shadow-2xl">
                        {overlay.text}
                    </h2>
                </motion.div>
            ))}
        </div>
    );
}
