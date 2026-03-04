// chessSounds.js
const SOUND_URLS = {
  move: 'https://images.chesscomfiles.com/chess-themes/pieces/base/sounds/move-self.mp3',
  capture: 'https://images.chesscomfiles.com/chess-themes/pieces/base/sounds/capture.mp3',
  check: 'https://images.chesscomfiles.com/chess-themes/pieces/base/sounds/move-check.mp3',
  gameEnd: 'https://images.chesscomfiles.com/chess-themes/pieces/base/sounds/game-end.mp3',
  gameStart: 'https://images.chesscomfiles.com/chess-themes/pieces/base/sounds/game-start.mp3',
  notify: 'https://images.chesscomfiles.com/chess-themes/pieces/base/sounds/notify.mp3'
};

// Tạo các instance Audio
const audioInstances = {};
Object.keys(SOUND_URLS).forEach(key => {
  audioInstances[key] = new Audio(SOUND_URLS[key]);
});

/**
 * Hàm phát âm thanh cờ vua
 * @param {string} type - Loại âm thanh ('move', 'capture', 'check', 'gameEnd', 'gameStart', 'notify')
 */
export const playChessSound = (type) => {
  const sound = audioInstances[type];
  if (sound) {
    sound.currentTime = 0; // Reset về đầu để có thể phát liên tục
    sound.play().catch(err => console.warn("Audio play blocked:", err));
  }
};