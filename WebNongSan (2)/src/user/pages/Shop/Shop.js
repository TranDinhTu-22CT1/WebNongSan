import React, { useState, useEffect, useMemo } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { FiChevronDown, FiChevronUp, FiStar, FiShoppingBag, FiMinus, FiPlus, FiGift } from 'react-icons/fi';
import { useCart } from '../../store/CartContext';
import { productsAPI } from '../../api/apiClient';
import { getStoredUser } from '../../utils/authStorage';
import { API_BASE } from 'src/config';
import './Shop.css';

const Shop = () => {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [searchParams] = useSearchParams();
  
  const [dbProducts, setDbProducts] = useState([]);
  const [dbCategories, setDbCategories] = useState([]); // State chứa Danh mục từ DB
  const [activeSales, setActiveSales] = useState([]);   // State chứa Khuyến mãi giá từ DB
  const [activeGiftSales, setActiveGiftSales] = useState([]); // State chứa Khuyến mãi quà tặng từ DB
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [category, setCategory] = useState("All");
  const [sortOrder, setSortOrder] = useState("default");
  const [isCategoryOpen, setIsCategoryOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [quantities, setQuantities] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 9;

  const user = getStoredUser();

  // Đồng bộ từ khóa tìm kiếm trên URL
  useEffect(() => {
    const paramSearch = searchParams.get('search') || '';
    setSearchQuery(paramSearch);
  }, [searchParams]);

  // --- 1. TẢI TẤT CẢ DỮ LIỆU CÙNG LÚC TỪ BACKEND ---
  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setLoading(true);
        let prodData;
        
        // 1. Lấy sản phẩm (hoặc tìm kiếm)
        if (searchQuery) {
          prodData = await productsAPI.search(searchQuery);
        } else {
          prodData = await productsAPI.getAll();
        }

        // 2. Lấy Danh mục và Ưu đãi (Sale)
        const [catRes, saleRes] = await Promise.all([
          fetch(`${API_BASE}/handle_categories.php?action=list_parents`).then(r => r.json()).catch(() => ({ data: [] })),
          fetch(`${API_BASE}/sale.php?action=list`).then(r => r.json()).catch(() => ({ data: [] }))
        ]);

        setDbProducts(Array.isArray(prodData) ? prodData : []);
        
        if (catRes.status === 'success') {
          setDbCategories(catRes.data || []);
        }

        if (saleRes.status === 'success') {
          // LỌC CHUẨN: Chỉ lấy Sale đang Active, áp dụng cho Cụ thể SP (product) và bỏ qua dạng Voucher
          const validProductSales = saleRes.data.filter(sale => 
            sale.status === 'Active' && 
            (sale.applyScope === 'product' || sale.apply_scope === 'product') &&
            sale.type !== 'Voucher'
          );
          setActiveSales(validProductSales);

          // LỌC SALE QUÀ TẶNG: Lấy các Sale áp dụng tặng quà
          const validGiftSales = saleRes.data.filter(sale => 
            sale.status === 'Active' && 
            (sale.applyScope === 'gift' || sale.apply_scope === 'gift')
          );
          setActiveGiftSales(validGiftSales);
        }

        setError(null);
      } catch (err) {
        console.error('Lỗi khi tải dữ liệu Shop:', err);
        const errorMessage = String(err.message || '').toLowerCase();
        if (errorMessage.includes('401') || errorMessage.includes('unauthorized')) {
            console.warn("Backend từ chối Token Firebase. Ẩn lỗi 401.");
            setError(null); 
        } else {
            setError('Đã xảy ra lỗi khi kết nối với máy chủ. Vui lòng thử lại sau.');
        }
        setDbProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, [searchQuery]);

  // --- 2. XỬ LÝ TÍNH TOÁN GIÁ KHUYẾN MÃI & QUÀ TẶNG THỰC TẾ ---
  const getProductWithRealDiscount = (product) => {
    let originalPrice = typeof product.price === 'string' ? parseFloat(product.price) : product.price;
    let finalPrice = originalPrice;
    let badgeText = null;
    let hasGift = false;

    // Kiểm tra Khuyến mãi giảm giá
    activeSales.forEach(sale => {
      const targetList = sale.targetItems || sale.target_items || "";
      const isTargeted = targetList.split(',').map(id => id.trim()).includes(String(product.id));

      if (isTargeted) {
        const discountVal = Number(sale.discount_value || sale.discount || 0);
        if (sale.type === 'Flash Sale' || sale.type === 'Discount') {
          const calculatedPrice = originalPrice * (1 - discountVal / 100);
          if (calculatedPrice < finalPrice) {
            finalPrice = calculatedPrice;
            badgeText = `-${discountVal}%`;
          }
        }
      }
    });

    // Kiểm tra Khuyến mãi tặng quà
    activeGiftSales.forEach(sale => {
      const targetList = sale.targetItems || sale.target_items || "";
      const isTargeted = targetList.split(',').map(id => id.trim()).includes(String(product.id));
      if (isTargeted) {
        hasGift = true;
      }
    });

    let image = product.image;
    if (!image && product.images && Array.isArray(product.images) && product.images.length > 0) {
      image = product.images[0];
    }
    if (!image) {
      image = 'https://via.placeholder.com/300x300?text=' + encodeURIComponent(product.name);
    }

    return {
      ...product,
      image: image,
      images: Array.isArray(product.images) ? product.images : [image],
      desc: product.description || product.desc || 'Chưa có mô tả',
      originalPrice,
      price: finalPrice, // Ghi đè giá gốc bằng giá đã giảm để Add To Cart hoạt động đúng
      hasDiscount: finalPrice < originalPrice,
      badgeText,
      hasGift // Thêm cờ nhận biết sản phẩm có quà tặng
    };
  };

  // Áp dụng định dạng và tính giảm giá/quà tặng cho tất cả sản phẩm
  const processedProducts = useMemo(() => {
    return dbProducts.map(getProductWithRealDiscount);
  }, [dbProducts, activeSales, activeGiftSales]);

  // --- 3. KHỞI TẠO DANH SÁCH CATEGORY TỪ DB ---
  const categories = [
    { id: 'All', name: 'Tất cả' },
    ...dbCategories.map(cat => ({
      id: cat.name, 
      name: cat.name
    }))
  ];

  // --- 4. LỌC VÀ SẮP XẾP SẢN PHẨM ---
  let filteredProducts = category === "All" 
    ? [...processedProducts] 
    : processedProducts.filter(p => p.category === category);

  filteredProducts.sort((a, b) => {
    if (sortOrder === "price-asc") {
      return a.price - b.price;
    } else if (sortOrder === "price-desc") {
      return b.price - a.price;
    } else {
      // Sắp xếp MẶC ĐỊNH: Đưa các sản phẩm đang có KHUYẾN MÃI lên đầu tiên
      if (a.hasDiscount && !b.hasDiscount) return -1;
      if (!a.hasDiscount && b.hasDiscount) return 1;
      return 0; // Giữ nguyên thứ tự nếu cùng trạng thái khuyến mãi
    }
  });

  // --- 5. XỬ LÝ PHÂN TRANG ---
  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / productsPerPage));
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * productsPerPage,
    currentPage * productsPerPage
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [category, sortOrder, searchQuery]);

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [currentPage, totalPages]);

  const currentCategoryName = categories.find(c => c.id === category)?.name || 'Sản phẩm';

  // --- XỬ LÝ SỐ LƯỢNG VÀ THÊM VÀO GIỎ ---
  const getProductQty = (productId) => {
    const saved = quantities[productId];
    return Number.isInteger(saved) && saved > 0 ? saved : 1;
  };

  const setProductQty = (productId, nextQty) => {
    const safeQty = Math.max(1, Number.parseInt(nextQty, 10) || 1);
    setQuantities((prev) => ({ ...prev, [productId]: safeQty }));
  };

  const handleAddToCart = (e, product) => {
    e.preventDefault();
    if (!user || (!user.id && !user.uid)) {
        alert("Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng!");
        navigate('/login?redirect=/shop');
        return;
    }
    
    // Gọi action addToCart với product đã được tính giá Khuyến mãi
    addToCart(product, getProductQty(product.id));
    alert("Đã thêm sản phẩm vào giỏ hàng!");
  };

  return (
    <div className="shop-container">
      <div className="shop-banner">
        <h1>{user ? `Chào ${user.name}, ` : ''}Cửa Hàng Nông Sản</h1>
        {searchQuery && <p style={{ marginTop: '10px', fontSize: '14px' }}>Kết quả tìm kiếm: "<strong>{searchQuery}</strong>"</p>}
        <p>Trang chủ / Cửa hàng</p>
      </div>

      {loading && (
        <div style={{textAlign: 'center', padding: '40px', color: '#666'}}>
          <p>Đang tải sản phẩm...</p>
        </div>
      )}

      {error && (
        <div style={{textAlign: 'center', padding: '40px', background: '#fff3cd', marginBottom: '20px', borderRadius: '8px'}}>
          <p style={{color: '#856404'}}>Lỗi: {error}</p>
        </div>
      )}

      {!loading && !error && (
      <div className="shop-content">
        
        {/* SIDEBAR DANH MỤC LẤY TỪ DATABASE */}
        <div className="sidebar">
          <h3 
            className="sidebar-title" 
            onClick={() => setIsCategoryOpen(!isCategoryOpen)}
          >
            Danh mục
            <span className="toggle-icon">
              {isCategoryOpen ? <FiChevronUp /> : <FiChevronDown />}
            </span>
          </h3>
          
          <div className={`category-list-wrapper ${isCategoryOpen ? 'open' : ''}`}>
            <ul className="category-list">
              {categories.map((cat) => (
                <li 
                  key={cat.id}
                  className={category === cat.id ? "active" : ""} 
                  onClick={() => setCategory(cat.id)}
                >
                  {cat.name}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="product-list-container">
            <div className="list-header">
              <h2 className="cat-title">{currentCategoryName}</h2>
              <div className="sort-container">
                <label htmlFor="sort">Sắp xếp theo: </label>
                <select 
                  id="sort" 
                  value={sortOrder} 
                  onChange={(e) => setSortOrder(e.target.value)}
                  className="sort-select"
                >
                  <option value="default">Mặc định (Ưu tiên Sale)</option>
                  <option value="price-asc">Giá: Thấp đến cao</option>
                  <option value="price-desc">Giá: Cao đến thấp</option>
                </select>
              </div>
            </div>
            <div className="results-summary">
              Hiển thị {filteredProducts.length === 0 ? 0 : (currentPage - 1) * productsPerPage + 1}
              -{Math.min(currentPage * productsPerPage, filteredProducts.length)} / {filteredProducts.length} sản phẩm
            </div>
            
            {filteredProducts.length > 0 ? (
              <>
              <div className="products-grid">
                  {paginatedProducts.map(product => (
                    <div key={product.id} className="modern-product-card">
                      
                      <div className="card-badges">
                        {product.hasDiscount && <span className="badge-discount">{product.badgeText}</span>}
                        {Number(product.stock) === 0 && <span className="badge-hot" style={{background: '#ef4444'}}>Hết hàng</span>}
                      </div>
                      
                      <Link to={`/product/${product.id}`} className="card-img-link">
                        <img 
                          src={product.image} 
                          alt={product.name} 
                          loading="lazy" 
                          decoding="async" 
                        />
                      </Link>
                      
                      <div className="card-body">
                        <div className="card-category">{product.category}</div>
                        <div className="card-rating">
                          <FiStar className="star-icon filled" />
                          <FiStar className="star-icon filled" />
                          <FiStar className="star-icon filled" />
                          <FiStar className="star-icon filled" />
                          <FiStar className="star-icon filled" />
                          <span>(5.0)</span>
                        </div>
                        
                        <Link to={`/product/${product.id}`} className="card-title">
                          {product.name}
                        </Link>

                        {/* --- DÒNG HIỂN THỊ QUÀ TẶNG KÈM MỚI THÊM VÀO --- */}
                        {product.hasGift && (
                          <div style={{ fontSize: '12px', color: '#10b981', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '8px' }}>
                            <FiGift /> Có quà tặng kèm
                          </div>
                        )}
                        
                        <div className="card-price-row">
                          <div className="price-info">
                            <span className="current-price">{product.price.toLocaleString()}đ</span>
                            {product.hasDiscount && (
                              <span className="old-price">{product.originalPrice.toLocaleString()}đ</span>
                            )}
                          </div>
                          
                          {Number(product.stock) > 0 ? (
                            <div className="shop-qty-control">
                              <button
                                type="button"
                                onClick={(e) => { e.preventDefault(); setProductQty(product.id, getProductQty(product.id) - 1); }}
                              >
                                <FiMinus />
                              </button>
                              <input
                                type="number"
                                min="1"
                                max={product.stock}
                                value={getProductQty(product.id)}
                                onChange={(e) => setProductQty(product.id, e.target.value)}
                                onClick={(e) => e.preventDefault()}
                              />
                              <button
                                type="button"
                                onClick={(e) => { 
                                  e.preventDefault(); 
                                  if (getProductQty(product.id) < product.stock) {
                                    setProductQty(product.id, getProductQty(product.id) + 1); 
                                  } else {
                                    alert('Đã đạt số lượng tồn kho tối đa!');
                                  }
                                }}
                              >
                                <FiPlus />
                              </button>
                            </div>
                          ) : (
                            <div style={{ fontSize: '13px', color: '#ef4444', fontWeight: 'bold' }}>Tạm hết</div>
                          )}
                          
                          <button 
                            className="btn-add-cart-icon"
                            disabled={Number(product.stock) === 0}
                            style={{ opacity: Number(product.stock) === 0 ? 0.5 : 1 }}
                            onClick={(e) => handleAddToCart(e, product)}
                            title={Number(product.stock) === 0 ? "Hết hàng" : "Thêm vào giỏ"}
                          >
                            <FiShoppingBag />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
              
              {totalPages > 1 && (
                <div className="pagination-bar">
                  <button
                    type="button"
                    className="pagination-btn pagination-nav"
                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                  >
                    Trước
                  </button>
                  <div className="pagination-pages">
                    {Array.from({ length: totalPages }, (_, index) => {
                      const page = index + 1;
                      return (
                        <button
                          type="button"
                          key={page}
                          className={`pagination-btn ${currentPage === page ? 'active' : ''}`}
                          onClick={() => setCurrentPage(page)}
                        >
                          {page}
                        </button>
                      );
                    })}
                  </div>
                  <button
                    type="button"
                    className="pagination-btn pagination-nav"
                    onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                  >
                    Sau
                  </button>
                </div>
              )}
              </>
            ) : (
              <div style={{textAlign: 'center', padding: '40px', color: '#666', background: '#f9f9f9', borderRadius: '12px'}}>
                <img 
                  src="https://cdn-icons-png.flaticon.com/512/11329/11329060.png" 
                  alt="Empty" 
                  loading="lazy" 
                  decoding="async" 
                  style={{width: '100px', opacity: 0.5, marginBottom: '20px'}} 
                />
                <p style={{fontSize: '18px', marginBottom: '15px'}}>Không tìm thấy sản phẩm nào trong danh mục này.</p>
                <button 
                  onClick={() => setCategory("All")} 
                  style={{
                    background: '#2e7d32', color: 'white', border: 'none', 
                    padding: '10px 20px', borderRadius: '25px', cursor: 'pointer',
                    fontWeight: 'bold'
                  }}
                >
                    Xem tất cả sản phẩm
                </button>
              </div>
            )}
        </div>
      </div>
      )}
    </div>
  );
};

export default Shop;