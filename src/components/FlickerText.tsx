"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { motion, useInView } from "framer-motion";

interface FlickerTextProps {
    text: string;
    textColor?: string;
    glowColor?: string;
    animationSpeed?: number;
    animationPattern?: "sequential" | "random" | "sync";
    repeatBehavior?: "once" | "loop";
    animationStyle?: "neon" | "led" | "retro" | "electric";
    strokeWidth?: number;
    glowIntensity?: number;
    autoPlay?: boolean;
    className?: string;
}

export default function FlickerText({
    text = "FLICKER TEXT",
    textColor = "#FFFFFF",
    glowColor = "#d4d4d8", // Chrome/silver glow by default
    animationSpeed = 1,
    animationPattern = "sequential",
    repeatBehavior = "loop",
    animationStyle = "neon",
    strokeWidth = 2,
    glowIntensity = 10,
    autoPlay = true,
    className = ""
}: FlickerTextProps) {
    const [isPlaying, setIsPlaying] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const isInView = useInView(containerRef, { once: false });

    // Split text into characters for individual animation
    const characters = useMemo(() => {
        return text.split("").map((char, index) => ({
            char: char === " " ? "\u00A0" : char,
            index,
            id: `${char}-${index}`
        }));
    }, [text]);

    // Animation timing calculations
    const baseDelay = 0.1 / animationSpeed;
    const flickerDuration = 0.3 / animationSpeed;
    const totalDuration = characters.length * baseDelay + flickerDuration;

    // Generate animation delays based on pattern
    const getAnimationDelay = (index: number) => {
        switch (animationPattern) {
            case "sequential":
                return index * baseDelay;
            case "random":
                return Math.random() * (totalDuration * 0.7);
            case "sync":
                return 0;
            default:
                return index * baseDelay;
        }
    };

    // Style variations based on animation style
    const getStyleVariation = () => {
        switch (animationStyle) {
            case "neon":
                return {
                    filter: `drop-shadow(0 0 ${glowIntensity}px ${glowColor})`,
                    textShadow: `0 0 ${glowIntensity * 2}px ${glowColor}`
                };
            case "led":
                return {
                    filter: `drop-shadow(0 0 ${glowIntensity * 0.5}px ${glowColor})`,
                    textShadow: `0 0 ${glowIntensity}px ${glowColor}`
                };
            case "retro":
                return {
                    filter: `drop-shadow(0 0 ${glowIntensity * 1.5}px ${glowColor}) contrast(1.2)`,
                    textShadow: `0 0 ${glowIntensity * 3}px ${glowColor}`
                };
            case "electric":
                return {
                    filter: `drop-shadow(0 0 ${glowIntensity * 2}px ${glowColor}) brightness(1.1)`,
                    textShadow: `0 0 ${glowIntensity * 4}px ${glowColor}`
                };
            default:
                return {};
        }
    };

    const styleVariation = getStyleVariation();

    // Auto-play logic
    useEffect(() => {
        if (autoPlay && isInView) {
            setIsPlaying(true);
        }
    }, [autoPlay, isInView]);

    // Character animation variants
    const characterVariants = {
        initial: {
            opacity: 1,
            color: textColor,
            WebkitTextStroke: `${strokeWidth}px transparent`,
            textShadow: "none",
            filter: "none"
        },
        flicker: (index: number) => ({
            opacity: [1, 0.3, 1, 0.1, 1, 0.7, 1],
            color: [textColor, "transparent", textColor, "transparent", textColor],
            WebkitTextStroke: [
                `${strokeWidth}px transparent`,
                `${strokeWidth}px ${textColor}`,
                `${strokeWidth}px transparent`,
                `${strokeWidth}px ${textColor}`,
                `${strokeWidth}px transparent`
            ],
            transition: {
                duration: flickerDuration,
                delay: getAnimationDelay(index),
                ease: "easeInOut",
                repeat: repeatBehavior === "loop" ? Infinity : 0,
                repeatDelay: repeatBehavior === "loop" ? totalDuration : 0
            }
        })
    };

    return (
        <div ref={containerRef} className={`relative flex flex-col items-center justify-center ${className}`}>
            <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", alignItems: "center", gap: "0", ...styleVariation }}>
                {characters.map((character, index) => (
                    <motion.span
                        key={`${character.id}`}
                        custom={index}
                        variants={characterVariants}
                        initial="initial"
                        animate={isPlaying ? "flicker" : "initial"}
                        style={{
                            display: "inline-block",
                            fontSize: "inherit",
                            fontWeight: "inherit",
                            fontFamily: "inherit",
                            lineHeight: "inherit",
                            letterSpacing: "inherit",
                            whiteSpace: "pre"
                        }}
                    >
                        {character.char}
                    </motion.span>
                ))}
            </div>
        </div>
    );
}
