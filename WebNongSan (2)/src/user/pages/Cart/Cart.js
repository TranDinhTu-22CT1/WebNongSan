import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../store/CartContext';
import { FiTrash2, FiMinus, FiPlus, FiArrowLeft } from 'react-icons/fi';
import { getStoredUser } from '../../utils/authStorage';
import './Cart.css';

const Cart = () => {
  const { cartItems, removeFromCart, updateQuantity, totalPrice } = useCart(); 
  const navigate = useNavigate();
  const user = getStoredUser();

  const handleCheckout = (e) => {
    e.preventDefault();
    if (!user) {
      alert("Vui lòng đăng nhập để tiến hành thanh toán!");
      navigate('/login?redirect=/checkout');
      return;
    }
    navigate('/checkout');
  };

  if (cartItems.length === 0) {
    return (
      <div className="cart-empty-container">
        <div className="empty-cart-content">
          <img src="https://cdn-icons-png.flaticon.com/512/11329/11329060.png" alt="Empty Cart" className="empty-cart-img" />
          <h2>Giỏ hàng của {user ? user.name : 'bạn'} đang trống!</h2>
          <p>Hãy dạo một vòng chợ nông sản để tìm những sản phẩm tươi ngon nhé.</p>
          <Link to="/shop" className="btn-continue-shopping">
            <FiArrowLeft /> Tiếp tục mua sắm
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <style>{`
        .cart-item-card { position: relative; }
        .cart-discount-badge {
          position: absolute;
          top: 10px;
          left: 10px;
          background-color: #ef4444;
          color: white;
          font-size: 11px;
          font-weight: 800;
          padding: 4px 8px;
          border-radius: 8px;
          z-index: 2;
        }
        .item-price-wrapper { display: flex; flex-direction: column; gap: 2px; }
        .item-price.current { color: #10b981; font-weight: 800; font-size: 16px; }
        .item-price.original { color: #94a3b8; font-size: 13px; text-decoration: line-through; font-weight: 600; }
        .stock-limit-msg { font-size: 11px; color: #ef4444; font-weight: 600; margin-top: 4px; display: block; text-align: center; }
      `}</style>

      <div className="cart-header-title">
        <h2>Giỏ hàng của {user ? user.name : 'bạn'}</h2>
        <p>Có {cartItems.length} sản phẩm trong giỏ hàng</p>
      </div>

      <div className="cart-content-wrapper">
        <div className="cart-items-section">
          <div className="cart-items-list">
            {cartItems.map((item) => {
              // Lấy thông tin giá khuyến mãi đã được lưu từ lúc Thêm vào giỏ
              const hasDiscount = item.hasDiscount;
              const originalPrice = item.originalPrice || item.price;
              const badgeText = item.badgeText;
              
              const maxStock = item.stock !== undefined ? Number(item.stock) : 999;
              const isMaxReached = item.quantity >= maxStock;

              return (
                <div key={item.id} className="cart-item-card">
                  
                  {/* HIỂN THỊ HUY HIỆU GIẢM GIÁ TỪ CONTEXT */}
                  {hasDiscount && badgeText && (
                    <span className="cart-discount-badge">{badgeText}</span>
                  )}

                  <div className="item-image-wrapper">
                    <Link to={`/product/${item.id}`}>
                      <img src={item.image} alt={item.name} className="item-image" />
                    </Link>
                  </div>
                  
                  <div className="item-details">
                    <Link to={`/product/${item.id}`} className="item-name">{item.name}</Link>
                    
                    <div className="item-price-wrapper">
                      <span className="item-price current">{item.price.toLocaleString()}đ</span>
                      {hasDiscount && originalPrice > item.price && (
                        <span className="item-price original">{originalPrice.toLocaleString()}đ</span>
                      )}
                    </div>
                  </div>

                  <div className="item-quantity-control" style={{ flexDirection: 'column', alignItems: 'center', gap: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <button 
                        className="qty-btn" 
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                      >
                        <FiMinus />
                      </button>
                      <input
                        className="qty-value"
                        type="number"
                        min="1"
                        max={maxStock}
                        value={item.quantity}
                        onChange={(e) => {
                          const next = Number.parseInt(e.target.value, 10);
                          if (Number.isNaN(next)) return;
                          updateQuantity(item.id, Math.min(next, maxStock));
                        }}
                      />
                      <button 
                        className="qty-btn" 
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        disabled={isMaxReached}
                      >
                        <FiPlus />
                      </button>
                    </div>
                    {isMaxReached && <span className="stock-limit-msg">Tối đa kho</span>}
                  </div>

                  <div className="item-total-price" style={{ color: '#4318ff' }}>
                    {(item.price * item.quantity).toLocaleString()}đ
                  </div>

                  <button 
                    className="item-remove-btn"
                    onClick={() => removeFromCart(item.id)}
                    title="Xóa sản phẩm"
                  >
                    <FiTrash2 />
                  </button>
                </div>
              );
            })}
          </div>
          
          <div className="cart-actions-bottom">
            <Link to="/shop" className="btn-back-shop">
              <FiArrowLeft /> Tiếp tục mua sắm
            </Link>
          </div>
        </div>

        <div className="cart-summary-section">
          <div className="summary-card">
            <h3>Tổng đơn hàng</h3>
            
            <div className="summary-row">
              <span>Tạm tính:</span>
              <span>{totalPrice.toLocaleString()}đ</span>
            </div>
            
            <div className="summary-row">
              <span>Phí giao hàng:</span>
              <span>Miễn phí</span>
            </div>
            
            <div className="summary-divider"></div>
            
            <div className="summary-row total">
              <span>Tổng cộng:</span>
              <span className="total-amount">{totalPrice.toLocaleString()}đ</span>
            </div>
            
            <button 
              onClick={handleCheckout} 
              className="btn-checkout"
              style={{ width: '100%', border: 'none', cursor: 'pointer' }}
            >
              Tiến hành thanh toán
            </button>
            
            <div className="secure-checkout">
              <img src="https://cdn-icons-png.flaticon.com/512/6598/6598519.png" alt="Secure" width="20" />
              <span>Thanh toán an toàn & bảo mật</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;