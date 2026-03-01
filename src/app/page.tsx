import HeroIntro from "../components/HeroIntro";
import KeyboardScroll from "../components/KeyboardScroll";
import FeaturedProjects from "../components/FeaturedProjects";
import FooterContent from "../components/FooterContent";
import LiquidChromeBackground from "../components/LiquidChromeBackground";

export default function Home() {
    return (
        <main className="relative w-full overflow-hidden bg-transparent">
            {/* The Full Website Liquid Chrome WebGL Background */}
            <div className="fixed inset-0 w-full h-full z-0 pointer-events-none">
                <LiquidChromeBackground speed={0.4} noiseIntensity={0.03} warpAmount={0.3} />
            </div>

            {/* Permanent Corner Branding */}
            <header className="fixed top-6 left-6 md:top-10 md:left-12 z-50 pointer-events-none">
                <img
                    src="/logo_transparent.png"
                    alt="Creatix Media Logo"
                    className="w-20 md:w-28 h-auto object-contain opacity-90 drop-shadow-2xl"
                />
            </header>

            {/* Content Container layered securely ABOVE the WebGL background */}
            <div className="relative z-10">
                <HeroIntro />
                <KeyboardScroll />
                <FeaturedProjects />
                <FooterContent />
            </div>
        </main>
    );

}
