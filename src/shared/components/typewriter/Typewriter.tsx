"use client";

import React, { useState, useEffect, useRef } from "react";
import TypewriterProps from "@/shared/components/typewriter/types";

export const Typewriter = ({
  text,
  delay = 0,
  onComplete,
}: TypewriterProps) => {
  const [displayedText, setDisplayedText] = useState("");
  const onCompleteRef = useRef(onComplete);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

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
          if (onCompleteRef.current) {
            setTimeout(onCompleteRef.current, 300);
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
