"use client";

import { Button } from "@/components/ui/button";
import { useState, useEffect, useRef } from "react";
import PlayIcon from "@/components/static/PlayIcon";
import PauseIcon from "@/components/static/PauseIcon";
import { sendLog } from "@/app/utils";
import useSound from "use-sound";

export default function Home() {
  const [log, setLog] = useState<[string, string][]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const [wakeLock, setWakeLock] = useState<WakeLockSentinel | null>(null);
  const [playBell] = useSound("/audio/bell.mp3");

  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.continuous = true;
    recognition.interimResults = false;

    const speechRecognitionList = new (window.SpeechGrammarList ||
      window.webkitSpeechGrammarList)();
    const grammar =
      "#JSGF V1.0; grammar commands; public <command> = thought | thinking";
    speechRecognitionList.addFromString(grammar, 1);
    recognition.grammars = speechRecognitionList;

    recognitionRef.current = recognition;
  }, []);

  async function acquireWakeLock() {
    try {
      const wakeLock = await navigator.wakeLock.request("screen");
      setWakeLock(wakeLock);
      console.log("Wake Lock acquired");
    } catch (err) {
      console.error(`Failed to acquire Wake Lock: ${err}`);
    }
  }

  async function releaseWakeLock() {
    if (wakeLock) {
      try {
        await wakeLock.release();
        setWakeLock(null);
        console.log("Wake Lock released");
      } catch (err) {
        console.error(`Failed to release Wake Lock: ${err}`);
      }
    }
  }

  async function handleRecordingClick() {
    const currentDateTime = new Date().toISOString();
    const previouslyRecording = isRecording;
    if (previouslyRecording) {
      sendLog(currentDateTime, "stop");
      setLog((prevLog) => [...prevLog, [currentDateTime, "stop"]]);
      if (recognitionRef.current) {
        recognitionRef.current.onend = () => {};
        recognitionRef.current.stop();
      }
      await releaseWakeLock();
    } else {
      sendLog(currentDateTime, "start");
      setLog((prevLog) => [...prevLog, [currentDateTime, "start"]]);
      await acquireWakeLock();

      if (recognitionRef.current) {
        recognitionRef.current.onend = () => {
          console.log("onend: restarting recognition");
          if (recognitionRef.current) {
            recognitionRef.current.start();
          }
        };
        recognitionRef.current.onresult = (event) => {
          console.log("onresult");
          const last = event.results.length - 1;
          const command = event.results[last][0].transcript.trim();
          if (
            (command === "thought" || command === "thinking") &&
            !previouslyRecording
          ) {
            const currentDateTime = new Date().toISOString();
            sendLog(currentDateTime, "thought");
            setLog((prevLog) => [...prevLog, [currentDateTime, "thought"]]);
            playBell();
          }
        };
        recognitionRef.current.start();
      }
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
      <Button className="w-full text-xl h-24" onClick={handleRecordingClick}>
        {isRecording ? <PauseIcon /> : <PlayIcon />}
      </Button>
    </div>
  );
}
