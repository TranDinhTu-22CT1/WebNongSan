import React, { useCallback, useState, useRef, useEffect } from 'react';
import { FaCommentDots, FaTimes, FaPaperPlane } from 'react-icons/fa';
import { supportAPI } from '../../../api/apiClient';
import { getAuthToken } from '../../../utils/authStorage';
import './Chatbox.css';

const Chatbox = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { id: 1, text: 'Chào bạn! AgriMarket có thể giúp gì cho bạn hôm nay?', sender: 'bot' }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [sending, setSending] = useState(false);
  const [retryQueue, setRetryQueue] = useState({});
  const messagesEndRef = useRef(null);

  const fetchHistory = useCallback(async () => {
    if (!isOpen) return;

    const token = getAuthToken();
    if (!token) {
      setMessages([{ id: 1, text: 'Vui long dang nhap de tro chuyen voi ho tro.', sender: 'bot' }]);
      return;
    }

    try {
      const history = await supportAPI.getHistory();
      if (Array.isArray(history) && history.length > 0) {
        setMessages(history.map((msg) => ({ ...msg, status: 'sent' })));
      } else {
        setMessages([{ id: 1, text: 'Chao ban! AgriMarket co the giup gi cho ban hom nay?', sender: 'bot' }]);
      }
    } catch (err) {
      console.error('Failed to fetch support history:', err);
    }
  }, [isOpen]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  useEffect(() => {
    fetchHistory();

    if (!isOpen) return undefined;
    const timer = setInterval(() => {
      fetchHistory();
    }, 8000);

    return () => clearInterval(timer);
  }, [isOpen, fetchHistory]);

  const handleSend = async () => {
    if (inputValue.trim() === '') return;

    const token = getAuthToken();
    if (!token) {
      alert('Vui long dang nhap de su dung chat ho tro.');
      return;
    }
    
    // Add user message
    const tempId = `tmp-${Date.now()}`;
    const newUserMsg = { id: tempId, text: inputValue, sender: 'user', status: 'sending' };
    setMessages(prev => [...prev, newUserMsg]);
    const textToSend = inputValue.trim();
    setInputValue('');
    
    try {
      setSending(true);
      await supportAPI.sendMessage(textToSend);
      setTimeout(() => {
        fetchHistory();
      }, 500);
    } catch (err) {
      setRetryQueue((prev) => ({ ...prev, [tempId]: textToSend }));
      setMessages((prev) => prev.map((m) => (
        m.id === tempId ? { ...m, status: 'failed' } : m
      )));
    } finally {
      setSending(false);
    }
  };

  const retrySend = async (tempId) => {
    const text = retryQueue[tempId];
    if (!text) return;

    setMessages((prev) => prev.map((m) => (
      m.id === tempId ? { ...m, status: 'sending' } : m
    )));

    try {
      await supportAPI.sendMessage(text);
      setRetryQueue((prev) => {
        const next = { ...prev };
        delete next[tempId];
        return next;
      });
      fetchHistory();
    } catch (err) {
      setMessages((prev) => prev.map((m) => (
        m.id === tempId ? { ...m, status: 'failed' } : m
      )));
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };

  return (
    <div className="chatbox-container">
      
      {/* Cửa sổ Chat */}
      {isOpen ? (
        <div className="chat-window open">
          <div className="chat-header">
            <span>Hỗ trợ khách hàng</span>
            <FaTimes className="chat-close-btn" onClick={() => setIsOpen(false)}/>
          </div>
          
          <div className="chat-body">
            {messages.map((msg) => (
              <div key={msg.id} className={`chat-message ${msg.sender === 'user' ? 'user' : ''}`}>
                <div>{msg.text}</div>
                {msg.sender === 'user' && msg.status === 'sending' && <small className="chat-msg-status">Dang gui...</small>}
                {msg.sender === 'user' && msg.status === 'failed' && (
                  <small className="chat-msg-status chat-msg-failed">
                    Gui that bai.
                    <button type="button" onClick={() => retrySend(msg.id)}>Thu lai</button>
                  </small>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
          
          <div className="chat-footer">
            <input 
              type="text" 
              className="chat-input"
              placeholder="Nhập tin nhắn..." 
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyPress}
              disabled={sending}
            />
            <div className="chat-send-btn" onClick={handleSend}>
              <FaPaperPlane />
            </div>
          </div>
        </div>
      ) : null}

      {/* Nút tròn để bật/tắt */}
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
