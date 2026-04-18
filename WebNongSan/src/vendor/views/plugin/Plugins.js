import React, { useState } from 'react'
import { CCol, CRow, CFormInput, CButton } from '@coreui/react'
import CIcon from '@coreui/icons-react'
import {
  cilMediaPlay,
  cilPuzzle,
  cilGamepad,
  cilGrid,
} from '@coreui/icons'

import ChessGame from './ChessGame'
import CaroGame from './CaroGame'

function Plugins() {
  const [chessVisible, setChessVisible] = useState(false)
  const [chessKey, setChessKey] = useState(0)

  const [caroVisible, setCaroVisible] = useState(false)
  const [caroKey, setCaroKey] = useState(0)

  const [ytLink, setYtLink] = useState('')

  const openChess = () => {
    setChessKey(Date.now())
    setChessVisible(true)
  }

  const openCaro = () => {
    setCaroKey(Date.now())
    setCaroVisible(true)
  }

  const handlePlayMusic = () => {
    const reg =
      /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
    const match = ytLink.match(reg)

    if (match && match[1]) {
      window.dispatchEvent(
        new CustomEvent('play-youtube-video', {
          detail: { videoId: match[1] },
        })
      )
    } else {
      alert('Link Youtube không hợp lệ')
    }
  }

  return (
    <>
      {/* ===== RGB BACKGROUND (ONLY BACKGROUND) ===== */}
      <style>
        {`
        .rgb-bg {
          border-radius: 22px;
          padding: 26px;
          background: linear-gradient(
            120deg,
            rgba(99,102,241,0.55),
            rgba(56,189,248,0.55),
            rgba(52,211,153,0.55),
            rgba(168,85,247,0.55)
          );
          background-size: 300% 300%;
          animation: rgbMove 14s ease infinite;
        }

        @keyframes rgbMove {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `}
      </style>

     <CRow className="g-4">
  {/* ===== CARD CHESS ===== */}
  <CCol md={6}>
    <div className="rgb-bg h-100 d-flex flex-column">
      <h5 className="fw-bold mb-2">
        <CIcon icon={cilPuzzle} className="me-2" />
        Cờ vua
      </h5>

      <p className="text-muted small">
        Đấu Stockfish trong giao diện gọn gàng.
      </p>

      <CButton
        className="w-100 fw-bold mt-auto"
        style={{
          background: 'linear-gradient(90deg,#22d3ee,#a7f3d0)',
          border: 'none',
          color: '#000',
        }}
        onClick={openChess}
      >
        <CIcon icon={cilGamepad} className="me-2" />
        Mở bàn cờ
      </CButton>
    </div>
  </CCol>

  {/* ===== CARD CARO ===== */}
  <CCol md={6}>
    <div className="rgb-bg h-100 d-flex flex-column">
      <h5 className="fw-bold mb-2">
        <CIcon icon={cilGrid} className="me-2" />
        Cờ caro
      </h5>

      <p className="text-muted small">
        Chơi caro 5 quân – giải trí nhanh.
      </p>

      <CButton
        className="w-100 fw-bold mt-auto"
        style={{
          background: 'linear-gradient(90deg,#a78bfa,#f472b6)',
          border: 'none',
          color: '#000',
        }}
        onClick={openCaro}
      >
        <CIcon icon={cilGamepad} className="me-2" />
        Chơi ngay
      </CButton>
    </div>
  </CCol>

  {/* ===== CARD MUSIC ===== */}
  <CCol md={6}>
    <div className="rgb-bg h-100 d-flex flex-column">
      <h5 className="fw-bold mb-2">
        <CIcon icon={cilMediaPlay} className="me-2" />
        Phát nhạc & Video
      </h5>

      <p className="text-muted small">
        Dán link Youtube để phát (chạy nền).
      </p>

      <CFormInput
        placeholder="https://www.youtube.com/watch?v=..."
        value={ytLink}
        onChange={(e) => setYtLink(e.target.value)}
        className="mb-3"
      />

      <CButton
        className="w-100 fw-bold mt-auto"
        style={{
          background: 'linear-gradient(90deg,#fb7185,#facc15)',
          border: 'none',
          color: '#000',
        }}
        onClick={handlePlayMusic}
      >
        <CIcon icon={cilMediaPlay} className="me-2" />
        Phát video
      </CButton>
    </div>
  </CCol>
</CRow>


      {/* ===== CHESS FLOATING ===== */}
      {chessVisible && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            pointerEvents: 'none',
          }}
        >
          <div style={{ pointerEvents: 'auto' }}>
            <ChessGame
              key={chessKey}
              visible={chessVisible}
              setVisible={setChessVisible}
            />
          </div>
        </div>
      )}

      {/* ===== CARO FLOATING ===== */}
      {caroVisible && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            pointerEvents: 'none',
          }}
        >
          <div style={{ pointerEvents: 'auto' }}>
            <CaroGame
              key={caroKey}
              visible={caroVisible}
              setVisible={setCaroVisible}
            />
          </div>
        </div>
      )}
    </>
  )
}

export default Plugins
