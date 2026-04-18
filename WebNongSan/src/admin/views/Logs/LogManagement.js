import React, { useState, useEffect, useMemo } from 'react';
import { Search, RefreshCw, Clock, Activity, AlertTriangle } from 'lucide-react';

const API_LOG_URL = 'http://localhost/nongsan-api/logs/logs.php';

const LogManagement = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const parseLogLine = (line, index) => {
    // Ví dụ chuẩn:
    // ADMIN Admin (id 8) đã đăng nhập lúc 12:11 ngày 07/02/2026

    // Regex mềm – chịu được lỗi encoding nhẹ
    const regex =
      /^(ADMIN|VENDOR)\s+(.*?)\s+(đã|Ä‘Ă£)\s+(.*?)\s+(lúc|lĂºc)\s+(.*)$/i;

    const match = line.match(regex);

    // Nếu parse OK
    if (match) {
      return {
        id: index,
        role: match[1].toUpperCase(),
        user: match[2].trim(),
        action: `${match[3]} ${match[4]}`.trim(),
        time: match[6].trim()
      };
    }

    // Fallback – KHÔNG để mất dữ liệu
    const parts = line.split(' ');
    return {
      id: index,
      role: parts[0] || 'UNKNOWN',
      user: line,
      action: line,
      time: ''
    };
  };

  const fetchLogs = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(API_LOG_URL, { cache: 'no-store' });
      if (!response.ok) {
        throw new Error(`Không thể truy cập file (HTTP ${response.status})`);
      }

      const text = await response.text();

      if (!text.trim()) {
        setLogs([]);
        return;
      }

      const lines = text
        .split('\n')
        .map(l => l.trim())
        .filter(Boolean);

      const parsed = lines
        .map((line, index) => parseLogLine(line, index))
        .reverse();

      setLogs(parsed);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const filteredLogs = useMemo(() => {
    const q = searchTerm.toLowerCase();
    return logs.filter(
      log =>
        log.user.toLowerCase().includes(q) ||
        log.action.toLowerCase().includes(q)
    );
  }, [logs, searchTerm]);

  return (
    <div className="log-container">
      <style>{`
        .log-container { padding: 40px; background: #f4f7fe; min-height: 100vh; font-family: Inter, sans-serif; }
        .log-card { background: #fff; border-radius: 30px; padding: 35px; box-shadow: 0 20px 40px rgba(0,0,0,0.05); max-width: 1200px; margin: auto; }
        .status-badge { padding: 4px 12px; border-radius: 8px; font-size: 11px; font-weight: 800; }
        .ADMIN { background: #1b2559; color: #fff; }
        .VENDOR { background: #ffb547; color: #fff; }
        .error-box { background: #fff1f2; color: #e11d48; padding: 20px; border-radius: 15px; margin-bottom: 20px; font-weight: 600; display: flex; gap: 10px; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th, td { padding: 15px; border-bottom: 1px solid #f4f7fe; }
        th { color: #a3aed0; font-size: 13px; text-align: left; }
        td { font-size: 14px; }
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>

      <div className="log-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 25 }}>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: '#1b2559' }}>
            System Logs
          </h1>
          <button
            onClick={fetchLogs}
            style={{
              background: '#4318ff',
              color: '#fff',
              border: 'none',
              padding: '10px 20px',
              borderRadius: 12,
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            <RefreshCw
              size={18}
              className={loading ? 'spin' : ''}
              style={{ marginRight: 8, verticalAlign: 'middle' }}
            />
            Làm mới
          </button>
        </div>

        {error && (
          <div className="error-box">
            <AlertTriangle size={20} />
            {error}
          </div>
        )}

        <div style={{ background: '#f4f7fe', padding: 12, borderRadius: 15, display: 'flex', alignItems: 'center' }}>
          <Search size={18} color="#a3aed0" />
          <input
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Tìm kiếm hành động..."
            style={{ border: 'none', outline: 'none', background: 'transparent', marginLeft: 10, width: '100%', fontWeight: 600 }}
          />
        </div>

        <table>
          <thead>
            <tr>
              <th>VAI TRÒ</th>
              <th>NGƯỜI DÙNG</th>
              <th>HÀNH ĐỘNG</th>
              <th>THỜI GIAN</th>
            </tr>
          </thead>
          <tbody>
            {filteredLogs.map(log => (
              <tr key={log.id}>
                <td><span className={`status-badge ${log.role}`}>{log.role}</span></td>
                <td style={{ fontWeight: 700 }}>{log.user}</td>
                <td>{log.action}</td>
                <td style={{ fontSize: 13, color: '#a3aed0' }}>
                  <Clock size={14} style={{ marginRight: 4 }} />
                  {log.time}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredLogs.length === 0 && !loading && (
          <div style={{ textAlign: 'center', padding: 40 }}>
            <Activity size={40} color="#a3aed0" />
            <p style={{ color: '#a3aed0', fontWeight: 600 }}>
              Không có dữ liệu hiển thị
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LogManagement;
