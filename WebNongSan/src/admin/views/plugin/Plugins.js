import React, { useState, useRef } from 'react'
import { CCol, CRow, CFormInput, CButton } from '@coreui/react'
import CIcon from '@coreui/icons-react'
import {
  cilMediaPlay,
  cilPuzzle,
  cilGamepad,
  cilGrid,
  cilSettings,
  cilImage,
  cilSync
} from '@coreui/icons'

import ChessGame from './ChessGame'
import CaroGame from './CaroGame'

function Plugins() {
  const loginBgInputRef = useRef(null)
  const registerBgInputRef = useRef(null)
  
  // States
  const [chessVisible, setChessVisible] = useState(false)
  const [chessKey, setChessKey] = useState(0)
  const [caroVisible, setCaroVisible] = useState(false)
  const [caroKey, setCaroKey] = useState(0)
  const [ytLink, setYtLink] = useState('')
  
  const [neko, setNeko] = useState(() => {
    const saved = localStorage.getItem('neko-enabled')
    return saved === null ? true : saved === 'true'
  })
  const [splash, setSplash] = useState(localStorage.getItem('enable_splash') !== 'false')
  const [authBg, setAuthBg] = useState(localStorage.getItem('auth_bg') || 'rgb')

  // Handlers
  const openChess = () => { setChessKey(Date.now()); setChessVisible(true); }
  const openCaro = () => { setCaroKey(Date.now()); setCaroVisible(true); }
  
  const handlePlayMusic = () => {
    const reg = /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
    const match = ytLink.match(reg)
    if (match?.[1]) {
      window.dispatchEvent(new CustomEvent('play-youtube-video', { detail: { videoId: match[1] } }))
    } else {
      alert('Link Youtube không hợp lệ')
    }
  }

  const toggleNeko = () => {
    const v = !neko
    setNeko(v)
    localStorage.setItem('neko-enabled', String(v))
    window.dispatchEvent(new CustomEvent('toggle-neko', { detail: v }))
  }

  const toggleSplash = () => {
    const v = !splash
    setSplash(v)
    localStorage.setItem('enable_splash', v)
    window.dispatchEvent(new CustomEvent('toggle-splash', { detail: { enabled: v } }))
  }

  const changeAuthBg = (bg) => {
    setAuthBg(bg)
    localStorage.setItem('auth_bg', bg)
  }

  return (
    <>
      <style>
        {`
          .plugin-card {
            background: rgba(255, 255, 255, 0.05);
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 24px;
            padding: 24px;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            position: relative;
            overflow: hidden;
            height: 100%;
          }

          .plugin-card:hover {
            transform: translateY(-5px);
            border-color: rgba(255, 255, 255, 0.3);
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
          }

          .rgb-glow {
            position: absolute;
            top: 0; left: 0; right: 0; bottom: 0;
            z-index: -1;
            opacity: 0.15;
            background: linear-gradient(120deg, #6366f1, #38bdf8, #34d399, #a855f7);
            background-size: 300% 300%;
            animation: rgbMove 8s linear infinite;
          }

          @keyframes rgbMove {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
          }

          .icon-box {
            width: 48px;
            height: 48px;
            border-radius: 14px;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-bottom: 16px;
            background: rgba(255,255,255,0.1);
          }

          .btn-custom {
            border: none;
            border-radius: 12px;
            padding: 10px 20px;
            font-weight: 600;
            transition: all 0.2s;
          }

          .btn-custom:active {
            transform: scale(0.95);
          }

          .input-dark {
            background: rgba(0,0,0,0.2) !important;
            border: 1px solid rgba(255,255,255,0.1) !important;
            color: white !important;
            border-radius: 12px !important;
          }

          .setting-label {
            font-size: 0.85rem;
            text-transform: uppercase;
            letter-spacing: 1px;
            color: rgba(255,255,255,0.5);
            margin-bottom: 12px;
            font-weight: bold;
          }
        `}
      </style>

      <CRow className="g-4">
        {/* CARD CHESS */}
        <CCol md={6} lg={4}>
          <div className="plugin-card">
            <div className="rgb-glow"></div>
            <div className="icon-box" style={{ color: '#22d3ee' }}>
              <CIcon icon={cilPuzzle} size="xl" />
            </div>
            <h5 className="fw-bold text-white">Cờ Vua Stockfish</h5>
            <p className="text-white-50 small flex-grow-1">
              Thách thức trí tuệ với AI Stockfish. Giao diện chuyên nghiệp, hỗ trợ nhiều cấp độ.
            </p>
            <CButton 
              className="w-100 btn-custom mt-3" 
              style={{ background: 'linear-gradient(90deg,#22d3ee,#38bdf8)', color: '#000' }}
              onClick={openChess}
            >
              <CIcon icon={cilGamepad} className="me-2" /> Chơi Ngay
            </CButton>
          </div>
        </CCol>

        {/* CARD CARO */}
        <CCol md={6} lg={4}>
          <div className="plugin-card">
            <div className="rgb-glow"></div>
            <div className="icon-box" style={{ color: '#a78bfa' }}>
              <CIcon icon={cilGrid} size="xl" />
            </div>
            <h5 className="fw-bold text-white">Cờ Caro 5 Quân</h5>
            <p className="text-white-50 small flex-grow-1">
              Trò chơi giải trí cổ điển. Đối đầu với máy hoặc luyện tập phản xạ nhanh.
            </p>
            <CButton 
              className="w-100 btn-custom mt-3" 
              style={{ background: 'linear-gradient(90deg,#a78bfa,#f472b6)', color: '#000' }}
              onClick={openCaro}
            >
              <CIcon icon={cilGamepad} className="me-2" /> Vào Bàn
            </CButton>
          </div>
        </CCol>

        {/* CARD MUSIC */}
        <CCol md={6} lg={4}>
          <div className="plugin-card">
            <div className="rgb-glow"></div>
            <div className="icon-box" style={{ color: '#fb7185' }}>
              <CIcon icon={cilMediaPlay} size="xl" />
            </div>
            <h5 className="fw-bold text-white">YouTube Background</h5>
            <p className="text-white-50 small mb-3">Dán link YouTube để nghe nhạc không quảng cáo khi làm việc.</p>
            
            <CFormInput
              placeholder="Dán link tại đây..."
              value={ytLink}
              onChange={(e) => setYtLink(e.target.value)}
              className="input-dark mb-3"
            />
            <CButton 
              className="w-100 btn-custom" 
              style={{ background: 'linear-gradient(90deg,#fb7185,#facc15)', color: '#000' }}
              onClick={handlePlayMusic}
            >
              <CIcon icon={cilMediaPlay} className="me-2" /> Phát Nhạc
            </CButton>
          </div>
        </CCol>

        {/* CARD SYSTEM SETTINGS */}
        <CCol md={12} lg={8}>
          <div className="plugin-card">
            <div className="rgb-glow"></div>
            <div className="d-flex align-items-center mb-4">
              <div className="icon-box mb-0 me-3" style={{ color: '#34d399' }}>
                <CIcon icon={cilSettings} size="xl" />
              </div>
              <h5 className="fw-bold text-white mb-0">Cấu Hình Hệ Thống</h5>
            </div>

            <CRow>
              <CCol md={6}>
                <div className="setting-label">Hiệu ứng tương tác</div>
                <div className="d-flex gap-2 mb-4">
                  <CButton
                    className={`flex-fill btn-custom ${neko ? 'bg-success' : 'bg-dark'}`}
                    onClick={toggleNeko}
                  >
                    🐱 Neko: {neko ? 'Bật' : 'Tắt'}
                  </CButton>
                  <CButton
                    className={`flex-fill btn-custom ${splash ? 'bg-success' : 'bg-dark'}`}
                    onClick={toggleSplash}
                  >
                    ✨ Splash: {splash ? 'Bật' : 'Tắt'}
                  </CButton>
                </div>

                <div className="setting-label">Chế độ nền Auth</div>
                <div className="d-flex gap-2 mb-4">
                  {['rgb', 'dark', 'none'].map((bg) => (
                    <CButton
                      key={bg}
                      className="flex-fill btn-custom"
                      style={{ 
                        background: authBg === bg ? '#38bdf8' : 'rgba(255,255,255,0.1)',
                        color: authBg === bg ? '#000' : '#fff'
                      }}
                      onClick={() => changeAuthBg(bg)}
                    >
                      {bg.toUpperCase()}
                    </CButton>
                  ))}
                </div>
              </CCol>

              <CCol md={6}>
                <div className="setting-label">Tùy chỉnh hình nền</div>
                <div className="mb-3 p-3 rounded-3" style={{ background: 'rgba(0,0,0,0.2)' }}>
                  <div className="d-flex align-items-center justify-content-between mb-2">
                    <span className="small text-white-50">Trang Đăng Nhập</span>
                    <div className="d-flex gap-2">
                      <CButton size="sm" color="dark" onClick={() => {/* reset logic */}}>
                         <CIcon icon={cilSync} />
                      </CButton>
                      <CButton size="sm" color="info" onClick={() => loginBgInputRef.current.click()}>
                        <CIcon icon={cilImage} /> Thay
                      </CButton>
                    </div>
                  </div>
                  <div className="d-flex align-items-center justify-content-between">
                    <span className="small text-white-50">Trang Đăng Ký</span>
                    <div className="d-flex gap-2">
                      <CButton size="sm" color="dark" onClick={() => {/* reset logic */}}>
                         <CIcon icon={cilSync} />
                      </CButton>
                      <CButton size="sm" color="info" onClick={() => registerBgInputRef.current.click()}>
                        <CIcon icon={cilImage} /> Thay
                      </CButton>
                    </div>
                  </div>
                </div>
              </CCol>
            </CRow>
          </div>
        </CCol>
      </CRow>

      {/* Hidden Inputs & Modals (Giữ nguyên logic cũ) */}
      <input type="file" ref={loginBgInputRef} hidden accept="image/*" />
      <input type="file" ref={registerBgInputRef} hidden accept="image/*" />

      {/* CHESS FLOATING */}
      {chessVisible && (
        <div style={{ position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
            <div style={{ background: 'rgba(0,0,0,0.8)', position: 'absolute', inset: 0 }} onClick={() => setChessVisible(false)} />
            <div style={{ position: 'relative', zIndex: 1 }}>
              <ChessGame key={chessKey} visible={chessVisible} setVisible={setChessVisible} />
            </div>
        </div>
      )}

      {/* CARO FLOATING */}
      {caroVisible && (
        <div style={{ position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
            <div style={{ background: 'rgba(0,0,0,0.8)', position: 'absolute', inset: 0 }} onClick={() => setCaroVisible(false)} />
            <div style={{ position: 'relative', zIndex: 1 }}>
              <CaroGame key={caroKey} visible={caroVisible} setVisible={setCaroVisible} />
            </div>
        </div>
      )}
    </>
  )
}

export default Plugins