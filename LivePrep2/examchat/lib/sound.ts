// Chat sounds use the Slack "new message" sample from /sounds/slack-receive.mp3.
// We decode once into an AudioBuffer so playback is instant and overlap-safe.

let ctx: AudioContext | null = null;
let slackBuffer: AudioBuffer | null = null;
let slackLoadStarted = false;

const SLACK_SOUND_URL = "/sounds/slack-receive.mp3";

function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  const Ctor =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext?: typeof AudioContext })
      .webkitAudioContext;
  if (!Ctor) return null;
  if (!ctx) ctx = new Ctor();
  return ctx;
}

function loadSlackBuffer(c: AudioContext): void {
  if (slackBuffer || slackLoadStarted) return;
  slackLoadStarted = true;
  void fetch(SLACK_SOUND_URL)
    .then((r) => (r.ok ? r.arrayBuffer() : Promise.reject(r.status)))
    .then((buf) => c.decodeAudioData(buf))
    .then((decoded) => {
      slackBuffer = decoded;
    })
    .catch(() => {
      slackLoadStarted = false;
    });
}

export function unlockSound(): void {
  const c = getCtx();
  if (!c) return;
  if (c.state === "suspended") {
    void c.resume();
  }
  loadSlackBuffer(c);
}

function playSlackSample(c: AudioContext, volume: number): void {
  loadSlackBuffer(c);
  if (!slackBuffer) return;
  const src = c.createBufferSource();
  src.buffer = slackBuffer;
  const gain = c.createGain();
  gain.gain.value = volume;
  src.connect(gain);
  gain.connect(c.destination);
  src.start(0);
}

export function playSendSound(): void {
  const c = getCtx();
  if (!c) return;
  if (c.state === "suspended") {
    void c.resume();
  }
  playSlackSample(c, 0.55);
}

export function playReceiveSound(): void {
  const c = getCtx();
  if (!c) return;
  if (c.state === "suspended") {
    void c.resume();
  }
  playSlackSample(c, 0.72);
}
