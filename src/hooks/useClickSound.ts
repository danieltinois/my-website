import { useSoundContext } from "@/src/contexts/SoundContext";
import { useEffect } from "react";
import useSound from "use-sound";

const useClickSound = (initialMuted = false, speed = 2) => {
  const { isMuted, toggleMute: globalToggleMute } = useSoundContext();

  const [playClick, { sound: clickSound }] = useSound("/sounds/click.mp3", {
    volume: 1,
    preload: true,
    html5: false,
    interrupt: true,
    playbackRate: speed,
  });

  useEffect(() => {
    if (!clickSound?._sounds?.[0]?._node) return;

    const source = clickSound._sounds[0]._node;
    const ctx = source.context;

    if (ctx.state === "suspended") ctx.resume();

    const lowPass = ctx.createBiquadFilter();
    lowPass.type = "lowpass";
    lowPass.frequency.value = 6500;

    try {
      source.disconnect();
    } catch (e) {
      console.log(e);
    }

    source.connect(lowPass);
    lowPass.connect(ctx.destination);
  }, [clickSound]);

  const toggleMute = () => {
    globalToggleMute();
    if (isMuted) {
      // If currently muted, we are unmuting, so play sound
      playClick();
    }
  };

  const play = () => {
    if (!isMuted) playClick();
  };

  return { playClick: play, isMuted, toggleMute };
};

export default useClickSound;
