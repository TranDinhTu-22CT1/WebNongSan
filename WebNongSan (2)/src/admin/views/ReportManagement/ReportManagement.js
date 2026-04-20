import React, { useState, useEffect } from 'react';
import { 
  BarChart3, Award, AlertTriangle, Users,
  Calendar, Download, ArrowUpRight, ArrowDownRight, Crown
} from 'lucide-react';
import { 
  XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, AreaChart, Area 
} from 'recharts';
import { API_BASE } from 'src/config';

const ReportManagement = () => {
  const [timeRange, setTimeRange] = useState('week');
  const [loading, setLoading] = useState(true);
  
  const [data, setData] = useState({
    overview: { total_revenue: 0, revenue_growth: 0, total_orders: 0, order_growth: 0, cancel_rate: 0, total_customers: 0 },
    charts: { revenueData: [] },
    lists: { topProducts: [], topCustomers: [] }
  });

  const fetchReportData = async (range) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/report.php?timeRange=${range}`);
      const result = await response.json();
      
      if (result.status === 'success') {
        setData(result);
      } else {
        console.error("Lỗi từ server:", result.message);
      }
    } catch (error) {
      console.error("Lỗi khi tải dữ liệu:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReportData(timeRange);
  }, [timeRange]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount || 0);
  };

  return (
    <div className="admin-reports-wrapper">
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      
      <style>{`
        .admin-reports-wrapper { padding: 40px; background: #f4f7fe; min-height: 100vh; font-family: 'Inter', sans-serif; color: #1b2559; }
        
        .master-report-card {
          background: #ffffff; border-radius: 35px; padding: 40px;
          box-shadow: 0 20px 50px rgba(0,0,0,0.04); max-width: 1400px;
          margin: 0 auto; transition: opacity 0.3s;
        }

        .report-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 40px; }
        .header-title h1 { font-size: 32px; font-weight: 800; letter-spacing: -1.2px; margin: 0; }
        
        /* TỔNG QUAN NHANH (CARDS) */
        .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin-bottom: 40px; }
        .stat-box { background: #f4f7fe; padding: 25px; border-radius: 24px; border: 1px solid #eef2f8; transition: 0.3s; position: relative; overflow: hidden; }
        .stat-box:hover { transform: translateY(-5px); background: #fff; box-shadow: 0 15px 30px rgba(0,0,0,0.05); border-color: #4318ff; }
        .stat-label { color: #a3aed0; font-size: 13px; font-weight: 700; text-transform: uppercase; margin-bottom: 10px; display: block; }
        .stat-value { font-size: 26px; font-weight: 800; color: #1b2559; }
        .stat-change { font-size: 12px; font-weight: 700; display: flex; align-items: center; gap: 4px; margin-top: 8px; }

        /* KHỐI BIỂU ĐỒ & DANH SÁCH */
        .content-grid { display: grid; grid-template-columns: 1.8fr 1fr; gap: 30px; }
        .chart-section { background: #ffffff; border: 2px solid #f4f7fe; border-radius: 28px; padding: 30px 25px 20px; box-shadow: 0 10px 30px rgba(0,0,0,0.02); }
        .list-section { background: #f8fafc; border-radius: 28px; padding: 25px; border: 1px solid #eef2f8; }

        .section-h { font-size: 18px; font-weight: 800; margin-bottom: 25px; display: flex; align-items: center; gap: 10px; }

        /* TABLE MINI */
        .mini-table { width: 100%; border-collapse: collapse; }
        .mini-table th { text-align: left; font-size: 11px; color: #a3aed0; padding: 10px; text-transform: uppercase; }
        .mini-table td { padding: 14px 10px; font-size: 14px; font-weight: 600; border-bottom: 1px solid #eef2f8; }
        .mini-table tr:hover td { background: #fff; }
        
        .grow-up { color: #10b981; }
        .grow-down { color: #e11d48; }
        .status-vip { background: #fef3c7; color: #d97706; padding: 4px 8px; border-radius: 6px; font-size: 11px; font-weight: 800; display: inline-flex; align-items: center; gap: 4px; }
        .loading-overlay { opacity: 0.6; pointer-events: none; transition: opacity 0.2s ease-in-out; }
        
        /* Custom Tooltip Chart */
        .custom-tooltip { background: rgba(255, 255, 255, 0.95); border-radius: 12px; padding: 15px; box-shadow: 0 10px 25px rgba(0,0,0,0.1); border: 1px solid #eef2f8; }
        .custom-tooltip .label { font-weight: 800; color: #a3aed0; font-size: 12px; margin-bottom: 5px; }
        .custom-tooltip .value { font-weight: 800; color: #4318ff; font-size: 16px; }

        @media (max-width: 1024px) {
          .stats-grid { grid-template-columns: repeat(2, 1fr); }
          .content-grid { grid-template-columns: 1fr; }
        }
        @media (max-width: 640px) {
          .stats-grid { grid-template-columns: 1fr; }
          .report-header { flex-direction: column; align-items: flex-start; gap: 20px; }
        }
      `}</style>

      <div className={`master-report-card ${loading ? 'loading-overlay' : ''}`}>
        {/* HEADER */}
        <div className="report-header">
          <div className="header-title">
            <h1>Báo cáo & Thống kê</h1>
            <p style={{ color: '#a3aed0', fontWeight: 500 }}>Phân tích dữ liệu tăng trưởng của cửa hàng</p>
          </div>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <div style={{ background: '#f4f7fe', padding: '10px 15px', borderRadius: '15px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Calendar size={18} color="#4318ff" />
              <select 
                style={{ background: 'transparent', border: 'none', fontWeight: 700, color: '#1b2559', outline: 'none', cursor: 'pointer' }} 
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
              >
                <option value="week">7 ngày qua</option>
                <option value="month">Tháng này</option>
                <option value="year">Năm nay</option>
              </select>
            </div>
            <button style={{ background: '#1b2559', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '15px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
              <Download size={18} /> Xuất báo cáo
            </button>
          </div>
        </div>

        {/* 1. TỔNG QUAN 4 CHỈ SỐ CHÍNH */}
        <div className="stats-grid">
          <div className="stat-box">
            <span className="stat-label">Tổng Doanh Thu</span>
            <div className="stat-value">{formatCurrency(data.overview.total_revenue)}</div>
            <div className={`stat-change ${data.overview.revenue_growth >= 0 ? 'grow-up' : 'grow-down'}`}>
              {data.overview.revenue_growth >= 0 ? <ArrowUpRight size={14}/> : <ArrowDownRight size={14}/>} 
              {Math.abs(data.overview.revenue_growth)}% <span style={{color:'#a3aed0'}}>vs kỳ trước</span>
            </div>
          </div>
          <div className="stat-box">
            <span className="stat-label">Lượng Đơn Hàng</span>
            <div className="stat-value">{data.overview.total_orders}</div>
            <div className={`stat-change ${data.overview.order_growth >= 0 ? 'grow-up' : 'grow-down'}`}>
              {data.overview.order_growth >= 0 ? <ArrowUpRight size={14}/> : <ArrowDownRight size={14}/>} 
              {Math.abs(data.overview.order_growth)}% <span style={{color:'#a3aed0'}}>vs kỳ trước</span>
            </div>
          </div>
          <div className="stat-box">
            <span className="stat-label">Tỉ lệ Hủy đơn</span>
            <div className="stat-value" style={{ color: data.overview.cancel_rate > 10 ? '#e11d48' : '#1b2559' }}>{data.overview.cancel_rate}%</div>
            <div className="stat-change" style={{ color: '#a3aed0' }}>
              Dựa trên tổng đơn hàng
            </div>
          </div>
          <div className="stat-box">
            <span className="stat-label">Số Khách Hàng</span>
            <div className="stat-value" style={{ color: '#4318ff' }}>{data.overview.total_customers}</div>
            <div className="stat-change grow-up">
              <span style={{color:'#a3aed0'}}>Phát sinh giao dịch</span>
            </div>
            <Users size={40} color="#f4f7fe" style={{ position: 'absolute', right: -5, bottom: -5, opacity: 0.5, transform: 'scale(1.5)' }} />
          </div>
        </div>

        {/* 2. KHỐI NỘI DUNG CHI TIẾT */}
        <div className="content-grid">
          
          {/* BIỂU ĐỒ DOANH THU THEO NGÀY */}
          <div className="chart-section">
            <div className="section-h"><BarChart3 size={22} color="#4318ff" /> Biểu đồ doanh thu sinh động</div>
            <div style={{ width: '100%', height: 350, minWidth: 0, minHeight: 350 }}>
              {data.charts.revenueData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={320}>
                  <AreaChart data={data.charts.revenueData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#4318ff" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#4318ff" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#e2e8f0" opacity={0.6} />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#a3aed0', fontSize: 12, fontWeight: 700}} dy={15} />
                    <YAxis hide />
                    <Tooltip 
                      content={({ active, payload, label }) => {
                        if (active && payload && payload.length) {
                          return (
                            <div className="custom-tooltip">
                              <div className="label">Ngày {label}</div>
                              <div className="value">{formatCurrency(payload[0].value)}</div>
                            </div>
                          );
                        }
                        return null;
                      }}
                      cursor={{ stroke: '#cbd5e1', strokeWidth: 1, strokeDasharray: '4 4' }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="total" 
                      stroke="#4318ff" 
                      strokeWidth={4} 
                      fillOpacity={1} 
                      fill="url(#colorTotal)" 
                      activeDot={{ r: 6, fill: '#4318ff', stroke: '#fff', strokeWidth: 3 }}
                      animationDuration={1500}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div style={{display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center', color: '#a3aed0', fontWeight: 600}}>
                  Chưa có dữ liệu giao dịch trong khoảng thời gian này
                </div>
              )}
            </div>
          </div>

          {/* TOP SẢN PHẨM & KHÁCH HÀNG VIP */}
          <div className="list-section">
            <div className="section-h"><Award size={22} color="#10b981" /> Top Sản phẩm bán chạy trong 7 ngày</div>
            <table className="mini-table">
              <thead>
                <tr>
                  <th>Sản phẩm</th>
                  <th>Số lượng</th>
                  <th style={{ textAlign: 'right' }}>Tăng trưởng</th>
                </tr>
              </thead>
              <tbody>
                {data.lists.topProducts.map((p, i) => (
                  <tr key={i}>
                    <td style={{ color: '#1b2559' }}>{p.name}</td>
                    <td><span style={{ background: '#f4f7fe', padding: '4px 10px', borderRadius: '8px', color: '#4318ff' }}>{p.sales}</span></td>
                    <td style={{ textAlign: 'right' }} className={p.grow > 0 ? 'grow-up' : (p.grow < 0 ? 'grow-down' : '')}>
                      {p.grow > 0 ? `+${p.grow}%` : `${p.grow}%`}
                    </td>
                  </tr>
                ))}
                {data.lists.topProducts.length === 0 && (
                  <tr><td colSpan="3" style={{textAlign:'center', padding: '20px 0', color: '#a3aed0'}}>Không có dữ liệu</td></tr>
                )}
              </tbody>
            </table>

            <div className="section-h" style={{ marginTop: '40px' }}><Users size={22} color="#f59e0b" /> Top Khách hàng VIP</div>
            <table className="mini-table">
              <thead>
                <tr>
                  <th>Khách hàng</th>
                  <th>Đơn hàng</th>
                  <th style={{ textAlign: 'right' }}>Tổng chi tiêu</th>
                </tr>
              </thead>
              <tbody>
                {data.lists.topCustomers.map((c, i) => (
                  <tr key={i}>
                    <td>
                      <div style={{ color: '#1b2559', display: 'flex', alignItems: 'center', gap: '5px' }}>
                        {i === 0 && <Crown size={14} color="#f59e0b" />}
                        {c.name}
                      </div>
                    </td>
                    <td>{c.orders}</td>
                    <td style={{ textAlign: 'right', color: '#10b981', fontWeight: 800 }}>
                      {formatCurrency(c.total_spent)}
                    </td>
                  </tr>
                ))}
                {data.lists.topCustomers.length === 0 && (
                  <tr><td colSpan="3" style={{textAlign:'center', padding: '20px 0', color: '#a3aed0'}}>Chưa có giao dịch</td></tr>
                )}
              </tbody>
            </table>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ReportManagement;