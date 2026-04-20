import React, { useState, useRef, useEffect } from 'react';
import { FaCommentDots, FaTimes, FaPaperPlane } from 'react-icons/fa';
import ReactMarkdown from 'react-markdown'; 
import { getAuthToken } from '../../../utils/authStorage';
import './Chatbox.css';

const Chatbox = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: 'Chào bạn! Trợ lý AI của AgriMarket có thể giúp gì cho bạn hôm nay?',
      sender: 'bot'
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (inputValue.trim() === '') return;

    // Lấy Token từ utils (đã có sẵn trong code cũ của bạn)
    const token = getAuthToken();
    if (!token) {
      alert('Vui lòng đăng nhập để sử dụng tính năng Chat AI.');
      return;
    }

    // 🔥 XỬ LÝ LẤY ID NGƯỜI DÙNG TỪ LOCALSTORAGE
    let currentUserId = 'guest';
    try {
      // Dựa vào Login.jsx, hàm setAuthSession thường lưu "user" thành một chuỗi JSON
      const userRaw = localStorage.getItem('user') || localStorage.getItem('auth_session');
      if (userRaw) {
        const userObj = JSON.parse(userRaw);
        // Lấy id (hoặc uid nếu đăng nhập bằng Google/Github qua Firebase)
        currentUserId = userObj.id || userObj.uid || 'guest';
      }
    } catch (e) {
      console.warn("Không thể parse ID người dùng từ storage", e);
    }

    const textToSend = inputValue.trim();
    setInputValue('');

    const tempUserId = `user-${Date.now()}`;
    
    // 🔥 FORMAT LỊCH SỬ CHO GEMINI
    const historyToSend = messages
      .filter(msg => msg.id !== 1 && !msg.isTyping)
      .map(msg => ({
        role: msg.sender === 'user' ? 'user' : 'model',
        parts: [{ text: msg.text }]
      }));

    setMessages(prev => [
      ...prev,
      { id: tempUserId, text: textToSend, sender: 'user' }
    ]);

    try {
      setSending(true);

      const tempBotId = `bot-${Date.now()}`;
      setMessages(prev => [
        ...prev,
        { id: tempBotId, text: '...', sender: 'bot', isTyping: true }
      ]);

      const response = await fetch("http://localhost:5000/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}` 
        },
        body: JSON.stringify({
          message: textToSend,
          history: historyToSend,
          userId: currentUserId // 🔥 Gửi ID đã lấy được xuống cho Node.js ghi log
        }),
      });

      if (!response.ok) {
        const errText = await response.text();
        console.error("🔥 LỖI BACKEND:", errText);
        throw new Error(errText);
      }

      const data = await response.json();

      setMessages(prev =>
        prev.map(msg =>
          msg.id === tempBotId
            ? { id: tempBotId, text: data.reply, sender: 'bot' }
            : msg
        )
      );

    } catch (err) {
      console.error('Lỗi khi gọi API:', err);
      let errorMessage = 'Không thể kết nối tới AI server!';

      if (err.message.includes("Failed to fetch")) {
        errorMessage = 'Backend chưa chạy hoặc bị chặn CORS!';
      }

      setMessages(prev => {
        const filtered = prev.filter(msg => !msg.isTyping);
        return [
          ...filtered,
          { id: Date.now(), text: errorMessage, sender: 'bot' }
        ];
      });

    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };

  return (
    <div className="chatbox-container">
      {isOpen && (
        <div className="chat-window open">
          <div className="chat-header">
            <span>Trợ lý AI AgriMarket</span>
            <FaTimes
              className="chat-close-btn"
              onClick={() => setIsOpen(false)}
            />
          </div>

          <div className="chat-body">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`chat-message ${msg.sender === 'user' ? 'user' : ''}`}
              >
                <div className={msg.isTyping ? "typing-indicator" : ""}>
                  {msg.isTyping ? (
                    <span className="dots"></span>
                  ) : msg.sender === 'bot' ? (
                    // 🔥 RENDER MARKDOWN CHO TIN NHẮN CỦA BOT
                    <ReactMarkdown>{msg.text}</ReactMarkdown>
                  ) : (
                    msg.text
                  )}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <div className="chat-footer">
            <input
              type="text"
              className="chat-input"
              placeholder="Nhập câu hỏi của bạn..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyPress}
              disabled={sending}
            />
            <div
              className={`chat-send-btn ${sending ? 'disabled' : ''}`}
              onClick={sending ? null : handleSend}
            >
              <FaPaperPlane />
            </div>
          </div>
        </div>
      )}

      <button
        className="chat-toggle-btn"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Chat support"
      >
        <FaCommentDots className={`icon ${isOpen ? 'icon-hidden' : 'icon-visible'}`} />
        <FaTimes className={`icon ${isOpen ? 'icon-visible' : 'icon-hidden'}`} />
      </button>
    </div>
  );
};

export default Chatbox;