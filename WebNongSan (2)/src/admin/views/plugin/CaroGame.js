import React, { useState } from 'react'
import { CButton } from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilX, cilReload } from '@coreui/icons'

const SIZE = 15

const AI_DELAY = {
  easy: 200,
  medium: 350,
  hard: 600,
}

/* =======================
    ZEBRA-STYLE AI CORE (UPGRADED)
======================= */
const AI = {
  HUMAN: 'X',
  BOT: 'O',
  dirs: [[1, 0], [0, 1], [1, 1], [1, -1]],
  memory: {},

  inBoard(r, c) {
    return r >= 0 && c >= 0 && r < SIZE && c < SIZE
  },

  countContinuous(board, r, c, dx, dy, role) {
    let cnt = 0, blocks = 0
    let i = 1
    while (this.inBoard(r + dx * i, c + dy * i) && board[r + dx * i][c + dy * i] === role) {
      cnt++; i++
    }
    if (!this.inBoard(r + dx * i, c + dy * i) || (board[r + dx * i][c + dy * i] && board[r + dx * i][c + dy * i] !== role)) {
      blocks++
    }
    return { cnt, blocks }
  },

  evaluatePoint(board, r, c, role) {
    let totalScore = 0
    for (let [dx, dy] of this.dirs) {
      const left = this.countContinuous(board, r, c, dx, dy, role)
      const right = this.countContinuous(board, r, c, -dx, -dy, role)
      const count = left.cnt + right.cnt + 1
      const blocks = left.blocks + right.blocks

      if (count >= 5) return 10000000 
      
      if (blocks === 0) {
        if (count === 4) totalScore += 500000
        else if (count === 3) totalScore += 5000
        else if (count === 2) totalScore += 500
      } else if (blocks === 1) {
        if (count === 4) totalScore += 5000
        else if (count === 3) totalScore += 500
        else if (count === 2) totalScore += 100
      }
    }
    return totalScore
  },

  getNeighbors(board) {
    const neighbors = []
    for (let r = 0; r < SIZE; r++) {
      for (let c = 0; c < SIZE; c++) {
        if (!board[r][c] && this.isNear(board, r, c, 1)) {
          neighbors.push({ r, c })
        }
      }
    }
    return neighbors
  },

  isNear(board, r, c, dist) {
    for (let i = -dist; i <= dist; i++)
      for (let j = -dist; j <= dist; j++)
        if (this.inBoard(r + i, c + j) && board[r + i][c + j]) return true
    return false
  },

  rememberHumanMove(r, c) {
    const k = `${r},${c}`; this.memory[k] = (this.memory[k] || 0) + 1
  },

  minimax(board, depth, alpha, beta, isMaximizing) {
    const neighbors = this.getNeighbors(board)
    if (depth === 0 || neighbors.length === 0) return this.evaluateBoard(board)

    if (isMaximizing) {
      let maxEval = -Infinity
      for (const move of neighbors) {
        board[move.r][move.c] = this.BOT
        const ev = this.minimax(board, depth - 1, alpha, beta, false)
        board[move.r][move.c] = null
        maxEval = Math.max(maxEval, ev)
        alpha = Math.max(alpha, ev)
        if (beta <= alpha) break
      }
      return maxEval
    } else {
      let minEval = Infinity
      for (const move of neighbors) {
        board[move.r][move.c] = this.HUMAN
        const ev = this.minimax(board, depth - 1, alpha, beta, true)
        board[move.r][move.c] = null
        minEval = Math.min(minEval, ev)
        beta = Math.min(beta, ev)
        if (beta <= alpha) break
      }
      return minEval
    }
  },

  evaluateBoard(board) {
    let score = 0
    for (let r = 0; r < SIZE; r++) {
      for (let c = 0; c < SIZE; c++) {
        if (board[r][c] === this.BOT) score += this.evaluatePoint(board, r, c, this.BOT)
        if (board[r][c] === this.HUMAN) score -= this.evaluatePoint(board, r, c, this.HUMAN) * 1.2
      }
    }
    return score
  },

  bestMove(board, level) {
    let hasStone = false
    for (let r = 0; r < SIZE; r++) 
        for (let c = 0; c < SIZE; c++) 
            if (board[r][c]) { hasStone = true; break; }

    if (!hasStone) return { r: Math.floor(SIZE / 2), c: Math.floor(SIZE / 2) }

    let bestScore = -Infinity
    let move = null
    const candidates = this.getNeighbors(board)
    const depth = level === 'hard' ? 2 : (level === 'medium' ? 1 : 0)

    for (const m of candidates) {
      board[m.r][m.c] = this.BOT
      const score = this.minimax(board, depth, -Infinity, Infinity, false)
      board[m.r][m.c] = null
      const finalScore = score + (this.memory[`${m.r},${m.c}`] || 0) * 10
      if (finalScore > bestScore) {
        bestScore = finalScore
        move = m
      }
    }
    return move || candidates[0]
  },
}

