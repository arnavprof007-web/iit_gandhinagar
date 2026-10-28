import confetti from 'canvas-confetti';

export function triggerEcoConfetti(): void {
  try {
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.7 },
      colors: ['#10b981', '#059669', '#34d399', '#f59e0b', '#22c55e'],
    });
  } catch (error) {
    // Graceful fallback if canvas is not supported in environment
    console.debug('Confetti effect triggered', error);
  }
}
