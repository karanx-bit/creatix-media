"use client";

import { useEffect, useRef, useState } from "react";
import { useScroll, useTransform, useMotionValueEvent, motion } from "framer-motion";
import { brandData } from "../data/brand";

interface Props {
    containerRef: React.RefObject<HTMLDivElement>;
}

export default function HeroCanvas({ containerRef }: Props) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [images, setImages] = useState<HTMLImageElement[]>([]);
    const { totalFrames } = brandData.sequence;

    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end end"]
    });

    // Calculate current frame (from 1 to 240) based on scroll progress
    const frameIndex = useTransform(scrollYProgress, [0, 1], [1, totalFrames]);

    // Background color fade from primeBlue to deepBlack
    const backgroundColor = useTransform(
        scrollYProgress,
        [0.7, 1],
        [brandData.colors.primeBlue, brandData.colors.deepBlack]
    );

    // Fade out canvas at the very end to transition into the next section
    const canvasOpacity = useTransform(scrollYProgress, [0.95, 1], [1, 0]);

    // Preload images
    useEffect(() => {
        const loadedImages: HTMLImageElement[] = [];
        let loadedCount = 0;

        for (let i = 1; i <= totalFrames; i++) {
            const img = new Image();
            // Format number to 3 digits e.g., 001, 045, 240
            const paddedIndex = i.toString().padStart(3, "0");
            img.src = `${brandData.sequence.folder}frame-${paddedIndex}.jpg`;

            img.onload = () => {
                loadedImages[i] = img;
                loadedCount++;
                // If it's the first frame, draw it immediately
                if (i === 1) drawImage(img);
            };
        }
        setImages(loadedImages);
    }, [totalFrames]);

    const drawImage = (img: HTMLImageElement) => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        // Use device pixel ratio for sharper image
        const dpr = window.devicePixelRatio || 1;
        // We update canvas dimensions to match viewport dynamically inside a resize listener
        // but the actual drawing size:
        const renderWidth = canvas.width;
        const renderHeight = canvas.height;

        ctx.clearRect(0, 0, renderWidth, renderHeight);

        // Object-fit: contain logic
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

    // Handle Resize
    useEffect(() => {
        const resizeCanvas = () => {
            if (!canvasRef.current) return;
            canvasRef.current.width = window.innerWidth * (window.devicePixelRatio || 1);
            canvasRef.current.height = window.innerHeight * (window.devicePixelRatio || 1);
            canvasRef.current.style.width = `${window.innerWidth}px`;
            canvasRef.current.style.height = `${window.innerHeight}px`;

            // re-draw current frame
            const currentFrame = Math.floor(frameIndex.get());
            if (images[currentFrame]) {
                drawImage(images[currentFrame]);
            }
        };

        window.addEventListener("resize", resizeCanvas);
        resizeCanvas(); // initial call
        return () => window.removeEventListener("resize", resizeCanvas);
    }, [images, frameIndex]);

    // Render on scroll
    useMotionValueEvent(frameIndex, "change", (latest) => {
        const frame = Math.floor(latest);
        if (images[frame]) {
            drawImage(images[frame]);
        }
    });

    return (
        <motion.div
            style={{ backgroundColor }}
            className="sticky top-0 h-screen w-full flex items-center justify-center overflow-hidden"
        >
            {/* Fallback glow/gradient */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/40 z-10 pointer-events-none" />

            <motion.canvas
                ref={canvasRef}
                style={{ opacity: canvasOpacity }}
                className="block z-0"
            />
        </motion.div>
    );
}
