import React, { useState, useEffect } from 'react';
import { 
  Image as ImageIcon, 
  Upload, 
  Save, 
  UserCircle, 
  LogIn, 
  UserPlus,
  Layout, 
  Info, 
  Eye,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Plus,
  Loader2
} from 'lucide-react';

// CẤU HÌNH ĐƯỜNG DẪN API (Thay đổi cho đúng với server của bạn)
const API_URL = "http://localhost/nongsan-api/banner.php"; 
const BASE_URL = "http://localhost/nongsan-api/"; // Để hiển thị ảnh từ thư mục uploads/

const App = () => {
  // States cho System Banners
  const [systemBanners, setSystemBanners] = useState({
    login: { url: '', file: null },
    register: { url: '', file: null },
    user_hero: { url: '', file: null }
  });

  // State cho Promo Banners (7 vị trí)
  const [promoBanners, setPromoBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // 1. LẤY DỮ LIỆU TỪ DATABASE KHI LOAD TRANG
  useEffect(() => {
    fetchBanners();
  }, []);

  const fetchBanners = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}?action=list`);
      const result = await response.json();

      if (result.status === "success") {
        // Map system banners
        const sysMap = { ...systemBanners };
        result.data.system.forEach(item => {
          if (sysMap[item.banner_key]) {
            sysMap[item.banner_key].url = item.image_path.startsWith('http') 
              ? item.image_path 
              : BASE_URL + item.image_path;
          }
        });
        setSystemBanners(sysMap);

        // Map promo banners (đảm bảo đủ 7 vị trí)
        const promos = [];
        for (let i = 1; i <= 7; i++) {
          const found = result.data.promo.find(p => parseInt(p.position) === i);
          promos.push({
            position: i,
            url: found ? (found.image_path.startsWith('http') ? found.image_path : BASE_URL + found.image_path) : '',
            note: found ? found.note : '',
            file: null,
            isChanged: false
          });
        }
        setPromoBanners(promos);
      }
    } catch (error) {
      console.error("Lỗi tải dữ liệu:", error);
    } finally {
      setLoading(false);
    }
  };

  // 2. XỬ LÝ CHỌN FILE
  const handleSystemFileChange = (e, key) => {
    const file = e.target.files[0];
    if (file) {
      setSystemBanners(prev => ({
        ...prev,
        [key]: { ...prev[key], file: file, url: URL.createObjectURL(file) }
      }));
    }
  };

  const handlePromoFileChange = (e, position) => {
    const file = e.target.files[0];
    if (file) {
      setPromoBanners(prev => prev.map(p => 
        p.position === position 
          ? { ...p, file: file, url: URL.createObjectURL(file), isChanged: true } 
          : p
      ));
    }
  };

  const handlePromoNoteChange = (position, value) => {
    setPromoBanners(prev => prev.map(p => 
      p.position === position ? { ...p, note: value, isChanged: true } : p
    ));
  };

  // 3. LƯU DỮ LIỆU LÊN SERVER
  const handleSaveAll = async () => {
    setIsSaving(true);
    try {
      // Lưu System Banners (Chỉ lưu những cái có file mới)
      for (const key in systemBanners) {
        if (systemBanners[key].file) {
          const formData = new FormData();
          formData.append('banner_key', key);
          formData.append('image', systemBanners[key].file);
          
          await fetch(`${API_URL}?action=update_system`, {
            method: 'POST',
            body: formData
          });
        }
      }

      // Lưu Promo Banners (Chỉ lưu những cái có thay đổi ảnh hoặc ghi chú)
      for (const promo of promoBanners) {
        if (promo.isChanged) {
          const formData = new FormData();
          formData.append('position', promo.position);
          formData.append('note', promo.note);
          if (promo.file) {
            formData.append('image', promo.file);
          }
          
          await fetch(`${API_URL}?action=update_promo`, {
            method: 'POST',
            body: formData
          });
        }
      }

      alert("🎉 Đã cập nhật tất cả thay đổi thành công!");
      fetchBanners(); // Load lại để cập nhật đường dẫn ảnh thật từ server
    } catch (error) {
      alert("❌ Có lỗi xảy ra khi lưu dữ liệu.");
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50">
        <Loader2 className="animate-spin text-blue-600 mb-4" size={48} />
        <p className="font-bold text-slate-500">Đang tải cấu hình banner...</p>
      </div>
    );
  }

  return (
    <div className="banner-mgmt-wrapper">
      <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      
      <style>{`
        .banner-mgmt-wrapper { padding: 40px; background: #f4f7fe; min-height: 100vh; font-family: 'Plus Jakarta Sans', sans-serif; color: #1b2559; }
        .container { max-width: 1300px; margin: 0 auto; }
        .section-card { background: #fff; border-radius: 35px; padding: 40px; box-shadow: 0 20px 50px rgba(0,0,0,0.03); margin-bottom: 40px; border: 1px solid #fff; }
        .section-header { display: flex; align-items: center; gap: 15px; margin-bottom: 30px; }
        .section-icon { width: 48px; height: 48px; border-radius: 16px; background: #e0e7ff; color: #4318ff; display: flex; align-items: center; justify-content: center; }
        
        .grid-two-cols { display: grid; grid-template-columns: 1fr 1fr; gap: 30px; }
        
        .upload-zone { 
          border: 2px dashed #D1D9E8; 
          border-radius: 24px; 
          padding: 30px; 
          text-align: center; 
          cursor: pointer; 
          transition: 0.3s; 
          background: #fbfcfe;
          position: relative;
        }
        .upload-zone:hover { border-color: #4318ff; background: #f4f7ff; }
        .upload-input { position: absolute; inset: 0; opacity: 0; cursor: pointer; }

        .label { display: block; font-size: 13px; font-weight: 800; color: #A3AED0; text-transform: uppercase; margin-bottom: 10px; }
        .note-input { width: 100%; padding: 15px 20px; border-radius: 18px; background: #fff; font-weight: 600; outline: none; transition: 0.3s; border: 1px solid #E0E5F2; }
        .note-input:focus { border-color: #4318ff; box-shadow: 0 10px 20px rgba(67, 24, 255, 0.05); }

        .banner-preview { width: 100%; height: 220px; border-radius: 24px; background-size: cover; background-position: center; margin-top: 20px; border: 4px solid #fff; box-shadow: 0 10px 30px rgba(0,0,0,0.1); position: relative; overflow: hidden; background-color: #eee; }
        .preview-badge { position: absolute; top: 15px; left: 15px; background: rgba(0,0,0,0.5); color: #fff; padding: 6px 15px; border-radius: 100px; font-size: 11px; font-weight: 800; backdrop-filter: blur(5px); }

        .promo-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 25px; }
        .promo-item { background: #fff; border-radius: 30px; padding: 25px; border: 1px solid #f0f2f8; box-shadow: 0 10px 20px rgba(0,0,0,0.02); }
        .promo-upload-box { width: 100%; height: 140px; border-radius: 20px; background-size: cover; background-position: center; margin-bottom: 20px; position: relative; display: flex; align-items: center; justify-content: center; background-color: #f4f7fe; border: 2px dashed #D1D9E8; overflow: hidden; cursor: pointer; }
        .promo-upload-box:hover { border-color: #4318ff; }
        .promo-upload-overlay { position: absolute; inset: 0; background: rgba(0,0,0,0.2); opacity: 0; transition: 0.3s; display: flex; align-items: center; justify-content: center; color: #fff; }
        .promo-upload-box:hover .promo-upload-overlay { opacity: 1; }

        .fixed-actions { position: fixed; bottom: 40px; right: 40px; z-index: 100; }
        .btn-save { padding: 18px 45px; border-radius: 20px; background: #4318ff; color: #fff; border: none; font-weight: 800; font-size: 16px; cursor: pointer; display: flex; align-items: center; gap: 12px; box-shadow: 0 15px 35px rgba(67, 24, 255, 0.3); transition: 0.3s; }
        .btn-save:hover { transform: translateY(-5px); box-shadow: 0 20px 45px rgba(67, 24, 255, 0.4); }
        .btn-save:disabled { background: #a3aed0; cursor: not-allowed; transform: none; box-shadow: none; }
      `}</style>

      <div className="container">
        {/* Header Trang */}
        <div style={{ marginBottom: 40 }}>
          <h1 style={{ fontSize: 36, fontWeight: 800, letterSpacing: '-1.5px', marginBottom: 10 }}>Quản lý Banner Hệ thống</h1>
          <p style={{ color: '#A3AED0', fontWeight: 600 }}>Cập nhật hình ảnh trực tiếp lên server của bạn</p>
        </div>

        {/* 1. Banner Đăng nhập & Đăng ký */}
        <div className="grid-two-cols">
            {/* Banner Đăng nhập */}
            <div className="section-card">
              <div className="section-header">
                <div className="section-icon"><LogIn size={24} /></div>
                <div>
                  <h2 style={{ fontSize: 18, fontWeight: 800 }}>Banner Đăng nhập</h2>
                  <p style={{ fontSize: 12, color: '#A3AED0', fontWeight: 600 }}>Ảnh nền trang Login, vui lòng chọn hình ảnh từ 1920x1080</p>
                </div>
              </div>
              
              <div className="upload-zone">
                <Upload size={32} color="#4318ff" style={{ marginBottom: 10 }} />
                <p style={{ fontWeight: 700, fontSize: 14 }}>Nhấp để thay đổi ảnh</p>
                <input 
                  type="file" 
                  className="upload-input" 
                  accept="image/*"
                  onChange={(e) => handleSystemFileChange(e, 'login')} 
                />
              </div>
              
              <div className="banner-preview" style={{ backgroundImage: `url(${systemBanners.login.url})` }}>
                <div className="preview-badge">XEM TRƯỚC: LOGIN</div>
              </div>
            </div>

            {/* Banner Đăng ký */}
            <div className="section-card">
              <div className="section-header">
                <div className="section-icon" style={{ background: '#f5f3ff', color: '#8b5cf6' }}><UserPlus size={24} /></div>
                <div>
                  <h2 style={{ fontSize: 18, fontWeight: 800 }}>Banner Đăng ký</h2>
                  <p style={{ fontSize: 12, color: '#A3AED0', fontWeight: 600 }}>Ảnh nền trang Register,vui lòng chọn hình ảnh từ 1920x1080.</p>
                </div>
              </div>
              
              <div className="upload-zone">
                <Upload size={32} color="#8b5cf6" style={{ marginBottom: 10 }} />
                <p style={{ fontWeight: 700, fontSize: 14 }}>Nhấp để thay đổi ảnh</p>
                <input 
                  type="file" 
                  className="upload-input" 
                  accept="image/*"
                  onChange={(e) => handleSystemFileChange(e, 'register')} 
                />
              </div>
              
              <div className="banner-preview" style={{ backgroundImage: `url(${systemBanners.register.url})` }}>
                <div className="preview-badge">XEM TRƯỚC: REGISTER</div>
              </div>
            </div>
        </div>

        {/* 2. Banner Tổng cho User */}
        <div className="section-card">
          <div className="section-header">
            <div className="section-icon" style={{ background: '#ecfdf5', color: '#10b981' }}><UserCircle size={24} /></div>
            <div>
              <h2 style={{ fontSize: 18, fontWeight: 800 }}>Banner Chính (User Dashboard)</h2>
              <p style={{ fontSize: 12, color: '#A3AED0', fontWeight: 600 }}>Banner Hero hiển thị trang chủ người dùng</p>
            </div>
          </div>
          
          <div className="upload-zone" style={{ padding: '40px' }}>
            <ImageIcon size={40} color="#10b981" style={{ marginBottom: 15 }} />
            <h3 style={{ fontWeight: 800, marginBottom: 5 }}>Tải Banner Hero mới</h3>
            <p style={{ color: '#A3AED0', fontSize: 13 }}>Kích thước chuẩn: 1920x600px</p>
            <input 
              type="file" 
              className="upload-input" 
              accept="image/*"
              onChange={(e) => handleSystemFileChange(e, 'user_hero')} 
            />
          </div>
          
          <div className="banner-preview" style={{ backgroundImage: `url(${systemBanners.user_hero.url})`, height: '300px' }}>
            <div className="preview-badge"><Layout size={12} style={{marginRight:5}}/> TRANG CHỦ USER</div>
          </div>
        </div>

        {/* 3. 7 Banner nhỏ kèm ghi chú */}
        <div className="section-card" style={{ background: '#fbfcfe' }}>
          <div className="section-header">
            <div className="section-icon" style={{ background: '#fff7ed', color: '#f97316' }}><Info size={24} /></div>
            <div>
              <h2 style={{ fontSize: 18, fontWeight: 800 }}>7 Banner Quảng bá</h2>
              <p style={{ fontSize: 12, color: '#A3AED0', fontWeight: 600 }}>Cập nhật hình ảnh và ghi chú cho các vị trí từ 1 đến 7</p>
            </div>
          </div>

          <div className="promo-grid">
            {promoBanners.map((item, index) => (
              <div key={item.position} className="promo-item">
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 15, alignItems: 'center' }}>
                  <span style={{ fontSize: 11, fontWeight: 900, color: '#4318ff', background: '#e0e7ff', padding: '4px 10px', borderRadius: '8px' }}>
                    VỊ TRÍ #0{item.position}
                    {item.isChanged && " (CHƯA LƯU)"}
                  </span>
                </div>
                
                <div className="promo-upload-box" style={{ backgroundImage: item.url ? `url(${item.url})` : 'none' }}>
                  {!item.url && <Plus size={24} color="#A3AED0" />}
                  <div className="promo-upload-overlay">
                    <Upload size={20} />
                  </div>
                  <input 
                    type="file" 
                    className="upload-input" 
                    accept="image/*"
                    onChange={(e) => handlePromoFileChange(e, item.position)} 
                  />
                </div>
                
                <div className="input-group">
                  <label className="label" style={{ fontSize: 11 }}>Ghi chú Banner</label>
                  <input 
                    className="note-input" 
                    value={item.note} 
                    onChange={(e) => handlePromoNoteChange(item.position, e.target.value)}
                    placeholder="Nhập ghi chú cho banner..."
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Floating Save Button */}
        <div className="fixed-actions">
          <button className="btn-save" onClick={handleSaveAll} disabled={isSaving}>
            {isSaving ? (
              <><Loader2 className="animate-spin" size={20} /> ĐANG LƯU...</>
            ) : (
              <><Save size={20} /> LƯU TOÀN BỘ CẤU HÌNH</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default App;