/* =======================
        GAME
======================= */
function CaroGame({ visible, setVisible }) {
  const emptyBoard = Array(SIZE).fill(null).map(() => Array(SIZE).fill(null))

  const [board, setBoard] = useState(emptyBoard)
  const [xTurn, setXTurn] = useState(true)
  const [last, setLast] = useState(null)
  const [winner, setWinner] = useState(null)
  const [level, setLevel] = useState('hard')
  const [winLine, setWinLine] = useState([]) // Lưu các ô tạo đường thắng

  if (!visible) return null

  const checkWin = (b, r, c) => {
    for (let [dx, dy] of AI.dirs) {
      let cells = [{ r, c }]
      for (let i = 1; i < 5; i++) {
        if (b[r + dx * i]?.[c + dy * i] === b[r][c]) cells.push({ r: r + dx * i, c: c + dy * i })
        else break
      }
      for (let i = 1; i < 5; i++) {
        if (b[r - dx * i]?.[c - dy * i] === b[r][c]) cells.push({ r: r - dx * i, c: c - dy * i })
        else break
      }
      if (cells.length >= 5) return cells
    }
    return null
  }

  const resetGame = () => {
    setBoard(emptyBoard)
    setXTurn(true)
    setWinner(null)
    setLast(null)
    setWinLine([])
  }

  const clickCell = (r, c) => {
    if (!xTurn || board[r][c] || winner) return

    const b = board.map(row => [...row])
    b[r][c] = 'X'
    setBoard(b)
    setLast({ r, c })
    AI.rememberHumanMove(r, c)

    const winningCells = checkWin(b, r, c)
    if (winningCells) {
      setWinner('X')
      setWinLine(winningCells)
      return
    }

    setXTurn(false)
    setTimeout(() => aiMove(b), AI_DELAY[level])
  }

  const aiMove = (b) => {
    if (winner) return

    const { r, c } = AI.bestMove(b, level)
    const nb = b.map(row => [...row])
    nb[r][c] = 'O'

    setBoard(nb)
    setLast({ r, c })

    const winningCells = checkWin(nb, r, c)
    if (winningCells) {
      setWinner('O')
      setWinLine(winningCells)
    } else {
      setXTurn(true)
    }
  }

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(15,23,42,0.45)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 99999,
    }}>
      <div style={{ width: 560, background: '#0f172a', borderRadius: 20, padding: 16 }}>

        {/* HEADER */}
        <div className="d-flex justify-content-between mb-2">
          <b style={{ color: '#e5e7eb' }}>🤖 Caro AI – Zebra Rebuild</b>

          <CButton
            size="sm"
            onClick={() => setVisible(false)}
            style={{
              background: '#ef4444',
              border: 'none',
              color: '#fff',
              width: 32,
              height: 32,
              padding: 0,
              borderRadius: 8,
            }}
          >
            <CIcon icon={cilX} />
          </CButton>
        </div>

        {/* LEVEL */}
        {['easy', 'medium', 'hard'].map(l => (
          <CButton
            key={l}
            size="sm"
            className="me-2"
            color={level === l ? 'info' : 'secondary'}
            onClick={() => {
              if (l !== level) {
                setLevel(l)
                resetGame()
              }
            }}
          >
            {l.toUpperCase()}
          </CButton>
        ))}

        <div style={{ margin: '8px 0', color: winner ? '#22c55e' : '#93c5fd' }}>
          {winner ? `🎉 ${winner} thắng!` : `Lượt: ${xTurn ? 'X (Bạn)' : 'O (AI)'}`}
        </div>

        {/* BOARD */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${SIZE},1fr)`,
          gap: 2,
          background: '#334155',
          padding: 6,
          borderRadius: 14,
        }}>
          {board.map((row, r) =>
            row.map((cell, c) => {
              const isWinCell = winLine.some(l => l.r === r && l.c === c)
              return (
                <div
                  key={`${r}-${c}`}
                  onClick={() => clickCell(r, c)}
                  style={{
                    width: 30,
                    height: 30,
                    background: isWinCell ? '#22c55e' : (last?.r === r && last?.c === c ? '#fde68a' : '#e5e7eb'),
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    color: isWinCell ? '#fff' : (cell === 'X' ? '#ef4444' : '#2563eb'),
                    borderRadius: 4,
                    transition: 'all 0.2s',
                    boxShadow: isWinCell ? '0 0 10px #22c55e' : 'none',
                  }}
                >
                  {cell}
                </div>
              )
            })
          )}
        </div>

        {/* 🔄 RESET BUTTON */}
        <CButton
          className="w-100 mt-3"
          onClick={resetGame}
          style={{
            background: 'linear-gradient(135deg, #22c55e, #16a34a)',
            border: 'none',
            color: '#fff',
            fontWeight: 'bold',
            borderRadius: 12,
            padding: '10px 0',
          }}
        >
          <CIcon icon={cilReload} className="me-2" />
          Chơi lại
        </CButton>
      </div>
    </div>
  )
}

export default CaroGame