import confetti from 'canvas-confetti';

export function fireCelebrationConfetti() {
  try {
    // Left side burst
    confetti({
      particleCount: 50,
      angle: 60,
      spread: 55,
      origin: { x: 0, y: 0.65 },
      colors: ['#10b981', '#f59e0b', '#3b82f6', '#ec4899', '#8b5cf6']
    });

    // Right side burst
    confetti({
      particleCount: 50,
      angle: 120,
      spread: 55,
      origin: { x: 1, y: 0.65 },
      colors: ['#10b981', '#f59e0b', '#3b82f6', '#ec4899', '#8b5cf6']
    });
  } catch {
    // ignore if canvas unavailable
  }
}
