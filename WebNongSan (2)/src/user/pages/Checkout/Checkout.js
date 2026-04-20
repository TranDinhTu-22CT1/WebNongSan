import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../../store/CartContext';
import { authAPI, ordersAPI, vouchersAPI, productsAPI } from '../../api/apiClient';
import { getAuthToken, getStoredUser } from '../../utils/authStorage';
import { FiGift } from 'react-icons/fi';
import { API_BASE } from 'src/config';
import './Checkout.css';

const Checkout = () => {
  const navigate = useNavigate();
  const cartData = useCart();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Voucher states
  const [voucherCode, setVoucherCode] = useState('');
  const [appliedVoucher, setAppliedVoucher] = useState(null);
  const [voucherMessage, setVoucherMessage] = useState('');
  const [voucherError, setVoucherError] = useState('');
  const [applyingVoucher, setApplyingVoucher] = useState(false);
  
  // Quà tặng states
  const [activeGiftSales, setActiveGiftSales] = useState([]);
  const [allProducts, setAllProducts] = useState([]);

  const currentCart = cartData.cart || cartData.cartItems || cartData.items || [];
  const safeCart = Array.isArray(currentCart) ? currentCart : [];
  const clearCart = cartData.clearCart || cartData.emptyCart || (() => {});

  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    address: '',
    note: ''
  });

  const [paymentMethod, setPaymentMethod] = useState('COD');

  // --- 1. KHỞI TẠO DỮ LIỆU USER & PREFILL FORM ---
  useEffect(() => {
    const token = getAuthToken();
    const localUser = getStoredUser();

    if (!token || !localUser) {
      setIsLoggedIn(false);
      alert("Vui lòng đăng nhập để tiến hành thanh toán!");
      navigate('/login?redirect=/checkout');
      return;
    } 
    
    setIsLoggedIn(true);
    setCurrentUser(localUser); 

    const loadProfile = async () => {
      try {
        const profile = await authAPI.getProfile();
        if (profile) {
          setFormData(prev => ({
            ...prev,
            fullName: profile.name || localUser.name || '',
            phone: profile.phone || localUser.phone || '',
            address: profile.address || localUser.address || ''
          }));
          setCurrentUser(prev => ({...prev, email: profile.email || prev.email || ''}));
        }
      } catch (e) {
        console.log('Không tải được profile mới nhất, sử dụng dữ liệu LocalStorage.');
        setFormData(prev => ({
          ...prev,
          fullName: localUser.name || '',
          phone: localUser.phone || '',
          address: localUser.address || ''
        }));
      }
    };
    loadProfile();
  }, [navigate]);

  // --- 2. LẤY DỮ LIỆU QUÀ TẶNG TỪ API SALE ---
  useEffect(() => {
    const loadSalesAndProducts = async () => {
      try {
        const [salesRes, productsData] = await Promise.all([
          fetch(`${API_BASE}/sale.php?action=list`).then(r => r.json()),
          productsAPI.getAll()
        ]);
        
        if (salesRes.status === 'success') {
          const gifts = salesRes.data.filter(s => s.status === 'Active' && (s.applyScope === 'gift' || s.apply_scope === 'gift'));
          setActiveGiftSales(gifts);
        }
        setAllProducts(Array.isArray(productsData) ? productsData : []);
      } catch (e) {
        console.error('Lỗi khi tải thông tin quà tặng', e);
      }
    };
    loadSalesAndProducts();
  }, []);

  const getGiftsForItem = (productId, quantity) => {
    let gifts = [];
    activeGiftSales.forEach(sale => {
      const targets = String(sale.targetItems || sale.target_items || "").split(',').map(id => id.trim());
      if (targets.includes(String(productId))) {
        const giftIds = String(sale.giftItems || sale.gift_items || "").split(',').map(id => id.trim());
        giftIds.forEach(gid => {
          const p = allProducts.find(prod => String(prod.id) === String(gid));
          if (p) {
            gifts.push({ ...p, giftQuantity: quantity });
          }
        });
      }
    });
    return gifts;
  };

  // --- 3. TÍNH TOÁN TIỀN BẠC ---
  const totalPrice = safeCart.reduce((total, item) => total + (item.price * (item.amount || item.quantity || 1)), 0);
  
  const eligibleTotalForVoucher = safeCart
    .filter(item => !item.hasDiscount)
    .reduce((total, item) => total + (item.price * (item.amount || item.quantity || 1)), 0);

  const shippingFee = (totalPrice > 300000 || totalPrice === 0) ? 0 : 30000;
  const discountAmount = Number(appliedVoucher?.discountAmount || appliedVoucher?.discount_amount || 0);
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
      setVoucherError('Vui lòng nhập mã voucher.');
      return;
    }

    if (totalPrice <= 0) {
      setVoucherError('Giỏ hàng trống, không thể áp dụng voucher.');
      return;
    }

    if (eligibleTotalForVoucher <= 0) {
      setVoucherError('Giỏ hàng của bạn đều là sản phẩm đã được giảm giá sốc. Không thể áp dụng thêm mã toàn sàn.');
      return;
    }

    try {
      setApplyingVoucher(true);

      const salesRes = await fetch(`${API_BASE}/sale.php?action=list`).then(r => r.json());
      if (salesRes.status === 'success') {
        const matchId = code.replace('SALE', '');
        const targetSale = salesRes.data.find(s => 
          String(s.id) === matchId && 
          s.status === 'Active' && 
          (s.applyScope === 'all' || s.apply_scope === 'all')
        );

        if (targetSale) {
           let calculatedDiscount = 0;
           const discountVal = Number(targetSale.discount || targetSale.discount_value || 0);
           
           if (targetSale.type === 'Voucher') {
               calculatedDiscount = Math.min(discountVal, eligibleTotalForVoucher);
           } else {
               calculatedDiscount = eligibleTotalForVoucher * (discountVal / 100);
           }

           setAppliedVoucher({ 
             code, 
             discount_amount: calculatedDiscount,
             discountAmount: calculatedDiscount 
           });
           setVoucherCode(code);
           setVoucherMessage(`Áp dụng mã ${code}: Giảm ${calculatedDiscount.toLocaleString('vi-VN')}đ (Chỉ tính trên các SP chưa giảm giá)`);
           return;
        }
      }

      // Fallback
      const result = await vouchersAPI.validateCode(code, eligibleTotalForVoucher);
      if (!result) {
        setVoucherError('Mã giảm giá không hợp lệ hoặc đã hết hạn.');
        return;
      }

      setAppliedVoucher({
        ...result,
        discountAmount: result.discount_amount || result.discountAmount
      });
      setVoucherCode(result.code || code);
      setVoucherMessage(`Áp dụng thành công: Giảm ${Number(result.discount_amount || 0).toLocaleString('vi-VN')}đ`);
      
    } catch (err) {
      setAppliedVoucher(null);
      setVoucherError(err.message || 'Áp dụng voucher thất bại.');
    } finally {
      setApplyingVoucher(false);
    }
  };

  const handleRemoveVoucher = () => {
    setAppliedVoucher(null);
    setVoucherMessage('Đã gỡ voucher.');
    setVoucherError('');
  };

  // --- 4. SUBMIT ĐƠN HÀNG VÀ AUTO UPDATE PROFILE ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!isLoggedIn) {
      alert("Vui lòng đăng nhập trước khi thanh toán!");
      navigate('/login?redirect=/checkout');
      return;
    }
    
    if (safeCart.length === 0) {
      alert("Giỏ hàng của bạn đang trống!");
      return;
    }

    if (!formData.fullName || !formData.phone || !formData.address) {
      alert("Vui lòng nhập địa chỉ giao hàng đầy đủ! (Chúng tôi chỉ nhận đơn giao hàng nội thành Đà Nẵng)");
      return;
    }

    // --- KIỂM TRA ĐỊA CHỈ NỘI THÀNH ĐÀ NẴNG ---
    const addressLower = formData.address.toLowerCase();
    const isDaNang = addressLower.includes('đà nẵng') || 
                     addressLower.includes('da nang') || 
                     addressLower.includes('danang');
                     
    if (!isDaNang) {
      alert("Rất tiếc, AgriMarket hiện tại chỉ hỗ trợ giao hàng nội thành khu vực Đà Nẵng. Vui lòng kiểm tra và cập nhật lại địa chỉ nhận hàng của bạn.");
      return; // Dừng việc submit form
    }

    try {
      setIsSubmitting(true);

      try {
        await authAPI.updateProfile(
          currentUser.email || 'no-email@agrimarket.local', 
          formData.fullName, 
          formData.phone, 
          formData.address, 
          null
        );
        const storedUser = getStoredUser();
        if (storedUser) {
          storedUser.name = formData.fullName;
          storedUser.phone = formData.phone;
          storedUser.address = formData.address;
          localStorage.setItem('user', JSON.stringify(storedUser));
        }
      } catch (updateErr) {
        console.error("Không thể tự động lưu thông tin profile mới:", updateErr);
      }

      // CHUẨN HÓA MẢNG SẢN PHẨM TRƯỚC KHI GỬI (NỐI QUÀ TẶNG VÀO TÊN SP)
      const itemsToOrder = safeCart.map(item => {
        const qty = item.amount || item.quantity || 1;
        const gifts = getGiftsForItem(item.id, qty);
        
        let finalName = item.name;
        if (gifts.length > 0) {
          const giftStrings = gifts.map(g => `${g.name} x${g.giftQuantity}`).join(', ');
          finalName = `${item.name} [🎁 Tặng kèm: ${giftStrings}]`; // Nối tên quà vào
        }

        return {
          ...item,
          name: finalName,
          product_name: finalName
        };
      });

      const response = await ordersAPI.create(
        itemsToOrder, // <-- Gửi mảng đã có kèm Quà tặng               
        subtotalAfterDiscount,       
        formData.address,            
        paymentMethod === 'COD' ? 'Tiền mặt' : 'Chuyển khoản', 
        formData.phone,             
        formData.fullName,          
        appliedVoucher
      );

      alert(`🎉 Đặt hàng thành công! Mã đơn hàng: ${response?.orderCode || 'Thành công'}`);
      clearCart();
      navigate('/orders');
      
    } catch (err) {
      console.error('Lỗi khi Submit:', err);
      const errorMsg = String(err.message).toLowerCase();
      
      if (errorMsg.includes('401') || errorMsg.includes('unauthorized')) {
        alert("❌ Lỗi Xác thực: Bạn cần tắt phần kiểm tra token trong API tạo đơn (api_orders.php) để khớp với hệ thống hiện tại.");
      } else {
        alert(`❌ Đã xảy ra lỗi: ${err.message}`);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const bankInfo = {
    bankId: 'MB',                
    accountNo: '0905559129',      
    accountName: 'TRAN THE KIET',  
  };

  const qrCodeUrl = `https://img.vietqr.io/image/${bankInfo.bankId}-${bankInfo.accountNo}-compact2.png?amount=${finalPrice}&addInfo=Thanh toan don hang AgriMarket&accountName=${bankInfo.accountName}`;

  return (
    <div className="checkout-container">
      <style>{`
        .gift-container {
          margin-top: 10px;
          border: 1.5px dashed #10b981;
          border-radius: 8px;
          padding: 8px 12px;
          background: #ecfdf5;
          position: relative;
        }
        .gift-container::before {
          content: 'Quà tặng kèm';
          position: absolute;
          top: -10px;
          left: 10px;
          background: #10b981;
          color: white;
          font-size: 10px;
          font-weight: 800;
          padding: 2px 6px;
          border-radius: 4px;
        }
        .gift-item-row {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          color: #059669;
          font-weight: 700;
          padding: 4px 0;
        }
        .gift-item-name { flex: 1; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .original-price-checkout {
          font-size: 12px;
          color: #94a3b8;
          text-decoration: line-through;
          margin-left: 6px;
          font-weight: 600;
        }
      `}</style>

      <div className="checkout-header">
        <h1>Thanh Toán Đơn Hàng</h1>
        <p>Vui lòng kiểm tra thông tin trước khi đặt hàng.</p>
      </div>

      <form className="checkout-content" onSubmit={handleSubmit}>
        
        {/* --- CỘT TRÁI: THÔNG TIN GIAO HÀNG --- */}
        <div className="checkout-form-section">
          
          {currentUser && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px', padding: '15px', backgroundColor: '#f0fdf4', borderRadius: '8px', border: '1px solid #c8e6c9', marginBottom: '25px' }}>
               <img 
                 src={currentUser.avatar || "https://i.pravatar.cc/150?img=5"} 
                 alt="Avatar" 
                 style={{ width: '50px', height: '50px', borderRadius: '50%', objectFit: 'cover' }} 
               />
               <div>
                  <p style={{ margin: 0, fontWeight: 'bold', color: '#1b5e20' }}>Tài khoản đặt hàng:</p>
                  <p style={{ margin: 0, fontSize: '14px', color: '#2e7d32' }}>{currentUser.name} {currentUser.email ? `(${currentUser.email})` : ''}</p>
               </div>
            </div>
          )}

          <h3>Thông tin giao hàng</h3>
          <p style={{ fontSize: '12px', color: '#e11d48', marginBottom: '15px', fontWeight: 'bold' }}>* Lưu ý: Hiện tại hệ thống chỉ hỗ trợ giao hàng trong thành phố Đà Nẵng. (Chúng tôi đang phát triển thêm giao hàng đến các tỉnh thành khác)</p>
          
          <div className="form-group">
            <label>Họ và tên *</label>
            <input type="text" name="fullName" value={formData.fullName} onChange={handleInputChange} placeholder="Nhập họ tên của bạn" required />
          </div>
          <div className="form-group">
            <label>Số điện thoại *</label>
            <input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} placeholder="Nhập số điện thoại" required />
          </div>
          <div className="form-group">
            <label>Địa chỉ nhận hàng (Bắt buộc chứa chữ "Đà Nẵng") *</label>
            <textarea 
              name="address" 
              value={formData.address} 
              onChange={handleInputChange} 
              placeholder="Nhập địa chỉ chi tiết (Ví dụ: 123 Lê Duẩn, Hải Châu, Đà Nẵng)" 
              required 
              rows="3">
            </textarea>
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
            {safeCart.map((item, index) => {
              const qty = item.amount || item.quantity || 1;
              const gifts = getGiftsForItem(item.id, qty); 
              const originalTotalPrice = (item.originalPrice || item.price) * qty;
              const currentTotalPrice = item.price * qty;

              return (
                <div key={index} className="summary-item" style={{ flexDirection: 'column', alignItems: 'stretch' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                    <span className="item-name">{item.name} <b>x{qty}</b></span>
                    
                    <div style={{ textAlign: 'right' }}>
                      <span className="item-price">{currentTotalPrice.toLocaleString()}đ</span>
                      {item.hasDiscount && originalTotalPrice > currentTotalPrice && (
                        <span className="original-price-checkout">{originalTotalPrice.toLocaleString()}đ</span>
                      )}
                    </div>
                  </div>
                  
                  {/* HIỂN THỊ QUÀ TẶNG BÊN DƯỚI SẢN PHẨM */}
                  {gifts.length > 0 && (
                    <div className="gift-container">
                      {gifts.map((gift, gIndex) => (
                        <div key={gIndex} className="gift-item-row">
                          <FiGift size={16} />
                          <span className="gift-item-name">{gift.name}</span>
                          <span>x{gift.giftQuantity}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="summary-totals">
            <div className="total-line">
              <span>Tạm tính:</span>
              <span>{totalPrice.toLocaleString()}đ</span>
            </div>
            {discountAmount > 0 && (
              <div className="total-line discount" style={{ color: '#e11d48' }}>
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
            <label htmlFor="voucherCode">Mã giảm giá Toàn Sàn</label>
            <div className="voucher-row">
              <input
                id="voucherCode"
                type="text"
                value={voucherCode}
                onChange={(e) => setVoucherCode(e.target.value.toUpperCase())}
                placeholder="Nhập mã giảm giá"
                disabled={isSubmitting || applyingVoucher}
              />
              <button
                type="button"
                onClick={handleApplyVoucher}
                disabled={isSubmitting || applyingVoucher}
              >
                {applyingVoucher ? 'Đang áp dụng...' : 'Áp dụng'}
              </button>
            </div>
            {appliedVoucher && (
              <button
                type="button"
                className="voucher-remove-btn"
                onClick={handleRemoveVoucher}
                disabled={isSubmitting}
              >
                Bỏ voucher
              </button>
            )}
            {voucherMessage && <p className="voucher-message" style={{ color: '#10b981', fontWeight: 'bold' }}>{voucherMessage}</p>}
            {voucherError && <p className="voucher-error" style={{ color: '#e11d48', fontWeight: 'bold' }}>{voucherError}</p>}
          </div>

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