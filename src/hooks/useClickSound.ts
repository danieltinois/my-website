import { useEffect, useState } from "react";
import useSound from "use-sound";

const useClickSound = (initialMuted = false, speed = 1.5) => {
  const [isMuted, setIsMuted] = useState(initialMuted);

  // Cria o sound sem depender do estado
  const [playClick, { sound: clickSound }] = useSound("/sounds/click.mp3", {
    volume: 1, // sempre 1 aqui
    preload: true,
    html5: false,
    interrupt: true,
    playbackRate: speed,
  });

  // Aplica filtro low-pass para som abafado
  useEffect(() => {
    if (!clickSound?._sounds?.length) return;

    const source = clickSound._sounds[0]._node;
    const ctx = source.context;

    if (ctx.state === "suspended") {
      ctx.resume();
    }

    const lowPass = ctx.createBiquadFilter();
    lowPass.type = "lowpass";
    lowPass.frequency.value = 800;
    lowPass.Q.value = 1;

    source.disconnect();
    source.connect(lowPass);
    lowPass.connect(ctx.destination);
  }, [clickSound]);

  const toggleMute = () => {
    setIsMuted((prevMuted) => {
      const newMuted = !prevMuted;

      // Se desmutando, toca o som
      if (newMuted === false) {
        playClick();
      }

      return newMuted;
    });
  };

  // Função para tocar o som respeitando mudo
  const play = () => {
    if (!isMuted) playClick();
  };

  return { playClick: play, isMuted, toggleMute };
};

export default useClickSound;
