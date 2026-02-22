"use client";

import React from "react";
import { motion } from "framer-motion";

export const TerminalPrompt = () => (
  <span className="mr-2 select-none">
    <span className="text-green-400">daniel@macbook-pro</span>
    <span className="text-white">:</span>
    <span className="text-blue-400">~/portfolio</span>
    <span className="text-white">$</span>
  </span>
);

export const BlinkingCursor = () => (
  <motion.span
    animate={{ opacity: [1, 1, 0, 0] }}
    transition={{ duration: 0.8, repeat: Infinity, times: [0, 0.5, 0.5, 1] }}
    className="inline-block bg-gray-400 w-2 h-4 ml-1 translate-y-0.5"
  />
);
