import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaBoxOpen, FaCheckCircle, FaTruck, FaClock } from 'react-icons/fa';
import { FiGift } from 'react-icons/fi';
import { BACKEND_BASE_URL, productsAPI } from '../../api/apiClient';
import { getAuthToken, getStoredUser } from '../../utils/authStorage';
import './OrderHistory.css';

const OrderHistory = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [allProducts, setAllProducts] = useState([]);

  // 1. TẢI LỊCH SỬ ĐƠN HÀNG
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const token = getAuthToken();
        const user = getStoredUser();

        if (!token || !user) {
          navigate('/login');
          return;
        }

        setLoading(true);

        const fbParams = user.uid 
          ? `?fb_name=${encodeURIComponent(user.name)}&fb_email=${encodeURIComponent(user.email)}` 
          : '';

        const response = await fetch(`${BACKEND_BASE_URL}/get_invoices.php${fbParams}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        const result = await response.json();

        if (result.status === 'success') {
          setOrders(Array.isArray(result.data) ? result.data : []);
          setError(null);
        } else {
          throw new Error(result.message || 'Không thể lấy dữ liệu');
        }
        
      } catch (err) {
        console.error('Lỗi lấy lịch sử đơn hàng:', err);
        setError('Không thể tải lịch sử đơn hàng lúc này. Vui lòng thử lại sau.');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
    window.scrollTo(0, 0);
  }, [navigate]);

  // 2. TẢI DỮ LIỆU SẢN PHẨM ĐỂ ĐỐI CHIẾU GIÁ GỐC
  useEffect(() => {
    const loadExtraData = async () => {
      try {
        const productsData = await productsAPI.getAll().catch(() => []);
        setAllProducts(Array.isArray(productsData) ? productsData : []);
      } catch (e) {
        console.error('Lỗi tải dữ liệu sản phẩm:', e);
      }
    };
    loadExtraData();
  }, []);

  const getStatusIcon = (status) => {
    const s = String(status || '').toLowerCase();
    if (s.includes('chờ') || s.includes('pending')) return <FaClock color="#f57c00" />;
    if (s.includes('giao') || s.includes('shipping')) return <FaTruck color="#1976d2" />;
    return <FaCheckCircle color="#2e7d32" />;
  };

  if (loading) {
    return (
      <div className="orders-container">
        <div className="orders-header"><h1>Theo Dõi Đơn Hàng</h1></div>
        <div style={{textAlign: 'center', padding: '100px 0'}}>
            <div className="loading-spinner"></div>
            <p style={{marginTop: '20px', color: '#666'}}>Đang tìm kiếm đơn hàng của bạn...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="orders-container">
      <style>{`
        .gift-container {
          margin-top: 8px;
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
          gap: 6px;
          font-size: 12px;
          color: #059669;
          font-weight: 700;
          padding: 4px 0;
        }
        .gift-item-name { flex: 1; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .original-price-history { font-size: 12px; color: #94a3b8; text-decoration: line-through; font-weight: 600; margin-top: 2px; text-align: right; }
      `}</style>

      <div className="orders-header">
        <h1>Lịch Sử Mua Hàng</h1>
        <p>Theo dõi trạng thái và chi tiết các đơn hàng nông sản của bạn</p>
      </div>

      {error ? (
        <div style={{textAlign: 'center', padding: '40px', background: '#fff3cd', borderRadius: '8px', color: '#856404'}}>
           {error}
        </div>
      ) : orders.length === 0 ? (
        <div className="empty-orders">
          <FaBoxOpen size={60} color="#ccc" />
          <h2>Bạn chưa có đơn hàng nào</h2>
          <p>Có vẻ như bạn chưa đặt sản phẩm nào từ hệ thống.</p>
          <Link to="/shop" className="btn-shopping">Mua sắm ngay</Link>
        </div>
      ) : (
        <div className="orders-list">
          {orders.map((order) => (
            <div key={order.db_id || order.id} className="order-card">
              
              <div className="order-card-header">
                <div>
                  <span className="order-id">Mã đơn: <b>{order.id}</b></span>
                  <span className="order-date">{order.date}</span>
                </div>
                <div className="order-status">
                  {getStatusIcon(order.status || order.deliveryStatus)} 
                  <span className="status-text">{order.status || order.deliveryStatus || 'Chờ xử lý'}</span>
                </div>
              </div>

              <div className="order-items">
                {order.items && order.items.length > 0 ? (
                  order.items.map((item, idx) => {
                    const qty = item.qty || item.quantity || 1;
                    const productId = item.product_id || item.id;
                    const currentPrice = Number(item.price);
                    
                    const originalProd = allProducts.find(p => String(p.id) === String(productId));
                    const originalPrice = originalProd ? (typeof originalProd.price === 'string' ? parseFloat(originalProd.price) : originalProd.price) : currentPrice;
                    const hasDiscount = originalPrice > currentPrice;

                    // --- BÓC TÁCH TÊN SẢN PHẨM VÀ QUÀ TẶNG (DÙNG REGEX CỰC MẠNH) ---
                    const rawName = item.name || item.product_name || '';
                    let baseName = rawName;
                    let parsedGifts = [];
                    
                    // Regex quét tìm đoạn " [bất_kỳ_ký_tự_gì Tặng kèm: nội_dung_quà_tặng]"
                    const giftRegex = / \[.*?Tặng kèm:\s*(.*?)\]/;
                    const match = rawName.match(giftRegex);
                    
                    if (match) {
                      // Xóa bỏ toàn bộ đoạn " [? Tặng kèm: ...]" ra khỏi tên gốc
                      baseName = rawName.replace(match[0], '');
                      // match[1] chính là phần quà tặng bên trong (VD: "Hồi khô x4")
                      const giftContent = match[1];
                      parsedGifts = giftContent.split(', ').filter(Boolean);
                    }

                    return (
                      <div key={idx} className="order-item-row" style={{ flexDirection: 'column', alignItems: 'stretch' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                          <div className="order-item-info">
                            <h4>{baseName}</h4>
                            <p>Số lượng: x{qty}</p>
                          </div>
                          
                          <div className="order-item-price" style={{ textAlign: 'right' }}>
                            <div style={{ fontWeight: '800', color: '#1b2559' }}>{(currentPrice * qty).toLocaleString()}đ</div>
                            {hasDiscount && (
                              <div className="original-price-history">
                                {(originalPrice * qty).toLocaleString()}đ
                              </div>
                            )}
                          </div>
                        </div>

                        {/* HIỂN THỊ QUÀ TẶNG BÊN DƯỚI SẢN PHẨM */}
                        {parsedGifts.length > 0 && (
                          <div className="gift-container">
                            {parsedGifts.map((giftStr, gIdx) => (
                              <div key={gIdx} className="gift-item-row">
                                <FiGift size={14} />
                                <span className="gift-item-name">{giftStr}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })
                ) : (
                  <p style={{padding: '10px', fontSize: '13px', color: '#999'}}>Không có thông tin chi tiết sản phẩm.</p>
                )}
              </div>

              <div className="order-card-footer">
                <div className="order-method">
                  Thanh toán: <b>{order.payment_method || order.method || 'Tiền mặt'}</b>
                </div>
                <div className="order-total">
                  Tổng tiền: <span>{Number(order.amount || order.total || 0).toLocaleString()}đ</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrderHistory;