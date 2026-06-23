type Tone = 'tap' | 'next' | 'success';

const tones: Record<Tone, { frequency: number; second?: number; duration: number; gain: number }> = {
  tap: { frequency: 520, duration: 0.07, gain: 0.025 },
  next: { frequency: 660, second: 880, duration: 0.09, gain: 0.03 },
  success: { frequency: 587, second: 988, duration: 0.12, gain: 0.035 },
};

let audioContext: AudioContext | null = null;

function getAudioContext() {
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;

  if (!AudioContextClass) return null;
  if (!audioContext) audioContext = new AudioContextClass();

  return audioContext;
}

function playFrequency(context: AudioContext, frequency: number, offset: number, duration: number, gainValue: number) {
  const oscillator = context.createOscillator();
  const gain = context.createGain();
  const start = context.currentTime + offset;

  oscillator.type = 'sine';
  oscillator.frequency.setValueAtTime(frequency, start);
  oscillator.frequency.exponentialRampToValueAtTime(frequency * 1.08, start + duration);

  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(gainValue, start + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);

  oscillator.connect(gain);
  gain.connect(context.destination);
  oscillator.start(start);
  oscillator.stop(start + duration + 0.02);
}

export function playUiTone(tone: Tone = 'tap') {
  const context = getAudioContext();
  const toneConfig = tones[tone];

  if (!context) return;

  if (context.state === 'suspended') {
    void context.resume();
  }

  playFrequency(context, toneConfig.frequency, 0, toneConfig.duration, toneConfig.gain);

  if (toneConfig.second) {
    playFrequency(context, toneConfig.second, 0.055, toneConfig.duration, toneConfig.gain * 0.82);
  }
}

declare global {
  interface Window {
    webkitAudioContext?: typeof AudioContext;
  }
}
