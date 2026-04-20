import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { FiSend, FiSearch, FiImage, FiX, FiPlay, FiLoader, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { getAuthToken, getStoredUser, hasValidAuthSession } from '../../utils/authStorage';
import './Messages.css';
const API_BASE = 'http://localhost/nongsan-api';

const parseImagesData = (data) => {
    if (!data) return [];
    if (Array.isArray(data)) return data;
    if (typeof data === 'string') {
        try {
            const parsed = JSON.parse(data);
            if (Array.isArray(parsed)) return parsed;
        } catch (e) {}
        if (data.includes(',')) return data.split(',').map(s => s.trim()).filter(Boolean);
        return [data.trim()];
    }
    return [];
};

const Messages = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    
    const [conversations, setConversations] = useState([]);
    const [activeChat, setActiveChat] = useState(null);
    const [messages, setMessages] = useState({});
    const [searchTerm, setSearchTerm] = useState('');
    const [inputMsg, setInputMsg] = useState('');
    const [admins, setAdmins] = useState([]);
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [error, setError] = useState('');

    const [selectedFiles, setSelectedFiles] = useState([]); 
    const [mediaViewer, setMediaViewer] = useState(null); 
    
    const chatHistoryRef = useRef(null);
    const fileInputRef = useRef(null);

    const currentUser = getStoredUser() || null;
    const currentUserId = currentUser?.id || currentUser?.uid || 0;
    const authToken = getAuthToken();

    const seedAdminId = searchParams.get('adminId') || 0;
    const seedAdminName = searchParams.get('name') || 'Quản trị viên';

    const seedConversation = useMemo(() => {
        if (!seedAdminId) return null;
        return {
            id: `new_${seedAdminId}`,
            partner_id: seedAdminId,
            name: seedAdminName,
            avatar: '',
            lastMessage: 'Bắt đầu cuộc trò chuyện',
            time: '',
            unread: 0,
            isSeed: true,
        };
    }, [seedAdminId, seedAdminName]);

    const visibleConversations = useMemo(() => {
        const normalizedSearch = searchTerm.trim().toLowerCase();
        
        const conversationByPartner = new Map(
            conversations.map((item) => [String(item.partner_id || item.partnerId), { ...item, isOffline: false }]),
        );

        admins.forEach((admin) => {
            if (!admin?.id) return;
            if (conversationByPartner.has(String(admin.id))) {
                const existed = conversationByPartner.get(String(admin.id));
                conversationByPartner.set(String(admin.id), {
                    ...existed,
                    name: admin.name || existed.name,
                    avatar: admin.avatar || existed.avatar,
                    status: admin.status || 'Offline',
                    isOffline: String(admin.is_online) === '0',
                });
                return;
            }
            conversationByPartner.set(String(admin.id), {
                id: `new_${admin.id}`,
                partner_id: admin.id,
                name: admin.name || 'Quản trị viên',
                avatar: admin.avatar || '',
                lastMessage: 'Chưa có tin nhắn',
                time: '',
                unread: 0,
                isOffline: String(admin.is_online) === '0',
            });
        });

        const mapped = Array.from(conversationByPartner.values());
        if (seedConversation && !mapped.some((item) => String(item.partner_id || item.partnerId) === String(seedConversation.partner_id))) {
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
    }, [conversations, admins, seedConversation, searchTerm]);

    const activeAdmin = visibleConversations.find((v) => String(v.id) === String(activeChat));
    const activeMessages = messages[activeChat] || [];

    const handleFileSelect = (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;

        const newFiles = files.map(file => ({
            file,
            previewUrl: URL.createObjectURL(file),
            type: file.type.startsWith('video/') ? 'video' : 'image'
        }));

        setSelectedFiles(prev => [...prev, ...newFiles]);
        e.target.value = null; 
    };

    const removeFile = (index) => {
        setSelectedFiles(prev => {
            const newList = [...prev];
            URL.revokeObjectURL(newList[index].previewUrl);
            newList.splice(index, 1);
            return newList;
        });
    };

    const clearMedia = () => {
        selectedFiles.forEach(f => URL.revokeObjectURL(f.previewUrl));
        setSelectedFiles([]);
    };

    const renderMediaGrid = (imagesArray, type) => {
        if (!imagesArray || imagesArray.length === 0) return null;
        
        const MAX_DISPLAY = 4;
        const extraCount = imagesArray.length - MAX_DISPLAY;
        const displayImages = imagesArray.slice(0, MAX_DISPLAY);
        
        return (
            <div className={`msg-images-grid count-${Math.min(imagesArray.length, MAX_DISPLAY)}`}>
                {displayImages.map((url, index) => {
                    const isLastDisplay = index === MAX_DISPLAY - 1;
                    return (
                        <div 
                            key={index} 
                            className="msg-image-wrapper" 
                            onClick={() => setMediaViewer({ 
                                items: imagesArray.map(u => ({ url: u, type: type === 'video' ? 'video' : 'image' })), 
                                currentIndex: index 
                            })}
                        >
                            {type === 'video' ? (
                                <div className="msg-video-inner">
                                    <video src={url} className="media-fit" />
                                    <FiPlay className="play-icon-overlay" />
                                </div>
                            ) : (
                                <img src={url} alt="media" className="media-fit" />
                            )}
                            
                            {isLastDisplay && extraCount > 0 && (
                                <div className="msg-image-overlay">
                                    <span>+{extraCount}</span>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        );
    };

    const fetchAdmins = async () => {
        try {
            const res = await fetch(`${API_BASE}/user_status.php?action=get_all_users`);
            const data = await res.json();
            const filteredAdmins = Array.isArray(data) ? data.filter(u => u.role === 'admin') : [];
            setAdmins(filteredAdmins);
        } catch (err) { setError('Không thể tải danh sách quản trị viên.'); }
    };

    const fetchConversations = async () => {
        if (!currentUserId) return;
        try {
            const res = await fetch(`${API_BASE}/message.php?action=get_conversations&user_id=${currentUserId}`, {
                headers: { 
                    'Authorization': `Bearer ${authToken}`,
                    'Accept': 'application/json' 
                }
            });
            const data = await res.json();
            if (Array.isArray(data)) {
                setConversations(data);
                if (!activeChat && data.length > 0) setActiveChat(data[0].id);
            }
        } catch (err) { setError('Không thể tải danh sách hội thoại.'); }
    };

    const fetchMessages = async (conversationId) => {
        if (!currentUserId || !conversationId || String(conversationId).startsWith('new_')) return;
        try {
            const res = await fetch(`${API_BASE}/message.php?action=get_messages&conversation_id=${conversationId}&user_id=${currentUserId}`, {
                headers: { 
                    'Authorization': `Bearer ${authToken}`,
                    'Accept': 'application/json'
                }
            });
            const data = await res.json();
            if (Array.isArray(data)) {
                setMessages((prev) => ({ ...prev, [conversationId]: data }));
            }
        } catch (err) { setError('Không thể tải tin nhắn.'); }
    };

    useEffect(() => {
        if (chatHistoryRef.current) {
            chatHistoryRef.current.scrollTop = chatHistoryRef.current.scrollHeight;
        }
    }, [activeMessages, sending]); 

    // CẬP NHẬT: Load danh sách hội thoại ban đầu và thiết lập interval
    useEffect(() => {
        if (!hasValidAuthSession() || !currentUserId) {
            navigate('/login', { replace: true });
            return;
        }
        const bootstrap = async () => {
            setLoading(true);
            await Promise.all([fetchConversations(), fetchAdmins()]);
            setLoading(false);
        };
        bootstrap();
        
        // Polling cập nhật danh sách hội thoại (và người dùng offline/online) mỗi 10 giây
        const intervalId = setInterval(() => {
            fetchConversations();
            fetchAdmins();
        }, 10000);

        return () => clearInterval(intervalId);
    }, [currentUserId, authToken, navigate]);

    // CẬP NHẬT: Load tin nhắn ban đầu và thiết lập interval cho khung chat đang mở
    useEffect(() => {
        if (!activeChat) {
            if (seedConversation) setActiveChat(seedConversation.id);
            return;
        }
        
        fetchMessages(activeChat);

        // Polling cập nhật tin nhắn liên tục mỗi 3 giây
        const intervalId = setInterval(() => {
            fetchMessages(activeChat);
        }, 3000);

        return () => clearInterval(intervalId);
    }, [activeChat, seedConversation]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!inputMsg.trim() && selectedFiles.length === 0) return;
        if (!activeAdmin || !currentUserId) return;

        const currentInput = inputMsg.trim();
        const currentFiles = [...selectedFiles];
        const localConversationId = activeChat;
        
        const resolvedReceiverId = activeAdmin.partner_id || activeAdmin.partnerId 
            ? (activeAdmin.partner_id || activeAdmin.partnerId) 
            : String(activeAdmin.id).replace('new_', '');

        setInputMsg('');
        clearMedia();
        setSending(true);

        try {
            const formData = new FormData();
            
            if (localConversationId && !String(localConversationId).startsWith('new_')) {
                formData.append('conversation_id', localConversationId);
            }
            
            formData.append('sender_id', currentUserId);
            formData.append('receiver_id', resolvedReceiverId);
            formData.append('text', currentInput !== '' ? currentInput : " "); 
            
            currentFiles.forEach(item => {
                formData.append('images[]', item.file);
            });

            const response = await fetch(`${API_BASE}/message.php?action=send_message`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${authToken}` },
                body: formData
            });

            const result = await response.json();

            if (result.status === 'success') {
                if (String(localConversationId).startsWith('new_') && result.conversation_id) {
                    setActiveChat(result.conversation_id);
                }
                fetchMessages(result.conversation_id || localConversationId);
                fetchConversations();
            } else {
                alert(`Lỗi từ Server: ${result.message}`);
            }
        } catch (err) {
            console.error("Lỗi hệ thống khi gửi:", err);
        } finally {
            setSending(false);
        }
    };

    return (
        <div className="messages-page">
            <style>{`
                /* Hệ thống Grid cho Media tin nhắn */
                .msg-images-grid {
                    display: grid;
                    gap: 4px;
                    width: 260px; /* Giới hạn độ rộng của khối ảnh để không vỡ layout */
                    margin-top: 4px;
                    border-radius: 12px;
                    overflow: hidden;
                }
                
                /* Layout 1 ảnh */
                .msg-images-grid.count-1 { grid-template-columns: 1fr; }
                .msg-images-grid.count-1 .msg-image-wrapper { max-height: 260px; }
                
                /* Layout 2 ảnh */
                .msg-images-grid.count-2 { grid-template-columns: 1fr 1fr; }
                .msg-images-grid.count-2 .msg-image-wrapper { height: 130px; }
                
                /* Layout 3 ảnh (1 ảnh lớn trên, 2 ảnh nhỏ dưới) */
                .msg-images-grid.count-3 { 
                    grid-template-columns: 1fr 1fr; 
                    grid-template-rows: 130px 130px; 
                }
                .msg-images-grid.count-3 .msg-image-wrapper:first-child { 
                    grid-column: span 2; 
                }
                
                /* Layout 4 ảnh (Lưới 2x2) */
                .msg-images-grid.count-4 { 
                    grid-template-columns: 1fr 1fr; 
                    grid-template-rows: 130px 130px; 
                }

                .msg-image-wrapper {
                    position: relative;
                    width: 100%;
                    height: 100%;
                    cursor: pointer;
                    background-color: #e0e0e0; /* placeholder màu xám */
                }

                .media-fit {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                    display: block;
                }

                .msg-image-overlay {
                    position: absolute;
                    top: 0; left: 0; right: 0; bottom: 0;
                    background: rgba(0, 0, 0, 0.5);
                    color: white;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 24px;
                    font-family: Arial, sans-serif;
                    font-weight: bold;
                }

                .msg-video-inner {
                    width: 100%; height: 100%; position: relative;
                }

                .play-icon-overlay {
                    position: absolute;
                    top: 50%; left: 50%;
                    transform: translate(-50%, -50%);
                    font-size: 32px;
                    color: white;
                    background: rgba(0,0,0,0.5);
                    border-radius: 50%;
                    padding: 8px;
                }

                /* Xóa background của bubble chat nếu nó CHỈ CHỨA ảnh */
                .chat-bubble.media-only {
                    background: transparent !important;
                    padding: 0 !important;
                    border: none !important;
                    box-shadow: none !important;
                }
                
                /* Box phóng to ảnh (Lightbox) */
                .full-media-viewer {
                    position: fixed; top: 0; left: 0; right: 0; bottom: 0;
                    background: rgba(0,0,0,0.85);
                    z-index: 99999;
                    display: flex; align-items: center; justify-content: center;
                }
                .viewer-close { position: absolute; top: 20px; right: 20px; cursor: pointer; color: white; padding: 10px; }
                .viewer-content img, .viewer-content video { max-width: 90vw; max-height: 90vh; border-radius: 8px; }
                
                /* Các nút điều hướng Next/Prev */
                .viewer-nav {
                    position: absolute;
                    top: 50%;
                    transform: translateY(-50%);
                    cursor: pointer;
                    color: white;
                    padding: 15px;
                    background: rgba(0,0,0,0.4);
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: background 0.3s;
                }
                .viewer-nav:hover { background: rgba(0,0,0,0.8); }
                .viewer-prev { left: 30px; }
                .viewer-next { right: 30px; }
            `}</style>

            <div className="messages-container">
                <div className="messages-sidebar">
                    <div className="sidebar-header">
                        <h2 className="sidebar-title">Hỗ trợ Admin</h2>
                        <div className="search-chat">
                            <FiSearch className="search-icon" />
                            <input
                                type="text"
                                placeholder="Tìm kiếm quản trị viên..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="vendor-list">
                        {visibleConversations.map(admin => (
                            <div
                                key={admin.id}
                                className={`vendor-item ${String(activeChat) === String(admin.id) ? 'active' : ''}`}
                                onClick={() => setActiveChat(admin.id)}
                            >
                                <div className="vendor-avatar">
                                    {admin.avatar ? <img src={admin.avatar} alt={admin.name} /> : String(admin.name || 'A').charAt(0).toUpperCase()}
                                </div>
                                <div className="vendor-info">
                                    <div className="vendor-name-row">
                                        <span className="vendor-name">{admin.name}</span>
                                        <span className={`vendor-presence-dot ${admin.isOffline ? 'offline' : 'online'}`} />
                                    </div>
                                    <div className="vendor-msg-row">
                                        <span className="vendor-last-msg">{admin.lastMessage}</span>
                                        {admin.unread > 0 && <span className="unread-badge">{admin.unread}</span>}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="messages-content">
                    {activeChat ? (
                        <>
                            <div className="chat-header">
                                <div className="chat-header-info">
                                    <div className="vendor-avatar">
                                        {activeAdmin?.avatar ? <img src={activeAdmin.avatar} alt={activeAdmin.name} /> : 'A'}
                                    </div>
                                    <div>
                                        <h3 className="chat-vendor-name">{activeAdmin?.name}</h3>
                                        <span className="chat-status">Quản trị viên hệ thống</span>
                                    </div>
                                </div>
                            </div>

                            <div className="chat-history" ref={chatHistoryRef}>
                                {activeMessages.map((msg, idx) => {
                                    const textContent = msg.message_text || msg.text;
                                    const imagesArray = parseImagesData(msg.media_url || msg.images || msg.image);
                                    const type = msg.message_type || msg.type || 'text';
                                    const hideTextBubble = (!textContent || textContent.trim() === '') && imagesArray.length > 0;

                                    return (
                                        <div key={idx} className={`chat-bubble-wrapper ${msg.sender === 'me' ? 'user' : 'bot'}`}>
                                            <div className={`chat-bubble ${msg.sender === 'me' ? 'user' : 'bot'} ${hideTextBubble ? 'media-only' : ''}`}>
                                                {!hideTextBubble && <div className="bubble-text">{textContent}</div>}
                                                {renderMediaGrid(imagesArray, type)}
                                                <span className="chat-time">{msg.time || msg.created_at}</span>
                                            </div>
                                        </div>
                                    );
                                })}

                                {sending && (
                                    <div className="chat-bubble-wrapper user">
                                        <div className="chat-bubble user sending" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <FiLoader className="spinning-icon" /> Đang gửi...
                                        </div>
                                    </div>
                                )}
                            </div>

                            {selectedFiles.length > 0 && (
                                <div className="media-preview-section">
                                    <div className="media-preview-header">
                                        <span className="media-count">Đã đính kèm {selectedFiles.length} tệp</span>
                                        <button type="button" className="btn-clear-all" onClick={clearMedia}>
                                            <FiX /> Hủy
                                        </button>
                                    </div>
                                    <div className="media-preview-scroll-wrapper">
                                        {selectedFiles.map((file, index) => (
                                            <div key={index} className="preview-item-mini">
                                                <button type="button" className="remove-preview-mini" onClick={() => removeFile(index)}>
                                                    <FiX size={12} />
                                                </button>
                                                {file.type === 'video' ? (
                                                    <div className="preview-video-wrapper">
                                                        <video src={file.previewUrl} />
                                                        <FiPlay className="preview-play-icon" />
                                                    </div>
                                                ) : (
                                                    <img src={file.previewUrl} alt="preview" />
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <form className="chat-input-area" onSubmit={handleSend}>
                                <button type="button" className="btn-icon" onClick={() => fileInputRef.current.click()} disabled={sending}>
                                    <FiImage />
                                </button>
                                <input 
                                    type="file" 
                                    ref={fileInputRef} 
                                    hidden 
                                    multiple
                                    accept="image/*,video/*" 
                                    onChange={handleFileSelect} 
                                />
                                <input
                                    type="text"
                                    placeholder="Nhập tin nhắn hỗ trợ..."
                                    value={inputMsg}
                                    onChange={(e) => setInputMsg(e.target.value)}
                                    disabled={sending}
                                />
                                <button type="submit" className="btn-send" disabled={(!inputMsg.trim() && selectedFiles.length === 0) || sending}>
                                    <FiSend />
                                </button>
                            </form>
                        </>
                    ) : (
                        <div className="no-chat-selected">
                            <FiSend size={48} />
                            <p>Chọn một quản trị viên để nhận hỗ trợ</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Media Viewer Modal với nút Next/Prev */}
            {mediaViewer && mediaViewer.items && (
                <div className="full-media-viewer" onClick={() => setMediaViewer(null)}>
                    <div className="viewer-close"><FiX size={32} /></div>
                    
                    {mediaViewer.items.length > 1 && (
                        <div className="viewer-nav viewer-prev" onClick={(e) => {
                            e.stopPropagation();
                            setMediaViewer(prev => ({ 
                                ...prev, 
                                currentIndex: (prev.currentIndex - 1 + prev.items.length) % prev.items.length 
                            }));
                        }}>
                            <FiChevronLeft size={48} />
                        </div>
                    )}

                    <div className="viewer-content" onClick={e => e.stopPropagation()}>
                        {mediaViewer.items[mediaViewer.currentIndex].type === 'video' ? (
                            <video src={mediaViewer.items[mediaViewer.currentIndex].url} controls autoPlay />
                        ) : (
                            <img src={mediaViewer.items[mediaViewer.currentIndex].url} alt="Phóng to" />
                        )}
                    </div>

                    {mediaViewer.items.length > 1 && (
                        <div className="viewer-nav viewer-next" onClick={(e) => {
                            e.stopPropagation();
                            setMediaViewer(prev => ({ 
                                ...prev, 
                                currentIndex: (prev.currentIndex + 1) % prev.items.length 
                            }));
                        }}>
                            <FiChevronRight size={48} />
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default Messages;