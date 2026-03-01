"use client";

import { brandData } from "../data/brand";

export default function Navbar() {
    return (
        <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-5 backdrop-blur-md bg-transparent">
            <div className="text-white font-bebas text-3xl tracking-wide">
                {brandData.name}
            </div>

            <button className="bg-gradient-to-r from-primeBlue to-primeRed text-white px-6 py-2 rounded-none font-bebas text-xl tracking-wider hover:opacity-90 transition-opacity">
                {brandData.priceLabel}
            </button>
        </nav>
    );
}
