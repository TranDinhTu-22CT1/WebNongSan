import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { vouchersAPI, productsAPI } from '../../api/apiClient';
import { useCart } from '../../store/CartContext';
import './Voucher.css';

const Voucher = () => {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  // State cho đồng hồ đếm ngược
  const [timeLeft, setTimeLeft] = useState({
    hours: 2,
    minutes: 59,
    seconds: 59
  });

  const [vouchers, setVouchers] = useState([]);
  const [myGiftVouchers, setMyGiftVouchers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [buying, setBuying] = useState(false);
  const [createdVoucher, setCreatedVoucher] = useState(null);
  const [buyForm, setBuyForm] = useState({
    amountPaid: 500000,
    voucherMode: 'fixed',
    percentRate: 50,
    minOrderValue: 0,
    expiresInDays: 90,
    recipientNote: '',
  });

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
        const [publicVouchers, purchasedVouchers] = await Promise.all([
          vouchersAPI.getAll(),
          vouchersAPI.getMyPurchasedGiftVouchers().catch(() => []),
        ]);
        setVouchers(Array.isArray(publicVouchers) ? publicVouchers : []);
        setMyGiftVouchers(Array.isArray(purchasedVouchers) ? purchasedVouchers : []);
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

  const handleUseProductVoucher = (voucher) => {
    if (!voucher?.productId) {
      handleApply(voucher?.code || '');
      return;
    }

    localStorage.setItem('selectedVoucherCode', voucher.code);
    navigate(`/product/${voucher.productId}?voucher=${encodeURIComponent(voucher.code)}`);
  };

  const handleBuyWithVoucher = async (voucher) => {
    try {
      if (!voucher?.productId) {
        handleApply(voucher?.code || '');
        return;
      }

      const product = await productsAPI.getById(voucher.productId);
      if (!product) {
        alert('Khong tim thay san pham ap dung voucher nay.');
        return;
      }

      const added = addToCart(product, 1);
      if (!added) {
        return;
      }

      localStorage.setItem('selectedVoucherCode', voucher.code);
      navigate('/checkout');
    } catch (err) {
      alert(err?.message || 'Khong the mua voi voucher luc nay.');
    }
  };

  const handleBuyFormChange = (key, value) => {
    setBuyForm((prev) => ({ ...prev, [key]: value }));
  };

  const refreshPurchasedVouchers = async () => {
    try {
      const purchasedVouchers = await vouchersAPI.getMyPurchasedGiftVouchers();
      setMyGiftVouchers(Array.isArray(purchasedVouchers) ? purchasedVouchers : []);
    } catch {
      // ignore refresh errors to avoid blocking UX after purchase
    }
  };

  const handleBuyGiftVoucher = async () => {
    try {
      setBuying(true);
      setError('');

      const amountPaid = Number(buyForm.amountPaid || 0);
      if (amountPaid < 10000) {
        setError('So tien mua voucher toi thieu la 10,000d.');
        return;
      }

      const created = await vouchersAPI.purchaseGiftVoucher({
        amountPaid,
        voucherMode: buyForm.voucherMode,
        percentRate: Number(buyForm.percentRate || 0),
        minOrderValue: Number(buyForm.minOrderValue || 0),
        expiresInDays: Number(buyForm.expiresInDays || 90),
        recipientNote: buyForm.recipientNote,
      });

      setCreatedVoucher(created);
      await refreshPurchasedVouchers();
      if (created?.code) {
        alert(`Tao voucher thanh cong: ${created.code}`);
      }
    } catch (err) {
      setError(err.message || 'Khong the mua voucher luc nay.');
    } finally {
      setBuying(false);
    }
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

      <h3 style={{ color: '#2e7d32', marginBottom: '20px', borderLeft: '4px solid #82ae46', paddingLeft: '10px' }}>
        Mua Gift Voucher de tang nguoi khac
      </h3>

      <div className="gift-voucher-builder">
        <div className="gift-row">
          <label>So tien ban tra (VND)</label>
          <input
            type="number"
            min="10000"
            step="1000"
            value={buyForm.amountPaid}
            onChange={(e) => handleBuyFormChange('amountPaid', e.target.value)}
            disabled={buying}
          />
        </div>

        <div className="gift-row">
          <label>Kieu voucher</label>
          <select
            value={buyForm.voucherMode}
            onChange={(e) => handleBuyFormChange('voucherMode', e.target.value)}
            disabled={buying}
          >
            <option value="fixed">Giam tien co dinh (bang so tien mua)</option>
            <option value="percent">Giam theo phan tram (co tran theo so tien mua)</option>
          </select>
        </div>

        {buyForm.voucherMode === 'percent' && (
          <div className="gift-row">
            <label>Phan tram giam (%)</label>
            <input
              type="number"
              min="5"
              max="90"
              value={buyForm.percentRate}
              onChange={(e) => handleBuyFormChange('percentRate', e.target.value)}
              disabled={buying}
            />
          </div>
        )}

        <div className="gift-row">
          <label>Don toi thieu (de trong = tu tinh theo quy tac)</label>
          <input
            type="number"
            min="0"
            step="1000"
            value={buyForm.minOrderValue}
            onChange={(e) => handleBuyFormChange('minOrderValue', e.target.value)}
            disabled={buying}
          />
        </div>

        <div className="gift-row">
          <label>Han su dung (ngay)</label>
          <input
            type="number"
            min="7"
            max="365"
            value={buyForm.expiresInDays}
            onChange={(e) => handleBuyFormChange('expiresInDays', e.target.value)}
            disabled={buying}
          />
        </div>

        <div className="gift-row">
          <label>Loi nhan nguoi nhan (tuy chon)</label>
          <input
            type="text"
            value={buyForm.recipientNote}
            onChange={(e) => handleBuyFormChange('recipientNote', e.target.value)}
            disabled={buying}
            placeholder="Chuc mung sinh nhat, dung ma nay nhe"
          />
        </div>

        <button type="button" className="gift-buy-btn" onClick={handleBuyGiftVoucher} disabled={buying}>
          {buying ? 'Dang tao voucher...' : 'Mua gift voucher'}
        </button>

        {createdVoucher?.code && (
          <div className="gift-created-box">
            <b>Ma moi vua tao:</b> {createdVoucher.code}
            <button type="button" className="gift-copy-btn" onClick={() => handleCopy(createdVoucher.code)}>
              Sao chep ma
            </button>
          </div>
        )}
      </div>

      <h3 style={{ color: '#2e7d32', margin: '24px 0 20px', borderLeft: '4px solid #82ae46', paddingLeft: '10px' }}>
        Gift Voucher ban da mua
      </h3>

      <div className="voucher-list" style={{ marginBottom: '36px' }}>
        {!loading && myGiftVouchers.length === 0 && <p style={{ color: '#666' }}>Ban chua mua gift voucher nao.</p>}
        {!loading && myGiftVouchers.map((v) => (
          <div key={`gift-${v.id}`} className="voucher-card">
            <div className="voucher-info">
              <div className="voucher-code">{v.code}</div>
              <div style={{ color: '#ff5722', fontWeight: 'bold', marginBottom: '5px' }}>{v.discountText}</div>
              <div className="voucher-desc">Trang thai: {v.status}</div>
              <div className="voucher-desc">So tien da tra: {Number(v.amountPaid || 0).toLocaleString('vi-VN')}d</div>
              <div className="voucher-desc">Don toi thieu: {Number(v.minOrder || 0).toLocaleString('vi-VN')}d</div>
              {v.recipientNote && <div className="voucher-desc">Loi nhan: {v.recipientNote}</div>}
              <div className="expiry">HSD: {v.expiresAt ? new Date(v.expiresAt).toLocaleDateString('vi-VN') : 'Khong gioi han'}</div>
            </div>
            <div className="voucher-actions">
              <div className="voucher-action" onClick={() => handleCopy(v.code)}>
                Sao chep
              </div>
              <div className="voucher-action" onClick={() => handleApply(v.code)}>
                Thu dung
              </div>
            </div>
          </div>
        ))}
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
              {v.scope === 'product' && v.productName && (
                <div className="voucher-desc" style={{ fontSize: '13px', color: '#2e7d32', fontWeight: 600 }}>
                  Ap dung cho: {v.productName}
                </div>
              )}
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
              {v.scope === 'product' && v.productId > 0 ? (
                <>
                  <div className="voucher-action" onClick={() => handleUseProductVoucher(v)}>
                    Dùng ngay
                  </div>
                  <div className="voucher-action" onClick={() => handleBuyWithVoucher(v)}>
                    Mua voi ma
                  </div>
                </>
              ) : (
                <div className="voucher-action" onClick={() => handleApply(v.code)}>
                  Dùng ngay
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Voucher;
