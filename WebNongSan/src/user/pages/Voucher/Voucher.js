import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { vouchersAPI } from '../../api/apiClient';
import './Voucher.css';

const Voucher = () => {
  const navigate = useNavigate();
  // State cho đồng hồ đếm ngược
  const [timeLeft, setTimeLeft] = useState({
    hours: 2,
    minutes: 59,
    seconds: 59
  });

  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Logic đếm ngược (Mỗi giây trừ 1)
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        if (prev.hours > 0) return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return prev; // Hết giờ thì đứng im
      });
    }, 1000);

    return () => clearInterval(timer); // Dọn dẹp khi thoát trang
  }, []);

  useEffect(() => {
    const fetchVouchers = async () => {
      try {
        setLoading(true);
        const data = await vouchersAPI.getAll();
        setVouchers(Array.isArray(data) ? data : []);
        setError('');
      } catch (err) {
        setError(err.message || 'Khong the tai voucher.');
      } finally {
        setLoading(false);
      }
    };

    fetchVouchers();
  }, []);

  const handleCopy = (code) => {
    navigator.clipboard.writeText(code);
    alert(`Đã sao chép mã: ${code}`);
  };

  const handleApply = (code) => {
    localStorage.setItem('selectedVoucherCode', code);
    navigate('/checkout');
  };

  return (
    <div className="voucher-container">
      {/* BANNER FLASH SALE ĐẾM GIỜ */}
      <div className="flash-sale-banner">
        <div>
          <h2 style={{ fontSize: '28px', marginBottom: '5px' }}>⚡ FLASH SALE SĂN DEAL</h2>
          <p>Sắp kết thúc đợt phát mã giảm giá khủng!</p>
        </div>
        
        <div className="timer-box">
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

      {/* DANH SÁCH MÃ GIẢM GIÁ */}
      <h3 style={{ color: '#2e7d32', marginBottom: '20px', borderLeft: '4px solid #82ae46', paddingLeft: '10px' }}>
        Kho Voucher của bạn
      </h3>
      
      <div className="voucher-list">
        {loading && <p style={{ color: '#666' }}>Dang tai voucher...</p>}
        {!loading && error && <p style={{ color: '#d32f2f' }}>{error}</p>}
        {!loading && !error && vouchers.length === 0 && <p style={{ color: '#666' }}>Hien chua co voucher kha dung.</p>}
        {!loading && !error && vouchers.map((v) => (
          <div key={v.id} className="voucher-card">
            <div className="voucher-info">
              <div className="voucher-code">{v.code}</div>
              <div style={{color: '#ff5722', fontWeight: 'bold', marginBottom: '5px'}}>{v.discount}</div>
              <div className="voucher-desc">{v.desc}</div>
              {Number(v.minOrder || 0) > 0 && (
                <div className="voucher-desc" style={{ fontSize: '13px', color: '#666' }}>
                  Don toi thieu: {Number(v.minOrder).toLocaleString('vi-VN')}d
                </div>
              )}
              {v.maxDiscount != null && (
                <div className="voucher-desc" style={{ fontSize: '13px', color: '#666' }}>
                  Giam toi da: {Number(v.maxDiscount).toLocaleString('vi-VN')}d
                </div>
              )}
              <div className="expiry">HSD: {v.date}</div>
            </div>
            <div className="voucher-actions">
              <div className="voucher-action" onClick={() => handleCopy(v.code)}>
                Lưu
              </div>
              <div className="voucher-action" onClick={() => handleApply(v.code)}>
                Dùng ngay
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Voucher;
