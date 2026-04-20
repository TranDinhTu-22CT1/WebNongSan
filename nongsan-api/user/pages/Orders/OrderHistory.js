import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaBoxOpen, FaCheckCircle, FaTruck, FaClock } from 'react-icons/fa';
import { ordersAPI } from '../../api/apiClient';
import { getAuthToken } from '../../utils/authStorage';
import './OrderHistory.css';

const OrderHistory = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch orders from backend
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const token = getAuthToken();
        if (!token) {
          navigate('/login');
          return;
        }

        setLoading(true);
        const data = await ordersAPI.getAll();
        setOrders(Array.isArray(data) ? data : []);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch orders:', err);
        setError(err.message);
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
    window.scrollTo(0, 0);
  }, [navigate]);

  // Hàm chọn icon theo trạng thái
  const getStatusIcon = (status) => {
    const normalizedStatus = String(status).toLowerCase();
    if (normalizedStatus.includes('chờ') || normalizedStatus.includes('pending') || normalizedStatus.includes('xử lý')) {
      return <FaClock color="#f57c00" />;
    } else if (normalizedStatus.includes('giao') || normalizedStatus.includes('shipping')) {
      return <FaTruck color="#1976d2" />;
    } else if (normalizedStatus.includes('hoàn thành') || normalizedStatus.includes('shipped') || normalizedStatus.includes('delivered')) {
      return <FaCheckCircle color="#2e7d32" />;
    }
    return <FaClock color="#f57c00" />;
  };

  if (loading) {
    return (
      <div className="orders-container">
        <div className="orders-header">
          <h1>Theo Dõi Đơn Hàng</h1>
        </div>
        <div style={{textAlign: 'center', padding: '40px', color: '#666'}}>
          <p>Đang tải đơn hàng...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="orders-container">
        <div className="orders-header">
          <h1>Theo Dõi Đơn Hàng</h1>
        </div>
        <div style={{textAlign: 'center', padding: '40px', background: '#fff3cd', borderRadius: '8px'}}>
          <p style={{color: '#856404'}}>Lỗi: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="orders-container">
      <div className="orders-header">
        <h1>Theo Dõi Đơn Hàng</h1>
        <p>Kiểm tra trạng thái các đơn hàng bạn đã đặt tại AgriMarket</p>
      </div>

      {orders.length === 0 ? (
        <div className="empty-orders">
          <FaBoxOpen size={60} color="#ccc" />
          <h2>Bạn chưa có đơn hàng nào</h2>
          <Link to="/shop" className="btn-shopping">Mua sắm ngay</Link>
        </div>
      ) : (
        <div className="orders-list">
          {orders.map((order) => {
            const statusText = order.statusLabel || order.status || 'Chờ xử lý';

            return (
              <div key={order.id} className="order-card">
                {/* Tiêu đề đơn hàng (Mã + Trạng thái) */}
                <div className="order-card-header">
                  <div>
                    <span className="order-id">Mã đơn: <b>{order.id}</b></span>
                    <span className="order-date">{order.date}</span>
                  </div>
                  <div className="order-status">
                    {getStatusIcon(statusText)} <span className={`status-text ${order.statusKey === 'success' ? 'success' : ''}`}>{statusText}</span>
                  </div>
                </div>

                {/* Danh sách sản phẩm trong đơn */}
                <div className="order-items">
                  {(order.items || []).map((item, index) => (
                    <div key={index} className="order-item-row">
                      <img src={item.image} alt={item.name} className="order-item-img" />
                      <div className="order-item-info">
                        <h4>{item.name}</h4>
                        <p>x{item.amount || item.quantity || 1}</p>
                      </div>
                      <div className="order-item-price">
                        {((item.price * (item.amount || item.quantity || 1)) || 0).toLocaleString()}đ
                      </div>
                    </div>
                  ))}
                </div>

                {/* Tổng kết đơn hàng */}
                <div className="order-card-footer">
                  <div className="order-method">
                    Thanh toán: <b>{order.method}</b>
                  </div>
                  <div className="order-total">
                    Tổng tiền: <span>{Number(order.total || 0).toLocaleString()}đ</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default OrderHistory;
