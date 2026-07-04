'use client';

import { useCallback, useRef } from 'react';

/**
 * Sound effects hook using the Web Audio API
 * Generates procedural sounds — no external audio files required.
 *
 * Backend integration point: Replace procedural audio with
 * fetched .mp3/.ogg files from /public/sounds/ for richer audio.
 */

type AudioContextRef = AudioContext | null;

function createAudioContext(): AudioContextRef {
  if (typeof window === 'undefined') return null;
  try {
    return new (window.AudioContext || (window as any).webkitAudioContext)();
  } catch {
    return null;
  }
}

function playTone(
  ctx: AudioContext,
  frequency: number,
  duration: number,
  type: OscillatorType = 'sine',
  gainValue = 0.15,
  delay = 0
) {
  const oscillator = ctx.createOscillator();
  const gainNode = ctx.createGain();

  oscillator.connect(gainNode);
  gainNode.connect(ctx.destination);

  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, ctx.currentTime + delay);
  oscillator.frequency.exponentialRampToValueAtTime(frequency * 0.5, ctx.currentTime + delay + duration);

  gainNode.gain.setValueAtTime(0, ctx.currentTime + delay);
  gainNode.gain.linearRampToValueAtTime(gainValue, ctx.currentTime + delay + 0.01);
  gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + duration);

  oscillator.start(ctx.currentTime + delay);
  oscillator.stop(ctx.currentTime + delay + duration + 0.05);
}

export function useSoundEffects(enabled: boolean) {
  const ctxRef = useRef<AudioContextRef>(null);

  const getCtx = useCallback((): AudioContext | null => {
    if (!enabled) return null;
    if (!ctxRef.current) {
      ctxRef.current = createAudioContext();
    }
    if (ctxRef.current?.state === 'suspended') {
      ctxRef.current.resume();
    }
    return ctxRef.current;
  }, [enabled]);

  const playMove = useCallback(() => {
    const ctx = getCtx();
    if (!ctx) return;
    playTone(ctx, 440, 0.08, 'triangle', 0.12);
  }, [getCtx]);

  const playCapture = useCallback(() => {
    const ctx = getCtx();
    if (!ctx) return;
    playTone(ctx, 300, 0.06, 'square', 0.1);
    playTone(ctx, 220, 0.1, 'triangle', 0.08, 0.05);
  }, [getCtx]);

  const playCheck = useCallback(() => {
    const ctx = getCtx();
    if (!ctx) return;
    playTone(ctx, 660, 0.1, 'sine', 0.15);
    playTone(ctx, 880, 0.08, 'sine', 0.12, 0.1);
  }, [getCtx]);

  const playGameOver = useCallback(() => {
    const ctx = getCtx();
    if (!ctx) return;
    playTone(ctx, 440, 0.2, 'sine', 0.15);
    playTone(ctx, 370, 0.2, 'sine', 0.15, 0.2);
    playTone(ctx, 310, 0.4, 'sine', 0.15, 0.4);
  }, [getCtx]);

  const playSelect = useCallback(() => {
    const ctx = getCtx();
    if (!ctx) return;
    playTone(ctx, 520, 0.05, 'triangle', 0.08);
  }, [getCtx]);

  return { playMove, playCapture, playCheck, playGameOver, playSelect };
}