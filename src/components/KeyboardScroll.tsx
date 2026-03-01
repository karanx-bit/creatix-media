"use client";

import { useEffect, useRef, useState } from "react";
import { useScroll, useTransform, useMotionValueEvent, motion } from "framer-motion";
import ScrambleText from "./ScrambleText";

const TOTAL_FRAMES = 161;
const FOLDER = "/images/keyboard-sequence/ezgif-4cd376184739cdde-jpg/";

export default function KeyboardScroll() {
    const containerRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const requestRef = useRef<number>();

    const [images, setImages] = useState<HTMLImageElement[]>([]);
    const [loadedCount, setLoadedCount] = useState(0);
    const [isLoaded, setIsLoaded] = useState(false);

    const { scrollYProgress } = useScroll({
        target: containerRef,
        // Start animation immediately as it enters the bottom of the viewport
        offset: ["start end", "end end"]
    });

    // Map scroll progress directly to frame index for instant, rapid response
    const frameIndex = useTransform(scrollYProgress, [0, 1], [0, TOTAL_FRAMES - 1]);

    // Framer Motion specific text beat mappings
    // 0%: Center "The Core" / "Initialization sequence."
    const t1Opacity = useTransform(scrollYProgress, [0.1, 0.15, 0.25, 0.3], [1, 1, 0, 0]);
    const t1Y = useTransform(scrollYProgress, [0.1, 0.3], [0, -20]);

    // 25%: Left aligned "Built for Precision." / "Every detail, measured."
    const t2Opacity = useTransform(scrollYProgress, [0.25, 0.32, 0.55, 0.65], [0, 1, 1, 0]);
    const t2Y = useTransform(scrollYProgress, [0.25, 0.65], [10, -10]);

    // 60%: Right aligned "Layered Engineering." / "See what’s inside."
    const t3Opacity = useTransform(scrollYProgress, [0.6, 0.68, 0.8, 0.85], [0, 1, 1, 0]);
    const t3Y = useTransform(scrollYProgress, [0.6, 0.85], [10, -10]);

    // 90%: Centered "Assembled. Ready." / "Scroll back to replay."
    const t4Opacity = useTransform(scrollYProgress, [0.85, 0.9, 1], [0, 1, 1]);
    const t4Y = useTransform(scrollYProgress, [0.85, 1], [10, 0]);

    // Preload Images Sequentially (Optimized for Mobile/Slow Connections)
    useEffect(() => {
        let mounted = true;
        const loaded: HTMLImageElement[] = [];

        const loadFrame = (i: number) => {
            if (!mounted || i >= TOTAL_FRAMES) return;

            const img = new Image();
            const paddedIndex = (i + 1).toString().padStart(3, "0");
            img.src = `${FOLDER}ezgif-frame-${paddedIndex}.jpg`;

            img.onload = () => {
                if (!mounted) return;
                loaded[i] = img;
                setLoadedCount(i + 1);

                // Unlock screen instantly when frame 0 is ready
                if (i === 0) {
                    setIsLoaded(true);
                    setImages(loaded);
                    requestAnimationFrame(() => drawFrame(0, loaded));
                } else if (i === TOTAL_FRAMES - 1) {
                    // Update state one last time when all are done to ensure scrub accuracy
                    setImages([...loaded]);
                }

                // Load next frame sequentially
                loadFrame(i + 1);
            };

            img.onerror = () => {
                console.error(`Failed to load frame ${i}`);
                setLoadedCount(i + 1);

                // Fallback unlock if frame 0 somehow fails
                if (i === 0) {
                    setIsLoaded(true);
                    setImages(loaded);
                }

                // Continue loading sequence even if one drops
                loadFrame(i + 1);
            };
        };

        // Kick off the sequential load with frame 0
        loadFrame(0);

        return () => {
            mounted = false;
        };
    }, []);

    // Frame Drawing Logic
    const drawFrame = (index: number, imgs: HTMLImageElement[] = images) => {
        const canvas = canvasRef.current;
        const img = imgs[index];
        if (!canvas || !img) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        // Device Pixel Ratio scaling for sharp rendering
        const dpr = window.devicePixelRatio || 1;
        const renderWidth = canvas.width;
        const renderHeight = canvas.height;

        // Clear canvas
        ctx.clearRect(0, 0, renderWidth, renderHeight);

        // Mathematical Object-Fit "Contain" centered logic
        const imgRatio = img.width / img.height;
        const canvasRatio = renderWidth / renderHeight;
        let drawWidth, drawHeight, offsetX, offsetY;

        if (imgRatio > canvasRatio) {
            drawWidth = renderWidth;
            drawHeight = renderWidth / imgRatio;
            offsetX = 0;
            offsetY = (renderHeight - drawHeight) / 2;
        } else {
            drawWidth = renderHeight * imgRatio;
            drawHeight = renderHeight;
            offsetX = (renderWidth - drawWidth) / 2;
            offsetY = 0;
        }

        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";
        ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
    };

    // Resize Handler
    useEffect(() => {
        const resizeCanvas = () => {
            if (!canvasRef.current) return;
            canvasRef.current.width = window.innerWidth * (window.devicePixelRatio || 1);
            canvasRef.current.height = window.innerHeight * (window.devicePixelRatio || 1);
            canvasRef.current.style.width = `${window.innerWidth}px`;
            canvasRef.current.style.height = `${window.innerHeight}px`;

            // Redraw current frame
            if (isLoaded) {
                drawFrame(Math.floor(frameIndex.get()));
            }
        };

        window.addEventListener("resize", resizeCanvas);
        resizeCanvas();
        return () => window.removeEventListener("resize", resizeCanvas);
    }, [isLoaded, frameIndex]);

    // Scroll -> Animation Frame hook
    useMotionValueEvent(frameIndex, "change", (latest) => {
        if (!isLoaded) return;

        if (requestRef.current) {
            cancelAnimationFrame(requestRef.current);
        }

        requestRef.current = requestAnimationFrame(() => {
            // Apply Math.round instead of Math.floor for smoother bi-directional scrubbing
            const idx = Math.min(Math.max(Math.round(latest), 0), TOTAL_FRAMES - 1);
            drawFrame(idx);
        });
    });

    return (
        <div ref={containerRef} className="relative w-full h-[150vh] bg-transparent">

            {/* Loading State */}
            {!isLoaded && (
                <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-transparent backdrop-blur-md">
                    <div className="w-12 h-12 border-4 border-white/10 border-t-white/80 rounded-full animate-spin"></div>
                    <p className="mt-4 text-white/60 tracking-widest text-sm uppercase">Loading sequence: {loadedCount}/{TOTAL_FRAMES}</p>
                </div>
            )}

            {/* Sticky Canvas & Overlays */}
            <div className="sticky top-0 h-screen w-full overflow-hidden">

                {/* Canvas Engine */}
                <canvas ref={canvasRef} className="block w-full h-full z-0 pointer-events-none" style={{ willChange: 'transform' }} />

                {/* Text Area 1: 0% Centered */}
                <motion.div
                    style={{ opacity: t1Opacity, y: t1Y }}
                    className="absolute inset-0 flex flex-col items-center justify-start pt-[8vh] pointer-events-none z-10"
                >
                    <h2 className="text-4xl md:text-6xl font-black tracking-tighter uppercase text-chrome drop-shadow-lg">
                        The Core.
                    </h2>
                    <ScrambleText text="Initialization sequence." as="p" className="text-lg md:text-2xl mt-4 text-orange-400 font-bold uppercase tracking-widest drop-shadow-md" />
                </motion.div>

                {/* Text Area 2: 25% Left Aligned */}
                <motion.div
                    style={{ opacity: t2Opacity, y: t2Y }}
                    className="absolute inset-0 flex flex-col items-start justify-center pl-[10vw] pointer-events-none z-10"
                >
                    <div className="bg-slate-900/80 p-8 rounded-3xl border border-slate-700 shadow-xl">
                        <h2 className="text-4xl md:text-6xl font-bold tracking-tight text-chrome border-l-4 border-slate-400 pl-4">
                            Cinematic Storytelling.
                        </h2>
                        <ScrambleText text="Every frame, perfectly engineered." as="p" className="text-lg md:text-2xl mt-4 text-slate-300 pl-4" />
                    </div>
                </motion.div>

                {/* Text Area 3: 60% Right Aligned */}
                <motion.div
                    style={{ opacity: t3Opacity, y: t3Y }}
                    className="absolute inset-0 flex flex-col items-end justify-center pr-[10vw] pointer-events-none z-10"
                >
                    <div className="bg-slate-900/80 p-8 rounded-3xl border border-slate-700 shadow-xl text-right">
                        <h2 className="text-4xl md:text-6xl font-bold tracking-tight text-chrome border-r-4 border-slate-400 pr-4">
                            Layered Production.
                        </h2>
                        <ScrambleText text="See what’s inside the vision." as="p" className="text-lg md:text-2xl mt-4 text-slate-300 pr-4" />
                    </div>
                </motion.div>

                {/* Text Area 4: 90% Centered Bottom */}
                <motion.div
                    style={{ opacity: t4Opacity, y: t4Y }}
                    className="absolute inset-0 flex flex-col items-center justify-end pb-[15vh] pointer-events-none z-10"
                >
                    <h2 className="text-5xl md:text-7xl font-black tracking-tighter uppercase text-chrome drop-shadow-sm">
                        The Vision Push.
                    </h2>
                    <ScrambleText text="Scroll back to replay." as="p" className="text-lg md:text-2xl mt-4 text-orange-600 font-semibold tracking-widest uppercase" />
                </motion.div>

            </div>
        </div>
    );
}
