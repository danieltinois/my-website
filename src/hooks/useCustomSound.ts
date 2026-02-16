import { useSoundContext } from "@/src/contexts/SoundContext";
import { useEffect, useCallback } from "react";
import useSound from "use-sound";

const useCustomSound = (
  soundPath: string,
  options = { speed: 1, lowPassFreq: 6500 },
) => {
  const { isMuted, toggleMute: globalToggleMute } = useSoundContext();

  const [playNative, { sound }] = useSound(soundPath, {
    volume: 1,
    preload: true,
    html5: false,
    interrupt: true,
    playbackRate: options.speed,
  });

  useEffect(() => {
    if (!sound?._sounds?.[0]?._node) return;

    const source = sound._sounds[0]._node;
    const ctx = source.context;

    if (ctx.state === "suspended") ctx.resume();

    const lowPass = ctx.createBiquadFilter();
    lowPass.type = "lowpass";
    lowPass.frequency.value = options.lowPassFreq;

    try {
      source.disconnect();
    } catch (e) {}

    source.connect(lowPass);
    lowPass.connect(ctx.destination);
  }, [sound, options.lowPassFreq]);

  const play = useCallback(() => {
    if (!isMuted) playNative();
  }, [isMuted, playNative]);

  return {
    play,
    isMuted,
    toggleMute: globalToggleMute,
  };
};

export default useCustomSound;
