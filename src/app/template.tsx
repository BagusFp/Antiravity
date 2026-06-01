"use client";

import { useEffect, useState } from "react";

export default function Template({ children }: { children: React.ReactNode }) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    return () => {
      setIsMounted(false);
    };
  }, []);

  return (
    <div
      className={`transition-all duration-400 ease-out ${
        isMounted
          ? "opacity-100 translate-y-0 filter-none"
          : "opacity-0 translate-y-3 blur-[2px]"
      } flex-grow flex flex-col`}
    >
      {children}
    </div>
  );
}
