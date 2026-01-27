import React, { useState } from 'react';
import { useCart } from '../../store/CartContext';
import { useNotification } from '../../store/NotificationContext'; 
import { useNavigate } from 'react-router-dom';
import './Checkout.css'; 

const Checkout = () => {
  // 1. LẤY HÀM clearCart
  const { cartItems, totalItems, clearCart } = useCart(); 
  const { addNotification } = useNotification(); 
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({ fullName: '', phone: '', address: '', note: '' });
  const [voucherCode, setVoucherCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [message, setMessage] = useState('');

  const AVAILABLE_VOUCHERS = [
    { code: 'CHAOMUNG', desc: 'Giảm 20%', type: 'percent', value: 0.2, minOrder: 0 },
    { code: 'RAUSACH', desc: 'Giảm 50k đơn >300k', type: 'fixed', value: 50000, minOrder: 300000 },
    { code: 'FREESHIP', desc: 'Freeship đơn >500k', type: 'fixed', value: 30000, minOrder: 500000 },
  ];

  const subTotal = cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
  const finalTotal = subTotal - discount > 0 ? subTotal - discount : 0;

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
  const handleQuickApply = (code) => { setVoucherCode(code); setMessage(''); setDiscount(0); };

  const handleApplyVoucher = () => {
    const inputCode = voucherCode.trim().toUpperCase();
    const validVoucher = AVAILABLE_VOUCHERS.find(v => v.code === inputCode);
    if (validVoucher) {
      if (subTotal < validVoucher.minOrder) {
        setDiscount(0);
        setMessage(`⚠️ Đơn hàng phải từ ${validVoucher.minOrder.toLocaleString()}đ mới dùng được mã này!`);
        return;
      }
      let discountAmount = validVoucher.type === 'percent' ? subTotal * validVoucher.value : validVoucher.value;
      setDiscount(discountAmount);
      setMessage(`🎉 Áp dụng mã ${inputCode} thành công!`);
    } else {
      setDiscount(0);
      setMessage('❌ Mã giảm giá không hợp lệ hoặc đã hết hạn.');
    }
  };

  const handleOrder = (e) => {
    e.preventDefault();
    if (!formData.fullName || !formData.phone || !formData.address) {
      alert("Vui lòng điền đầy đủ thông tin giao hàng!");
      return;
    }

    addNotification(
      "Đặt hàng thành công! 🎉", 
      `Đơn hàng trị giá ${finalTotal.toLocaleString()}đ đang được chuẩn bị.`
    );

    alert(`🎉 Đặt hàng thành công!\nTổng tiền thanh toán: ${finalTotal.toLocaleString()}đ`);
    
    // 2. GỌI HÀM XÓA GIỎ HÀNG
    clearCart(); 
    
    navigate('/');
  };

  return (
    <div className="checkout-container">
      <div className="checkout-form">
        <h2>Thông tin giao hàng</h2>
        <form onSubmit={handleOrder}>
          <div className="form-group">
            <label>Họ và tên</label>
            <input type="text" name="fullName" placeholder="Nguyễn Văn A" onChange={handleChange} />
          </div>
          <div className="form-group">
            <label>Số điện thoại</label>
            <input type="text" name="phone" placeholder="0912345678" onChange={handleChange} />
          </div>
          <div className="form-group">
            <label>Địa chỉ nhận hàng</label>
            <textarea name="address" rows="3" placeholder="Số nhà, đường, phường, quận..." onChange={handleChange}></textarea>
          </div>
          <div className="payment-method">
            <h3>Phương thức thanh toán</h3>
            <label className="payment-option">
              <input type="radio" name="payment" defaultChecked /> Thanh toán khi nhận hàng (COD)
            </label>
            <label className="payment-option">
              <input type="radio" name="payment" /> Chuyển khoản ngân hàng (QR Code)
            </label>
          </div>
          <button type="submit" className="place-order-btn">
            ĐẶT HÀNG ({finalTotal.toLocaleString()}đ)
          </button>
        </form>
      </div>

      <div className="checkout-summary">
        <h3>Đơn hàng ({totalItems} sản phẩm)</h3>
        {cartItems.map((item) => (
          <div key={item.id} className="summary-item">
            <span>{item.quantity}x {item.name}</span>
            <span>{(item.price * item.quantity).toLocaleString()}đ</span>
          </div>
        ))}
        <hr style={{margin: '15px 0', border: 'none', borderTop: '1px solid #eee'}} />
        
        <div style={{marginBottom: '15px'}}>
          <p style={{fontWeight: 'bold', marginBottom: '5px'}}>Mã giảm giá:</p>
          <div style={{display: 'flex', gap: '5px'}}>
            <input type="text" placeholder="Nhập mã voucher" value={voucherCode} onChange={(e) => setVoucherCode(e.target.value)} style={{flex: 1, padding: '8px', border: '1px solid #ccc', borderRadius: '4px'}} />
            <button type="button" onClick={handleApplyVoucher} style={{backgroundColor: '#82ae46', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '4px', cursor: 'pointer'}}>Áp dụng</button>
          </div>
          <div className="voucher-tags">
            <p style={{fontSize: '12px', color: '#666', marginTop: '5px', marginBottom: '3px'}}>Mã khả dụng:</p>
            <div style={{display: 'flex', gap: '5px', flexWrap: 'wrap'}}>
              {AVAILABLE_VOUCHERS.map((v) => (
                <span key={v.code} className="voucher-tag" onClick={() => handleQuickApply(v.code)}>{v.code} <small>({v.desc})</small></span>
              ))}
            </div>
          </div>
          {message && <p style={{fontSize: '13px', marginTop: '10px', fontWeight: 'bold', color: message.includes('🎉') ? 'green' : (message.includes('⚠️') ? '#f57f17' : 'red')}}>{message}</p>}
        </div>

        <div className="summary-item"><span>Tạm tính:</span><span>{subTotal.toLocaleString()}đ</span></div>
        {discount > 0 && <div className="summary-item" style={{color: 'green'}}><span>Giảm giá:</span><span>- {discount.toLocaleString()}đ</span></div>}
        <div className="summary-item" style={{fontWeight: 'bold', fontSize: '20px', borderTop: '2px solid #ddd', paddingTop: '10px', marginTop: '10px'}}><span>Tổng thanh toán:</span><span style={{color: '#d32f2f'}}>{finalTotal.toLocaleString()}đ</span></div>
      </div>
    </div>
  );
};

export default Checkout;