"use client";

import React, { useState } from "react";
import LiquidImage from "./LiquidImage";
import ScrambleText from "./ScrambleText";

const PROJECTS = [
    {
        id: 1,
        title: "Liquid Vision",
        category: "Eyewear Campaign",
        image: "/project-1.jpg",
        gridStyle: "md:col-span-2 md:row-span-2 aspect-[4/5] object-top",
    },
    {
        id: 2,
        title: "Tailored Form",
        category: "Apparel Collection",
        image: "/project-2.jpg",
        gridStyle: "md:col-span-1 md:row-span-1 aspect-square",
    },
    {
        id: 3,
        title: "The Blazer",
        category: "Lookbook",
        image: "/project-3.jpg",
        gridStyle: "md:col-span-1 md:row-span-1 aspect-square",
    },
    {
        id: 4,
        title: "Earth Tones",
        category: "Editorial",
        image: "/project-4.jpg",
        gridStyle: "md:col-span-1 md:row-span-1 aspect-[4/5]",
    },
    {
        id: 5,
        title: "Modern Classic",
        category: "Campaign",
        image: "/project-5.jpg",
        gridStyle: "md:col-span-1 md:row-span-1 aspect-[4/5]",
    },
    {
        id: 6,
        title: "Monochrome Study",
        category: "Editorial Portrait",
        image: "/project-6.jpg",
        gridStyle: "md:col-span-1 md:row-span-1 aspect-[4/5]",
    },
    {
        id: 7,
        title: "Street Archive",
        category: "Fashion Film",
        image: "/project-7.jpg",
        gridStyle: "md:col-span-3 md:row-span-1 aspect-[21/9] object-center",
    },
    {
        id: 8,
        title: "Brand Motion",
        category: "Cinematography",
        image: "/0228.mp4",
        gridStyle: "md:col-span-3 md:row-span-2 aspect-[16/9] object-center",
    }
];

export default function FeaturedProjects() {
    const [selectedProject, setSelectedProject] = useState<typeof PROJECTS[0] | null>(null);

    return (
        <section className="w-full py-24 md:py-32 px-4 md:px-12 xl:px-24">

            {/* Section Header */}
            <div className="max-w-7xl mx-auto mb-16 md:mb-24 flex flex-col md:flex-row justify-between items-end gap-8">
                <div>
                    <h2 className="text-5xl md:text-7xl font-black tracking-tighter text-chrome uppercase drop-shadow-md">
                        Selected <br /> Work.
                    </h2>
                    <div className="h-1 w-24 bg-slate-300 mt-6 shadow-[0_0_10px_rgba(255,255,255,0.5)]" />
                </div>
                <ScrambleText
                    as="p"
                    text="A curated collection of our most impactful fashion and editorial campaigns."
                    className="text-xl md:text-2xl text-slate-300 max-w-md font-medium"
                />
            </div>

            {/* Asymmetrical Aesthetic Grid */}
            <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 auto-rows-fr">
                {PROJECTS.map((project) => (
                    <div
                        key={project.id}
                        className={`group relative w-full rounded-xl overflow-hidden cursor-pointer shadow-lg hover:shadow-2xl transition-all duration-700 ${project.gridStyle}`}
                        onClick={() => setSelectedProject(project)}
                    >
                        {/* Media Renderer */}
                        {project.image.endsWith('.mp4') ? (
                            <video
                                src={project.image}
                                autoPlay
                                loop
                                muted
                                playsInline
                                className="w-full h-full object-cover transition-transform duration-[1.5s] ease-out group-hover:scale-105"
                            />
                        ) : (
                            <img
                                src={project.image}
                                alt={project.title}
                                className="w-full h-full object-cover transition-transform duration-[1.5s] ease-out group-hover:scale-105"
                            />
                        )}

                        {/* Subtle Gradient Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/10 to-transparent opacity-50 group-hover:opacity-80 transition-opacity duration-500" />

                        {/* Text Content */}
                        <div className="absolute bottom-0 left-0 w-full p-6 md:p-10 flex flex-col justify-end translate-y-4 group-hover:translate-y-0 transition-transform duration-500 ease-out">
                            <span className="text-orange-400 font-bold tracking-widest uppercase text-xs md:text-sm mb-2 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                                {project.category}
                            </span>
                            <h3 className="text-2xl md:text-4xl font-black text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)] tracking-tight">
                                {project.title}
                            </h3>
                        </div>
                    </div>
                ))}
            </div>

            {/* View All Button */}
            <div className="max-w-7xl mx-auto mt-20 flex justify-center">
                <button className="px-10 py-5 bg-slate-900 text-white rounded-full font-bold tracking-widest uppercase hover:bg-orange-500 hover:-translate-y-1 transition-all duration-300 shadow-xl">
                    View Complete Archive
                </button>
            </div>

            {/* Fullscreen 9:16 Lightbox Modal */}
            {selectedProject && (
                <div
                    className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/80 backdrop-blur-xl transition-opacity animate-in fade-in duration-300"
                    onClick={() => setSelectedProject(null)}
                >
                    {/* Close Button */}
                    <button className="absolute top-6 right-6 md:top-10 md:right-10 text-white/50 hover:text-white transition-colors z-[110]">
                        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>

                    {/* 9:16 Container */}
                    <div
                        className="relative w-full max-w-md h-[85vh] md:h-[90vh] aspect-[9/16] bg-black rounded-xl overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.8)]"
                        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking the media directly
                    >
                        {selectedProject.image.endsWith('.mp4') ? (
                            <video
                                src={selectedProject.image}
                                autoPlay
                                loop
                                controls // Added controls for better fullscreen experience
                                playsInline
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <img
                                src={selectedProject.image}
                                alt={selectedProject.title}
                                className="w-full h-full object-cover"
                            />
                        )}

                        {/* Title Overlay in Modal */}
                        <div className="absolute bottom-0 inset-x-0 p-8 bg-gradient-to-t from-black/90 to-transparent pointer-events-none">
                            <span className="text-orange-400 font-bold tracking-widest uppercase text-sm mb-2 block drop-shadow-md">
                                {selectedProject.category}
                            </span>
                            <h3 className="text-3xl font-black text-chrome tracking-tight">
                                {selectedProject.title}
                            </h3>
                        </div>
                    </div>
                </div>
            )}

        </section>
    );
}
