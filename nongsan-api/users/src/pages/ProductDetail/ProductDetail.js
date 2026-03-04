import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useCart } from "../../store/CartContext";
import { products } from '../../data'; 
import './ProductDetail.css';

const ProductDetail = () => {
  const { id } = useParams(); 
  const { addToCart } = useCart(); 
  const [quantity, setQuantity] = useState(1);

  // Tìm sản phẩm trong kho dữ liệu chung (data.js) dựa vào ID
  const product = products.find(p => p.id === parseInt(id));

  // Nếu không tìm thấy (ví dụ gõ ID linh tinh)
  if (!product) {
    return (
      <div style={{ textAlign: 'center', marginTop: '50px', color: '#666' }}>
        <h2>Không tìm thấy sản phẩm này!</h2>
        <p>Vui lòng quay lại trang chủ.</p>
      </div>
    );
  }

  return (
    <div className="product-detail-container">
      {/* Cột trái: Ảnh */}
      <div className="detail-image">
         <img src={product.image} alt={product.name} />
      </div>

      {/* Cột phải: Thông tin */}
      <div className="detail-info">
        <h1>{product.name}</h1>
        <p className="detail-price">{product.price.toLocaleString()}đ</p>
        <p className="detail-description">{product.desc}</p>
        
        {/* Bộ chọn số lượng */}
        <div className="quantity-control">
          <label>Số lượng: </label>
          <input 
            type="number" 
            value={quantity} 
            min="1" 
            onChange={(e) => setQuantity(parseInt(e.target.value))} 
          />
        </div>

        {/* Nút mua hàng */}
        <button 
          className="buy-btn" 
          onClick={() => addToCart(product, quantity)}
        >
          Thêm vào giỏ hàng
        </button>
      </div>
    </div>
  );
};

export default ProductDetail;