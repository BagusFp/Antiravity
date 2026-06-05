"use client";

import { useEffect } from "react";

export default function PwaRegister() {
  useEffect(() => {
    // 1. Service Worker Registration
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      const registerSW = async () => {
        try {
          const registration = await navigator.serviceWorker.register("/sw.js");
          console.log("[PWA] Service Worker registered successfully:", registration.scope);
        } catch (error) {
          console.error("[PWA] Service Worker registration failed:", error);
        }
      };

      // Register after page load for optimal page load speed
      if (document.readyState === "complete") {
        registerSW();
      } else {
        window.addEventListener("load", registerSW);
        return () => window.removeEventListener("load", registerSW);
      }
    }
  }, []);

  useEffect(() => {
    // 2. Standalone Mode Detection & Viewport Maximization
    if (typeof window !== "undefined") {
      const checkStandalone = () => {
        const isStandalone = 
          window.matchMedia("(display-mode: standalone)").matches || 
          (navigator as any).standalone === true;
        
        if (isStandalone) {
          document.documentElement.classList.add("pwa-standalone");
          document.body.classList.add("pwa-standalone");
          console.log("[PWA] Running in Standalone (Installed) Mode");
        } else {
          document.documentElement.classList.remove("pwa-standalone");
          document.body.classList.remove("pwa-standalone");
        }
      };

      checkStandalone();
      
      // Listen for display mode changes (e.g. if the window is resized or modes toggle)
      const mediaQuery = window.matchMedia("(display-mode: standalone)");
      try {
        mediaQuery.addEventListener("change", checkStandalone);
        return () => mediaQuery.removeEventListener("change", checkStandalone);
      } catch (e) {
        // Fallback for older browsers
        try {
          mediaQuery.addListener(checkStandalone);
          return () => mediaQuery.removeListener(checkStandalone);
        } catch (err) {}
      }
    }
  }, []);

  return null;
}
