"use client";

import React, { useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";

export function NavigationLoader() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  // Reset/complete loader when pathname or search params update
  useEffect(() => {
    if (isLoading) {
      setProgress(100);
      const timer = setTimeout(() => {
        setIsVisible(false);
        const resetTimer = setTimeout(() => {
          setIsLoading(false);
          setProgress(0);
        }, 200);
        return () => clearTimeout(resetTimer);
      }, 180);
      return () => clearTimeout(timer);
    }
  }, [pathname, searchParams, isLoading]);

  // Trickle progress when loading
  useEffect(() => {
    if (!isLoading) return;

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) return prev;
        // Asymptotic trickle
        const diff = 90 - prev;
        const step = Math.max(1, Math.floor(diff * 0.15));
        return Math.min(prev + step, 90);
      });
    }, 120);

    // Timeout safety fallback (max 8 seconds)
    const safetyTimeout = setTimeout(() => {
      setIsVisible(false);
      setIsLoading(false);
      setProgress(0);
    }, 8000);

    return () => {
      clearInterval(interval);
      clearTimeout(safetyTimeout);
    };
  }, [isLoading]);

  // Intercept local link clicks
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      // Don't intercept if modifier keys are pressed or non-primary click
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) {
        return;
      }

      const target = (e.target as HTMLElement).closest("a");
      if (!target) return;

      const href = target.getAttribute("href");
      if (!href) return;

      // Ignore external, target blank, anchors, or pseudo-protocols
      if (
        target.target === "_blank" ||
        target.hasAttribute("download") ||
        href.startsWith("#") ||
        href.startsWith("http://") ||
        href.startsWith("https://") ||
        href.startsWith("mailto:") ||
        href.startsWith("tel:") ||
        href.startsWith("javascript:")
      ) {
        return;
      }

      // Check if it's the exact current URL (including search)
      const currentFullUrl = window.location.pathname + window.location.search;
      if (href === currentFullUrl || href === window.location.pathname) {
        return;
      }

      // Start transition animation
      setIsVisible(true);
      setIsLoading(true);
      setProgress(20);
    };

    const handlePopState = () => {
      setIsVisible(true);
      setIsLoading(true);
      setProgress(30);
    };

    document.addEventListener("click", handleClick, { capture: true });
    window.addEventListener("popstate", handlePopState);

    return () => {
      document.removeEventListener("click", handleClick, { capture: true });
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);

  if (!isVisible && !isLoading) {
    return null;
  }

  return (
    <>
      {/* Top glowing Lime Progress Bar */}
      <div
        className="fixed top-0 left-0 right-0 h-[2.5px] z-[99999] pointer-events-none transition-all duration-200 ease-out"
        style={{
          width: `${progress}%`,
          opacity: isVisible ? 1 : 0,
        }}
        aria-hidden="true"
      >
        <div className="w-full h-full bg-gradient-to-r from-emerald-500 via-[#ccff00] to-white shadow-[0_0_16px_#ccff00,0_0_32px_rgba(204,255,0,0.6)] relative">
          {/* Leading-edge flare */}
          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-8 h-3 bg-white blur-[2px] rounded-full opacity-90" />
        </div>
      </div>

      {/* Futuristic Obsidian & Lime Corner Telemetry Badge */}
      <div
        className={`fixed top-4 right-4 z-[99998] pointer-events-none transition-all duration-300 transform ${
          isVisible ? "opacity-100 translate-y-0 scale-100" : "opacity-0 -translate-y-2 scale-95"
        }`}
        aria-hidden="true"
      >
        <div className="flex items-center gap-2.5 rounded-full border border-lime-500/30 bg-[#0c0c0c]/90 px-3.5 py-1.5 backdrop-blur-xl shadow-[0_0_30px_rgba(0,0,0,0.9)] ring-1 ring-white/10">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#ccff00] opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-[#ccff00]" />
          </span>
          <span className="font-mono text-[10px] font-semibold tracking-widest uppercase text-white/90">
            AERVY // ROUTE_TRANSIT
          </span>
          <span className="font-mono text-[9px] font-bold text-[#ccff00]">
            {Math.min(100, Math.round(progress))}%
          </span>
        </div>
      </div>
    </>
  );
}
