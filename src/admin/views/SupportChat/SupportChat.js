import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, Search, MoreHorizontal, MessageSquare, 
  Image as ImageIcon, Paperclip, Smile, Menu,
  AlertCircle, Ticket, SearchCode, Zap, X,
  ChevronLeft, ChevronRight, Trash2,
  ChevronDown, ChevronUp, ShieldCheck, ShoppingBag, UserCheck
} from 'lucide-react';

import { API_BASE } from 'src/config';

const SupportChat = () => {
  const token = localStorage.getItem('token');
  const userData = JSON.parse(localStorage.getItem('user') || '{}');
  const adminId = userData.id;

  const [activeTab, setActiveTab] = useState('chat');
  const [items, setItems] = useState([]); 
  const [selectedItem, setSelectedItem] = useState(null);
  const [messages, setMessages] = useState([]); 
  const [message, setMessage] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showActions, setShowActions] = useState(false);
  
  const [expandedGroups, setExpandedGroups] = useState({
    admin: true,
    vendor: true,
    customer: true
  });

  const [selectedImages, setSelectedImages] = useState([]);
  const fileInputRef = useRef(null);
  const scrollContainerRef = useRef(null);

  const [viewer, setViewer] = useState({ isOpen: false, images: [], currentIndex: 0 });
  const chatMessagesRef = useRef(null);
  const [isAtBottom, setIsAtBottom] = useState(true);

  // --- LẮNG NGHE PHÍM MŨI TÊN BÀN PHÍM ---
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!viewer.isOpen) return;
      if (e.key === 'ArrowRight') nextImg(e);
      if (e.key === 'ArrowLeft') prevImg(e);
      if (e.key === 'Escape') closeViewer();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [viewer.isOpen, viewer.currentIndex, viewer.images]);

  const fetchSidebar = async () => {
    if (!adminId || activeTab !== 'chat') return;
    try {
      const statusRes = await fetch(`${API_BASE}/user_status.php?action=get_all_users`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const allUsers = await statusRes.json();

      const convRes = await fetch(`${API_BASE}/message.php?action=get_conversations&user_id=${adminId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const conversations = await convRes.json();

      const mergedItems = allUsers.map(user => {
        const existingConv = Array.isArray(conversations) 
          ? conversations.find(c => String(c.partner_id) === String(user.id))
          : null;

        return {
          ...user,
          // FIX GỬI TIN: Luôn gán partner_id bằng id của user gốc từ DB
          partner_id: user.id, 
          id: existingConv ? existingConv.id : `new_${user.id}`,
          avatar: existingConv ? existingConv.avatar : user.avatar,
          lastMessage: existingConv ? existingConv.lastMessage : "Chưa có cuộc hội thoại",
          unread: existingConv ? existingConv.unread : 0,
          is_online: user.is_online 
        };
      });

      setItems(mergedItems.filter(i => String(i.partner_id) !== String(adminId)));
    } catch (error) { 
      console.error("Lỗi cập nhật danh sách:", error); 
    }
  };

  useEffect(() => {
    fetchSidebar();
    const interval = setInterval(fetchSidebar, 10000);
    return () => clearInterval(interval);
  }, [activeTab, adminId]);

  const fetchMessages = async () => {
    if (!selectedItem || !adminId || String(selectedItem.id).startsWith('new_')) {
        if (String(selectedItem?.id).startsWith('new_')) setMessages([]);
        return;
    }
    try {
      const response = await fetch(
        `${API_BASE}/message.php?action=get_messages&conversation_id=${selectedItem.id}&user_id=${adminId}`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      const data = await response.json();
      setMessages(data);
      
      await fetch(`${API_BASE}/mark_read.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ conversation_id: selectedItem.id, user_id: adminId })
      });
    } catch (error) { console.error(error); }
  };

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 5000);
    return () => clearInterval(interval);
  }, [selectedItem]);

  const handleSendMessage = async () => {
    if ((!message.trim() && selectedImages.length === 0) || !selectedItem) return;
    const formData = new FormData();
    formData.append('action', 'send_message');
    const convId = String(selectedItem.id).startsWith('new_') ? '' : selectedItem.id;
    formData.append('conversation_id', convId);
    formData.append('sender_id', adminId);
    formData.append('receiver_id', selectedItem.partner_id); 
    formData.append('text', message);
    selectedImages.forEach(img => formData.append('images[]', img.file));

    try {
      const response = await fetch(`${API_BASE}/message.php`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });
      const resData = await response.json();
      if (resData.status === 'success') {
        setMessage("");
        clearAllImages();
        await fetchSidebar();
        if (resData.conversation_id) {
           setSelectedItem(prev => ({...prev, id: resData.conversation_id}));
        }
        fetchMessages();
      }
    } catch (error) { console.error(error); }
  };

  const groupedUsers = {
    admin: items.filter(u => u.role === 'admin'),
    vendor: items.filter(u => u.role === 'vendor'),
    customer: items.filter(u => u.role === 'customer' || !u.role)
  };

  const toggleGroup = (group) => setExpandedGroups(prev => ({ ...prev, [group]: !prev[group] }));

  const getAvatarUrl = (user) => {
    if (user?.avatar && user.avatar !== "") {
        if (String(user.avatar).startsWith('http')) return user.avatar;
        return `${API_BASE}/uploads/avatars/${user.avatar}`;
    }
    const roleColors = { admin: 'ef4444', vendor: '22c55e', customer: '3b82f6' };
    const color = roleColors[user?.role] || '64748b';
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'U')}&background=${color}&background=${color}&color=fff&bold=true`;
  };

  const renderUserItem = (user) => (
    <div key={user.partner_id} className={`support-item ${selectedItem?.partner_id === user.partner_id ? 'active' : ''}`} onClick={() => setSelectedItem(user)}>
      <div style={{display:'flex', gap: '10px', alignItems: 'center'}}>
        <div style={{ position: 'relative', flexShrink: 0 }}>
          <img 
            src={getAvatarUrl(user)} 
            style={{width: 35, height: 35, borderRadius: '8px', objectFit:'cover'}} 
            alt="avt" 
            onError={(e) => { e.target.src = `https://ui-avatars.com/api/?name=${user.name}&background=64748b&color=fff`; }}
          />
          <div style={{ 
            position: 'absolute', bottom: -1, right: -1, width: 10, height: 10, 
            backgroundColor: user.is_online == 1 ? '#22c55e' : '#94a3b8', 
            borderRadius: '50%', border: '2px solid #fff' 
          }}></div>
        </div>
        <div style={{flex: 1, minWidth: 0}}>
          <b style={{fontSize: '12px'}}>{user.name}</b>
          <br/><span style={{fontSize: '11px', color: '#64748b', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis', display:'block'}}>{user.lastMessage}</span>
        </div>
        {user.unread > 0 && <div className="unread-dot">{user.unread}</div>}
      </div>
    </div>
  );

  const handleScroll = () => {
    const container = chatMessagesRef.current;
    if (container) setIsAtBottom(container.scrollHeight - container.scrollTop <= container.clientHeight + 50);
  };
  useEffect(() => { if (isAtBottom && chatMessagesRef.current) chatMessagesRef.current.scrollTop = chatMessagesRef.current.scrollHeight; }, [messages]);
  
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setSelectedImages(prev => [...prev, ...files.map(file => ({ file, url: URL.createObjectURL(file) }))]);
    e.target.value = null; 
  };
  
  const removeImage = (index) => {
    const imgToRemove = selectedImages[index];
    if (imgToRemove) URL.revokeObjectURL(imgToRemove.url); 
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
  };
  
  const clearAllImages = () => {
    selectedImages.forEach(img => URL.revokeObjectURL(img.url));
    setSelectedImages([]);
  };
  
  const handleWheelScroll = (e) => { if (scrollContainerRef.current) scrollContainerRef.current.scrollLeft += e.deltaY; };
  
  const openViewer = (imgs, index) => setViewer({ isOpen: true, images: imgs, currentIndex: index });
  const closeViewer = () => setViewer(prev => ({ ...prev, isOpen: false }));
  const nextImg = (e) => { 
    if(e) e.stopPropagation(); 
    setViewer(prev => ({ 
      ...prev, 
      currentIndex: (prev.currentIndex + 1) % prev.images.length 
    })); 
  };
  const prevImg = (e) => { 
    if(e) e.stopPropagation(); 
    setViewer(prev => ({ 
      ...prev, 
      currentIndex: (prev.currentIndex - 1 + prev.images.length) % prev.images.length 
    })); 
  };

  if (!token) return <div className="p-10 text-center">Vui lòng đăng nhập để sử dụng.</div>;

  return (
    <>
      {viewer.isOpen && (
        <div 
          style={{
            position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
            backgroundColor: 'rgba(0, 0, 0, 0.98)', zIndex: 99999999,
            display: 'flex', alignItems: 'center', justifyContent: 'center', userSelect: 'none'
          }}
          onClick={closeViewer}
        >
          <div 
            style={{ position: 'fixed', top: '30px', right: '30px', color: 'white', cursor: 'pointer', zIndex: 100000000 }}
            onClick={closeViewer}
          >
            <X size={40} strokeWidth={3} />
          </div>

          {viewer.images.length > 1 && (
            <>
              <div 
                style={{ position: 'fixed', left: '40px', top: '50%', transform: 'translateY(-50%)', color: 'white', cursor: 'pointer', zIndex: 100000000, background: 'rgba(255,255,255,0.1)', padding: '15px', borderRadius: '50%' }}
                onClick={prevImg}
              >
                <ChevronLeft size={50} />
              </div>
              <div 
                style={{ position: 'fixed', right: '40px', top: '50%', transform: 'translateY(-50%)', color: 'white', cursor: 'pointer', zIndex: 100000000, background: 'rgba(255,255,255,0.1)', padding: '15px', borderRadius: '50%' }}
                onClick={nextImg}
              >
                <ChevronRight size={50} />
              </div>
            </>
          )}

          <img 
            src={viewer.images[viewer.currentIndex]} 
            style={{ maxWidth: '90vw', maxHeight: '90vh', objectFit: 'contain', boxShadow: '0 0 50px rgba(0,0,0,0.5)' }} 
            alt="full-view"
            onClick={(e) => e.stopPropagation()}
          />

          <div style={{ position: 'fixed', bottom: '30px', color: 'white', background: 'rgba(255,255,255,0.2)', padding: '5px 25px', borderRadius: '25px', fontSize: '16px', fontWeight: 'bold', zIndex: 100000000 }}>
            {viewer.currentIndex + 1} / {viewer.images.length}
          </div>
        </div>
      )}

      <div className="isolated-support-panel">
        <style>{`
          .isolated-support-panel { width: 100%; height: 650px; display: flex; flex-direction: column; font-family: 'Inter', sans-serif; background: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 20px rgba(0,0,0,0.05); position: relative; z-index: 1; }
          .panel-nav-header { display: flex; background: #fff; padding: 10px 15px; border-bottom: 1px solid #f1f5f9; gap: 10px; }
          .tab-trigger { padding: 6px 16px; border-radius: 8px; border: none; font-size: 13px; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 6px; transition: 0.2s; color: #64748b; background: #f8fafc; }
          .tab-trigger.active { background: #198754; color: white; }
          .panel-flex-body { display: flex; flex: 1; overflow: hidden; position: relative; }
          .panel-sidebar { width: 280px; border-right: 1px solid #f1f5f9; display: flex; flex-direction: column; background: #fff; }
          .item-scroll-list { flex: 1; overflow-y: auto; }
          .group-header { padding: 12px 15px; font-size: 11px; font-weight: 800; color: #64748b; background: #f8fafc; cursor: pointer; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #eee; text-transform: uppercase; letter-spacing: 0.5px; }
          .support-item { padding: 12px 15px; border-bottom: 1px solid #fcfdfe; cursor: pointer; transition: 0.2s; position: relative; }
          .support-item.active { background: #e8f5e9; border-left: 3px solid #198754; }
          .unread-dot { position: absolute; right: 15px; top: 50%; transform: translateY(-50%); background: #ef4444; color: white; border-radius: 10px; padding: 2px 6px; font-size: 10px; font-weight: bold; }
          .chat-view { flex: 1; display: flex; flex-direction: column; background: white; position: relative; overflow: hidden; }
          .chat-view-header { padding: 12px 20px; border-bottom: 1px solid #f1f5f9; display: flex; justify-content: space-between; align-items: center; }
          .chat-view-messages { flex: 1; padding: 20px; overflow-y: auto; background: #fbfcfe; display: flex; flex-direction: column; gap: 12px; scroll-behavior: smooth; }
          .bubble-msg { max-width: 80%; padding: 10px 14px; border-radius: 12px; font-size: 13px; line-height: 1.4; position: relative; }
          .bubble-in { background: #f1f5f9; color: #1e293b; align-self: flex-start; }
          .bubble-out { background: #198754; color: white; align-self: flex-end; }
          
          /* LOGIC GRID ẢNH TRONG TIN NHẮN */
          .media-grid { display: grid; grid-template-columns: repeat(2, 100px); gap: 8px; margin-top: 8px; width: fit-content; }
          .media-grid-item { width: 100px; height: 100px; position: relative; cursor: pointer; border-radius: 8px; overflow: hidden; background: #eee; }
          .media-grid-item img { width: 100%; height: 100%; object-fit: cover; }
          .media-more-overlay { position: absolute; inset: 0; background: rgba(0,0,0,0.6); color: white; display: flex; align-items: center; justify-content: center; font-size: 18px; font-weight: bold; }
          
          .single-image-wrapper { max-width: 200px; max-height: 250px; margin-top: 8px; border-radius: 10px; overflow: hidden; cursor: pointer; border: 1px solid #e2e8f0; }
          .single-image-wrapper img { width: 100%; height: 100%; object-fit: contain; background: #f8fafc; display: block; }

          .preview-wrapper { position: absolute; bottom: 60px; left: 0; right: 0; background: #ffffff; border-top: 1px solid #e2e8f0; z-index: 20; padding: 12px 15px; box-shadow: 0 -4px 10px rgba(0,0,0,0.03); }
          .preview-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; }
          .preview-clear-btn { display: flex; align-items: center; gap: 4px; font-size: 11px; font-weight: 700; color: #ef4444; border: 1px solid #fee2e2; background: #fef2f2; padding: 4px 10px; border-radius: 6px; cursor: pointer; }
          .image-preview-bar { display: flex; gap: 12px; overflow-x: auto; padding-bottom: 5px; }
          
          .preview-item { position: relative; flex-shrink: 0; }
          .preview-img-box { width: 65px; height: 65px; border-radius: 8px; object-fit: cover; border: 1px solid #ddd; }
          .x-remove-btn { position: absolute; top: -6px; right: -6px; background: #ef4444; color: white; border: 2px solid white; border-radius: 50%; width: 20px; height: 20px; display: flex; align-items: center; justify-content: center; cursor: pointer; z-index: 5; }

          .chat-view-footer { padding: 12px 20px; border-top: 1px solid #f1f5f9; display: flex; align-items: center; gap: 12px; background: white; z-index: 21; position: relative; }
          .pill-input { flex: 1; background: #f8fafc; border-radius: 8px; padding: 8px 12px; border: 1px solid #f1f5f9; }
          .pill-input input { width: 100%; border: none; background: transparent; outline: none; font-size: 13px; }
          .send-btn-circle { width: 35px; height: 35px; border-radius: 8px; background: #198754; color: white; border: none; display: flex; align-items: center; justify-content: center; cursor: pointer; }
        `}</style>

        <div className="panel-nav-header">
          <button className={`tab-trigger active`}><MessageSquare size={16} /> Live Chat</button>
        </div>

        <div className="panel-flex-body">
          <div className="panel-sidebar">
            <div className="item-scroll-list">
              {activeTab === 'chat' && (
                <>
                  {['admin', 'vendor', 'customer'].map(role => (
                    <div key={role}>
                      <div className="group-header" onClick={() => toggleGroup(role)}>
                        <div><ShieldCheck size={14} style={{display:'inline', marginRight:5}}/> {role.toUpperCase()} ({groupedUsers[role].length})</div>
                        {expandedGroups[role] ? <ChevronUp size={14}/> : <ChevronDown size={14}/>}
                      </div>
                      {expandedGroups[role] && groupedUsers[role].map(renderUserItem)}
                    </div>
                  ))}
                </>
              )}
            </div>
          </div>

          <div className="chat-view">
            {selectedItem ? (
              <>
                <div className="chat-view-header">
                  <div style={{display:'flex', alignItems:'center', gap:'10px'}}>
                    <div style={{position:'relative'}}>
                      <img src={getAvatarUrl(selectedItem)} style={{width: 32, height: 32, borderRadius: '6px', objectFit: 'cover'}} alt="avt" />
                      <div style={{position:'absolute', bottom: -2, right: -2, width: 10, height: 10, background: selectedItem.is_online == 1 ? '#22c55e' : '#94a3b8', borderRadius: '50%', border: '2px solid #fff'}}></div>
                    </div>
                    <h4 style={{margin: 0, fontSize: '14px'}}>{selectedItem.name}</h4>
                  </div>
                </div>

                <div className="chat-view-messages" ref={chatMessagesRef} onScroll={handleScroll}>
                  {messages.map((msg, idx) => (
                    <div
                      key={idx}
                      className={`bubble-msg ${msg.sender === 'me' || String(msg.sender_id) === String(adminId) ? 'bubble-out' : 'bubble-in'}`}
                    >
                      {msg.text && <div>{msg.text}</div>}
                      {msg.images && msg.images.length > 0 && (
                        <div className={msg.images.length === 1 ? "single-image-wrapper" : "media-grid"}>
                          {msg.images.slice(0, 4).map((url, i) => (
                            <div key={i} className="media-grid-item" onClick={() => openViewer(msg.images, i)}>
                              <img src={url} alt="chat-img" onError={(e) => { e.target.src = 'https://via.placeholder.com/150?text=Error'; }} />
                              {i === 3 && msg.images.length > 4 && (
                                <div className="media-more-overlay">+{msg.images.length - 4}</div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                      <span style={{fontSize:'9px', opacity:0.6, display:'block', textAlign:'right', marginTop:4}}>{msg.time}</span>
                    </div>
                  ))}
                </div>

                {selectedImages.length > 0 && (
                  <div className="preview-wrapper">
                    <div className="preview-header">
                      <span style={{fontSize:'11px', fontWeight:700, color:'#475569'}}>Đã chọn {selectedImages.length} tệp</span>
                      <button className="preview-clear-btn" onClick={clearAllImages}><Trash2 size={12} /> Hủy tất cả</button>
                    </div>
                    <div className="image-preview-bar" ref={scrollContainerRef} onWheel={handleWheelScroll}>
                      {selectedImages.map((img, index) => (
                        <div key={index} className="preview-item">
                          <img src={img.url} className="preview-img-box" alt="preview" />
                          <div className="x-remove-btn" onClick={() => removeImage(index)}><X size={12} /></div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="chat-view-footer">
                  <ImageIcon size={20} onClick={() => fileInputRef.current.click()} style={{cursor:'pointer', color:'#a3aed0'}} />
                  <input type="file" ref={fileInputRef} hidden multiple accept="image/*" onChange={handleImageChange} />
                  <div className="pill-input">
                    <input type="text" placeholder="Nhập tin nhắn..." value={message} onChange={(e) => setMessage(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()} />
                  </div>
                  <button className="send-btn-circle" onClick={handleSendMessage}><Send size={16} /></button>
                </div>
              </>
            ) : (
              <div style={{flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8'}}>Chọn một người dùng để bắt đầu chat</div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default SupportChat;