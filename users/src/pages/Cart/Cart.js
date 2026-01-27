import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../../store/CartContext';
import './Cart.css';

const Cart = () => {
  // SỬA TÊN BIẾN: cart -> cartItems
  const { cartItems, removeFromCart } = useCart(); 

  // Tính tổng tiền (Sửa cart -> cartItems)
  const totalAmount = cartItems.reduce((total, item) => total + item.price * item.quantity, 0);

  // Trường hợp giỏ hàng trống (Sửa cart -> cartItems)
  if (cartItems.length === 0) {
    return (
      <div className="cart-container empty-cart">
        <h2>Giỏ hàng của bạn đang trống!</h2>
        <p>Hãy dạo một vòng chợ nông sản nhé.</p>
        <Link to="/">
          <button className="checkout-btn">Quay lại mua sắm</button>
        </Link>
      </div>
    );
  }

  // Trường hợp có hàng
  return (
    <div className="cart-container">
      <h2>Giỏ hàng của bạn</h2>
      
      <table className="cart-table">
        <thead>
          <tr>
            <th>Sản phẩm</th>
            <th>Đơn giá</th>
            <th>Số lượng</th>
            <th>Thành tiền</th>
            <th>Xóa</th>
          </tr>
        </thead>
        <tbody>
          {/* Sửa cart.map -> cartItems.map */}
          {cartItems.map((item) => (
            <tr key={item.id}>
              <td>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <img src={item.image} alt={item.name} className="cart-img" />
                  <span>{item.name}</span>
                </div>
              </td>
              <td>{item.price.toLocaleString()}đ</td>
              <td>{item.quantity}</td>
              <td style={{ fontWeight: 'bold' }}>
                {(item.price * item.quantity).toLocaleString()}đ
              </td>
              <td>
                <button 
                  className="remove-btn"
                  onClick={() => removeFromCart(item.id)}
                >
                  Xóa
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="cart-summary">
        <h3>Tổng cộng: <span className="total-price">{totalAmount.toLocaleString()}đ</span></h3>
        
        <Link to="/checkout">
          <button className="checkout-btn">
            Tiến hành thanh toán
          </button>
        </Link>
      </div>
    </div>
  );
};

export default Cart;