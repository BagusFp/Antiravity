import Link from "next/link";
import { Play, Heart } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-[#07070A] border-t border-white/5 py-12 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center">
              <Play className="w-4 h-4 text-white fill-current" />
            </div>
            <span className="text-lg font-extrabold tracking-wider text-white">
              M<span className="text-accent">AG</span>
            </span>
          </div>

          {/* Links */}
          <div className="flex flex-wrap justify-center gap-x-8 gap-y-2 text-sm text-muted-foreground">
            <Link href="/" className="hover:text-white transition-colors">
              Home
            </Link>
            <Link href="/schedule" className="hover:text-white transition-colors">
              Schedule
            </Link>
            <Link href="/search" className="hover:text-white transition-colors">
              Browse
            </Link>
            <a
              href="https://api.jikan.moe/v4"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white transition-colors"
            >
              Jikan API
            </a>
            <a
              href="https://consumet.org"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white transition-colors"
            >
              Consumet
            </a>
          </div>

          {/* Disclaimer */}
          <div className="text-xs text-muted-foreground text-center md:text-right max-w-xs">
            MAG does not store any files on its servers. All contents are fetched dynamically from external third-party providers.
          </div>
        </div>

        <div className="border-t border-white/5 mt-8 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <div>
            &copy; {new Date().getFullYear()} MAG (MyAnimeGW). All rights reserved.
          </div>
          <div className="flex items-center space-x-1">
            <span>Made with</span>
            <Heart className="w-3.5 h-3.5 text-accent fill-current" />
            <span>for Indonesian Anime Fans.</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
