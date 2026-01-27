import React, { useState } from 'react';
import { FaCommentDots, FaTimes, FaPaperPlane } from 'react-icons/fa';

const Chatbox = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div style={{ position: 'fixed', bottom: '30px', right: '30px', zIndex: 1000 }}>
      
      {/* Cửa sổ Chat */}
      {isOpen && (
        <div style={{
          width: '300px', height: '400px', background: 'white', 
          boxShadow: '0 5px 20px rgba(0,0,0,0.2)', borderRadius: '10px',
          display: 'flex', flexDirection: 'column', marginBottom: '15px', overflow: 'hidden'
        }}>
          <div style={{background: '#2e7d32', color: 'white', padding: '10px', display: 'flex', justifyContent: 'space-between'}}>
            <span>Hỗ trợ khách hàng</span>
            <FaTimes style={{cursor: 'pointer'}} onClick={() => setIsOpen(false)}/>
          </div>
          <div style={{flex: 1, padding: '10px', background: '#f9f9f9', fontSize: '14px', color: '#555'}}>
            <p>Chào bạn! AgriMarket có thể giúp gì cho bạn hôm nay?</p>
          </div>
          <div style={{padding: '10px', borderTop: '1px solid #eee', display: 'flex'}}>
            <input type="text" placeholder="Nhập tin nhắn..." style={{flex: 1, border: 'none', outline: 'none'}} />
            <FaPaperPlane color="#2e7d32" style={{cursor: 'pointer'}} />
          </div>
        </div>
      )}

      {/* Nút tròn để bật/tắt */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: '60px', height: '60px', borderRadius: '50%', 
          background: '#2e7d32', color: 'white', border: 'none',
          fontSize: '24px', cursor: 'pointer', boxShadow: '0 4px 10px rgba(0,0,0,0.3)',
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}
      >
        <FaCommentDots />
      </button>
    </div>
  );
};

export default Chatbox;