"use client";

import useKonami from "@/src/hooks/useKonami";
import useSound from "@/src/hooks/useSound";
import { useCallback, useEffect, useState } from "react";

const PartyMode = () => {
  const [party, setParty] = useState(false);
  const { play } = useSound("/sounds/click.mp3", { speed: 0.4 });

  const activate = useCallback(() => {
    setParty(true);
    play();
  }, [play]);

  useKonami(activate);

  useEffect(() => {
    document.body.classList.toggle("cn-party", party);
  }, [party]);

  return null;
};

export default PartyMode;