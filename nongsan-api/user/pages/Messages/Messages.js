import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { FiSend, FiSearch, FiMoreVertical } from 'react-icons/fi';
import { messagesAPI, vendorsAPI } from '../../api/apiClient';
import { getStoredUser, hasValidAuthSession } from '../../utils/authStorage';
import './Messages.css';

const Messages = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [conversations, setConversations] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [inputMsg, setInputMsg] = useState('');
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const chatHistoryRef = useRef(null);
  const shouldAutoScrollRef = useRef(true);

  const currentUser = getStoredUser() || null;
  const currentUserId = Number(currentUser?.id || 0);

  const seedVendorId = Number(searchParams.get('vendor') || 0);
  const seedVendorName = searchParams.get('name') || 'Nha cung cap';

  const seedConversation = useMemo(() => {
    if (!seedVendorId) return null;
    return {
      id: `new_${seedVendorId}`,
      partnerId: seedVendorId,
      name: seedVendorName,
      avatar: '',
      lastMessage: 'Bat dau cuoc tro chuyen',
      time: '',
      unread: 0,
      isSeed: true,
    };
  }, [seedVendorId, seedVendorName]);

  const visibleConversations = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();
    const conversationByPartner = new Map(
      conversations.map((item) => [Number(item.partnerId), { ...item, isOffline: false }]),
    );

    vendors.forEach((vendor) => {
      if (!vendor?.id) return;

      if (conversationByPartner.has(vendor.id)) {
        const existed = conversationByPartner.get(vendor.id);
        conversationByPartner.set(vendor.id, {
          ...existed,
          name: vendor.name || existed.name,
          avatar: vendor.avatar || existed.avatar,
          vendorStatus: vendor.status || 'Offline',
          isOffline: String(vendor.status || '').toLowerCase() !== 'active',
        });
        return;
      }

      conversationByPartner.set(vendor.id, {
        id: `new_${vendor.id}`,
        partnerId: vendor.id,
        name: vendor.name || 'Nha cung cap',
        avatar: vendor.avatar || '',
        lastMessage: 'Chua co tin nhan',
        time: '',
        unread: 0,
        vendorStatus: vendor.status || 'Offline',
        isOffline: true,
      });
    });

    const mapped = Array.from(conversationByPartner.values());

    if (
      seedConversation &&
      !mapped.some((item) => Number(item.partnerId) === Number(seedConversation.partnerId))
    ) {
      mapped.unshift(seedConversation);
    }

    const sorted = mapped.sort((a, b) => {
      const aHasChat = !String(a.id).startsWith('new_');
      const bHasChat = !String(b.id).startsWith('new_');
      if (aHasChat !== bHasChat) return aHasChat ? -1 : 1;
      return String(a.name || '').localeCompare(String(b.name || ''));
    });

    if (!normalizedSearch) return sorted;
    return sorted.filter((item) => String(item.name || '').toLowerCase().includes(normalizedSearch));
  }, [conversations, vendors, seedConversation, searchTerm]);

  const activeVendor = visibleConversations.find((v) => String(v.id) === String(activeChat));
  const activeMessages = messages[activeChat] || [];

  const fetchConversations = async () => {
    if (!currentUserId) return;
    try {
      const data = await messagesAPI.getConversations(currentUserId);
      setConversations(data);
      if (!activeChat && data.length > 0) {
        setActiveChat(data[0].id);
      }
    } catch (err) {
      setError(err?.message || 'Khong the tai danh sach hoi thoai.');
    }
  };

  const fetchVendors = async () => {
    try {
      const data = await vendorsAPI.getAll();
      setVendors(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err?.message || 'Khong the tai danh sach nha cung cap.');
    }
  };

  const fetchMessages = async (conversationId) => {
    if (!currentUserId || !conversationId || String(conversationId).startsWith('new_')) {
      return;
    }
    try {
      const data = await messagesAPI.getMessages(conversationId, currentUserId);
      setMessages((prev) => ({ ...prev, [conversationId]: data }));
    } catch (err) {
      setError(err?.message || 'Khong the tai tin nhan.');
    }
  };

  useEffect(() => {
    if (!hasValidAuthSession()) {
      navigate(`/login?redirect=${encodeURIComponent('/messages')}`, { replace: true });
      return;
    }

    if (!currentUserId) {
      navigate('/login', { replace: true });
      return;
    }

    const bootstrap = async () => {
      setLoading(true);
      await Promise.all([fetchConversations(), fetchVendors()]);
      setLoading(false);
    };

    bootstrap();
    const interval = window.setInterval(fetchConversations, 7000);
    return () => window.clearInterval(interval);
  }, [currentUserId, navigate]);

  useEffect(() => {
    if (!activeChat) {
      if (seedConversation) {
        setActiveChat(seedConversation.id);
      }
      return;
    }

    fetchMessages(activeChat);

    if (String(activeChat).startsWith('new_')) {
      return;
    }

    const interval = window.setInterval(() => fetchMessages(activeChat), 4000);
    return () => window.clearInterval(interval);
  }, [activeChat, currentUserId, seedConversation]);

  useEffect(() => {
    if (!activeChat && !loading && visibleConversations.length > 0) {
      setActiveChat(visibleConversations[0].id);
    }
  }, [activeChat, loading, visibleConversations]);

  useEffect(() => {
    shouldAutoScrollRef.current = true;
  }, [activeChat]);

  const scrollToBottom = () => {
    const container = chatHistoryRef.current;
    if (!container) return;
    container.scrollTop = container.scrollHeight;
  };

  const handleHistoryScroll = () => {
    const container = chatHistoryRef.current;
    if (!container) return;
    const distanceToBottom = container.scrollHeight - container.scrollTop - container.clientHeight;
    shouldAutoScrollRef.current = distanceToBottom < 80;
  };

  useEffect(() => {
    if (shouldAutoScrollRef.current) {
      scrollToBottom();
    }
  }, [activeChat, activeMessages.length]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!inputMsg.trim() || !activeVendor || !currentUserId) return;

    setError('');

    const text = inputMsg.trim();
    const localConversationId = activeChat;
    const resolvedReceiverId = Number(
      activeVendor.partnerId ||
      (String(activeVendor.id || '').startsWith('new_')
        ? String(activeVendor.id).replace('new_', '')
        : 0),
    );

    if (!resolvedReceiverId || resolvedReceiverId === currentUserId) {
      setError('Khong xac dinh duoc nha cung cap hop le de gui tin nhan.');
      return;
    }

    const optimisticMessage = {
      id: Date.now(),
      sender: 'user',
      text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => ({
      ...prev,
      [localConversationId]: [...(prev[localConversationId] || []), optimisticMessage],
    }));
    setInputMsg('');

    try {
      setSending(true);
      const result = await messagesAPI.sendMessage({
        conversationId: String(localConversationId).startsWith('new_') ? '' : localConversationId,
        senderId: currentUserId,
        receiverId: resolvedReceiverId,
        text,
      });

      const finalConversationId = result.conversationId || localConversationId;

      if (String(localConversationId).startsWith('new_') && finalConversationId) {
        setActiveChat(finalConversationId);
      }

      await fetchConversations();
      await fetchMessages(finalConversationId);
    } catch (err) {
      setError(err?.message || 'Khong the gui tin nhan.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="messages-page">
      <div className="messages-container">
        {/* SIDEBAR */}
        <div className="messages-sidebar">
          <div className="sidebar-header">
            <h2 className="sidebar-title">Tin nhắn</h2>
            <div className="search-chat">
              <FiSearch className="search-icon" />
              <input
                type="text"
                placeholder="Tìm kiếm cửa hàng..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="vendor-list">
            {visibleConversations.map(vendor => (
              <div
                key={vendor.id}
                className={`vendor-item ${String(activeChat) === String(vendor.id) ? 'active' : ''}`}
                onClick={() => setActiveChat(vendor.id)}
              >
                <div className="vendor-avatar">
                  {vendor.avatar ? <img src={vendor.avatar} alt={vendor.name} /> : String(vendor.name || 'N').charAt(0).toUpperCase()}
                </div>
                <div className="vendor-info">
                  <div className="vendor-name-row">
                    <span className="vendor-name">
                      {vendor.name}
                      <span className={`vendor-presence-dot ${vendor.isOffline ? 'offline' : 'online'}`} />
                    </span>
                    <span className="vendor-time">{vendor.time || ''}</span>
                  </div>
                  <div className="vendor-msg-row">
                    <span className="vendor-last-msg">{vendor.lastMessage || 'Chua co tin nhan'}</span>
                    {vendor.unread > 0 && <span className="unread-badge">{vendor.unread}</span>}
                  </div>
                </div>
              </div>
            ))}
            {!loading && visibleConversations.length === 0 ? (
              <p style={{ padding: '16px', color: '#777' }}>Ban chua co cuoc tro chuyen nao.</p>
            ) : null}
          </div>
        </div>

        {/* CHAT CONTENT */}
        <div className="messages-content">
          {activeChat ? (
            <>
              <div className="chat-header">
                <div className="chat-header-info">
                  <div className="vendor-avatar">
                    {activeVendor?.avatar ? <img src={activeVendor.avatar} alt={activeVendor.name} /> : String(activeVendor?.name || 'N').charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="chat-vendor-name">{activeVendor?.name}</h3>
                    <span className={`chat-status ${activeVendor?.isOffline ? 'offline' : ''}`}>
                      {activeVendor?.isOffline ? 'Ngoai tuyen' : 'San sang trao doi'}
                    </span>
                  </div>
                </div>
                <div className="chat-header-actions">
                  <button className="btn-icon"><FiSearch /></button>
                  <button className="btn-icon"><FiMoreVertical /></button>
                </div>
              </div>

              <div className="chat-history" ref={chatHistoryRef} onScroll={handleHistoryScroll}>
                <div className="chat-date-divider"><span>Hôm nay</span></div>
                {activeMessages.map(msg => (
                  <div key={msg.id} className={`chat-bubble-wrapper ${msg.sender}`}>
                    <div className={`chat-bubble ${msg.sender}`}>
                      {msg.text}
                      <span className="chat-time">{msg.time}</span>
                    </div>
                  </div>
                ))}
                {error ? <p style={{ color: '#c62828', fontSize: '13px' }}>{error}</p> : null}
              </div>

              <form className="chat-input-area" onSubmit={handleSend}>
                <input
                  type="text"
                  placeholder="Nhập tin nhắn..."
                  value={inputMsg}
                  onChange={(e) => setInputMsg(e.target.value)}
                  disabled={sending}
                />
                <button type="submit" className="btn-send" disabled={!inputMsg.trim() || sending}>
                  <FiSend />
                </button>
              </form>
            </>
          ) : (
            <div className="no-chat-selected">
              <div className="no-chat-icon"><FiSend /></div>
              <p>{loading ? 'Dang tai cuoc tro chuyen...' : 'Chon mot cuoc tro chuyen de bat dau'}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Messages;
