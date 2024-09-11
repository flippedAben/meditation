"use client";

import { Button } from "@/components/ui/button";
import { useState, useEffect, useRef } from "react";
import PlayIcon from "@/components/static/PlayIcon";
import PauseIcon from "@/components/static/PauseIcon";
import { sendLog } from "@/app/utils";

export default function Home() {
  const [log, setLog] = useState<[string, string][]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  function handleClick() {
    const currentDateTime = new Date().toISOString();
    sendLog(currentDateTime, "thought");
    setLog((prevLog) => [...prevLog, [currentDateTime, "thought"]]);
  }

  function handleRecordingClick() {
    const currentDateTime = new Date().toISOString();
    if (isRecording) {
      sendLog(currentDateTime, "stop");
      setLog((prevLog) => [...prevLog, [currentDateTime, "stop"]]);
    } else {
      sendLog(currentDateTime, "start");
      setLog((prevLog) => [...prevLog, [currentDateTime, "start"]]);
    }
    setIsRecording((prevIsRecording) => !prevIsRecording);
  }

  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop =
        scrollContainerRef.current.scrollHeight;
    }
  }, [log]);

  return (
    <div className="flex flex-col h-screen p-8 gap-4 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      {/* {`${process.env.NEXT_PUBLIC_API_URL}/log`} */}
      <main className="flex-grow overflow-hidden flex flex-col justify-end">
        <div
          ref={scrollContainerRef}
          className="flex-grow overflow-y-auto scrollbar-hide"
        >
          <ul className="list-none p-0">
            {log.map((entry, index) => {
              const date = new Date(entry[0]);
              const formattedDate = date
                .toISOString()
                .slice(0, 19)
                .replace("T", " ");
              return (
                <li key={index} className="mb-1">
                  <span className="font-mono">{formattedDate}</span>: {entry[1]}
                </li>
              );
            })}
          </ul>
        </div>
      </main>
      <div className="w-full">
        <div className="flex flex-col gap-4">
          <Button
            onClick={handleClick}
            className={`w-full text-xl h-24 ${
              !isRecording ? "cursor-not-allowed" : ""
            }`}
            disabled={!isRecording}
          >
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
          <Button
            className="w-full text-xl h-24"
            onClick={handleRecordingClick}
          >
            {isRecording ? <PauseIcon /> : <PlayIcon />}
          </Button>
        </div>
      </div>
    </div>
  );
}
