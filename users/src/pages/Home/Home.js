import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { products } from '../../data';
import Services from "./Services";
import './Home.css';

const Home = () => {
  const [searchParams] = useSearchParams();
  const [category, setCategory] = useState("All");
  const [sortType, setSortType] = useState("default");
  const [searchTerm, setSearchTerm] = useState("");

  // --- LOGIC BANNER TỰ ĐỘNG CHUYỂN (MỚI) ---
  const bannerImages = [
    "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1200&q=80", // Ảnh rau củ
    "https://images.unsplash.com/photo-1610348725531-843dff563e2c?auto=format&fit=crop&w=1200&q=80", // Ảnh người cầm rau
    "https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=1200&q=80"  // Ảnh trái cây
  ];

  const [currentBanner, setCurrentBanner] = useState(0);

  
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentBanner((prev) => (prev === bannerImages.length - 1 ? 0 : prev + 1));
    }, 4000); 

    return () => clearInterval(timer);
  }, []);
  // ------------------------------------------

  useEffect(() => {
    const query = searchParams.get("search");
    if (query) setSearchTerm(query.toLowerCase());
    else setSearchTerm("");
  }, [searchParams]);

  let filteredProducts = products;
  if (category !== "All") filteredProducts = filteredProducts.filter(p => p.category === category);
  if (searchTerm) filteredProducts = filteredProducts.filter(p => p.name.toLowerCase().includes(searchTerm));
  if (sortType === "low-high") filteredProducts.sort((a, b) => a.price - b.price);
  else if (sortType === "high-low") filteredProducts.sort((a, b) => b.price - a.price);

  return (
    <div className="home-container">
      
      {/* 1. BANNER ĐỘNG (Sửa phần style) */}
      <div 
        className="banner"
        style={{ 
          // Dùng biến state để thay đổi ảnh
          backgroundImage: `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url(${bannerImages[currentBanner]})` 
        }}
      >
        <h1>Nông Sản Sạch - Nhà trồng 3 đời</h1>
        <p>100% Tươi ngon & Hữu cơ</p>
        
        {/* Thêm mấy cái chấm tròn bên dưới để biết đang ở ảnh nào */}
        <div className="banner-dots">
          {bannerImages.map((_, index) => (
            <span 
              key={index} 
              className={`dot ${index === currentBanner ? 'active' : ''}`}
              onClick={() => setCurrentBanner(index)} // Cho phép bấm vào chấm để chuyển ảnh
            ></span>
          ))}
        </div>

        <button onClick={() => document.getElementById('shop').scrollIntoView({ behavior: 'smooth' })}>
          Mua ngay
        </button>
      </div>

      <Services />

      <div className="main-content" id="shop">
        <aside className="sidebar">
          <h3>Danh mục</h3>
          <ul className="category-list">
            <li className={category === "All" ? "active" : ""} onClick={() => setCategory("All")}>🌱 Tất cả</li>
            <li className={category === "Rau" ? "active" : ""} onClick={() => setCategory("Rau")}>🥬 Rau xanh</li>
            <li className={category === "Củ" ? "active" : ""} onClick={() => setCategory("Củ")}>🥕 Củ quả</li>
            <li className={category === "Quả" ? "active" : ""} onClick={() => setCategory("Quả")}>🍓 Trái cây</li>
          </ul>
        </aside>

        <div className="product-section">
          <div className="sort-bar">
            <h2>{category === "All" ? "Tất cả sản phẩm" : category}</h2>
            <select className="sort-select" onChange={(e) => setSortType(e.target.value)}>
              <option value="default">Sắp xếp mặc định</option>
              <option value="low-high">Giá: Thấp đến Cao</option>
              <option value="high-low">Giá: Cao đến Thấp</option>
            </select>
          </div>

          {filteredProducts.length > 0 ? (
            <div className="product-grid">
              {filteredProducts.map((product) => (
                <div key={product.id} className="product-card">
                  <Link to={`/product/${product.id}`}>
                    <img src={product.image} alt={product.name} />
                  </Link>
                  <div style={{ padding: '15px' }}>
                    <h3>{product.name}</h3>
                    <p className="price">{product.price.toLocaleString()}đ</p>
                    <Link to={`/product/${product.id}`}>
                       <button className="add-btn">Mua ngay</button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{textAlign: 'center', padding: '50px'}}>
              <p style={{fontSize: '18px', color: '#666'}}>Không tìm thấy sản phẩm nào!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;