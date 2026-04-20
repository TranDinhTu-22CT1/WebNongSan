import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiCopy, FiCheckCircle, FiClock, FiShoppingBag, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { API_BASE } from 'src/config';
import './Voucher.css';

const Voucher = () => {
  const navigate = useNavigate();
  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copiedId, setCopiedId] = useState(null);

  // Phân trang
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  // State đếm ngược thực tế
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  // 1. TẢI DỮ LIỆU TỪ BẢNG SALE (Chỉ lấy Toàn Sàn)
  useEffect(() => {
    const fetchGlobalSales = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API_BASE}/sale.php?action=list`);
        const data = await res.json();
        
        if (data.status === 'success') {
          // LỌC: Chỉ lấy ưu đãi Toàn Sàn (applyScope === 'all') và Đang chạy (Active)
          const globalSales = data.data.filter(
            (item) => item.status === 'Active' && (item.applyScope === 'all' || item.apply_scope === 'all')
          );
          setVouchers(globalSales);
        } else {
          setError(data.message || 'Không thể tải dữ liệu khuyến mãi.');
        }
      } catch (err) {
        setError('Lỗi kết nối đến máy chủ.');
      } finally {
        setLoading(false);
      }
    };

    fetchGlobalSales();
  }, []);

  // 2. ĐỒNG HỒ ĐẾM NGƯỢC THỰC TẾ
  useEffect(() => {
    if (vouchers.length === 0) return;

    // Tìm voucher kết thúc sớm nhất
    const upcomingVouchers = vouchers.filter(v => v.end && new Date(v.end) > new Date());
    let targetDate = new Date();
    
    if (upcomingVouchers.length > 0) {
      upcomingVouchers.sort((a, b) => new Date(a.end) - new Date(b.end));
      targetDate = new Date(upcomingVouchers[0].end);
      targetDate.setHours(23, 59, 59); // Hết hạn vào cuối ngày
    } else {
      // Mặc định Chủ nhật tuần này
      const day = targetDate.getDay();
      targetDate.setDate(targetDate.getDate() + (7 - day));
      targetDate.setHours(23, 59, 59);
    }

    const timer = setInterval(() => {
      const now = new Date().getTime();
      const distance = targetDate.getTime() - now;

      if (distance < 0) {
        clearInterval(timer);
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      setTimeLeft({
        days: Math.floor(distance / (1000 * 60 * 60 * 24)),
        hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((distance % (1000 * 60)) / 1000)
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [vouchers]);

  // 3. HÀNH ĐỘNG
  const handleCopy = (code, id) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 3000); // Reset nút copy sau 3 giây
  };

  const handleApply = (code) => {
    localStorage.setItem('selectedVoucherCode', code);
    alert(`Đã lưu mã ${code} vào bộ nhớ. Hệ thống sẽ áp dụng khi bạn thanh toán!`);
    navigate('/shop');
  };

  // 4. LOGIC PHÂN TRANG
  const totalPages = Math.max(1, Math.ceil(vouchers.length / itemsPerPage));
  const currentVouchers = vouchers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="voucher-page-wrapper">
      <style>{`
        .voucher-page-wrapper { background-color: #f4f7fe; min-height: 100vh; padding: 40px 20px; font-family: 'Inter', sans-serif; }
        .voucher-container { max-width: 1200px; margin: 0 auto; }
        
        /* BANNER */
        .flash-sale-banner { 
          background: linear-gradient(135deg, #1b2559 0%, #4318ff 100%); 
          border-radius: 24px; padding: 40px; color: white; display: flex; 
          justify-content: space-between; align-items: center; margin-bottom: 40px;
          box-shadow: 0 15px 30px rgba(67, 24, 255, 0.2); flex-wrap: wrap; gap: 20px;
        }
        .flash-sale-banner h2 { margin: 0 0 10px 0; font-size: 32px; font-weight: 800; display: flex; align-items: center; gap: 10px; }
        .flash-sale-banner p { margin: 0; font-size: 16px; color: #e0e7ff; }
        
        /* ĐỒNG HỒ */
        .timer-box { display: flex; gap: 15px; }
        .time-unit { background: rgba(255, 255, 255, 0.15); backdrop-filter: blur(10px); border-radius: 16px; padding: 15px; width: 75px; text-align: center; border: 1px solid rgba(255, 255, 255, 0.2); }
        .time-unit span { display: block; font-size: 28px; font-weight: 800; color: #fff; line-height: 1; margin-bottom: 5px; }
        .time-unit small { font-size: 12px; font-weight: 600; color: #e0e7ff; text-transform: uppercase; }

        .section-heading { color: #1b2559; font-size: 24px; font-weight: 800; margin-bottom: 25px; display: flex; align-items: center; gap: 10px; }
        
        /* LƯỚI VOUCHER */
        .voucher-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(380px, 1fr)); gap: 25px; }
        
        /* THIẾT KẾ RĂNG CƯA CHUYÊN NGHIỆP */
        .v-card { display: flex; background: #fff; border-radius: 16px; box-shadow: 0 10px 25px rgba(0,0,0,0.03); overflow: hidden; position: relative; transition: 0.3s; filter: drop-shadow(0px 4px 6px rgba(0,0,0,0.05)); border: 1px solid #f1f4f9; }
        .v-card:hover { transform: translateY(-5px); box-shadow: 0 20px 40px rgba(0,0,0,0.08); }
        
        /* Khối màu trái */
        .v-left { background: linear-gradient(135deg, #10b981 0%, #059669 100%); width: 130px; display: flex; flex-direction: column; align-items: center; justify-content: center; color: white; padding: 20px; text-align: center; position: relative; flex-shrink: 0; }
        .v-left.type-voucher { background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); }
        .v-left h4 { margin: 0; font-size: 22px; font-weight: 900; line-height: 1.1; }
        .v-left span { font-size: 12px; font-weight: 700; opacity: 0.9; margin-top: 5px; text-transform: uppercase; }
        
        /* Răng cưa chia cắt */
        .v-divider { width: 15px; background: transparent; position: relative; }
        .v-divider::before { content: ""; position: absolute; top: 0; bottom: 0; left: -7px; width: 14px; background-image: radial-gradient(#fff 4px, transparent 4px); background-size: 14px 14px; background-position: -7px -7px; }
        .v-divider::after { content: ""; position: absolute; top: 10px; bottom: 10px; left: 7px; width: 1px; border-left: 2px dashed #e2e8f0; }

        /* Khối thông tin phải */
        .v-right { padding: 20px; flex: 1; display: flex; flex-direction: column; justify-content: space-between; }
        .v-badge { background: #fef2f2; color: #e11d48; font-size: 11px; font-weight: 800; padding: 4px 8px; border-radius: 6px; width: fit-content; margin-bottom: 8px; }
        .v-title { margin: 0 0 10px 0; font-size: 16px; font-weight: 800; color: #1b2559; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
        .v-meta { font-size: 12px; color: #64748b; font-weight: 600; display: flex; flex-direction: column; gap: 5px; }
        .v-meta-item { display: flex; justify-content: space-between; }
        .v-code { background: #f1f5f9; padding: 4px 8px; border-radius: 6px; font-family: monospace; font-weight: 800; color: #475569; letter-spacing: 1px; }
        
        /* Khối nút bấm */
        .v-actions { display: flex; gap: 10px; margin-top: 15px; }
        .v-btn { flex: 1; border: none; padding: 10px; border-radius: 10px; font-weight: 700; font-size: 13px; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 5px; transition: 0.2s; }
        .v-btn.copy { background: #f8fafc; border: 1px solid #e2e8f0; color: #1e293b; }
        .v-btn.copy:hover { background: #f1f5f9; }
        .v-btn.copy.success { background: #d1fae5; color: #059669; border-color: #10b981; }
        .v-btn.use { background: #4318ff; color: white; }
        .v-btn.use:hover { background: #3311db; transform: translateY(-2px); }

        /* PHÂN TRANG */
        .pagination { display: flex; justify-content: center; align-items: center; gap: 8px; margin-top: 40px; }
        .page-btn { min-width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; border-radius: 12px; border: 1px solid #e0e5f2; background: #fff; color: #707eae; font-weight: 700; cursor: pointer; transition: 0.2s; }
        .page-btn:hover:not(:disabled) { background: #f4f7fe; color: #4318ff; }
        .page-btn.active { background: #4318ff; color: #fff; border-color: #4318ff; }
        .page-btn:disabled { opacity: 0.4; cursor: not-allowed; }

        @media (max-width: 768px) {
          .flash-sale-banner { flex-direction: column; align-items: flex-start; text-align: left; }
          .voucher-grid { grid-template-columns: 1fr; }
        }
      `}</style>

      <div className="voucher-container">
        {/* BANNER FLASH SALE */}
        <div className="flash-sale-banner">
          <div>
            <h2>⚡ SĂN DEAL TOÀN SÀN</h2>
            <p>Mã giảm giá áp dụng cho mọi đơn hàng. Số lượng có hạn!</p>
          </div>
          <div className="timer-box">
            {timeLeft.days > 0 && (
              <div className="time-unit">
                <span>{timeLeft.days.toString().padStart(2, '0')}</span>
                <small>Ngày</small>
              </div>
            )}
            <div className="time-unit">
              <span>{timeLeft.hours.toString().padStart(2, '0')}</span>
              <small>Giờ</small>
            </div>
            <div className="time-unit">
              <span>{timeLeft.minutes.toString().padStart(2, '0')}</span>
              <small>Phút</small>
            </div>
            <div className="time-unit">
              <span>{timeLeft.seconds.toString().padStart(2, '0')}</span>
              <small>Giây</small>
            </div>
          </div>
        </div>

        <h3 className="section-heading"><FiShoppingBag color="#4318ff" /> Voucher Dành Cho Bạn</h3>
        
        {loading ? (
          <div style={{ textAlign: 'center', padding: '50px', color: '#a3aed0', fontWeight: 'bold' }}>
            Đang tải kho Voucher...
          </div>
        ) : error ? (
          <div style={{ background: '#fef2f2', color: '#e11d48', padding: '20px', borderRadius: '16px', fontWeight: 'bold' }}>
            {error}
          </div>
        ) : vouchers.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '50px', background: '#fff', borderRadius: '24px', color: '#a3aed0', fontWeight: 'bold' }}>
            Hiện tại không có chương trình khuyến mãi toàn sàn nào đang diễn ra.
          </div>
        ) : (
          <>
            <div className="voucher-grid">
              {currentVouchers.map((v) => {
                // Phân tích dữ liệu hiển thị
                const isVoucher = v.type === 'Voucher';
                const discountVal = Number(v.discount || 0);
                const discountText = isVoucher 
                  ? `-${discountVal >= 1000 ? discountVal / 1000 + 'K' : discountVal + 'Đ'}` 
                  : `-${discountVal}%`;
                
                const codeName = `SALE${v.id}`; // Sinh mã cứng để khách copy nhập lúc thanh toán
                
                return (
                  <div key={v.id} className="v-card">
                    {/* TRÁI */}
                    <div className={`v-left ${isVoucher ? 'type-voucher' : ''}`}>
                      <h4>{discountText}</h4>
                      <span>Toàn sàn</span>
                    </div>

                    {/* RĂNG CƯA */}
                    <div className="v-divider"></div>

                    {/* PHẢI */}
                    <div className="v-right">
                      <div>
                        <div className="v-badge">MÃ: <span className="v-code">{codeName}</span></div>
                        <h3 className="v-title">{v.name}</h3>
                        
                        <div className="v-meta">
                          <div className="v-meta-item">
                            <span>HSD:</span>
                            <span style={{color: '#e11d48'}}>{v.end || 'Không giới hạn'}</span>
                          </div>
                          {v.usage && (
                            <div className="v-meta-item">
                              <span>Đã dùng:</span>
                              <span>{v.usage}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="v-actions">
                        <button 
                          className={`v-btn copy ${copiedId === v.id ? 'success' : ''}`}
                          onClick={() => handleCopy(codeName, v.id)}
                        >
                          {copiedId === v.id ? <><FiCheckCircle /> Đã chép</> : <><FiCopy /> Sao chép</>}
                        </button>
                        <button className="v-btn use" onClick={() => handleApply(codeName)}>
                          Dùng ngay
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* THANH PHÂN TRANG */}
            {totalPages > 1 && (
              <div className="pagination">
                <button 
                  className="page-btn" 
                  disabled={currentPage === 1} 
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                >
                  <FiChevronLeft size={18} />
                </button>
                
                {[...Array(totalPages)].map((_, i) => (
                  <button 
                    key={i + 1} 
                    className={`page-btn ${currentPage === i + 1 ? 'active' : ''}`}
                    onClick={() => setCurrentPage(i + 1)}
                  >
                    {i + 1}
                  </button>
                ))}

                <button 
                  className="page-btn" 
                  disabled={currentPage === totalPages} 
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                >
                  <FiChevronRight size={18} />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Voucher;