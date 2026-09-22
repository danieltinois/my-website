import { useCallback, useEffect } from "react";
import useSoundPackage from "use-sound";
import { useSoundContext } from "@/src/context/SoundContext";

interface UseSoundOptions {
  speed?: number;
  lowPassFreq?: number;
}

const applyLowPass = (
  sound: { _sounds?: unknown[] } | null,
  lowPassFreq = 6500,
) => {
  const source = (sound?._sounds?.[0] as { _node?: AudioNode } | undefined)
    ?._node;
  if (!source) return;

  const ctx = source.context as AudioContext;
  if (ctx.state === "suspended") ctx.resume();

  const lowPass = ctx.createBiquadFilter();
  lowPass.type = "lowpass";
  lowPass.frequency.value = lowPassFreq;

  // already disconnected/piped by a previous effect run
  try {
    source.disconnect();
  } catch {}

  source.connect(lowPass);
  lowPass.connect(ctx.destination);
};

const useSound = (
  soundPath: string,
  { speed = 1, lowPassFreq = 6500 }: UseSoundOptions = {},
) => {
  const { isMuted, toggleMute: contextToggleMute } = useSoundContext();

  const [playNative, { sound }] = useSoundPackage(soundPath, {
    volume: 1,
    preload: true,
    html5: false,
    interrupt: true,
    playbackRate: speed,
  });

  useEffect(() => {
    applyLowPass(sound, lowPassFreq);
  }, [sound, lowPassFreq]);

  const play = useCallback(() => {
    if (!isMuted) playNative();
  }, [isMuted, playNative]);

  const toggleMute = useCallback(() => {
    contextToggleMute();
    if (isMuted) playNative();
  }, [contextToggleMute, isMuted, playNative]);

  return { play, isMuted, toggleMute };
};

export default useSound;