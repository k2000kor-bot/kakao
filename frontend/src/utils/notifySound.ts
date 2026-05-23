/**
 * Web Audio API 기반 알림음 유틸
 * localStorage corbu.settings.notifySound = '1' 일 때만 재생
 */

const SOUND_KEY = 'corbu.settings.notifySound';

function isSoundEnabled(): boolean {
  try { return localStorage.getItem(SOUND_KEY) !== '0'; } catch { return true; }
}

let ctx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!ctx) {
    try { ctx = new AudioContext(); } catch { return null; }
  }
  return ctx;
}

/** 짧은 성공음 (두 음절 상행) */
export function playSoundSuccess(): void {
  if (!isSoundEnabled()) return;
  const ac = getCtx();
  if (!ac) return;
  const now = ac.currentTime;
  [[523, 0], [659, 0.12]].forEach(([freq, t]) => {
    const osc = ac.createOscillator();
    const gain = ac.createGain();
    osc.connect(gain); gain.connect(ac.destination);
    osc.type = 'sine';
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0.18, now + t);
    gain.gain.exponentialRampToValueAtTime(0.001, now + t + 0.25);
    osc.start(now + t);
    osc.stop(now + t + 0.28);
  });
}

/** 짧은 에러음 (하행 두 음절) */
export function playSoundError(): void {
  if (!isSoundEnabled()) return;
  const ac = getCtx();
  if (!ac) return;
  const now = ac.currentTime;
  [[440, 0], [349, 0.15]].forEach(([freq, t]) => {
    const osc = ac.createOscillator();
    const gain = ac.createGain();
    osc.connect(gain); gain.connect(ac.destination);
    osc.type = 'sawtooth';
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0.1, now + t);
    gain.gain.exponentialRampToValueAtTime(0.001, now + t + 0.2);
    osc.start(now + t);
    osc.stop(now + t + 0.22);
  });
}

/** 단순 틱 (알림·새 메시지) */
export function playSoundNotify(): void {
  if (!isSoundEnabled()) return;
  const ac = getCtx();
  if (!ac) return;
  const now = ac.currentTime;
  const osc = ac.createOscillator();
  const gain = ac.createGain();
  osc.connect(gain); gain.connect(ac.destination);
  osc.type = 'sine';
  osc.frequency.value = 880;
  gain.gain.setValueAtTime(0.12, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
  osc.start(now);
  osc.stop(now + 0.18);
}
