"use client";

import { Button } from "@/components/ui/button";
import { useState, useEffect, useRef } from "react";

export default function Home() {
  const [log, setLog] = useState<string[]>([]);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const handleClick = () => {
    const currentDateTime = new Date().toISOString();
    setLog((prevLog) => [...prevLog, currentDateTime]);
  };

  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop =
        scrollContainerRef.current.scrollHeight;
    }
  }, [log]);

  return (
    <div className="flex flex-col h-screen p-8 gap-4 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex-grow overflow-hidden flex flex-col justify-end">
        <div
          ref={scrollContainerRef}
          className="flex-grow overflow-y-auto scrollbar-hide"
        >
          <ul className="list-none p-0">
            {log.map((entry, index) => {
              const date = new Date(entry);
              const formattedDate = date
                .toISOString()
                .slice(0, 19)
                .replace("T", " ");
              return (
                <li key={index} className="mb-1">
                  <span className="font-mono">{formattedDate}</span>
                </li>
              );
            })}
          </ul>
        </div>
      </main>
      <div className="w-full">
        <Button onClick={handleClick} className="w-full text-xl h-60">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
        </Button>
      </div>
    </div>
  );
}
