"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { brandData } from "../data/brand";

interface Props {
    contentRef: React.RefObject<HTMLDivElement>;
}

export default function PostSequenceContent({ contentRef }: Props) {
    const { scrollYProgress } = useScroll({
        target: contentRef,
        offset: ["start end", "end end"]
    });

    // Background color shift slightly darker as we scroll down
    const backgroundColor = useTransform(
        scrollYProgress,
        [0, 1],
        [brandData.colors.deepBlack, "#050505"]
    );

    return (
        <motion.div
            ref={contentRef}
            style={{ backgroundColor }}
            className="relative w-full z-10"
        >
            <div className="max-w-7xl mx-auto px-8 py-32 flex flex-col gap-[40vh]">
                {brandData.postSequenceSections.map((section, idx) => (
                    <SectionBlock
                        key={section.title}
                        idx={idx}
                        title={section.title}
                        content={section.content}
                    />
                ))}
            </div>
        </motion.div>
    );
}

function SectionBlock({ title, content, idx }: { title: string, content: string, idx: number }) {
    const ref = useRef(null);
    const { scrollYProgress } = useScroll({
        target: ref,
        offset: ["start 80%", "end 20%"]
    });

    const opacity = useTransform(scrollYProgress, [0, 0.5, 1], [0, 1, 0.4]);
    const y = useTransform(scrollYProgress, [0, 0.5, 1], [100, 0, -50]);

    // Alternate alignments
    const alignment = idx % 2 === 0 ? "items-start text-left" : "items-end text-right";

    return (
        <motion.div
            ref={ref}
            style={{ opacity, y }}
            className={`flex flex-col w-full ${alignment}`}
        >
            <h3 className="text-primeBlue font-bebas text-4xl mb-4 tracking-widest uppercase">
                {title}
            </h3>
            <p className="text-white text-3xl md:text-5xl lg:text-7xl font-medium max-w-4xl tracking-tight leading-tight">
                {content}
            </p>
        </motion.div>
    );
}
