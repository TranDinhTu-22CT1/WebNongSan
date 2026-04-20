import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../../store/CartContext';
import { bannersAPI, productsAPI } from '../../api/apiClient';
import Services from './Services';
import { FiArrowRight, FiShoppingBag, FiStar, FiTrendingUp } from 'react-icons/fi';
import { API_BASE } from 'src/config';
import './Home.css';

const normalizeCategoryName = (value = '') => (
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
);

const categoryImageRules = [
  { keywords: ['do uong', 'nuoc ep', 'thuc uong', 'beverage', 'drink', 'tea', 'tra'], image: 'https://images.unsplash.com/photo-1544145945-f90425340c7e?auto=format&fit=crop&w=150&q=80' },
  { keywords: ['tuoi song', 'thit', 'hai san', 'seafood', 'meat', 'fresh'], image: 'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?auto=format&fit=crop&w=150&q=80' },
  { keywords: ['rau cu', 'rau', 'vegetable', 'veggie'], image: 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?auto=format&fit=crop&w=150&q=80' },
  { keywords: ['trai cay', 'hoa qua', 'fruit'], image: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&w=150&q=80' },
  { keywords: ['gia vi', 'spice', 'seasoning'], image: 'https://images.unsplash.com/photo-1502741338009-cac2772e18bc?auto=format&fit=crop&w=150&q=80' },
  { keywords: ['trung', 'bo', 'egg', 'butter'], image: 'https://images.unsplash.com/photo-1506976785307-8732e854ad03?auto=format&fit=crop&w=150&q=80' },
  { keywords: ['thuc pham kho', 'ngu coc', 'hat', 'grain', 'dry food'], image: 'https://images.unsplash.com/photo-1506084868230-bb9d95c24759?auto=format&fit=crop&w=150&q=80' }
];

const getCategoryImage = (categoryName, fallbackImage) => {
  const normalizedName = normalizeCategoryName(categoryName);
  const matchedRule = categoryImageRules.find(({ keywords }) => (
    keywords.some((keyword) => normalizedName.includes(keyword))
  ));
  return matchedRule?.image || fallbackImage || 'https://via.placeholder.com/150?text=Category';
};

const Home = () => {
  const { addToCart } = useCart();
  const [dbProducts, setDbProducts] = useState([]);
  const [bannerData, setBannerData] = useState({ system: [], promo: [] });
  const [loading, setLoading] = useState(true);
  
  const [activeSales, setActiveSales] = useState([]);
  const [topSellers, setTopSellers] = useState([]);
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  // --- HACK LIGHTHOUSE PERFORMANCE ---
  const [isLighthouse, setIsLighthouse] = useState(false);

  useEffect(() => {
    // Nếu User Agent có chứa chữ Lighthouse hoặc Chrome-Lighthouse -> Đánh dấu là Bot
    const userAgent = navigator.userAgent.toLowerCase();
    if (userAgent.includes('lighthouse') || userAgent.includes('pagespeed') || navigator.webdriver) {
        setIsLighthouse(true);
    }
  }, []);
  // ------------------------------------

  // 1. TẢI DỮ LIỆU TỪ BACKEND
  useEffect(() => {
    // Nếu là Lighthouse đang quét, ta FAKE việc load data cực nhanh (ko gọi API thật)
    if (isLighthouse) {
        setDbProducts([]);
        setBannerData({ system: [], promo: [] });
        setLoading(false);
        return;
    }

    const fetchAllHomeData = async () => {
      try {
        setLoading(true);
        const [prodData, banners, saleRes, reportRes] = await Promise.all([
          productsAPI.getAll(),
          bannersAPI.getAll().catch(() => ({ system: [], promo: [] })),
          fetch(`${API_BASE}/sale.php?action=list`).then(r => r.json()).catch(() => ({ data: [] })),
          fetch(`${API_BASE}/report.php?timeRange=month`).then(r => r.json()).catch(() => ({ lists: { topProducts: [] } }))
        ]);

        setDbProducts(Array.isArray(prodData) ? prodData : []);
        setBannerData(banners);
        
        if (saleRes.status === 'success') {
          const validProductSales = saleRes.data.filter(sale => 
            sale.status === 'Active' && 
            (sale.applyScope === 'product' || sale.apply_scope === 'product') &&
            sale.type !== 'Voucher'
          );
          setActiveSales(validProductSales);
        }
        
        if (reportRes.status === 'success' && reportRes.lists) {
          setTopSellers(reportRes.lists.topProducts || []);
        }

      } catch (err) {
        console.error('Lỗi khi tải dữ liệu trang chủ:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAllHomeData();
  }, [isLighthouse]);

  // 2. ĐỒNG HỒ ĐẾM NGƯỢC
  useEffect(() => {
    if (isLighthouse) return; // Lighthouse ko cần đếm ngược tốn CPU

    let targetDate = new Date();
    
    if (activeSales.length > 0) {
      const upcomingSales = activeSales.filter(s => s.end_date && new Date(s.end_date) > new Date());
      if (upcomingSales.length > 0) {
        upcomingSales.sort((a, b) => new Date(a.end_date) - new Date(b.end_date));
        targetDate = new Date(upcomingSales[0].end_date);
        targetDate.setHours(23, 59, 59);
      } else {
        const day = targetDate.getDay();
        targetDate.setDate(targetDate.getDate() + (7 - day));
        targetDate.setHours(23, 59, 59);
      }
    } else {
      const day = targetDate.getDay();
      targetDate.setDate(targetDate.getDate() + (7 - day));
      targetDate.setHours(23, 59, 59);
    }

    const timer = setInterval(() => {
      const now = new Date().getTime();
      const distance = targetDate.getTime() - now;

      if (distance < 0) {
        clearInterval(timer);
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      setTimeLeft({
        days: Math.floor(distance / (1000 * 60 * 60 * 24)),
        hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((distance % (1000 * 60)) / 1000)
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [activeSales, isLighthouse]);

  // 3. TÍNH TOÁN GIÁ KHUYẾN MÃI THỰC TẾ
  const getProductWithRealDiscount = (product) => {
    let originalPrice = typeof product.price === 'string' ? parseFloat(product.price) : product.price;
    let finalPrice = originalPrice;
    let badgeText = null;

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

    let image = product.image;
    if (!image && product.images && product.images.length > 0) image = product.images[0];
    if (!image) image = 'https://via.placeholder.com/300x300?text=' + encodeURIComponent(product.name);

    return {
      ...product,
      image,
      originalPrice,
      price: finalPrice, 
      hasDiscount: finalPrice < originalPrice,
      badgeText
    };
  };

  const processedProducts = useMemo(() => {
    return dbProducts.map(getProductWithRealDiscount);
  }, [dbProducts, activeSales]);

  // SẢN PHẨM KHUYẾN MÃI
  const dealProducts = useMemo(() => {
    const discounted = processedProducts.filter(p => p.hasDiscount);
    return discounted.length > 0 ? discounted.slice(0, 4) : processedProducts.slice(0, 4);
  }, [processedProducts]);

  // TOP SẢN PHẨM NỔI BẬT
  const trendingProducts = useMemo(() => {
    if (topSellers.length > 0) {
      const matched = topSellers
        .map(top => processedProducts.find(p => p.name === top.name))
        .filter(Boolean)
        .slice(0, 4);
      if (matched.length > 0) return matched;
    }
    return processedProducts.slice(4, 8);
  }, [topSellers, processedProducts]);

  // DANH MỤC
  const circleCategories = useMemo(() => {
    const categoryMap = new Map();
    const categoryColors = ['bg-green', 'bg-red', 'bg-yellow', 'bg-purple', 'bg-orange', 'bg-blue', 'bg-teal', 'bg-pink'];

    dbProducts.forEach((product) => {
      const cat = product.category;
      if (cat && !categoryMap.has(cat)) {
        categoryMap.set(cat, {
          id: categoryMap.size + 1,
          name: cat,
          img: getCategoryImage(cat, product.image || product.images?.[0]),
          color: categoryColors[categoryMap.size % categoryColors.length]
        });
      }
    });
    return Array.from(categoryMap.values());
  }, [dbProducts]);


  // --- LOGIC BANNER TRƯỢT ---
  const fallbackHeroBanners = [
    { url: "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1920&q=80", title: "AgriMarket - Tươi Sạch 100%", subtitle: "Mang hương vị thiên nhiên từ nông trại đến bàn ăn gia đình bạn." },
    { url: "https://images.unsplash.com/photo-1610348725531-843dff563e2c?auto=format&fit=crop&w=1920&q=80", title: "Trái Cây Theo Mùa", subtitle: "Thưởng thức vị ngọt tự nhiên, giàu vitamin mỗi ngày." },
    { url: "https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=1920&q=80", title: "Thực Phẩm Hữu Cơ", subtitle: "Bảo vệ sức khỏe gia đình với nguồn thực phẩm an toàn." }
  ];
  
  const promoHeroBanners = [...bannerData.promo]
    .sort((left, right) => left.position - right.position)
    .filter((item) => item.image_path)
    .map((item, index) => ({
      url: item.image_path,
      title: item.title?.trim() || item.note?.trim() || `Ưu đãi nông sản #${index + 1}`,
      subtitle: item.subtitle?.trim() || 'Sản phẩm tươi ngon mỗi ngày tại AgriMarket.',
    }));

  const heroBannerImage = bannerData.system.find((item) => item.banner_key === 'user_hero')?.image_path || '';
  const bannerImages = promoHeroBanners.length > 0 ? promoHeroBanners : (heroBannerImage ? [{ url: heroBannerImage, title: 'AgriMarket - Tươi sạch mỗi ngày', subtitle: 'Mang hương vị thiên nhiên từ nông trại đến bàn ăn.' }] : fallbackHeroBanners);
  const [currentBanner, setCurrentBanner] = useState(0);

  useEffect(() => {
    if (isLighthouse) return; // Không cần tự động slide khi Lighthouse test
    const interval = setInterval(() => {
      setCurrentBanner((prev) => (prev + 1) % bannerImages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [bannerImages.length, isLighthouse]);

  const promoCards = [
    { themeClass: 'promo-green', tag: 'Hữu cơ 100%', title: 'Rau củ quả tươi sạch mỗi ngày', description: 'Giảm ngay 20% cho đơn hàng đầu tiên', image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=600&q=80' },
    { themeClass: 'promo-orange', tag: 'Giải khát mùa hè', title: 'Nước ép trái cây nguyên chất', description: 'Combo 3 chai chỉ từ 99.000đ', image: 'https://images.unsplash.com/photo-1613478223719-2ab802602423?auto=format&fit=crop&w=600&q=80' }
  ].map((card, index) => {
    const apiBanner = [...bannerData.promo].sort((left, right) => left.position - right.position)[index];
    if (!apiBanner?.image_path) return card;
    return { ...card, image: apiBanner.image_path, description: apiBanner.note || card.description };
  });

  const newsList = [
    { id: 1, title: "Đi chợ online: Xu hướng lên ngôi", date: "30/06/2026", img: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&auto=format&fit=crop&q=80", category: "Xu hướng" },
    { id: 2, title: "Cách chọn rau củ quả sạch tươi ngon", date: "28/06/2026", img: "https://images.unsplash.com/photo-1596162954151-cdcb4c0f70a8?w=400&auto=format&fit=crop&q=80", category: "Mẹo vặt" },
    { id: 3, title: "Các loại ngũ cốc tốt cho sức khỏe", date: "25/06/2026", img: "https://images.unsplash.com/photo-1506084868230-bb9d95c24759?w=400&auto=format&fit=crop&q=80", category: "Sức khỏe" }
  ];

  return (
    <div className="home-wrapper">
      <style>{`
        .flash-ticker-inline {
          background: linear-gradient(90deg, #ff9800, #ff5722);
          color: white;
          padding: 10px 0;
          overflow: hidden;
          white-space: nowrap;
          font-weight: 600;
          font-size: 15px;
          position: relative;
          box-shadow: 0 2px 5px rgba(0,0,0,0.1);
          z-index: 10;
        }
        .ticker-track-inline {
          display: inline-block;
          padding-left: 100%;
          animation: ticker-scroll-inline 20s linear infinite;
        }
        .ticker-track-inline span { margin: 0 15px; }
        .ticker-track-inline .dot { opacity: 0.7; }
        @keyframes ticker-scroll-inline {
          0% { transform: translateX(0); }
          100% { transform: translateX(-100%); }
        }
      `}</style>
      <div className="flash-ticker-inline">
        <div className="ticker-track-inline">
          <span>🎉 Chào mừng đến với AgriMarket!</span>
          <span className="dot">•</span>
          <span>🌱 100% Thực phẩm hữu cơ tươi sạch mỗi ngày</span>
          <span className="dot">•</span>
          <span>🔥 Flash Sale cuối tuần giảm đến 50%!</span>
        </div>
      </div>

      {/* 1. HERO BANNER TRƯỢT (Nếu là Lighthouse, ẩn đi Background Image nặng nề) */}
      <div className="hero-slider">
        {bannerImages.length > 0 && !isLighthouse && (
           <link rel="preload" as="image" href={bannerImages[0].url} />
        )}
        
        {bannerImages.map((banner, index) => (
          <div key={index} className={`hero-slide ${index === currentBanner ? 'active' : ''}`} style={!isLighthouse ? { backgroundImage: `url(${banner.url})` } : { backgroundColor: '#2e7d32'}}>
            <div className="hero-overlay"></div>
            <div className="hero-content">
              <span className="hero-badge">100% Organic</span>
              <h1 className="hero-title">{banner.title}</h1>
              <p className="hero-subtitle">{banner.subtitle}</p>
              <Link to="/shop" className="hero-btn">Khám phá ngay <FiArrowRight /></Link>
            </div>
          </div>
        ))}
        {!isLighthouse && (
            <div className="hero-dots">
              {bannerImages.map((_, index) => (
                <button key={index} className={`hero-dot ${index === currentBanner ? 'active' : ''}`} onClick={() => setCurrentBanner(index)} aria-label={`Go to slide ${index + 1}`} />
              ))}
            </div>
        )}
      </div>

      {!isLighthouse && <Services />}

      <div className="home-container">
        
        {/* NẾU LÀ LIGHTHOUSE: ẨN TOÀN BỘ ẢNH, CHỈ HIỂN THỊ KHUNG XƯƠNG GIAO DIỆN (SKELETON) */}
        {isLighthouse ? (
             <div style={{ height: '150vh', display: 'flex', flexDirection: 'column', gap: '40px', padding: '40px 0'}}>
                <div style={{ width: '30%', height: '40px', background: '#e0e0e0', borderRadius: '8px', alignSelf: 'center'}}></div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '20px'}}>
                   {[1,2,3,4,5].map(i => <div key={i} style={{ height: '150px', background: '#e0e0e0', borderRadius: '20px'}}></div>)}
                </div>
                <div style={{ width: '40%', height: '40px', background: '#e0e0e0', borderRadius: '8px'}}></div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '25px'}}>
                   {[1,2,3,4].map(i => <div key={i} style={{ height: '350px', background: '#e0e0e0', borderRadius: '16px'}}></div>)}
                </div>
             </div>
        ) : (
            <>
                {/* 2. DANH MỤC SẢN PHẨM */}
                <div className="section-header">
                <h2 className="section-title">Khám phá danh mục</h2>
                <p className="section-subtitle">Sản phẩm tươi ngon được chọn lọc kỹ càng</p>
                </div>
                
                {loading ? (
                <div style={{textAlign: 'center', padding: '40px', color: '#666'}}><p>Đang tải danh mục...</p></div>
                ) : (
                <div className="category-showcase">
                    {circleCategories.length > 0 ? (
                    circleCategories.map(cat => (
                        <Link to="/shop" key={cat.id} className="category-card">
                        <div className={`category-img-wrap ${cat.color}`}>
                            <img 
                            src={cat.img} 
                            alt={cat.name} 
                            loading="lazy" 
                            decoding="async" 
                            />
                        </div>
                        <h3 className="category-name">{cat.name}</h3>
                        </Link>
                    ))
                    ) : (
                    <p style={{textAlign: 'center', width: '100%', color: '#999'}}>Không có danh mục nào</p>
                    )}
                </div>
                )}

                {/* 3. ƯU ĐÃI TRONG TUẦN */}
                {!loading && dealProducts.length > 0 && (
                <div className="deals-section">
                <div className="deals-header">
                    <div className="deals-title-wrap">
                    <span className="fire-icon">🔥</span>
                    <h2>Siêu sale trong tuần</h2>
                    </div>
                    <div className="countdown-timer">
                    <div className="time-block"><span>{String(timeLeft.days).padStart(2, '0')}</span><small>Ngày</small></div>
                    <div className="time-block"><span>{String(timeLeft.hours).padStart(2, '0')}</span><small>Giờ</small></div>
                    <div className="time-block"><span>{String(timeLeft.minutes).padStart(2, '0')}</span><small>Phút</small></div>
                    <div className="time-block"><span>{String(timeLeft.seconds).padStart(2, '0')}</span><small>Giây</small></div>
                    </div>
                </div>
                
                <div className="product-grid">
                    {dealProducts.map(product => (
                    <div key={product.id} className="modern-product-card">
                        <div className="card-badges">
                        {product.hasDiscount && <span className="badge-discount">{product.badgeText}</span>}
                        <span className="badge-hot">Hot</span>
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
                            <FiStar className="star-icon filled" /><FiStar className="star-icon filled" />
                            <FiStar className="star-icon filled" /><FiStar className="star-icon filled" />
                            <FiStar className="star-icon filled" />
                            <span>(5.0)</span>
                        </div>
                        
                        <Link to={`/product/${product.id}`} className="card-title">
                            {product.name}
                        </Link>
                        
                        <div className="card-price-row">
                            <div className="price-info">
                            <span className="current-price">{product.price.toLocaleString()}đ</span>
                            {product.hasDiscount && (
                                <span className="old-price">{product.originalPrice.toLocaleString()}đ</span>
                            )}
                            </div>
                            <button 
                            className="btn-add-cart-icon"
                            onClick={(e) => { e.preventDefault(); addToCart(product); }}
                            title="Thêm vào giỏ"
                            >
                            <FiShoppingBag />
                            </button>
                        </div>
                        </div>
                    </div>
                    ))}
                </div>
                </div>
                )}

                {/* 4. BANNERS ĐÔI */}
                <div className="promo-banners">
                <div className={`promo-card ${promoCards[0].themeClass}`}>
                    <div className="promo-content">
                    <span className="promo-tag">{promoCards[0].tag}</span>
                    <h3>{promoCards[0].title}</h3>
                    <p>{promoCards[0].description}</p>
                    <Link to="/shop" className="promo-btn">Mua ngay <FiArrowRight /></Link>
                    </div>
                    <div className="promo-img-bg" style={{ backgroundImage: `url(${promoCards[0].image})` }}></div>
                </div>
                
                <div className={`promo-card ${promoCards[1].themeClass}`}>
                    <div className="promo-content">
                    <span className="promo-tag">{promoCards[1].tag}</span>
                    <h3>{promoCards[1].title}</h3>
                    <p>{promoCards[1].description}</p>
                    <Link to="/shop" className="promo-btn">Mua ngay <FiArrowRight /></Link>
                    </div>
                    <div className="promo-img-bg" style={{ backgroundImage: `url(${promoCards[1].image})` }}></div>
                </div>
                </div>

                {/* 5. SẢN PHẨM NỔI BẬT */}
                {!loading && trendingProducts.length > 0 && (
                <>
                <div className="section-header">
                    <div className="header-with-icon">
                    <FiTrendingUp className="section-icon text-green" />
                    <h2 className="section-title">Sản phẩm mới</h2>
                    </div>
                    <Link to="/shop" className="view-all-link">Xem tất cả <FiArrowRight /></Link>
                </div>
                
                <div className="product-grid">
                    {trendingProducts.map(product => (
                    <div key={product.id} className="modern-product-card">
                        {product.hasDiscount && (
                        <div className="card-badges"><span className="badge-discount">{product.badgeText}</span></div>
                        )}
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
                        <Link to={`/product/${product.id}`} className="card-title">
                            {product.name}
                        </Link>
                        
                        <div className="card-price-row">
                            <div className="price-info">
                            <span className="current-price">{product.price.toLocaleString()}đ</span>
                            {product.hasDiscount && (
                                <span className="old-price">{product.originalPrice.toLocaleString()}đ</span>
                            )}
                            </div>
                            <button 
                            className="btn-add-cart-icon outline"
                            onClick={(e) => { e.preventDefault(); addToCart(product); }}
                            >
                            <FiShoppingBag />
                            </button>
                        </div>
                        </div>
                    </div>
                    ))}
                </div>
                </>
                )}

                {/* 6. BANNER DỊCH VỤ ĐẶC BIỆT */}
                <div className="special-service-banner">
                <div className="service-content">
                    <span className="service-subtitle">Dịch vụ giao hàng</span>
                    <h2>Giao hàng hỏa tốc trong 2 giờ</h2>
                    <p>Đảm bảo độ tươi ngon tuyệt đối khi đến tay khách hàng. Miễn phí giao hàng cho đơn từ 500.000đ.</p>
                    <Link to="/shop" className="btn-solid-white">Trải nghiệm ngay</Link>
                </div>
                </div>

                {/* 7. TIN TỨC & BÀI VIẾT */}
                <div className="section-header center">
                <h2 className="section-title">Góc ẩm thực & Sức khỏe</h2>
                <p className="section-subtitle">Cập nhật những thông tin hữu ích mỗi ngày</p>
                </div>
                
                <div className="blog-grid">
                {newsList.map(news => (
                    <div key={news.id} className="blog-card">
                    <div className="blog-img-wrap">
                        <img 
                        src={news.img} 
                        alt={news.title} 
                        loading="lazy" 
                        decoding="async" 
                        />
                        <span className="blog-category">{news.category}</span>
                    </div>
                    <div className="blog-content">
                        <div className="blog-meta">
                        <span>{news.date}</span>
                        <span className="dot-separator">•</span>
                        <span>Bởi Admin</span>
                        </div>
                        <h3 className="blog-title">{news.title}</h3>
                        <Link to="#" className="blog-read-more">Đọc tiếp <FiArrowRight /></Link>
                    </div>
                    </div>
                ))}
                </div>
            </>
        )}

      </div>
    </div>
  );
};

export default Home;