"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import {
  BlinkingCursor,
  TerminalPrompt,
} from "@/src/components/ui/TerminalElements";
import { Typewriter } from "@/src/components/ui/Typewriter";
import Terminal from "@/src/components/features/Terminal";
import { FILES } from "@/src/components/features/Terminal/commands";

const outputVariants = {
  hidden: { opacity: 0, y: -5, filter: "blur(2px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.3 },
  },
};

const About = () => {
  const [step, setStep] = useState(0);

  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [step]);

  return (
    <div className="h-full w-full overflow-y-auto bg-black/80 p-6 font-mono text-sm text-emerald-100 flex flex-col antialiased">
      <div className="flex-1">
        <div className="mb-6">
          <div className="flex items-center">
            <TerminalPrompt />
            <Typewriter
              text="cat info.json"
              delay={500}
              onComplete={() => setStep(1)}
            />
            {step === 0 && <BlinkingCursor />}
          </div>

          {step >= 1 && (
            <motion.div
              initial="hidden"
              animate="visible"
              variants={outputVariants}
              className="mt-2 pl-4 border-l-2 border-gray-700 transform-gpu"
            >
              <pre className="whitespace-pre-wrap">{FILES["info.json"]}</pre>
            </motion.div>
          )}
        </div>

        {step >= 1 && (
          <div className="mb-6">
            <div className="flex items-center">
              <TerminalPrompt />
              <Typewriter
                text="cat bio.txt"
                delay={800}
                onComplete={() => setStep(2)}
              />
              {step === 1 && <BlinkingCursor />}
            </div>

            {step >= 2 && (
              <motion.div
                initial="hidden"
                animate="visible"
                variants={outputVariants}
                className="mt-2 pl-4 border-l-2 border-gray-700 transform-gpu"
              >
                <p className="leading-relaxed">{FILES["bio.txt"]}</p>
              </motion.div>
            )}
          </div>
        )}

        {step >= 2 && (
          <div className="mb-6">
            <div className="flex items-center">
              <TerminalPrompt />
              <Typewriter
                text="echo $MINDSET"
                delay={800}
                onComplete={() => setStep(3)}
              />
              {step === 2 && <BlinkingCursor />}
            </div>

            {step >= 3 && (
              <motion.div
                initial="hidden"
                animate="visible"
                variants={outputVariants}
                className="mt-2 pl-4 border-l-2 border-gray-700 transform-gpu"
              >
                <p className="italic text-gray-400">{FILES["mindset.txt"]}</p>
              </motion.div>
            )}
          </div>
        )}
      </div>

      {step >= 3 && <Terminal />}

      <div ref={bottomRef} className="h-2 w-full" />
    </div>
  );
};

export default About;