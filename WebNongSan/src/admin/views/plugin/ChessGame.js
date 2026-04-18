import React, { useEffect, useRef } from 'react'

export default function ChessGame({ visible }) {
  const containerRef = useRef(null)
  const loadedRef = useRef(false)

  useEffect(() => {
    if (!visible || loadedRef.current) return
    loadedRef.current = true

    /* ================= LOAD LIBRARY ================= */
    const load = src =>
      new Promise(r => {
        const s = document.createElement('script')
        s.src = src
        s.onload = r
        document.head.appendChild(s)
      })

    const loadCSS = href => {
      if (document.querySelector(`link[href="${href}"]`)) return
      const l = document.createElement('link')
      l.rel = 'stylesheet'
      l.href = href
      document.head.appendChild(l)
    }

    async function boot() {
      loadCSS('https://unpkg.com/@chrisoakman/chessboardjs@1.0.0/dist/chessboard-1.0.0.min.css')
      loadCSS('https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css')

      if (!window.jQuery) await load('https://code.jquery.com/jquery-3.6.0.min.js')
      if (!window.ChessBoard) await load('https://unpkg.com/@chrisoakman/chessboardjs@1.0.0/dist/chessboard-1.0.0.min.js')
      if (!window.Chess) await load('https://cdnjs.cloudflare.com/ajax/libs/chess.js/0.10.3/chess.min.js')

      startApp()
    }

    function startApp() {
      // --- HỆ THỐNG ÂM THANH CẢI TIẾN ---
      const audioPaths = {
        move: 'https://lichess.org/assets/sound/standard/Move.ogg',
        capture: 'https://lichess.org/assets/sound/standard/Capture.ogg',
        check: 'https://lichess.org/assets/sound/standard/Check.ogg',
        end: 'https://lichess.org/assets/sound/standard/GenericNotify.ogg'
      };

      const playSfx = (moveObj, delay = 0) => {
        if (!moveObj) return;
        
        // Sử dụng setTimeout để tránh tiếng bị double khi AI đi quá nhanh
        setTimeout(() => {
          try {
            let soundUrl = audioPaths.move;
            // Kiểm tra chiếu tướng ngay sau nước đi
            if (game.in_check()) {
              soundUrl = audioPaths.check;
            } else if (moveObj.captured) {
              soundUrl = audioPaths.capture;
            }
            
            const audio = new Audio(soundUrl);
            audio.play().catch(() => {});
          } catch (e) {}
        }, delay);
      };

      const playEndSfx = () => {
        try { new Audio(audioPaths.end).play().catch(() => {}); } catch (e) {}
      };
      // ----------------------------------

      containerRef.current.innerHTML = `
        <style>
          .chess-overlay {
            position: fixed;
            inset: 0;
            background: rgba(0,0,0,.65);
            backdrop-filter: blur(6px);
            z-index: 1000;
            display: flex;
            justify-content: center;
            align-items: center;
            overflow-y: auto;
            padding: 10px;
          }
          .chess-card-container {
            width: 100%;
            max-width: 1100px;
            margin: auto;
          }
          .piece-417db {
            z-index: 9999 !important;
            cursor: grabbing !important;
            filter: drop-shadow(0 10px 14px rgba(0,0,0,.35));
            transform: scale(1.08);
          }
          img {
            transition: transform .15s cubic-bezier(.22,.61,.36,1), left .15s cubic-bezier(.22,.61,.36,1), top .15s cubic-bezier(.22,.61,.36,1);
          }
          .board-green .white-1e1d7 { background:#e6f2e6 }
          .board-green .black-3c85d { background:#4f7942 }
          .board-classic .white-1e1d7 { background:#f0d9b5 }
          .board-classic .black-3c85d { background:#b58863 }
          .board-blue .white-1e1d7 { background:#dee9f5 }
          .board-blue .black-3c85d { background:#4a6fa5 }
          .board-dark .white-1e1d7 { background:#444 }
          .board-dark .black-3c85d { background:#222 }
          #promotion-layer {
            display: none;
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: white;
            padding: 15px;
            border-radius: 12px;
            box-shadow: 0 10px 40px rgba(0,0,0,0.5);
            z-index: 10001;
            text-align: center;
            width: 90%;
            max-width: 320px;
          }
          .promo-choice {
            border: 2px solid #eee;
            background: #f8f9fa;
            border-radius: 8px;
            cursor: pointer;
            transition: 0.2s;
            padding: 5px;
            margin: 5px;
            flex: 1;
          }
          .promo-choice:hover {
            background: #e9ecef;
            border-color: #0d6efd;
            transform: translateY(-3px);
          }
          .promo-choice img { width: 100%; max-width: 60px; height: auto; }
          #result-modal {
            display: none;
            position: fixed;
            inset: 0;
            background: rgba(0,0,0,0.8);
            z-index: 10005;
            justify-content: center;
            align-items: center;
            padding: 20px;
          }
          .result-card {
            background: white;
            padding: 25px;
            border-radius: 20px;
            max-width: 450px;
            width: 100%;
            text-align: center;
            box-shadow: 0 20px 50px rgba(0,0,0,0.3);
            animation: bounceIn 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55);
          }
          @keyframes bounceIn {
            from { opacity: 0; transform: scale(0.5); }
            to { opacity: 1; transform: scale(1); }
          }
          .result-gif { width: 100%; border-radius: 10px; margin-bottom: 20px; max-height: 200px; object-fit: cover; }
          @media (max-width: 991.98px) {
            .col-lg-8 { margin-bottom: 1rem; }
            #board { margin: 0 auto; }
            .card-body { padding: 1rem; }
            .result-card h2 { font-size: 1.5rem; }
          }
        </style>

        <div class="chess-overlay">
          <div id="result-modal">
            <div class="result-card">
              <img id="result-gif" class="result-gif" src="" />
              <h2 id="result-title" class="fw-bold mb-3"></h2>
              <p id="result-text" class="text-muted mb-4 fw-bold"></p>
              <button id="restart-btn" class="btn btn-dark btn-lg w-100">Ván mới thôi nào</button>
            </div>
          </div>

          <div id="promotion-layer">
            <button id="cancel-promotion" style="position:absolute; top:5px; right:10px; border:none; background:none; font-size:18px; cursor:pointer;">✖</button>
            <h6 class="fw-bold mb-3">Chọn quân phong cấp</h6>
            <div class="d-flex justify-content-center">
              <div class="promo-choice" data-promo="q"><img src="https://chessboardjs.com/img/chesspieces/wikipedia/wQ.png" /></div>
              <div class="promo-choice" data-promo="r"><img src="https://chessboardjs.com/img/chesspieces/wikipedia/wR.png" /></div>
              <div class="promo-choice" data-promo="b"><img src="https://chessboardjs.com/img/chesspieces/wikipedia/wB.png" /></div>
              <div class="promo-choice" data-promo="n"><img src="https://chessboardjs.com/img/chesspieces/wikipedia/wN.png" /></div>
            </div>
          </div>

          <div class="chess-card-container">
            <div class="card shadow-lg">
              <div class="card-header bg-dark text-white fw-bold d-flex justify-content-between align-items-center p-3">
                <span>♟️ Chơi cờ vua</span>
                <button id="closeChess" class="btn btn-sm btn-outline-light">✖</button>
              </div>
              <div class="card-body">
                <div class="row">
                  <div class="col-12 col-lg-8 d-flex justify-content-center position-relative">
                    <div id="board" style="width: 100%; max-width: 600px;"></div>
                  </div>
                  <div class="col-12 col-lg-4 mt-3 mt-lg-0">
                    <div class="d-flex flex-column gap-3 h-100">
                      <div id="status" class="alert alert-info fw-bold text-center mb-0 p-2">👉 Đến lượt bạn</div>
                      <div class="row row-cols-2 row-cols-lg-1 g-2">
                        <div class="col">
                          <label class="fw-bold small">🎨 Màu bàn cờ</label>
                          <select id="boardTheme" class="form-select form-select-sm">
                            <option value="classic">Cổ điển</option>
                            <option value="blue">Xanh dương</option>
                            <option value="green" selected>Xanh lá</option>
                            <option value="dark">Tối</option>
                          </select>
                        </div>
                        <div class="col">
                          <label class="fw-bold small">♟️ Kiểu quân cờ</label>
                          <select id="style" class="form-select form-select-sm">
                            <option value="wikipedia">Wikipedia</option>
                            <option value="alpha">Alpha</option>
                            <option value="cburnett">Cburnett</option>
                            <option value="cardinal">Cardinal</option>
                            <option value="merida" selected>Merida</option>
                          </select>
                        </div>
                        <div class="col-12">
                          <label class="fw-bold small">🤖 ELO AI</label>
                          <select id="aiElo" class="form-select form-select-sm">
                            <option value="800">800 (Người mới)</option>
                            <option value="1000">1000</option>
                            <option value="1200">1200</option>
                            <option value="1400" selected>1400</option>
                            <option value="1600">1600</option>
                            <option value="1800">1800</option>
                            <option value="2000">2000</option>
                            <option value="2200">2200</option>
                            <option value="2400">2400 (Master)</option>
                          </select>
                        </div>
                      </div>
                      <button id="reset" class="btn btn-dark btn-lg mt-lg-auto w-100">🔄 Ván mới</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      `

      const game = new window.Chess()
      let board
      let thinking = false
      let currentElo = 1400
      let pendingPromotion = null

      const status = document.getElementById('status')
      const boardEl = document.getElementById('board')
      const promoLayer = document.getElementById('promotion-layer')
      const resultModal = document.getElementById('result-modal')

      const gifArchive = {
        win: ["https://media.giphy.com/media/3o7TKVUn7iM8FMEU24/giphy.gif", "https://media.giphy.com/media/1GT5PZLjMwYBW/giphy.gif"],
        lose: ["https://media.giphy.com/media/6gDSyjaOPwZ4A/giphy.gif", "https://media.giphy.com/media/3o6ZtaO9BZHcOjmErm/giphy.gif"],
        draw: ["https://media.giphy.com/media/26u4b45b8KlgAB7iM/giphy.gif", "https://media.giphy.com/media/xT9IgusfDcqpPFzjdS/giphy.gif"]
      };

      const jokes = {
        win: ["Ghê đấy! Check VAR ngay!", "Thắng rồi! Bộ não của bạn nhanh hơn Stockfish rồi."],
        lose: {
          low: ["Mức 800 mà cũng thua?", "Về chơi cờ cá ngựa đi bạn ơi!"],
          mid: ["Sai một li, đi luôn cả ván cờ.", "Nước cờ của bạn... khó hiểu thật."],
          high: ["Thua Grandmaster không có gì xấu hổ.", "Bạn đã trụ vững? Đẳng cấp!"]
        }
      };

      function cancelPromotion() {
        promoLayer.style.display = 'none';
        pendingPromotion = null;
        board.position(game.fen(), true); 
      }

      document.getElementById('cancel-promotion').onclick = cancelPromotion;

      function showGameOver(winner) {
        playEndSfx();
        const title = document.getElementById('result-title')
        const text = document.getElementById('result-text')
        const gif = document.getElementById('result-gif')

        let gifSource, jokeMessage;
        if (winner === 'human') {
          title.innerText = "CHÚC MỪNG! 🎉"; title.style.color = "#28a745";
          jokeMessage = jokes.win[Math.floor(Math.random() * jokes.win.length)];
          gifSource = gifArchive.win[Math.floor(Math.random() * gifArchive.win.length)];
        } else if (winner === 'ai') {
          title.innerText = "BẠN ĐÃ THUA! 💀"; title.style.color = "#dc3545";
          let list = currentElo <= 1200 ? jokes.lose.low : (currentElo >= 2000 ? jokes.lose.high : jokes.lose.mid);
          jokeMessage = list[Math.floor(Math.random() * list.length)];
          gifSource = gifArchive.lose[Math.floor(Math.random() * gifArchive.lose.length)];
        } else {
          title.innerText = "HÒA CỜ! 🤝"; title.style.color = "#007bff";
          jokeMessage = "Kẻ tám lạng, người nửa cân!";
          gifSource = gifArchive.draw[Math.floor(Math.random() * gifArchive.draw.length)];
        }

        text.innerText = jokeMessage
        gif.src = gifSource
        resultModal.style.display = 'flex'
      }

      document.getElementById('restart-btn').onclick = () => {
        resultModal.style.display = 'none'
        document.getElementById('reset').click()
      }

      const PIECE_THEMES = {
        wikipedia: 'https://chessboardjs.com/img/chesspieces/wikipedia/{piece}.png',
        alpha: 'https://chessboardjs.com/img/chesspieces/alpha/{piece}.png',
        cburnett: 'https://lichess1.org/assets/piece/cburnett/{piece}.svg',
        cardinal: 'https://lichess1.org/assets/piece/cardinal/{piece}.svg',
        merida: 'https://lichess1.org/assets/piece/merida/{piece}.svg'
      }

      const ELO_CONFIG = {
        800:  { skill: 1,  depth: 6,  time: 150 },
        1000: { skill: 3,  depth: 8,  time: 250 },
        1200: { skill: 5,  depth: 10, time: 350 },
        1400: { skill: 8,  depth: 12, time: 500 },
        1600: { skill: 12, depth: 14, time: 700 },
        1800: { skill: 15, depth: 16, time: 900 },
        2000: { skill: 18, depth: 18, time: 1200 },
        2200: { skill: 20, depth: 20, time: 1600 },
        2400: { skill: 20, depth: 22, time: 2000 }
      }

      const stockfish = new Worker('/stockfish.js')
      stockfish.postMessage('uci')
      stockfish.postMessage('isready')

      function applyElo(elo) {
        const cfg = ELO_CONFIG[elo]
        stockfish.postMessage(`setoption name Skill Level value ${cfg.skill}`)
        stockfish.postMessage('setoption name UCI_LimitStrength value true')
        stockfish.postMessage(`setoption name UCI_Elo value ${elo}`)
      }

      applyElo(1400)

      stockfish.onmessage = e => {
        if (!e.data.startsWith('bestmove')) return
        thinking = false
        const move = e.data.split(' ')[1]
        if (!move || move === '(none)') return
        
        const moveObj = game.move(move, { sloppy: true })
        // AI đi quân: Delay 250ms để không bị đè âm thanh với người chơi
        playSfx(moveObj, 250); 
        
        board.position(game.fen(), true)
        updateStatus()
        
        if (game.game_over()) {
          if (game.in_checkmate()) showGameOver('ai')
          else showGameOver('draw')
        }
      }

      function commitMove(promoPiece) {
        promoLayer.style.display = 'none'
        const moveObj = game.move({ from: pendingPromotion.from, to: pendingPromotion.to, promotion: promoPiece })
        playSfx(moveObj); 
        
        board.position(game.fen(), true)
        updateStatus()
        
        if (game.game_over()) {
          if (game.in_checkmate()) showGameOver('human')
          else showGameOver('draw')
          return
        }

        thinking = true
        status.innerText = '🤖 Stockfish đang suy nghĩ...'
        stockfish.postMessage('position fen ' + game.fen())
        stockfish.postMessage(`go depth ${ELO_CONFIG[currentElo].depth} movetime ${ELO_CONFIG[currentElo].time}`)
        pendingPromotion = null
      }

      document.querySelectorAll('.promo-choice').forEach(el => {
        el.onclick = () => commitMove(el.getAttribute('data-promo'))
      })

      function createBoard(themeKey) {
        board = window.ChessBoard('board', {
          draggable: true,
          position: game.fen(),
          pieceTheme: PIECE_THEMES[themeKey],
          onDragStart: (s, p) => {
            if (thinking || game.game_over()) return false
            if (p.startsWith('b')) return false
          },
          onDrop: (s, t) => {
            const sourcePiece = game.get(s)
            const isPromotion = sourcePiece && sourcePiece.type === 'p' && (t.endsWith('8') || t.endsWith('1'))

            if (isPromotion) {
              const tempGame = new window.Chess(game.fen())
              if (!tempGame.move({ from: s, to: t, promotion: 'q' })) return 'snapback'
              pendingPromotion = { from: s, to: t }
              promoLayer.style.display = 'block'
              return
            }

            const move = game.move({ from: s, to: t, promotion: 'q' })
            if (!move) return 'snapback'

            playSfx(move); // Người chơi đi: Phát ngay lập tức
            updateStatus()

            if (game.game_over()) {
              if (game.in_checkmate()) showGameOver('human')
              else showGameOver('draw')
              return
            }

            thinking = true
            status.innerText = '🤖 Stockfish đang suy nghĩ...'
            stockfish.postMessage('position fen ' + game.fen())
            stockfish.postMessage(`go depth ${ELO_CONFIG[currentElo].depth} movetime ${ELO_CONFIG[currentElo].time}`)
          },
          onSnapEnd: () => board.position(game.fen(), false)
        })
      }

      function updateStatus() {
        if (game.in_checkmate()) status.innerText = '⚠️ Chiếu hết!'
        else if (game.in_draw()) status.innerText = '🤝 Hòa cờ'
        else if (game.in_check()) status.innerText = '⚡ Bị chiếu'
        else status.innerText = '👉 Đến lượt bạn'
      }

      createBoard('merida')
      setBoardTheme('green')

      const handleResize = () => { if (board) board.resize(); };
      window.addEventListener('resize', handleResize);

      function setBoardTheme(theme) {
        boardEl.classList.remove('board-classic','board-blue','board-green','board-dark')
        boardEl.classList.add('board-' + theme)
      }

      document.getElementById('boardTheme').onchange = e => setBoardTheme(e.target.value)
      document.getElementById('style').onchange = e => { board.destroy(); createBoard(e.target.value) }
      document.getElementById('aiElo').onchange = e => { currentElo = Number(e.target.value); applyElo(currentElo) }
      
      document.getElementById('reset').onclick = () => {
        game.reset(); thinking = false; board.destroy();
        createBoard(document.getElementById('style').value); 
        setBoardTheme(document.getElementById('boardTheme').value);
        applyElo(currentElo); updateStatus(); promoLayer.style.display = 'none';
      }

      document.getElementById('closeChess').onclick = () => {
        window.removeEventListener('resize', handleResize);
        containerRef.current.innerHTML = ''
        loadedRef.current = false
      }
    }
    boot()
  }, [visible])

  return <div ref={containerRef} />
}