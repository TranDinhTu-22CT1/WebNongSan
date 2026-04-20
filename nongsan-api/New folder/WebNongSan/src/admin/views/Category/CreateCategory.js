import React, { useState, useEffect } from 'react';
import { Trash2, FolderTree } from 'lucide-react';
import { API_BASE } from 'src/config';

const API_URL = `${API_BASE}/handle_categories.php`;

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

const CreateCategory = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Tách riêng 2 state: 1 cho bảng danh sách, 1 cho dropdown danh mục cha
  const [categoriesList, setCategoriesList] = useState([]); 
  const [parentsList, setParentsList] = useState([]); 

  const [category, setCategory] = useState({
    name: '',
    slug: '',
    parentId: '0',
    description: '',
    status: 'active',
    displayOrder: 0
  });

  // Fetch dữ liệu khi load trang
  const fetchData = async () => {
    try {
      // 1. Lấy danh sách đầy đủ cho Bảng (dùng action=list có LEFT JOIN parent_name)
      const resList = await fetch(`${API_URL}?action=list`);
      const resultList = await resList.json();
      if (resultList.status === 'success') {
        setCategoriesList(resultList.data);
      }

      // 2. Lấy danh sách active cho Dropdown (dùng action=list_parents)
      const resParents = await fetch(`${API_URL}?action=list_parents`);
      const resultParents = await resParents.json();
      if (resultParents.status === 'success') {
        setParentsList(resultParents.data);
      }
    } catch (err) {
      console.error("Lỗi lấy dữ liệu API:", err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const generateSlug = () => {
    const name = category.name;
    const slug = name.toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[đĐ]/g, 'd')
      .replace(/[^\w ]+/g, '')
      .replace(/ +/g, '-');
    
    setCategory({ ...category, slug });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCategory({ ...category, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const submitData = {
      action: 'create',
      ...category,
      parentId: category.parentId === '0' ? null : parseInt(category.parentId)
    };
    
    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(submitData)
      });
      
      const result = await res.json();
      
      if (result.status === 'success') {
        alert('Tạo danh mục thành công!');
        setCategory({
          name: '', slug: '', parentId: '0', description: '', status: 'active', displayOrder: 0
        });
        fetchData(); // Load lại cả 2 danh sách ngay lập tức
      } else {
        alert('Lỗi: ' + result.message);
      }
    } catch (err) {
      alert('Không thể kết nối đến máy chủ API!');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Hàm XÓA danh mục
  const handleDelete = async (id, name) => {
    if(!window.confirm(`Bạn có chắc chắn muốn xóa danh mục "${name}" không?`)) return;
    
    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ action: 'delete', id: id })
      });
      const result = await res.json();
      
      if (result.status === 'success') {
        fetchData(); // Load lại bảng
      } else {
        alert("Lỗi xóa: " + result.message);
      }
    } catch (err) {
      alert('Lỗi kết nối API!');
    }
  };

  // --- STYLES ---
  const s = {
    wrapper: { padding: '30px', minHeight: '100vh', fontFamily: '"Inter", sans-serif', backgroundColor: '#f8fafc', display: 'flex', flexDirection: 'column', gap: '30px', alignItems: 'center' },
    card: { width: '100%', maxWidth: '800px', backgroundColor: '#ffffff', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0, 0, 0, 0.03)', padding: '35px', color: '#1e293b' },
    title: { fontSize: '22px', fontWeight: '800', color: '#0f172a', marginBottom: '30px', display: 'flex', alignItems: 'center', gap: '10px' },
    grid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' },
    group: { display: 'flex', flexDirection: 'column', gap: '8px' },
    label: { fontSize: '13px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' },
    input: { padding: '12px 15px', borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '15px', outline: 'none', transition: 'all 0.2s', backgroundColor: '#f8fafc', color: '#0f172a' },
    slugWrapper: { display: 'flex', gap: '10px' },
    btnSlug: { padding: '0 15px', backgroundColor: '#f1f5f9', color: '#475569', border: 'none', borderRadius: '10px', cursor: 'pointer', fontSize: '13px', fontWeight: '600', transition: '0.2s' },
    footer: { marginTop: '35px', display: 'flex', justifyContent: 'flex-end' },
    btnSave: { backgroundColor: '#3b82f6', color: '#ffffff', border: 'none', padding: '14px 40px', borderRadius: '12px', fontSize: '15px', fontWeight: '700', cursor: 'pointer', boxShadow: '0 4px 12px rgba(59, 130, 246, 0.2)', transition: '0.2s' },
    radioLabel: { display: 'flex', alignItems: 'center', gap: '8px', fontSize: '15px', cursor: 'pointer', color: '#334155', fontWeight: '500' },
    
    // Bảng danh sách
    table: { width: '100%', borderCollapse: 'collapse', marginTop: '10px' },
    th: { textAlign: 'left', padding: '15px', borderBottom: '2px solid #e2e8f0', color: '#64748b', fontSize: '13px', fontWeight: '700', textTransform: 'uppercase' },
    td: { padding: '15px', borderBottom: '1px solid #f1f5f9', color: '#334155', fontSize: '15px', verticalAlign: 'middle' },
    btnDelete: { background: '#fef2f2', color: '#ef4444', border: 'none', padding: '8px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: '0.2s' }
  };

  return (
    <div style={s.wrapper}>
      {/* KHỐI 1: FORM TẠO DANH MỤC */}
      <div style={s.card}>
        <h2 style={s.title}><FolderTree size={24} color="#3b82f6" /> Tạo Danh Mục Mới</h2>
        
        <form onSubmit={handleSubmit}>
          <div style={s.grid}>
            <div style={{ ...s.group, gridColumn: 'span 2' }}>
              <label style={s.label}>Tên danh mục</label>
              <input type="text" name="name" placeholder="Ví dụ: Trái cây nhập khẩu" value={category.name} onChange={handleInputChange} style={s.input} required />
            </div>

            <div style={{ ...s.group, gridColumn: 'span 2' }}>
              <label style={s.label}>Đường dẫn tĩnh (Slug)</label>
              <div style={s.slugWrapper}>
                <input type="text" name="slug" placeholder="trai-cay-nhap-khau" value={category.slug} onChange={handleInputChange} style={{ ...s.input, flex: 1 }} required />
                <button type="button" onClick={generateSlug} style={s.btnSlug}>Tạo tự động</button>
              </div>
            </div>

            <div style={s.group}>
              <label style={s.label}>Danh mục cha</label>
              <select name="parentId" value={category.parentId} onChange={handleInputChange} style={{...s.input, backgroundColor: '#fff', cursor: 'pointer'}}>
                <option value="0">--- Cấp cao nhất ---</option>
                {/* Lấy từ parentsList thay vì categoriesList */}
                {parentsList.map(cat => (
                  <option key={cat.id} value={cat.id}>
                    {cat.parent_id ? '— ' : ''} {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div style={s.group}>
              <label style={s.label}>Thứ tự hiển thị</label>
              <input type="number" name="displayOrder" value={category.displayOrder} onChange={handleInputChange} style={s.input} />
            </div>
          </div>

          <div style={{ ...s.group, marginTop: '20px' }}>
            <label style={s.label}>Trạng thái</label>
            <div style={{ display: 'flex', gap: '30px', marginTop: '5px' }}>
              <label style={s.radioLabel}><input type="radio" name="status" value="active" checked={category.status === 'active'} onChange={handleInputChange} /> Hiện trên web</label>
              <label style={s.radioLabel}><input type="radio" name="status" value="hidden" checked={category.status === 'hidden'} onChange={handleInputChange} /> Tạm ẩn</label>
            </div>
          </div>

          <div style={s.footer}>
            <button type="submit" style={s.btnSave} disabled={isSubmitting}>
              {isSubmitting ? 'ĐANG LƯU...' : 'LƯU DANH MỤC'}
            </button>
          </div>
        </form>
      </div>

      {/* KHỐI 2: DANH SÁCH DANH MỤC */}
      <div style={s.card}>
        <h2 style={s.title}>Danh Sách Danh Mục Hiện Có</h2>
        {categoriesList.length === 0 ? (
          <p style={{ color: '#94a3b8', textAlign: 'center', padding: '20px' }}>Chưa có danh mục nào.</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={s.table}>
              <thead>
                <tr>
                  <th style={s.th}>ID</th>
                  <th style={s.th}>Tên danh mục</th>
                  <th style={s.th}>Danh mục cha</th>
                  <th style={s.th}>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {categoriesList.map((cat) => {
                  // Sử dụng trực tiếp trường parent_name do PHP nối bảng trả về
                  const parentNameDisplay = cat.parent_id 
                    ? (cat.parent_name || `ID: ${cat.parent_id}`)
                    : <span style={{ color: '#10b981', fontWeight: '700', fontSize: '12px', background: '#d1fae5', padding: '4px 8px', borderRadius: '6px' }}>Cấp cao nhất</span>;

                  return (
                    <tr key={cat.id}>
                      <td style={{ ...s.td, fontWeight: '600', color: '#94a3b8' }}>#{cat.id}</td>
                      <td style={{ ...s.td, fontWeight: '600' }}>{cat.name}</td>
                      <td style={s.td}>{parentNameDisplay}</td>
                      <td style={s.td}>
                        <button 
                          onClick={() => handleDelete(cat.id, cat.name)} 
                          style={s.btnDelete} 
                          title="Xóa danh mục"
                          onMouseOver={e => e.currentTarget.style.background = '#fecaca'}
                          onMouseOut={e => e.currentTarget.style.background = '#fef2f2'}
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <style>{`
        :where(input, select, textarea, div, h2, label, button) { color-scheme: light; }
        input:focus, select:focus, textarea:focus { border-color: #3b82f6 !important; background-color: #fff !important; box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1); }
        button:active { transform: scale(0.97); }
        ::placeholder { color: #94a3b8; opacity: 1; font-weight: 400; }
      `}</style>
    </div>
  );
};

export default CreateCategory;