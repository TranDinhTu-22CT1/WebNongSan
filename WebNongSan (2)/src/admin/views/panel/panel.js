import React, { useState, useEffect } from 'react';
import { 
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';
import { 
  DollarSign, ShoppingCart, Users, Clock, AlertCircle, TrendingUp, Package, Crown 
} from 'lucide-react';
import { API_BASE as API_BASE_URL } from 'src/config';

const DashboardFullWidth = () => {
  const [data, setData] = useState({
    overview: { todayRevenue: 0, todayOrders: 0, totalCustomers: 0, newCustomers: 0 },
    charts: { revenue: [], orders: [] },
    pending: { customers: 0, orders: 0, disputes: 0 },
    topCustomers: [],
    topProducts: []
  });

  const [loading, setLoading] = useState(true);

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

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('vi-VN').format(value);
  };

  if (loading) return <div style={{ padding: 100, textAlign: 'center', color: '#4318ff', fontWeight: 800 }}>ĐANG TẢI DỮ LIỆU HỆ THỐNG...</div>;

  return (
    <div className="dashboard-wrapper">
      <style>{`
        .dashboard-wrapper { padding: 25px; background: #f4f7fe; min-height: 100vh; font-family: 'Inter', sans-serif; }
        .dashboard-title { color: #1b2559; margin-bottom: 30px; font-size: 26px; font-weight: 800; letter-spacing: -1px; }
        .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 20px; margin-bottom: 30px; }
        .stat-card { background: white; padding: 25px; border-radius: 25px; display: flex; align-items: center; gap: 20px; box-shadow: 0 10px 30px rgba(0,0,0,0.02); transition: 0.3s; }
        .stat-card:hover { transform: translateY(-5px); box-shadow: 0 15px 35px rgba(0,0,0,0.05); }
        .icon-circle { width: 55px; height: 55px; border-radius: 18px; display: flex; align-items: center; justify-content: center; }
        .bg-blue { background: #e0e7ff; color: #4318ff; }
        .bg-green { background: #dcfce7; color: #059669; }
        .bg-purple { background: #f3e8ff; color: #7c3aed; }
        .bg-orange { background: #ffedd5; color: #d97706; }
        .stat-label { color: #a3aed0; font-size: 13px; font-weight: 700; text-transform: uppercase; margin-bottom: 5px; display: block; }
        .stat-value { font-size: 22px; font-weight: 800; color: #1b2559; margin: 0; }
        .chart-row { background: white; padding: 30px; border-radius: 30px; margin-bottom: 30px; box-shadow: 0 10px 30px rgba(0,0,0,0.02); }
        .chart-header { font-size: 17px; font-weight: 800; color: #1b2559; margin-bottom: 25px; display: flex; align-items: center; gap: 10px; }
        .bottom-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 25px; }
        .list-card { background: white; padding: 25px; border-radius: 25px; box-shadow: 0 10px 30px rgba(0,0,0,0.02); }
        .item-row { display: flex; justify-content: space-between; align-items: center; padding: 15px 0; border-bottom: 1px solid #f4f7fe; }
        .badge-count { background: #f4f7fe; color: #4318ff; padding: 5px 12px; border-radius: 10px; font-weight: 800; font-size: 12px; }
      `}</style>

      <h2 className="dashboard-title">Tổng quan Quản trị</h2>

      {/* THẺ CHỈ SỐ BIẾN ĐỔI */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="icon-circle bg-blue"><DollarSign size={26}/></div>
          <div><span className="stat-label">Doanh thu (Hôm nay)</span><p className="stat-value">{formatCurrency(data.overview.todayRevenue)}đ</p></div>
        </div>
        <div className="stat-card">
          <div className="icon-circle bg-green"><ShoppingCart size={26}/></div>
          <div><span className="stat-label">Đơn thành công</span><p className="stat-value">{data.overview.todayOrders} đơn</p></div>
        </div>
        <div className="stat-card">
          <div className="icon-circle bg-purple"><Users size={26}/></div>
          <div><span className="stat-label">Tổng khách hàng</span><p className="stat-value">{data.overview.totalCustomers}</p></div>
        </div>
        <div className="stat-card">
          <div className="icon-circle bg-orange"><TrendingUp size={26}/></div>
          <div><span className="stat-label">Khách hàng mới (Hôm nay)</span><p className="stat-value">+{data.overview.newCustomers}</p></div>
        </div>
      </div>

      {/* BIỂU ĐỒ DOANH THU */}
      <div className="chart-row">
        <div className="chart-header"><TrendingUp size={20} color="#4318ff"/> Hiệu suất doanh thu (7 ngày)</div>
        <div style={{ width: '100%', height: 350 }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data.charts.revenue}>
              <defs>
                <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4318ff" stopOpacity={0.15}/>
                  <stop offset="95%" stopColor="#4318ff" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f1f1" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#a3aed0', fontWeight: 600}} />
              <YAxis hide />
              <Tooltip formatter={(v) => formatCurrency(v) + "đ"} />
              <Area type="monotone" dataKey="value" stroke="#4318ff" strokeWidth={4} fill="url(#colorRev)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* GRID CHI TIẾT */}
      <div className="bottom-grid">
        <div className="list-card">
          <h4 className="chart-header"><Clock size={20} color="#7c3aed"/> Cần xử lý</h4>
          <div className="item-row"><span>Đơn hàng chờ lấy</span><span className="badge-count">{data.pending.orders}</span></div>
        </div>

        <div className="list-card">
          <h4 className="chart-header"><Crown size={20} color="#f59e0b"/> Top 5 Khách hàng VIP</h4>
          {data.topCustomers.map((c, i) => (
            <div className="item-row" key={i}>
              <span style={{fontWeight: 700}}>{i+1}. {c.name}</span>
              <span style={{fontWeight: 800, color: '#4318ff'}}>{formatCurrency(c.total_spent)}đ</span>
            </div>
          ))}
        </div>

        <div className="list-card">
          <h4 className="chart-header"><Package size={20} color="#10b981"/> Sản phẩm bán chạy từ trước đến nay</h4>
          {data.topProducts.map((p, i) => (
            <div className="item-row" key={i}>
              <span className="text-truncate" style={{maxWidth: '70%', fontWeight: 600}}>{p.product_name}</span>
              <span className="badge-count" style={{background: '#dcfce7', color: '#059669'}}>{p.total_sold} món</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DashboardFullWidth;