"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Search, Play, Menu, X, Calendar, Compass, User } from "lucide-react";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setIsMobileMenuOpen(false);
    }
  };

  const navLinks = [
    { name: "Home", href: "/", icon: Compass },
    { name: "Schedule", href: "/schedule", icon: Calendar },
    { name: "Search", href: "/search", icon: Search },
  ];

  return (
    <nav
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-[#0B0B0F]/90 backdrop-blur-md border-b border-white/5 py-3"
          : "bg-transparent py-5"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-12">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2 group">
              <div className="w-9 h-9 rounded-lg bg-accent flex items-center justify-center shadow-lg shadow-accent/20 group-hover:bg-accent-hover transition-colors">
                <Play className="w-5 h-5 text-white fill-current" />
              </div>
              <span className="text-xl font-extrabold tracking-wider text-white group-hover:text-accent transition-colors">
                M<span className="text-accent">AG</span>
              </span>
            </Link>
          </div>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`text-sm font-medium transition-colors hover:text-white flex items-center space-x-1.5 ${
                    isActive ? "text-accent" : "text-muted-foreground"
                  }`}
                >
                  <link.icon className="w-4 h-4" />
                  <span>{link.name}</span>
                </Link>
              );
            })}
          </div>

          {/* Search bar & Profile */}
          <div className="hidden md:flex items-center space-x-4">
            <form onSubmit={handleSearchSubmit} className="relative">
              <input
                type="text"
                placeholder="Search anime..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-48 lg:w-64 px-4 py-1.5 pl-10 text-sm bg-muted/80 text-white placeholder-muted-foreground rounded-full border border-white/5 focus:outline-none focus:border-accent/50 focus:w-80 transition-all duration-300"
              />
              <Search className="w-4 h-4 text-muted-foreground absolute left-3.5 top-2.5" />
            </form>

            <button className="w-9 h-9 rounded-full bg-muted border border-white/5 flex items-center justify-center hover:bg-accent transition-all text-muted-foreground hover:text-white">
              <User className="w-4 h-4" />
            </button>
          </div>

          {/* Mobile menu toggle */}
          <div className="flex md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-muted-foreground hover:text-white focus:outline-none"
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden glass border-b border-white/5 absolute top-full left-0 w-full animate-fade-in">
          <div className="px-4 pt-4 pb-6 space-y-4">
            <form onSubmit={handleSearchSubmit} className="relative w-full">
              <input
                type="text"
                placeholder="Search anime..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 pl-10 text-sm bg-muted text-white placeholder-muted-foreground rounded-full border border-white/5 focus:outline-none focus:border-accent"
              />
              <Search className="w-4 h-4 text-muted-foreground absolute left-3.5 top-3" />
            </form>

            <div className="space-y-1">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg text-base font-medium transition-colors ${
                      isActive
                        ? "bg-accent/10 text-accent border-l-2 border-accent"
                        : "text-muted-foreground hover:bg-muted hover:text-white"
                    }`}
                  >
                    <link.icon className="w-5 h-5" />
                    <span>{link.name}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
