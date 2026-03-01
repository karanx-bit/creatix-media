"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";

interface ScrambleTextProps {
    text: string;
    className?: string;
    style?: React.CSSProperties;
    as?: React.ElementType;
    delay?: number; // Kept for interface compatibility, mostly unused now
}

const CHARS = "!<>-_\\\\/[]{}—=+*^?#________";

function ScrambleWord({ word }: { word: string }) {
    const [displayText, setDisplayText] = useState(word);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    const scramble = useCallback(() => {
        // Don't scramble purely empty/whitespace items
        if (!word.trim()) return;

        if (intervalRef.current) {
            clearInterval(intervalRef.current);
        }

        let iteration = 0;

        intervalRef.current = setInterval(() => {
            setDisplayText(() =>
                word
                    .split("")
                    .map((char, index) => {
                        if (index < iteration) {
                            return word[index]; // Reveal actual letter
                        }
                        // Show random symbol
                        return CHARS[Math.floor(Math.random() * CHARS.length)];
                    })
                    .join("")
            );

            // Once fully resolved, clear interval
            if (iteration >= word.length) {
                if (intervalRef.current) clearInterval(intervalRef.current);
            }

            // Reveal speed
            iteration += 1 / 3;
        }, 30); // Delay between ticks

    }, [word]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, []);

    return (
        <span
            className="cursor-crosshair inline-block transition-colors hover:text-white"
            onMouseEnter={scramble}
        >
            {displayText}
        </span>
    );
}

export default function ScrambleText({ text, className = "", style = {}, as: Tag = "span", delay = 0 }: ScrambleTextProps) {
    // Split the text by spaces so we can process each word individually
    const words = text.split(" ");

    return (
        <Tag className={className} style={style}>
            {words.map((word, i) => (
                <React.Fragment key={i}>
                    <ScrambleWord word={word} />
                    {i < words.length - 1 && " "}
                </React.Fragment>
            ))}
        </Tag>
    );
}
