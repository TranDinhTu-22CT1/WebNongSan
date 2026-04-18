import React, { useState, useEffect } from 'react';
import { 
  BarChart3, Award, AlertTriangle, 
  Calendar, Download, ArrowUpRight, ArrowDownRight
} from 'lucide-react';
import { 
  XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, AreaChart, Area 
} from 'recharts';

const ReportManagement = () => {
  const [timeRange, setTimeRange] = useState('week');
  const [loading, setLoading] = useState(true);
  
  // State lưu trữ dữ liệu thực từ API
  const [data, setData] = useState({
    overview: { total_revenue: 0, revenue_growth: 0, total_orders: 0, order_growth: 0, cancel_rate: 0, new_vendors: 0 },
    charts: { revenueData: [] },
    lists: { topProducts: [], vendorPerformance: [] }
  });

  // Hàm gọi API
  const fetchReportData = async (range) => {
    setLoading(true);
    try {
      // Đảm bảo URL này trỏ đúng vào file api_dashboard.php trên server XAMPP/PHP của bạn
      // VD: http://localhost/tên_thư_mục_của_bạn/api_dashboard.php
      const response = await fetch(`http://localhost/nongsan-api/report.php?timeRange=${range}`);
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

  // Gọi API mỗi khi timeRange thay đổi
  useEffect(() => {
    fetchReportData(timeRange);
  }, [timeRange]);

  // Hàm format tiền tệ VNĐ
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount || 0);
  };

  return (
    <div className="admin-reports-wrapper">
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      
      <style>{`
        .admin-reports-wrapper { padding: 40px; background: #f4f7fe; min-height: 100vh; font-family: 'Inter', sans-serif; color: #1b2559; }
        
        /* CONTAINER TRẮNG DUY NHẤT */
        .master-report-card {
          background: #ffffff;
          border-radius: 35px;
          padding: 40px;
          box-shadow: 0 20px 50px rgba(0,0,0,0.04);
          max-width: 1400px;
          margin: 0 auto;
          border: 1px solid #fff;
          transition: opacity 0.3s;
        }

        .report-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 40px; }
        .header-title h1 { font-size: 32px; font-weight: 800; letter-spacing: -1.2px; margin: 0; }
        
        /* TỔNG QUAN NHANH (CARDS) */
        .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin-bottom: 40px; }
        .stat-box { background: #f4f7fe; padding: 25px; border-radius: 24px; border: 1px solid #eef2f8; transition: 0.3s; }
        .stat-box:hover { transform: translateY(-5px); background: #fff; box-shadow: 0 15px 30px rgba(0,0,0,0.05); border-color: #4318ff; }
        .stat-label { color: #a3aed0; font-size: 13px; font-weight: 700; text-transform: uppercase; margin-bottom: 10px; display: block; }
        .stat-value { font-size: 24px; font-weight: 800; color: #1b2559; }
        .stat-change { font-size: 12px; font-weight: 700; display: flex; align-items: center; gap: 4px; margin-top: 5px; }

        /* KHỐI BIỂU ĐỒ & DANH SÁCH */
        .content-grid { display: grid; grid-template-columns: 1.8fr 1fr; gap: 30px; }
        .chart-section { background: #ffffff; border: 2px solid #f4f7fe; border-radius: 28px; padding: 25px; }
        .list-section { background: #f8fafc; border-radius: 28px; padding: 25px; border: 1px solid #eef2f8; }

        .section-h { font-size: 18px; font-weight: 800; margin-bottom: 20px; display: flex; align-items: center; gap: 10px; }

        /* TABLE MINI */
        .mini-table { width: 100%; border-collapse: collapse; }
        .mini-table th { text-align: left; font-size: 11px; color: #a3aed0; padding: 10px; text-transform: uppercase; }
        .mini-table td { padding: 12px 10px; font-size: 13px; font-weight: 700; border-bottom: 1px solid #eef2f8; }
        
        .grow-up { color: #10b981; }
        .grow-down { color: #e11d48; }
        .status-kem { background: #fff1f2; color: #e11d48; padding: 4px 8px; border-radius: 6px; font-size: 10px; }
        .loading-overlay { opacity: 0.5; pointer-events: none; transition: opacity 0.2s ease-in-out; }
        
        /* Responsive cơ bản */
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
            <p style={{ color: '#a3aed0', fontWeight: 500 }}>Phân tích dữ liệu tăng trưởng của hệ thống</p>
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
              <Download size={18} /> Xuất PDF
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
            <div className="stat-value">{data.overview.cancel_rate}%</div>
            <div className="stat-change grow-down">
              <span style={{color:'#a3aed0'}}>Dựa trên tổng đơn hàng</span>
            </div>
          </div>
          <div className="stat-box">
            <span className="stat-label">Vendor đang hoạt động</span>
            <div className="stat-value">{data.overview.new_vendors}</div>
            <div className="stat-change grow-up">
              <span style={{color:'#a3aed0'}}>Trong khoảng thời gian này</span>
            </div>
          </div>
        </div>

        {/* 2. KHỐI NỘI DUNG CHI TIẾT */}
        <div className="content-grid">
          
          {/* BIỂU ĐỒ DOANH THU THEO NGÀY */}
          <div className="chart-section">
            <div className="section-h"><BarChart3 size={20} color="#4318ff" /> Biểu đồ doanh thu</div>
            <div style={{ width: '100%', height: 350 }}>
              {data.charts.revenueData.length > 0 ? (
                <ResponsiveContainer>
                  <AreaChart data={data.charts.revenueData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#4318ff" stopOpacity={0.1}/>
                        <stop offset="95%" stopColor="#4318ff" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f4f9" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#a3aed0', fontSize: 12, fontWeight: 600}} dy={10} />
                    <YAxis hide />
                    <Tooltip 
                      contentStyle={{ borderRadius: '15px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}
                      formatter={(value) => [formatCurrency(value), "Doanh thu"]}
                      labelStyle={{ color: '#1b2559', fontWeight: 'bold' }}
                    />
                    <Area type="monotone" dataKey="total" stroke="#4318ff" strokeWidth={4} fillOpacity={1} fill="url(#colorTotal)" />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div style={{display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center', color: '#a3aed0', fontWeight: 600}}>
                  Chưa có dữ liệu giao dịch trong khoảng thời gian này
                </div>
              )}
            </div>
          </div>

          {/* TOP SẢN PHẨM & HIỆU SUẤT VENDOR */}
          <div className="list-section">
            <div className="section-h"><Award size={20} color="#f59e0b" /> Top sản phẩm bán chạy</div>
            <table className="mini-table">
              <thead>
                <tr>
                  <th>Sản phẩm</th>
                  <th>Số lượng</th>
                  <th>Xu hướng</th>
                </tr>
              </thead>
              <tbody>
                {data.lists.topProducts.map((p, i) => (
                  <tr key={i}>
                    <td style={{ color: '#1b2559' }}>{p.name}</td>
                    <td>{p.sales} <span style={{fontSize:11, color:'#a3aed0'}}></span></td>
                    <td className={p.grow > 0 ? 'grow-up' : (p.grow < 0 ? 'grow-down' : '')}>
                      {p.grow > 0 ? `+${p.grow}%` : `${p.grow}%`}
                    </td>
                  </tr>
                ))}
                {data.lists.topProducts.length === 0 && (
                  <tr><td colSpan="3" style={{textAlign:'center', padding: '20px 0', color: '#a3aed0'}}>Không có dữ liệu</td></tr>
                )}
              </tbody>
            </table>

            <div className="section-h" style={{ marginTop: '35px' }}><AlertTriangle size={20} color="#e11d48" /> Hiệu suất Vendor</div>
            <table className="mini-table">
              <thead>
                <tr>
                  <th>Vendor</th>
                  <th>Đơn hàng</th>
                  <th>Đánh giá</th>
                </tr>
              </thead>
              <tbody>
                {data.lists.vendorPerformance.map((v, i) => (
                  <tr key={i}>
                    <td>
                      <div style={{ color: '#1b2559' }}>{v.name}</div>
                      {v.status === 'Kém' && <span className="status-kem">Cần cảnh báo</span>}
                    </td>
                    <td>{v.orders}</td>
                    <td style={{ color: v.rate.includes('9') || v.rate.includes('8') ? '#10b981' : (v.status === 'Kém' ? '#e11d48' : '#1b2559') }}>
                      {v.rate}
                    </td>
                  </tr>
                ))}
                {data.lists.vendorPerformance.length === 0 && (
                  <tr><td colSpan="3" style={{textAlign:'center', padding: '20px 0', color: '#a3aed0'}}>Không có dữ liệu vendor</td></tr>
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