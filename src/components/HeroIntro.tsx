"use client";

import React, { useState, useRef } from "react";
import FlickerText from "./FlickerText";
import ScrambleText from "./ScrambleText";

export default function HeroIntro() {
    const [hasEntered, setHasEntered] = useState(false);
    const videoRef = useRef<HTMLVideoElement>(null);

    const handleEnter = () => {
        setHasEntered(true);
        if (videoRef.current) {
            // Mobile Safari/Android often require explicit .play() tied to a user gesture (onClick)
            // Even if autoPlay is present, it will often pause unless forced here.
            videoRef.current.play().catch(e => console.error("Mobile play override failed:", e));
        }
    };

    return (
        <div className="w-full relative flex flex-col items-center justify-center bg-transparent text-slate-900 overflow-hidden z-20">

            {/* Slide 1 - Initial Hero View */}
            <div className="w-full h-screen flex flex-col items-center justify-center text-center px-4 relative">

                {/* Entry Overlay (Only shows before clicking Enter) */}
                {!hasEntered && (
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-2xl z-50 flex flex-col items-center justify-center p-6 transition-opacity duration-1000">
                        <div className="bg-white/5 border border-white/20 p-12 md:p-16 rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.5)] flex flex-col items-center text-center max-w-2xl transform scale-100 transition-all">
                            <div className="mb-6">
                                <FlickerText
                                    text="STEP INTO THE FUTURE."
                                    textColor="#f8fafc" // bright silver text
                                    glowColor="#a1a1aa" // chrome/zinc glow
                                    animationStyle="neon"
                                    glowIntensity={15}
                                    strokeWidth={1}
                                    animationSpeed={1.5}
                                    className="text-4xl md:text-6xl font-black uppercase tracking-tighter"
                                />
                            </div>
                            <ScrambleText
                                as="p"
                                text="You are about to enter a high-performance cinematic digital experience."
                                className="text-slate-300 text-lg md:text-xl font-medium mb-10 max-w-md leading-relaxed"
                                delay={500}
                            />
                            <button
                                onClick={handleEnter}
                                className="bg-gradient-to-br from-slate-100 to-slate-300 text-slate-900 px-10 py-5 rounded-full font-black text-lg uppercase tracking-widest hover:scale-105 transition-all shadow-[0_0_30px_rgba(255,255,255,0.4)] hover:shadow-[0_0_50px_rgba(255,255,255,0.6)]"
                            >
                                Enter Experience
                            </button>
                        </div>
                    </div>
                )}

                {/* Looping Background Video (Now controlled by React Ref) */}
                <video
                    ref={videoRef}
                    autoPlay
                    loop
                    playsInline
                    webkit-playsinline="true"
                    x5-playsinline="true"
                    preload="auto"
                    muted={!hasEntered}
                    className="absolute inset-0 w-full h-full object-cover z-0 opacity-80"
                    style={{ willChange: 'transform' }} // Forces hardware acceleration
                >
                    <source src="/AQPTiWXS3MEWZZppBDj_-BOvvzkpYbmRD9dmM4hhhZinCk9E91nB4vfFMSsd-HCFc_eff-T095YdcihDh6HPz284.mp4" type="video/mp4" />
                </video>

                {/* Dark fog overlay for text contrast */}
                <div className="absolute inset-0 bg-slate-900/40 z-0 bg-[radial-gradient(circle_at_center,rgba(249,115,22,0.1),transparent_50%)]" />

                {/* User's Uploaded Metallic Logo removed from center to become a fixed corner header element */}

                <h1 className="text-7xl md:text-[10rem] font-black uppercase tracking-tighter text-chrome mb-6 relative z-10 transition-opacity duration-1000" style={{ opacity: hasEntered ? 1 : 0 }}>
                    Creatix Media
                </h1>
                <ScrambleText
                    as="p"
                    text="We Don't Create Content. We Create Gravity."
                    className="text-2xl md:text-4xl font-semibold tracking-tight text-white drop-shadow-md relative z-10 transition-opacity duration-1000 delay-300"
                    style={{ opacity: hasEntered ? 1 : 0 }}
                    delay={300}
                />

                {/* Scroll Indicator */}
                <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center opacity-60 transition-opacity duration-1000 delay-700" style={{ opacity: hasEntered ? 0.6 : 0 }}>
                    <ScrambleText
                        as="span"
                        text="Scroll down"
                        className="text-sm font-bold tracking-widest uppercase mb-4 text-orange-600"
                        delay={1200}
                    />
                    <div className="w-8 h-12 border-2 border-slate-400 rounded-full flex justify-center p-1">
                        <div className="w-1.5 h-3 bg-orange-500 rounded-full animate-bounce" />
                    </div>
                </div>
            </div>

            {/* Slide 2 - Context/Lead-in */}
            <div className="w-full h-screen flex flex-col items-center justify-center text-center px-4 bg-transparent backdrop-blur-sm">
                <h2 className="text-5xl md:text-7xl font-bold tracking-tighter text-chrome mb-8 max-w-5xl leading-tight">
                    Precision engineered for <br />
                    <span className="text-slate-200 border-b-4 border-slate-400">maximum impact.</span>
                </h2>
                <ScrambleText
                    as="p"
                    text="The next section is a fully interactive WebGL scroll experience. Keep scrolling to tear down the vision."
                    className="text-xl md:text-3xl text-slate-300 max-w-3xl leading-relaxed drop-shadow-md font-medium"
                />
            </div>

        </div>
    );
}
