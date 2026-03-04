import React, { useState, useEffect, useRef } from 'react'
import {
  CCard, CCol, CRow, CButton, CFormInput, CAvatar, CBadge, CFormTextarea, CModal, CModalBody
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { 
  cilSend, cilUser, cilSearch, cilPaperclip, cilImage, cilClock, cilLeaf, cilSnowflake, cilTruck, cilX, cilChevronLeft, cilChevronRight, cilVideo
} from '@coreui/icons'

// --- CẤU HÌNH ---
const API_BASE_URL = 'http://localhost/nongsan-api'; 
const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
const storedToken = localStorage.getItem('token');
const CURRENT_USER_ID = storedUser.id || 1; 
const MAX_FILE_SIZE = 40 * 1024 * 1024; // 40MB tính bằng bytes

const quickReplies = [
    { label: 'Ngày thu hoạch', text: 'Dạ sản phẩm này được thu hoạch mới vào sáng sớm nay, đảm bảo độ tươi 100% ạ.', icon: cilClock },
    { label: 'Độ tươi', text: 'Bên em cam kết hàng tươi sạch, không chất bảo quản, bao đổi trả nếu dập nát ạ.', icon: cilLeaf },
    { label: 'Cách bảo quản', text: 'Anh/Chị nên bọc kín bằng giấy báo hoặc màng bọc, để ngăn mát tủ lạnh sẽ giữ tươi được 3-5 ngày ạ.', icon: cilSnowflake },
    { label: 'Vận chuyển', text: 'Bên em sẽ giao hỏa tốc trong 2h để đảm bảo độ tươi ngon nhất ạ.', icon: cilTruck }
]

const Chat = () => {
  const [chats, setChats] = useState([]) 
  const [activeChatId, setActiveChatId] = useState(null)
  const [messages, setMessages] = useState([]) 
  const [inputText, setInputText] = useState('')
  const [pendingFiles, setPendingFiles] = useState([]) 
  
  const [userSearchTerm, setUserSearchTerm] = useState('') 
  const [msgSearchTerm, setMsgSearchTerm] = useState('')   
  const [showMsgSearch, setShowMsgSearch] = useState(false) 

  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [currentMedia, setCurrentMedia] = useState([]) 
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0)

  const messagesEndRef = useRef(null)
  const fileInputRef = useRef(null) 

  const fetchConversations = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/message.php?action=get_conversations&user_id=${CURRENT_USER_ID}`, {
            headers: { 'Authorization': `Bearer ${storedToken}` }
        });
        const data = await response.json();
        setChats(Array.isArray(data) ? data : []);
    } catch (error) { console.error("Lỗi tải chat:", error); }
  };

  useEffect(() => {
    fetchConversations();
    const interval = setInterval(fetchConversations, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchMessages = async (conversationId) => {
      try {
          const response = await fetch(`${API_BASE_URL}/message.php?action=get_messages&conversation_id=${conversationId}&user_id=${CURRENT_USER_ID}`, {
              headers: { 'Authorization': `Bearer ${storedToken}` }
          });
          const data = await response.json();
          setMessages(Array.isArray(data) ? data : []);
      } catch (error) { console.error("Lỗi tải tin nhắn:", error); }
  };

  const markAsRead = async (conversationId) => {
      try {
          await fetch(`${API_BASE_URL}/mark_read.php`, {
              method: 'POST',
              headers: { 'Authorization': `Bearer ${storedToken}` },
              body: JSON.stringify({ conversation_id: conversationId, user_id: CURRENT_USER_ID })
          });
          setChats(prev => prev.map(c => c.id === conversationId ? { ...c, unread: 0 } : c));
      } catch (error) {}
  }

  const handleSelectChat = (id) => {
    setActiveChatId(id);
    setMsgSearchTerm('');
    setShowMsgSearch(false);
    setPendingFiles([]);
    setInputText('');
    fetchMessages(id);
    markAsRead(id);
  };

  useEffect(() => {
      let interval;
      if (activeChatId) {
          interval = setInterval(() => { fetchMessages(activeChatId); }, 3000);
      }
      return () => clearInterval(interval);
  }, [activeChatId]);

  const activeChatInfo = chats.find(c => c.id === activeChatId);
  const filteredChats = chats.filter(c => c.name.toLowerCase().includes(userSearchTerm.toLowerCase()));

  const displayedMessages = messages.filter(msg => {
      if (!msgSearchTerm) return true;
      return msg.text && msg.text.toLowerCase().includes(msgSearchTerm.toLowerCase());
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, pendingFiles, activeChatId]);

  const nextMedia = () => setCurrentMediaIndex((prev) => (prev + 1) % currentMedia.length);
  const prevMedia = () => setCurrentMediaIndex((prev) => (prev - 1 + currentMedia.length) % currentMedia.length);

  useEffect(() => {
    const handleKeyDown = (e) => {
        if (!lightboxOpen) return;
        if (e.key === 'ArrowRight') nextMedia();
        if (e.key === 'ArrowLeft') prevMedia();
        if (e.key === 'Escape') setLightboxOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxOpen, currentMediaIndex, currentMedia]);

  // --- XỬ LÝ FILE (GIỚI HẠN 40MB) ---
  const handleFileSelect = (e) => {
    if (e.target.files) {
        const filesArray = Array.from(e.target.files);
        
        // Kiểm tra dung lượng từng file
        const validFiles = filesArray.filter(file => {
          if (file.size > MAX_FILE_SIZE) {
            alert(`File "${file.name}" vượt quá giới hạn 40MB.`);
            return false;
          }
          return true;
        });

        if (pendingFiles.length + validFiles.length > 40) {
            alert("Tối đa 40 tệp tin một lần.");
            return;
        }
        setPendingFiles(prev => [...prev, ...validFiles]);
    }
    e.target.value = null;
  }

  const removePendingFile = (index) => setPendingFiles(prev => prev.filter((_, i) => i !== index));

  const handleSendMessage = async () => {
    if ((!inputText.trim() && pendingFiles.length === 0) || !activeChatId) return;
    
    const currentPartnerId = activeChatInfo?.partner_id;
    const formData = new FormData();
    formData.append('action', 'send_message');
    formData.append('conversation_id', activeChatId);
    formData.append('sender_id', CURRENT_USER_ID);
    formData.append('receiver_id', currentPartnerId); 

    if (inputText.trim()) formData.append('text', inputText);
    if (pendingFiles.length > 0) {
        pendingFiles.forEach((file) => formData.append('images[]', file));
    }

    try {
        const res = await fetch(`${API_BASE_URL}/message.php`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${storedToken}` },
            body: formData
        });
        const result = await res.json();
        if (result.status === 'success') {
            setInputText('');
            setPendingFiles([]);
            fetchMessages(activeChatId);
            fetchConversations(); 
        }
    } catch (error) { console.error("Lỗi gửi tin:", error); }
  }

  const openLightbox = (media, index) => {
      if (!Array.isArray(media)) return;
      setCurrentMedia(media);
      setCurrentMediaIndex(index);
      setLightboxOpen(true);
  }

  const renderMediaGrid = (mediaUrls) => {
      if (!mediaUrls || mediaUrls.length === 0) return null;
      const count = mediaUrls.length;
      const displayMedia = mediaUrls.slice(0, 4);
      const remaining = count - 4;

      return (
          <div className={`media-grid grid-count-${Math.min(count, 4)}`} style={{
            display: 'grid',
            gridTemplateColumns: count === 1 ? '1fr' : '1fr 1fr',
            gap: '2px',
            width: '280px',
            marginTop: '8px',
            borderRadius: '12px',
            overflow: 'hidden',
            border: '1px solid rgba(255,255,255,0.1)'
          }}>
              {displayMedia.map((url, idx) => {
                  const isVideo = url.match(/\.(mp4|webm|ogg|mov)$/i);
                  let gridStyle = { height: '100px', background: '#000', cursor: 'pointer', position: 'relative' };
                  
                  if (count === 1) gridStyle.height = '180px';
                  else if (count === 3 && idx === 2) {
                      gridStyle.gridColumn = 'span 2';
                      gridStyle.height = '120px';
                  }

                  return (
                      <div key={idx} style={gridStyle} onClick={() => openLightbox(mediaUrls, idx)}>
                          {isVideo ? (
                              <div className="h-100 d-flex align-items-center justify-content-center">
                                  <video src={url} style={{width:'100%', height:'100%', objectFit:'cover'}} />
                                  <CIcon icon={cilVideo} className="position-absolute text-white" size="xl" />
                              </div>
                          ) : (
                              <img src={url} alt={`media-${idx}`} style={{width:'100%', height:'100%', objectFit:'cover'}} />
                          )}
                          {idx === 3 && remaining > 0 && (
                              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '1.4rem' }}>
                                <span>+{remaining}</span>
                              </div>
                          )}
                      </div>
                  );
              })}
          </div>
      );
  }

  return (
    <div className="chat-page-container">
      <style>{`
        .card-chat-container { height: calc(100vh - 140px); min-height: 600px; background-color: #2F5233; border: none; overflow: hidden; display: flex; flex-direction: column; }
        .chat-sidebar { background-color: #1E3923; border-right: 1px solid #558b6e; height: 100%; display: flex; flex-direction: column; }
        .user-list { overflow-y: auto; flex-grow: 1; }
        .user-item { padding: 15px; border-bottom: 1px solid rgba(85, 139, 110, 0.3); cursor: pointer; transition: 0.2s; display: flex; align-items: center; position: relative; color: white; }
        .user-item:hover { background-color: rgba(255,255,255,0.05); }
        .user-item.active { background-color: rgba(82, 183, 136, 0.2); border-left: 4px solid #ffd166; }
        .chat-main { display: flex; flex-direction: column; height: 100%; background-color: #2F5233; }
        .chat-header { padding: 10px 15px; background-color: #1E3923; border-bottom: 1px solid #558b6e; display: flex; align-items: center; justify-content: space-between; height: 70px; }
        .message-list { flex-grow: 1; padding: 20px; overflow-y: auto; display: flex; flex-direction: column; gap: 15px; }
        .message-bubble { max-width: 80%; padding: 10px 15px; border-radius: 12px; font-size: 0.95rem; line-height: 1.4; word-wrap: break-word; }
        .msg-customer { align-self: flex-start; background-color: #3A6B35; color: #fff; }
        .msg-admin { align-self: flex-end; background-color: #ffd166; color: #1E3923; font-weight: 500; }
        .form-control-chat { background-color: #2F5233; border: 1px solid #558b6e; color: #fff; border-radius: 20px; }
        .lightbox-close { position: absolute; top: 20px; right: 20px; z-index: 9999; color: white; background: rgba(0,0,0,0.5); border-radius: 50%; width: 45px; height: 45px; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; }
        .status-dot { position: absolute; bottom: 2px; right: 2px; width: 12px; height: 12px; border-radius: 50%; border: 2px solid #1E3923; }
      `}</style>

      <input type="file" ref={fileInputRef} style={{ display: 'none' }} accept="image/*,video/*" multiple onChange={handleFileSelect} />

      <CCard className="card-chat-container">
        <CRow className="g-0 h-100">
          <CCol md={4} lg={3} className={`chat-sidebar ${activeChatId ? 'd-none d-md-flex' : 'd-flex'}`}>
             <div className="p-3 border-bottom border-secondary">
                <div className="position-relative">
                    <CFormInput className="form-control-chat ps-5" placeholder="Tìm người nhắn..." value={userSearchTerm} onChange={(e) => setUserSearchTerm(e.target.value)} />
                    <CIcon icon={cilSearch} className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted" />
                </div>
             </div>
             <div className="user-list">
                {filteredChats.map(chat => (
                    <div key={chat.id} className={`user-item ${activeChatId === chat.id ? 'active' : ''}`} onClick={() => handleSelectChat(chat.id)}>
                        <div className="me-3 position-relative">
                            <CAvatar src={chat.avatar || `https://i.pravatar.cc/150?u=${chat.partner_id}`} size="md" />
                            <div className={`status-dot ${chat.online ? 'bg-success' : 'bg-secondary'}`}></div>
                        </div>
                        <div className="flex-grow-1 overflow-hidden">
                            <div className="d-flex justify-content-between align-items-center">
                                <div className="fw-bold text-white text-truncate">{chat.name}</div>
                                <small className="text-muted ms-2">{chat.time}</small>
                            </div>
                            <div className="text-truncate small text-white-50">
                                {parseInt(chat.unread) > 0 ? <strong className="text-warning">{chat.lastMessage}</strong> : chat.lastMessage}
                            </div>
                        </div>
                        {parseInt(chat.unread) > 0 && <CBadge color="danger" shape="rounded-pill" className="ms-2">{chat.unread}</CBadge>}
                    </div>
                ))}
             </div>
          </CCol>

          <CCol xs={12} md={8} lg={9} className={`chat-main ${!activeChatId ? 'd-none d-md-flex' : 'd-flex'}`}>
            <div className="chat-header">
                {activeChatInfo && (
                    <div className="d-flex align-items-center">
                        <CButton className="d-md-none text-white me-2 p-0" onClick={() => setActiveChatId(null)}><CIcon icon={cilChevronLeft} /></CButton>
                        <CAvatar src={activeChatInfo.avatar || `https://i.pravatar.cc/150?u=${activeChatInfo.partner_id}`} size="md" className="me-3" />
                        <div className="fw-bold text-white">{activeChatInfo.name}</div>
                    </div>
                )}
                <div className="d-flex align-items-center">
                    {showMsgSearch && <input type="text" className="search-msg-input" placeholder="Tìm..." value={msgSearchTerm} onChange={(e) => setMsgSearchTerm(e.target.value)} autoFocus style={{background: 'transparent', border: 'none', borderBottom: '1px solid #ffd166', color: 'white', marginRight: '10px'}} />}
                    <CButton color="link" className="text-white-50" onClick={() => setShowMsgSearch(!showMsgSearch)}><CIcon icon={cilSearch} /></CButton>
                    <CButton color="link" className="text-white-50" onClick={() => fileInputRef.current.click()}><CIcon icon={cilPaperclip} /></CButton>
                </div>
            </div>

            <div className="message-list">
                {displayedMessages.map(msg => (
                    <div key={msg.id} className={`message-bubble ${msg.sender_id == CURRENT_USER_ID ? 'msg-admin' : 'msg-customer'} ${msg.type !== 'text' ? 'bg-transparent p-0 border-0' : ''}`}>
                        {msg.type === 'text' && msg.text && <div>{msg.text}</div>}
                        {msg.type !== 'text' && msg.text && !msg.text.includes('http') && (
                             <div className="mb-1 p-2 rounded bg-dark text-white small">{msg.text}</div>
                        )}
                        {msg.images && msg.images.length > 0 && renderMediaGrid(msg.images)}
                        <div className="msg-time" style={{fontSize: '0.7rem', marginTop: '5px', opacity: 0.7, textAlign:'right'}}>{msg.time}</div>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>

            <div className="chat-input-area" style={{background: '#1E3923', padding: '15px'}}>
                <div className="quick-replies d-flex gap-2 mb-2 overflow-auto pb-1">
                    {quickReplies.map((qr, index) => (
                        <div key={index} className="reply-chip" style={{padding: '5px 12px', border: '1px solid #558b6e', borderRadius: '20px', color: '#b7e4c7', cursor: 'pointer', whiteSpace: 'nowrap', fontSize: '0.8rem'}} onClick={() => setInputText(qr.text)}>{qr.label}</div>
                    ))}
                </div>
                
                {/* PREVIEW AREA CÓ NÚT HỦY TẤT CẢ */}
                {pendingFiles.length > 0 && (
                    <div className="mb-2">
                        <div className="d-flex justify-content-between align-items-center mb-1">
                          <span className="text-white-50 small">Đã chọn {pendingFiles.length} tệp</span>
                          <CButton size="sm" color="danger" variant="ghost" onClick={() => setPendingFiles([])} style={{fontSize: '0.7rem', padding: '2px 8px'}}>Hủy tất cả</CButton>
                        </div>
                        <div className="preview-area d-flex gap-2 overflow-auto pb-2">
                            {pendingFiles.map((file, index) => (
                                <div key={index} className="position-relative flex-shrink-0">
                                    {file.type.startsWith('video/') ? 
                                        <div className="bg-dark rounded d-flex align-items-center justify-content-center" style={{width:60, height:60}}><CIcon icon={cilVideo} className="text-white"/></div> :
                                        <img src={URL.createObjectURL(file)} style={{width:60, height:60, objectFit:'cover', borderRadius:8}} alt="preview"/>
                                    }
                                    <div onClick={() => removePendingFile(index)} style={{position:'absolute', top:-5, right:-5, background:'red', color:'white', borderRadius:'50%', width:18, height:18, textAlign:'center', cursor:'pointer', fontSize:12, fontWeight:'bold', lineHeight: '18px'}}>X</div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <div className="d-flex gap-2 align-items-end">
                    <CButton color="link" className="text-white-50 p-2" onClick={() => fileInputRef.current.click()}><CIcon icon={cilImage} size="lg"/></CButton>
                    <CFormTextarea rows={1} className="form-control-chat" value={inputText} placeholder="Nhập tin nhắn..." onChange={(e) => setInputText(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(); } }} />
                    <CButton style={{backgroundColor: '#ffd166', color: '#1E3923', fontWeight: 'bold'}} className="rounded-circle p-2" onClick={handleSendMessage}><CIcon icon={cilSend} size="lg" /></CButton>
                </div>
            </div>
          </CCol>
        </CRow>
      </CCard>

      {/* LIGHTBOX MEDIA */}
      <CModal visible={lightboxOpen} onClose={() => setLightboxOpen(false)} fullscreen backdrop="static">
        <CModalBody className="bg-black p-0 d-flex align-items-center justify-content-center position-relative">
            <button className="lightbox-close" onClick={() => setLightboxOpen(false)}><CIcon icon={cilX} size="xl"/></button>
            <CButton color="link" onClick={prevMedia} style={{position:'absolute', left:20, zIndex:10000}}><CIcon icon={cilChevronLeft} size="3xl" className="text-white-50"/></CButton>
            
            <div className="media-container w-100 h-100 d-flex align-items-center justify-content-center">
                {currentMedia.length > 0 && (
                    currentMedia[currentMediaIndex].match(/\.(mp4|webm|ogg|mov)$/i) ? 
                    <video key={currentMedia[currentMediaIndex]} src={currentMedia[currentMediaIndex]} controls autoPlay style={{maxHeight:'90vh', maxWidth:'90vw'}} /> :
                    <img src={currentMedia[currentMediaIndex]} style={{maxHeight:'90vh', maxWidth:'90vw', objectFit:'contain'}} alt="view" />
                )}
            </div>

            <CButton color="link" onClick={nextMedia} style={{position:'absolute', right:20, zIndex:10000}}><CIcon icon={cilChevronRight} size="3xl" className="text-white-50"/></CButton>
            <div className="position-absolute bottom-0 mb-4 text-white small bg-dark px-3 py-1 rounded-pill opacity-75">{currentMediaIndex + 1} / {currentMedia.length}</div>
        </CModalBody>
      </CModal>
    </div>
  )
}

export default Chat