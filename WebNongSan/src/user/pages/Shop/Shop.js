import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { FiChevronDown, FiChevronUp, FiStar, FiShoppingBag, FiMinus, FiPlus } from 'react-icons/fi';
import { useCart } from '../../store/CartContext';
import { productsAPI } from '../../api/apiClient';
import './Shop.css';

const Shop = () => {
  const { addToCart } = useCart();
  const [searchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [category, setCategory] = useState("All");
  const [sortOrder, setSortOrder] = useState("default");
  const [isCategoryOpen, setIsCategoryOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [quantities, setQuantities] = useState({});

  // Update search query when URL search param changes
  useEffect(() => {
    const paramSearch = searchParams.get('search') || '';
    setSearchQuery(paramSearch);
  }, [searchParams]);

  // Fetch products from backend (search-aware)
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        let data;
        if (searchQuery) {
          // Use search API
          data = await productsAPI.search(searchQuery);
        } else {
          // Get all products
          data = await productsAPI.getAll();
        }
        setProducts(Array.isArray(data) ? data : []);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch products:', err);
        setError(err.message);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [searchQuery]);

  // --- CẤU HÌNH DANH MỤC (Dynamically generated from products) ---
  // Extract unique categories from products
  const uniqueCategories = new Set(products.map(p => p.category).filter(Boolean));
  const categories = [
    { id: 'All', name: 'Tất cả' },
    ...Array.from(uniqueCategories).map(cat => ({
      id: cat,
      name: cat
    }))
  ];

  // Format product for display - handle both old and new data formats
  const formatProduct = (product) => {
    // Determine which image to use
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
      desc: product.description || product.desc || 'No description',
      isFeatured: product.isFeatured || false,
      isBestSeller: product.isBestSeller || false,
      price: typeof product.price === 'string' ? parseFloat(product.price) : product.price
    };
  };

  const formattedProducts = products.map(formatProduct);

  // Logic lọc sản phẩm
  let filteredProducts = category === "All" 
    ? [...formattedProducts] 
    : formattedProducts.filter(p => p.category === category);

  // Logic sắp xếp sản phẩm
  if (sortOrder === "price-asc") {
    filteredProducts.sort((a, b) => a.price - b.price);
  } else if (sortOrder === "price-desc") {
    filteredProducts.sort((a, b) => b.price - a.price);
  }

  // Lấy tên hiển thị hiện tại để hiện lên tiêu đề
  const currentCategoryName = categories.find(c => c.id === category)?.name;

  const getProductQty = (productId) => {
    const saved = quantities[productId];
    return Number.isInteger(saved) && saved > 0 ? saved : 1;
  };

  const setProductQty = (productId, nextQty) => {
    const safeQty = Math.max(1, Number.parseInt(nextQty, 10) || 1);
    setQuantities((prev) => ({ ...prev, [productId]: safeQty }));
  };

  return (
    <div className="shop-container">
      {/* Banner phụ */}
      <div className="shop-banner">
        <h1>Cửa Hàng Nông Sản</h1>
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
        {/* --- SIDEBAR (MENU TRÁI) --- */}
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

        {/* --- DANH SÁCH SẢN PHẨM --- */}
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
                  <option value="default">Mặc định</option>
                  <option value="price-asc">Giá: Thấp đến cao</option>
                  <option value="price-desc">Giá: Cao đến thấp</option>
                </select>
              </div>
            </div>
            
            {filteredProducts.length > 0 ? (
              <div className="products-grid">
                  {filteredProducts.map(product => (
                    <div key={product.id} className="modern-product-card">
                      <div className="card-badges">
                        <span className="badge-discount">-15%</span>
                      </div>
                      
                      <Link to={`/product/${product.id}`} className="card-img-link">
                        <img src={product.image} alt={product.name} />
                      </Link>
                      
                      <div className="card-body">
                        <div className="card-category">{product.category}</div>
                        <div className="card-rating">
                          <FiStar className="star-icon filled" />
                          <FiStar className="star-icon filled" />
                          <FiStar className="star-icon filled" />
                          <FiStar className="star-icon filled" />
                          <FiStar className="star-icon filled" />
                          <span>(4.5)</span>
                        </div>
                        
                        <Link to={`/product/${product.id}`} className="card-title">
                          {product.name}
                        </Link>
                        
                        <div className="card-price-row">
                          <div className="price-info">
                            <span className="current-price">{product.price.toLocaleString()}đ</span>
                            <span className="old-price">{(product.price * 1.15).toLocaleString()}đ</span>
                          </div>
                          <div className="shop-qty-control">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.preventDefault();
                                setProductQty(product.id, getProductQty(product.id) - 1);
                              }}
                            >
                              <FiMinus />
                            </button>
                            <input
                              type="number"
                              min="1"
                              value={getProductQty(product.id)}
                              onChange={(e) => setProductQty(product.id, e.target.value)}
                              onClick={(e) => e.preventDefault()}
                            />
                            <button
                              type="button"
                              onClick={(e) => {
                                e.preventDefault();
                                setProductQty(product.id, getProductQty(product.id) + 1);
                              }}
                            >
                              <FiPlus />
                            </button>
                          </div>
                          <button 
                            className="btn-add-cart-icon"
                            onClick={(e) => {
                              e.preventDefault();
                              addToCart(product, getProductQty(product.id));
                            }}
                            title="Thêm vào giỏ"
                          >
                            <FiShoppingBag />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              <div style={{textAlign: 'center', padding: '40px', color: '#666', background: '#f9f9f9', borderRadius: '12px'}}>
                <img src="https://cdn-icons-png.flaticon.com/512/11329/11329060.png" alt="Empty" style={{width: '100px', opacity: 0.5, marginBottom: '20px'}} />
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
