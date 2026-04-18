import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../store/CartContext';
import { authAPI, ordersAPI, vouchersAPI } from '../../api/apiClient';
import { getAuthToken } from '../../utils/authStorage';
import './Checkout.css';

const Checkout = () => {
  const navigate = useNavigate();
  const cartData = useCart();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [voucherCode, setVoucherCode] = useState('');
  const [appliedVoucher, setAppliedVoucher] = useState(null);
  const [voucherMessage, setVoucherMessage] = useState('');
  const [voucherError, setVoucherError] = useState('');
  const [applyingVoucher, setApplyingVoucher] = useState(false);
  
  // Check if user is logged in
  useEffect(() => {
    const token = getAuthToken();
    if (!token) {
      setIsLoggedIn(false);
    } else {
      setIsLoggedIn(true);
    }
  }, []);

  // Tự động quét tìm đúng biến chứa dữ liệu giỏ hàng
  const currentCart = cartData.cart || cartData.cartItems || cartData.items || [];
  const safeCart = Array.isArray(currentCart) ? currentCart : [];
  const clearCart = cartData.clearCart || cartData.emptyCart || (() => {});

  // State lưu thông tin khách hàng
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    address: '',
    note: ''
  });

  // Prefill customer info from profile if logged in
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const profile = await authAPI.getProfile();
        setFormData(prev => ({
          ...prev,
          fullName: profile.name || prev.fullName,
          phone: profile.phone || prev.phone,
          address: profile.address || prev.address
        }));
      } catch (e) {
        // ignore errors (not logged in, etc.)
      }
    };
    loadProfile();
  }, []);

  // State lưu phương thức thanh toán
  const [paymentMethod, setPaymentMethod] = useState('COD');

  // Tính tổng tiền
  const totalPrice = safeCart.reduce((total, item) => total + (item.price * (item.amount || item.quantity || 1)), 0);
  const shippingFee = (totalPrice > 300000 || totalPrice === 0) ? 0 : 30000;
  const discountAmount = Number(appliedVoucher?.discount_amount || 0);
  const subtotalAfterDiscount = Math.max(totalPrice - discountAmount, 0);
  const finalPrice = subtotalAfterDiscount + shippingFee;

  const resetVoucherState = () => {
    setAppliedVoucher(null);
    setVoucherMessage('');
    setVoucherError('');
  };

  useEffect(() => {
    const storedCode = localStorage.getItem('selectedVoucherCode') || '';
    if (storedCode) {
      setVoucherCode(storedCode);
      localStorage.removeItem('selectedVoucherCode');
    }
  }, []);

  useEffect(() => {
    resetVoucherState();
  }, [totalPrice]);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleApplyVoucher = async () => {
    setVoucherError('');
    setVoucherMessage('');

    const code = voucherCode.trim().toUpperCase();
    if (!code) {
      setVoucherError('Vui long nhap ma voucher.');
      return;
    }

    if (totalPrice <= 0) {
      setVoucherError('Gio hang trong, khong the ap dung voucher.');
      return;
    }

    try {
      setApplyingVoucher(true);
      const result = await vouchersAPI.validateCode(code, totalPrice, safeCart);
      if (!result) {
        setVoucherError('Khong the ap dung voucher luc nay.');
        return;
      }

      setAppliedVoucher(result);
      setVoucherCode(result.code || code);
      setVoucherMessage(`Da ap dung ${result.code}: giam ${Number(result.discount_amount || 0).toLocaleString('vi-VN')}d`);
      setVoucherError('');
    } catch (err) {
      setAppliedVoucher(null);
      setVoucherError(err.message || 'Ap dung voucher that bai.');
    } finally {
      setApplyingVoucher(false);
    }
  };

  const handleRemoveVoucher = () => {
    setAppliedVoucher(null);
    setVoucherMessage('Da bo voucher.');
    setVoucherError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Check if user is logged in
    if (!isLoggedIn) {
      alert("Vui lòng đăng nhập trước khi thanh toán!");
      navigate('/login');
      return;
    }
    
    if (safeCart.length === 0) {
      alert("Giỏ hàng của bạn đang trống!");
      return;
    }

    // ensure all products belong to a single vendor (backend requires this)
    const vendorIds = safeCart.map(i => i.vendor_id).filter(Boolean);
    if (new Set(vendorIds).size > 1) {
      alert('Các sản phẩm trong giỏ hàng phải cùng một nhà cung cấp. Vui lòng tách đơn hàng.');
      return;
    }

    if (!formData.fullName || !formData.phone || !formData.address) {
      alert("Vui lòng điền đầy đủ thông tin bắt buộc (*)");
      return;
    }

    try {
      setIsSubmitting(true);

      // Create order via backend API
      const response = await ordersAPI.create(
        safeCart,                    // items
        subtotalAfterDiscount,       // totalPrice (sau voucher, truoc phi ship)
        formData.address,            // shippingAddress
        paymentMethod === 'COD' ? 'Tiền mặt' : 'Chuyển khoản', // paymentMethod
        formData.phone,             // customerPhone
        formData.fullName,          // customerName
        appliedVoucher
      );

      alert(`🎉 Đặt hàng thành công! Mã đơn hàng: ${response.orderCode}`);
      
      // Clear cart and redirect
      clearCart();
      navigate('/orders');
    } catch (err) {
      console.error('Error creating order:', err);
      alert(`❌ Lỗi: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- CẤU HÌNH THÔNG TIN TÀI KHOẢN NGÂN HÀNG CỦA BẠN ---
  const bankInfo = {
    bankId: 'MB',                 // Tên viết tắt ngân hàng (MB, VCB, TCB, ACB...)
    accountNo: '0905559129',      // Số tài khoản của bạn
    accountName: 'TRAN THE KIET',  // Tên chủ tài khoản (Không dấu)
  };

  // Tạo URL mã QR động từ VietQR (Tự động điền số tiền)
  const qrCodeUrl = `https://img.vietqr.io/image/${bankInfo.bankId}-${bankInfo.accountNo}-compact2.png?amount=${finalPrice}&addInfo=Thanh toan don hang AgriMarket&accountName=${bankInfo.accountName}`;

  return (
    <div className="checkout-container">
      <div className="checkout-header">
        <h1>Thanh Toán Đơn Hàng</h1>
        <p>Vui lòng kiểm tra thông tin trước khi đặt hàng.</p>
      </div>

      <form className="checkout-content" onSubmit={handleSubmit}>
        
        {/* --- CỘT TRÁI: THÔNG TIN GIAO HÀNG --- */}
        <div className="checkout-form-section">
          <h3>Thông tin giao hàng</h3>
          <div className="form-group">
            <label>Họ và tên *</label>
            <input type="text" name="fullName" value={formData.fullName} onChange={handleInputChange} placeholder="Nhập họ tên của bạn" required />
          </div>
          <div className="form-group">
            <label>Số điện thoại *</label>
            <input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} placeholder="Nhập số điện thoại" required />
          </div>
          <div className="form-group">
            <label>Địa chỉ nhận hàng *</label>
            <textarea name="address" value={formData.address} onChange={handleInputChange} placeholder="Nhập địa chỉ chi tiết (Số nhà, đường, phường/xã...)" required rows="3"></textarea>
          </div>
          <div className="form-group">
            <label>Ghi chú đơn hàng (Tùy chọn)</label>
            <textarea name="note" value={formData.note} onChange={handleInputChange} placeholder="Ví dụ: Giao ngoài giờ hành chính..." rows="2"></textarea>
          </div>
        </div>

        {/* --- CỘT PHẢI: ĐƠN HÀNG & THANH TOÁN --- */}
        <div className="checkout-summary-section">
          <h3>Đơn hàng của bạn</h3>
          
          <div className="summary-items">
            {/* Sử dụng safeCart thay vì cart */}
            {safeCart.map((item, index) => (
              <div key={index} className="summary-item">
                <span className="item-name">{item.name} <b>x{item.amount || item.quantity || 1}</b></span>
                <span className="item-price">{(item.price * (item.amount || item.quantity || 1)).toLocaleString()}đ</span>
              </div>
            ))}
          </div>

          <div className="summary-totals">
            <div className="total-line">
              <span>Tạm tính:</span>
              <span>{totalPrice.toLocaleString()}đ</span>
            </div>
            {discountAmount > 0 && (
              <div className="total-line discount">
                <span>Voucher ({appliedVoucher?.code}):</span>
                <span>-{discountAmount.toLocaleString('vi-VN')}đ</span>
              </div>
            )}
            <div className="total-line">
              <span>Phí vận chuyển:</span>
              <span>{shippingFee === 0 ? 'Miễn phí' : `${shippingFee.toLocaleString()}đ`}</span>
            </div>
            <div className="total-line final">
              <span>Tổng cộng:</span>
              <span className="final-price">{finalPrice.toLocaleString()}đ</span>
            </div>
          </div>

          <div className="voucher-box">
            <label htmlFor="voucherCode">Ma voucher</label>
            <div className="voucher-row">
              <input
                id="voucherCode"
                type="text"
                value={voucherCode}
                onChange={(e) => setVoucherCode(e.target.value.toUpperCase())}
                placeholder="Nhap ma giam gia"
                disabled={isSubmitting || applyingVoucher}
              />
              <button
                type="button"
                onClick={handleApplyVoucher}
                disabled={isSubmitting || applyingVoucher}
              >
                {applyingVoucher ? 'Dang ap dung...' : 'Ap dung'}
              </button>
            </div>
            {appliedVoucher && (
              <button
                type="button"
                className="voucher-remove-btn"
                onClick={handleRemoveVoucher}
                disabled={isSubmitting}
              >
                Bo voucher
              </button>
            )}
            {voucherMessage && <p className="voucher-message">{voucherMessage}</p>}
            {voucherError && <p className="voucher-error">{voucherError}</p>}
          </div>

          {/* --- CHỌN PHƯƠNG THỨC THANH TOÁN --- */}
          <h3 style={{ marginTop: '30px' }}>Phương thức thanh toán</h3>
          <div className="payment-methods">
            <label className={`payment-option ${paymentMethod === 'COD' ? 'active' : ''}`}>
              <input type="radio" name="payment" value="COD" checked={paymentMethod === 'COD'} onChange={(e) => setPaymentMethod(e.target.value)} />
              <span>💵 Thanh toán khi nhận hàng (COD)</span>
            </label>
            
            <label className={`payment-option ${paymentMethod === 'BANKING' ? 'active' : ''}`}>
              <input type="radio" name="payment" value="BANKING" checked={paymentMethod === 'BANKING'} onChange={(e) => setPaymentMethod(e.target.value)} />
              <span>💳 Chuyển khoản ngân hàng (Quét mã QR)</span>
            </label>
          </div>

          {/* HIỂN THỊ MÃ QR NẾU CHỌN CHUYỂN KHOẢN */}
          {paymentMethod === 'BANKING' && (
            <div className="qr-code-box">
              <p className="qr-guide">Mở App Ngân hàng để quét mã</p>
              <img src={qrCodeUrl} alt="QR Code Thanh Toán" className="qr-image" />
              <p className="qr-note">Số tiền: <b>{finalPrice.toLocaleString()}đ</b></p>
              <p className="qr-note">Nội dung CK: <b>Thanh toan don hang AgriMarket</b></p>
            </div>
          )}

          <button type="submit" className="place-order-btn" disabled={isSubmitting}>
            {isSubmitting ? 'Đang xử lý...' : 'XÁC NHẬN ĐẶT HÀNG'}
          </button>
        </div>

      </form>
    </div>
  );
};

export default Checkout;
