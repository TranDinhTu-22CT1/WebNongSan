import React, { useState, useEffect, useMemo } from 'react';
import { 
  Search, Star, Trash2, ShieldAlert, 
  MessageSquare, CheckCircle2, 
  XCircle, ImageIcon, User, Store, Maximize2, Loader2
} from 'lucide-react';
import { API_BASE } from 'src/config';

const API_BASE_URL = `${API_BASE}/review.php`;

const ReviewManagement = () => {
  const [reviews, setReviews] = useState([]);
  const [activeTab, setActiveTab] = useState('Pending');
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  
  // State xử lý xem ảnh phóng to
  const [viewingImage, setViewingImage] = useState(null);

  // 1. Tải dữ liệu từ API khi component mount
  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}?action=list`);
      const data = await res.json();
      if (data.status === 'success') {
        setReviews(data.data);
      } else {
        console.error("Lỗi API:", data.message);
      }
    } catch (error) {
      console.error("Lỗi kết nối server:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // 2. Cập nhật trạng thái (Phê duyệt / Vi phạm)
  const handleUpdateStatus = async (id, newStatus) => {
    try {
      const res = await fetch(`${API_BASE_URL}?action=update_status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: newStatus })
      });
      const data = await res.json();
      
      if (data.status === 'success') {
        // Cập nhật state cục bộ để giao diện phản hồi ngay lập tức
        setReviews(prev => prev.map(r => r.id === id ? { ...r, status: newStatus } : r));
      } else {
        alert("Lỗi: " + data.message);
      }
    } catch (error) {
      alert("Không thể kết nối tới máy chủ để cập nhật!");
    }
  };

  // 3. Xóa vĩnh viễn đánh giá
  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa vĩnh viễn đánh giá này?")) return;

    try {
      const res = await fetch(`${API_BASE_URL}?action=delete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      const data = await res.json();
      
      if (data.status === 'success') {
        setReviews(prev => prev.filter(r => r.id !== id));
      } else {
        alert("Lỗi: " + data.message);
      }
    } catch (error) {
      alert("Lỗi khi xóa dữ liệu!");
    }
  };

  const filteredReviews = useMemo(() => {
    return reviews.filter(r => {
      const matchSearch = 
        (r.product_name?.toLowerCase() || "").includes(searchTerm.toLowerCase()) || 
        (r.vendor_name?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
        (r.customer_name?.toLowerCase() || "").includes(searchTerm.toLowerCase());
      return r.status === activeTab && matchSearch;
    });
  }, [reviews, activeTab, searchTerm]);

  return (
    <div className="admin-review-wrapper">
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      
      <style>{`
        .admin-review-wrapper { padding: 40px; background: #f4f7fe; min-height: 100vh; font-family: 'Inter', sans-serif; color: #1b2559; }
        .master-card { background: #fff; border-radius: 40px; padding: 45px; box-shadow: 0 25px 60px rgba(0,0,0,0.05); max-width: 1350px; margin: 0 auto; border: 1px solid #fff; }
        
        .header-flex { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 35px; }
        .tab-bar { display: flex; background: #f4f7fe; padding: 6px; border-radius: 18px; width: fit-content; gap: 8px; margin-bottom: 25px; }
        .tab-item { padding: 12px 25px; border-radius: 14px; border: none; cursor: pointer; font-weight: 800; font-size: 13px; color: #a3aed0; background: transparent; transition: 0.3s; }
        .tab-item.active { background: #fff; color: #4318ff; box-shadow: 0 8px 15px rgba(0,0,0,0.04); }

        .search-wrap { background: #f4f7fe; border-radius: 18px; padding: 12px 20px; display: flex; align-items: center; width: 350px; }
        .search-wrap input { background: transparent; border: none; outline: none; margin-left: 10px; width: 100%; font-weight: 600; color: #1b2559; }

        table { width: 100%; border-collapse: separate; border-spacing: 0 12px; }
        th { padding: 10px 20px; color: #a3aed0; font-size: 12px; text-transform: uppercase; font-weight: 800; text-align: left; }
        td { background: #fff; padding: 22px 20px; border-top: 1px solid #f1f4f9; border-bottom: 1px solid #f1f4f9; vertical-align: middle; transition: 0.2s ease; }
        tr:hover td { background: #fafbff; }
        td:first-child { border-left: 1px solid #f1f4f9; border-top-left-radius: 20px; border-bottom-left-radius: 20px; }
        td:last-child { border-right: 1px solid #f1f4f9; border-top-right-radius: 20px; border-bottom-right-radius: 20px; }

        .star-box { color: #f59e0b; display: flex; gap: 2px; margin-bottom: 6px; }
        .img-trigger { 
          margin-top: 12px; display: inline-flex; align-items: center; gap: 6px; 
          color: #4318ff; font-size: 12px; font-weight: 800; cursor: pointer;
          background: #f4f7fe; padding: 6px 12px; border-radius: 10px; transition: 0.2s;
        }
        .img-trigger:hover { background: #e0e7ff; transform: scale(1.05); }

        .btn-round { width: 40px; height: 40px; border-radius: 12px; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: 0.2s; }
        .btn-round:hover { transform: translateY(-3px); }
        
        .loading-state { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 100px 0; color: #a3aed0; }

        /* MODAL XEM ẢNH */
        .img-modal-overlay { position: fixed; inset: 0; background: rgba(11,16,45,0.85); backdrop-filter: blur(10px); display: flex; align-items: center; justify-content: center; z-index: 2000; padding: 20px; }
        .img-container { background: white; padding: 15px; border-radius: 30px; position: relative; max-width: 600px; width: 100%; box-shadow: 0 40px 100px rgba(0,0,0,0.5); animation: zoomIn 0.3s ease; }
        .close-btn { position: absolute; top: -15px; right: -15px; background: #e11d48; color: white; width: 40px; height: 40px; border-radius: 50%; border: 4px solid #fff; display: flex; align-items: center; justify-content: center; cursor: pointer; }
        
        @keyframes zoomIn { from { transform: scale(0.9); opacity: 0; } to { transform: scale(1); opacity: 1; } }
      `}</style>

      <div className="master-card">
        <div className="header-flex">
          <div>
            <h1 style={{ fontSize: 32, fontWeight: 800, letterSpacing: '-1.2px', margin: 0 }}>Quản lý Đánh giá</h1>
            <p style={{ color: '#a3aed0', fontWeight: 500, marginTop: 5 }}>Duyệt nội dung & hình ảnh từ khách hàng (Dữ liệu thời gian thực)</p>
          </div>
          <div className="search-wrap">
            <Search size={18} color="#a3aed0" />
            <input 
              placeholder="Tìm sản phẩm, người dùng..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="tab-bar">
          <button className={`tab-item ${activeTab === 'Pending' ? 'active' : ''}`} onClick={() => setActiveTab('Pending')}>Chờ kiểm duyệt</button>
          <button className={`tab-item ${activeTab === 'Approved' ? 'active' : ''}`} onClick={() => setActiveTab('Approved')}>Đã hiển thị</button>
          <button className={`tab-item ${activeTab === 'Flagged' ? 'active' : ''}`} onClick={() => setActiveTab('Flagged')}>Vi phạm</button>
        </div>

        {isLoading ? (
          <div className="loading-state">
            <Loader2 className="animate-spin mb-4" size={40} />
            <p className="font-bold">Đang tải dữ liệu đánh giá...</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            {filteredReviews.length > 0 ? (
              <table>
                <thead>
                  <tr>
                    <th style={{ width: '25%' }}>Sản phẩm</th>
                    <th style={{ width: '20%' }}>Người đánh giá</th>
                    <th style={{ width: '35%' }}>Nội dung</th>
                    <th style={{ textAlign: 'right' }}>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredReviews.map(review => (
                    <tr key={review.id}>
                      <td>
                        <div style={{ fontWeight: 800, color: '#1b2559' }}>{review.product_name}</div>
                        <div style={{ fontSize: '12px', color: '#4318ff', fontWeight: 700 }}>
                          <Store size={12} style={{display:'inline', marginBottom:2}}/> {review.vendor_name}
                        </div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={{ width: 32, height: 32, border: '1px solid #e0e5f2', borderRadius: '50%', background: '#f4f7fe', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#a3aed0' }}>
                            <User size={16} />
                          </div>
                          <div style={{ fontWeight: 700, fontSize: '14px' }}>{review.customer_name}</div>
                        </div>
                      </td>
                      <td>
                        <div className="star-box">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} size={14} fill={i < review.rating ? "#f59e0b" : "none"} stroke={i < review.rating ? "#f59e0b" : "#cbd5e0"} />
                          ))}
                        </div>
                        <div style={{ fontSize: '14px', fontWeight: 500, lineHeight: 1.4 }}>"{review.comment}"</div>
                        {review.review_img && (
                          <div className="img-trigger" onClick={() => setViewingImage(review.review_img)}>
                            <ImageIcon size={14}/> Xem ảnh đính kèm
                          </div>
                        )}
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                          {activeTab !== 'Approved' && (
                            <button className="btn-round" style={{background:'#f0fdf4', color:'#10b981'}} title="Phê duyệt" onClick={() => handleUpdateStatus(review.id, 'Approved')}>
                              <CheckCircle2 size={18} />
                            </button>
                          )}
                          {activeTab !== 'Flagged' && (
                            <button className="btn-round" style={{background:'#fff1f2', color:'#e11d48'}} title="Đánh dấu vi phạm" onClick={() => handleUpdateStatus(review.id, 'Flagged')}>
                              <ShieldAlert size={18} />
                            </button>
                          )}
                          <button className="btn-round" style={{background:'#f4f7fe'}} onClick={() => handleDelete(review.id)} title="Xóa vĩnh viễn">
                            <Trash2 size={18} color="#707eae" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div style={{ textAlign: 'center', padding: '60px 0', color: '#a3aed0' }}>
                <MessageSquare size={48} style={{ margin: '0 auto 15px', opacity: 0.3 }} />
                <p className="font-bold">Không có đánh giá nào trong mục này</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* --- MODAL XEM ẢNH PHÓNG TO --- */}
      {viewingImage && (
        <div className="img-modal-overlay" onClick={() => setViewingImage(null)}>
          <div className="img-container" onClick={e => e.stopPropagation()}>
            <div className="close-btn" onClick={() => setViewingImage(null)}>
              <XCircle size={24} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 15, color: '#1b2559', fontWeight: 800 }}>
              <Maximize2 size={20} color="#4318ff"/> CHI TIẾT HÌNH ẢNH KIỂM DUYỆT
            </div>
            <img 
              src={viewingImage} 
              style={{ width: '100%', borderRadius: '20px', display: 'block', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }} 
              alt="Review Full" 
            />
            <div style={{ marginTop: 15, fontSize: 13, color: '#a3aed0', textAlign: 'center', fontWeight: 500 }}>
              Nhấp ra ngoài hoặc bấm X để đóng
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReviewManagement;