import React, { useState, useEffect } from 'react';
import { 
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area 
} from 'recharts';
import { 
  DollarSign, ShoppingCart, Store, Users, 
  Clock, CreditCard, AlertCircle 
} from 'lucide-react';

const API_BASE_URL = 'http://localhost/nongsan-api'; // Thay đổi đường dẫn thực tế

const DashboardFullWidth = () => {
  // --- STATE LƯU TRỮ DỮ LIỆU TỪ API ---
  const [data, setData] = useState({
    overview: { todayRevenue: 0, todayOrders: 0, activeVendors: 0, newCustomers: 0 },
    charts: { revenue: [], orders: [] },
    pending: { vendors: 0, withdrawals: 0, disputes: 0 },
    topVendors: [],
    topProducts: []
  });

  const [loading, setLoading] = useState(true);

  // --- GỌI API KHI COMPONENT MOUNT ---
  useEffect(() => {
    fetch(`${API_BASE_URL}/api_dashboard.php`)
      .then(res => res.json())
      .then(response => {
        if (response.status === 'success') {
          setData(response.data);
        }
      })
      .catch(error => console.error("Lỗi khi tải Dashboard:", error))
      .finally(() => setLoading(false));
  }, []);

  // Hàm format tiền tệ VNĐ
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('vi-VN').format(value);
  };

  if (loading) return <div style={{ padding: 20, textAlign: 'center' }}>Đang tải dữ liệu...</div>;

  return (
    <>
      {/* GIỮ NGUYÊN TOÀN BỘ THẺ <style> CỦA BẠN Ở ĐÂY */}
      <style>{`
        .dashboard-wrapper {
          padding: 15px; 
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          min-height: 100vh;
          transition: all 0.3s ease;
        }
        /* ... (Phần CSS giữ nguyên không đổi) ... */
        .badge-count {
          background: #eef2ff; color: #4318ff;
          padding: 4px 12px; border-radius: 10px; font-weight: 700;
        }
        .bg-blue { background: #e0e7ff; color: #4318ff; }
        .bg-green { background: #dcfce7; color: #059669; }
        .bg-purple { background: #f3e8ff; color: #7c3aed; }
        .bg-orange { background: #ffedd5; color: #d97706; }
        .stats-grid { display: grid; grid-template-columns: repeat(1, 1fr); gap: 15px; margin-bottom: 25px; }
        @media (min-width: 480px) { .stats-grid { grid-template-columns: repeat(2, 1fr); } }
        @media (min-width: 1024px) { .stats-grid { grid-template-columns: repeat(4, 1fr); } }
        .stat-card-centered { background: white; padding: 20px; border-radius: 20px; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.05); }
        .icon-circle { width: 45px; height: 45px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-bottom: 10px; }
        .stat-label { color: #8b949e; font-size: 13px; font-weight: 500; margin-bottom: 5px; }
        .stat-value { font-size: 20px; font-weight: 800; color: #1b2559; margin: 0; }
        .chart-row { background: white; padding: 15px; border-radius: 20px; margin-bottom: 25px; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.05); }
        .chart-header { font-size: 16px; font-weight: 700; color: #1b2559; margin-bottom: 15px; padding-left: 10px; border-left: 4px solid #4318ff; }
        .chart-container { height: 250px; }
        @media (min-width: 768px) { .chart-container { height: 350px; } }
        .bottom-grid { display: grid; grid-template-columns: 1fr; gap: 20px; }
        @media (min-width: 1280px) { .bottom-grid { grid-template-columns: repeat(3, 1fr); } }
        .list-card { background: white; padding: 20px; border-radius: 20px; }
        .item-row { display: flex; justify-content: space-between; align-items: center; padding: 12px 0; border-bottom: 1px solid #f1f4f9; }
      `}</style>

      <div className="dashboard-wrapper">
        <h2 style={{ color: '#1b2559', marginBottom: '25px', fontSize: '22px' }}>Tổng quan hệ thống</h2>

        {/* 4 THẺ CHỈ SỐ */}
        <div className="stats-grid">
          <div className="stat-card-centered">
            <div className="icon-circle bg-blue"><DollarSign size={24}/></div>
            <p className="stat-label">Doanh thu hôm nay</p>
            <p className="stat-value">{formatCurrency(data.overview.todayRevenue)} đ</p>
          </div>
          <div className="stat-card-centered">
            <div className="icon-circle bg-green"><ShoppingCart size={24}/></div>
            <p className="stat-label">Số đơn hôm nay</p>
            <p className="stat-value">{formatCurrency(data.overview.todayOrders)}</p>
          </div>
          <div className="stat-card-centered">
            <div className="icon-circle bg-purple"><Store size={24}/></div>
            <p className="stat-label">Vendor hoạt động</p>
            <p className="stat-value">{formatCurrency(data.overview.activeVendors)}</p>
          </div>
          <div className="stat-card-centered">
            <div className="icon-circle bg-orange"><Users size={24}/></div>
            <p className="stat-label">Customer mới</p>
            <p className="stat-value">+{data.overview.newCustomers}</p>
          </div>
        </div>

        {/* BIỂU ĐỒ DOANH THU */}
        <div className="chart-row">
          <div className="chart-header">Doanh thu (7 ngày)</div>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.charts.revenue} margin={{ top: 5, right: 5, left: 10, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4318ff" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#4318ff" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f1f1" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#a3aed0', fontSize: 12}} />
                {/* Format YAxis để hiển thị triệu/tỷ cho gọn */}
                <YAxis 
                  axisLine={false} tickLine={false} tick={{fill: '#a3aed0', fontSize: 12}} 
                  tickFormatter={(val) => `${val / 1000000}M`}
                />
                <Tooltip formatter={(value) => formatCurrency(value) + " đ"} />
                <Area type="monotone" dataKey="value" stroke="#4318ff" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* BIỂU ĐỒ ĐƠN HÀNG */}
        <div className="chart-row">
          <div className="chart-header">Đơn hàng theo ngày</div>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.charts.orders} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f1f1" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#a3aed0', fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#a3aed0', fontSize: 12}} />
                <Tooltip cursor={{fill: '#f8f9ff'}} />
                <Bar dataKey="count" fill="#059669" radius={[6, 6, 0, 0]} barSize={30} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* PHẦN DANH SÁCH DƯỚI CÙNG */}
        <div className="bottom-grid">
          <div className="list-card">
            <h4 className="chart-header">Cần xử lý</h4>
            <div className="item-row">
              <span><Clock size={16} /> Vendor chờ duyệt</span> 
              <span className="badge-count">{data.pending.vendors}</span>
            </div>
            <div className="item-row">
              <span><CreditCard size={16} /> Yêu cầu rút tiền</span> 
              <span className="badge-count">{data.pending.withdrawals}</span>
            </div>
            <div className="item-row">
              <span><AlertCircle size={16} /> Đơn tranh chấp</span> 
              <span className="badge-count" style={{color: data.pending.disputes > 0 ? 'red' : ''}}>{data.pending.disputes}</span>
            </div>
          </div>

          <div className="list-card">
            <h4 className="chart-header">Top 5 Vendor</h4>
            {data.topVendors.length > 0 ? data.topVendors.map((v, i) => (
              <div className="item-row" key={i}>
                <span className="text-truncate" style={{maxWidth: '65%'}}>{i+1}. {v.shop_name || 'Vendor vô danh'}</span>
                <span style={{fontWeight: 'bold', color: '#4318ff'}}>{formatCurrency(v.total_revenue)} đ</span>
              </div>
            )) : <div className="text-muted mt-3 text-center">Chưa có dữ liệu</div>}
          </div>

          <div className="list-card">
            <h4 className="chart-header">Sản phẩm bán chạy</h4>
            {data.topProducts.length > 0 ? data.topProducts.map((p, i) => (
              <div className="item-row" key={i}>
                <span className="text-truncate" style={{maxWidth: '75%', fontSize: '14px'}}>{p.product_name}</span>
                <span className="badge-count" style={{background: '#dcfce7', color: '#059669'}}>{p.total_sold}</span>
              </div>
            )) : <div className="text-muted mt-3 text-center">Chưa có dữ liệu</div>}
          </div>
        </div>
      </div>
    </>
  );
};

export default DashboardFullWidth;