"use client";

import React, { useState, useEffect } from "react";
import TypewriterProps from "@/src/components/ui/Typewriter/interfaces";

export const Typewriter = ({
  text,
  delay = 0,
  onComplete,
}: TypewriterProps) => {
  const [displayedText, setDisplayedText] = useState("");

  useEffect(() => {
    setDisplayedText("");
    let i = 0;
    let typingInterval: NodeJS.Timeout;

    const startTyping = () => {
      typingInterval = setInterval(() => {
        if (i < text.length) {
          setDisplayedText((prev) => text.substring(0, prev.length + 1));
          i++;
        } else {
          clearInterval(typingInterval);
          if (onComplete) {
            setTimeout(onComplete, 300);
          }
        }
      }, 50);
    };

    const delayTimer = setTimeout(startTyping, delay);

    return () => {
      clearTimeout(delayTimer);
      clearInterval(typingInterval);
    };
  }, [text, delay]);

  return <span className="text-gray-100">{displayedText}</span>;
};
