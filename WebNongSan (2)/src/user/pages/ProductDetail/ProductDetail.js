import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useCart } from "../../store/CartContext";
import { productsAPI, reviewsAPI } from '../../api/apiClient';
import { getStoredUser } from '../../utils/authStorage';
import { FaStar, FaCheckCircle, FaTruck, FaShieldAlt, FaSearchPlus, FaTimes, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { FiStar, FiShoppingBag, FiMessageSquare, FiAlertCircle } from 'react-icons/fi';
import { API_BASE } from 'src/config';
import './ProductDetail.css';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  
  const [product, setProduct] = useState(null);
  const [allProducts, setAllProducts] = useState([]);
  const [activeSales, setActiveSales] = useState([]); // Khuyến mãi thực từ DB
  
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedType, setSelectedType] = useState('1kg');
  const [selectedArea, setSelectedArea] = useState('Hà Nội');
  const [isExpanded, setIsExpanded] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [activeTab, setActiveTab] = useState('description');
  
  const [reviews, setReviews] = useState([]);
  const [isLoadingReviews, setIsLoadingReviews] = useState(false);
  const [canRate, setCanRate] = useState(false);
  const [ratingGateMessage, setRatingGateMessage] = useState('Vui lòng đăng nhập để đánh giá');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [newReview, setNewReview] = useState({ rating: 5, comment: '', imageFile: null, imagePreview: '' });

  // 1. TẢI TOÀN BỘ DỮ LIỆU CÙNG LÚC
  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setLoading(true);
        const [productData, allData, saleRes] = await Promise.all([
          productsAPI.getById(id),
          productsAPI.getAll(),
          fetch(`${API_BASE}/sale.php?action=list`).then(r => r.json()).catch(() => ({ data: [] }))
        ]);

        setProduct(productData);
        setAllProducts(Array.isArray(allData) ? allData : []);
        
        if (saleRes.status === 'success') {
          // LỌC CHUẨN: Chỉ lấy Sale đang Active, áp dụng cho SP cụ thể và bỏ qua Voucher toàn sàn
          const validProductSales = saleRes.data.filter(sale => 
            sale.status === 'Active' && 
            (sale.applyScope === 'product' || sale.apply_scope === 'product') &&
            sale.type !== 'Voucher'
          );
          setActiveSales(validProductSales);
        }

        // Reset scroll & state khi chuyển SP
        setCurrentImageIndex(0);
        setQuantity(1);
        setIsExpanded(false);
        setTimeout(() => {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }, 10);
      } catch (err) {
        console.error('Lỗi khi tải chi tiết sản phẩm:', err);
        setProduct(null);
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, [id]);

  // Tải Reviews
  useEffect(() => {
    const loadReviews = async () => {
      try {
        setIsLoadingReviews(true);
        const data = await reviewsAPI.getByProduct(id);
        setReviews(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Failed to fetch reviews:', err);
        setReviews([]);
      } finally {
        setIsLoadingReviews(false);
      }
    };

    const checkCanRate = async () => {
      const user = getStoredUser();
      if (!user) {
        setCanRate(false);
        setRatingGateMessage('Vui lòng đăng nhập để đánh giá sản phẩm');
        return;
      }
      try {
        const result = await reviewsAPI.canRate(id);
        setCanRate(result.canRate);
        setRatingGateMessage(result.reason || (result.canRate ? '' : 'Bạn chưa đủ điều kiện để đánh giá'));
      } catch (err) {
        setCanRate(false);
        setRatingGateMessage('Bạn chỉ có thể đánh giá sau khi đã mua sản phẩm này');
      }
    };

    loadReviews();
    checkCanRate();
  }, [id]);

  useEffect(() => {
    return () => {
      if (newReview.imagePreview) URL.revokeObjectURL(newReview.imagePreview);
    };
  }, [newReview.imagePreview]);

  // 2. ENGINE TÍNH TOÁN GIÁ KHUYẾN MÃI THỰC TẾ
  const getProductWithRealDiscount = (p) => {
    if (!p) return null;
    let originalPrice = typeof p.price === 'string' ? parseFloat(p.price) : p.price;
    let finalPrice = originalPrice;
    let badgeText = null;

    activeSales.forEach(sale => {
      const targetList = sale.targetItems || sale.target_items || "";
      const isTargeted = targetList.split(',').map(tid => String(tid).trim()).includes(String(p.id));

      if (isTargeted) {
        const discountVal = Number(sale.discount || sale.discount_value || 0);
        if (sale.type === 'Flash Sale' || sale.type === 'Discount') {
          const calculatedPrice = originalPrice * (1 - discountVal / 100);
          if (calculatedPrice < finalPrice) {
            finalPrice = calculatedPrice;
            badgeText = `-${discountVal}%`;
          }
        }
      }
    });

    let image = p.image;
    if (!image && p.images && Array.isArray(p.images) && p.images.length > 0) image = p.images[0];
    if (!image) image = 'https://via.placeholder.com/300x300?text=' + encodeURIComponent(p.name);

    return {
      ...p,
      image,
      images: Array.isArray(p.images) ? p.images : [image],
      originalPrice,
      price: finalPrice,
      hasDiscount: finalPrice < originalPrice,
      badgeText
    };
  };

  // Áp dụng tính toán cho sản phẩm chính & tất cả sản phẩm (để lấy SP tương tự)
  const processedProduct = useMemo(() => getProductWithRealDiscount(product), [product, activeSales]);
  const processedAllProducts = useMemo(() => allProducts.map(getProductWithRealDiscount), [allProducts, activeSales]);
  
  const relatedProducts = useMemo(() => {
    if (!processedProduct) return [];
    return processedAllProducts
      .filter(p => p.category === processedProduct.category && String(p.id) !== String(processedProduct.id))
      .slice(0, 4);
  }, [processedAllProducts, processedProduct]);


  if (loading) return <div className="not-found">Đang tải sản phẩm... <Link to="/">Về trang chủ</Link></div>;
  if (!processedProduct) return <div className="not-found">Không tìm thấy sản phẩm! <Link to="/">Về trang chủ</Link></div>;

  const productImages = processedProduct.images;
  const descriptionText = String(processedProduct.description || processedProduct.desc || '').trim();
  const descriptionParagraphs = descriptionText ? descriptionText.split(/\r?\n+/).map(p => p.trim()).filter(Boolean) : [];
  const hasDescription = descriptionParagraphs.length > 0;
  const canExpandDescription = descriptionText.length > 280 || descriptionParagraphs.length > 3;

  const stockNum = Number(processedProduct.stock) || 0;
  const isOutOfStock = stockNum === 0;

  const handleQuantity = (num) => {
    if (quantity + num >= 1 && quantity + num <= stockNum) setQuantity(quantity + num);
  };

  const handleQuantityInput = (e) => {
    const next = Number.parseInt(e.target.value, 10);
    if (Number.isNaN(next)) return;
    setQuantity(Math.min(stockNum, Math.max(1, next)));
  };

  const handleNextImage = (e) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev === productImages.length - 1 ? 0 : prev + 1));
  };

  const handlePrevImage = (e) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev === 0 ? productImages.length - 1 : prev - 1));
  };

  const handleReviewImageChange = (e) => {
    const file = e.target.files?.[0] || null;
    if (newReview.imagePreview) URL.revokeObjectURL(newReview.imagePreview);
    if (!file) {
      setNewReview((prev) => ({ ...prev, imageFile: null, imagePreview: '' }));
      return;
    }
    const preview = URL.createObjectURL(file);
    setNewReview((prev) => ({ ...prev, imageFile: file, imagePreview: preview }));
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!canRate || isSubmittingReview) return;
    if (newReview.comment.trim() === '') return;

    try {
      setIsSubmittingReview(true);
      await reviewsAPI.create({
        productId: id,
        rating: newReview.rating,
        comment: newReview.comment,
        imageFile: newReview.imageFile,
      });

      if (newReview.imagePreview) URL.revokeObjectURL(newReview.imagePreview);
      setNewReview({ rating: 5, comment: '', imageFile: null, imagePreview: '' });
      alert('Đánh giá của bạn đã được gửi, vui lòng chờ duyệt.');

      const refreshed = await reviewsAPI.getByProduct(id);
      setReviews(Array.isArray(refreshed) ? refreshed : []);
    } catch (err) {
      alert(err?.message || 'Gửi đánh giá thất bại');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const executeAddToCart = () => {
    const user = getStoredUser();
    if (!user || (!user.id && !user.uid)) {
      alert("Vui lòng đăng nhập để thêm vào giỏ hàng!");
      navigate('/login');
      return;
    }
    // Add với giá đã được tính lại của processedProduct
    addToCart(processedProduct, quantity);
    alert(`Đã thêm ${quantity} sản phẩm vào giỏ hàng!`);
  };

  return (
    <div className="pd-page-container">
      <style>{`
        @keyframes pulseBadge {
          0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7); }
          70% { transform: scale(1.05); box-shadow: 0 0 0 10px rgba(239, 68, 68, 0); }
          100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
        }
        .real-discount-badge {
          position: absolute; top: 15px; left: 15px;
          background: #ef4444; color: white; font-weight: 800;
          padding: 6px 14px; border-radius: 12px; font-size: 14px; z-index: 10;
          animation: pulseBadge 2s infinite;
          box-shadow: 0 5px 15px rgba(239, 68, 68, 0.4);
        }
        .real-price { font-size: 32px; font-weight: 800; color: #ef4444; margin-right: 15px; }
        .original-price { font-size: 18px; color: #94a3b8; text-decoration: line-through; font-weight: 600; }
        .stock-alert { color: #ef4444; background: #fef2f2; padding: 10px 15px; border-radius: 10px; font-weight: 700; display: inline-flex; align-items: center; gap: 8px; margin-bottom: 20px; }
        .buy-buttons { display: flex; gap: 15px; margin-top: 25px; }
        .buy-buttons button:disabled { opacity: 0.5; cursor: not-allowed; filter: grayscale(1); }
      `}</style>

      {/* --- PHẦN 1: THÔNG TIN TRÊN --- */}
      <div className="pd-top-section">
        
        {/* CỘT TRÁI: ẢNH */}
        <div className="pd-image-gallery">
          <div className="pd-main-image" onClick={() => setIsZoomed(true)}>
            {/* THẺ GIẢM GIÁ THỰC TẾ VỚI HIỆU ỨNG */}
            {processedProduct.hasDiscount && (
              <span className="real-discount-badge">{processedProduct.badgeText}</span>
            )}
            
            <img src={productImages[currentImageIndex]} alt={processedProduct.name} />
            
            {productImages.length > 1 && (
              <>
                <button className="img-nav-btn prev-btn" onClick={handlePrevImage}><FaChevronLeft /></button>
                <button className="img-nav-btn next-btn" onClick={handleNextImage}><FaChevronRight /></button>
              </>
            )}
            <div className="zoom-hint"><FaSearchPlus /> Phóng to</div>
          </div>
          
          <div className="pd-thumbnails">
            {productImages.map((img, index) => (
              <div 
                key={index} 
                className={`thumb-item ${currentImageIndex === index ? 'active' : ''}`}
                onClick={() => setCurrentImageIndex(index)}
              >
                <img src={img} alt={`thumb-${index}`} />
              </div>
            ))}
          </div>
        </div>

        {/* CỘT PHẢI: THÔNG TIN */}
        <div className="pd-info-box">
          <div className="pd-category-tag">
            Danh mục: <Link to="/shop" style={{ color: '#2e7d32', fontWeight: 'bold', textDecoration: 'none' }}>{processedProduct.category}</Link>
          </div>
          <h1 className="pd-title">{processedProduct.name}</h1>
          
          <div className="pd-rating">
            <span className="stars">
                {[...Array(5)].map((_, i) => <FaStar key={i} color="#ffc107" />)}
            </span>
            <span className="review-count">({reviews.length} đánh giá) | Tồn kho: {stockNum}</span>
          </div>

          <div className="pd-price-box" style={{ alignItems: 'baseline', marginTop: 15, marginBottom: 25 }}>
            <span className="real-price">{processedProduct.price.toLocaleString()} ₫</span>
            {processedProduct.hasDiscount && (
              <span className="original-price">{processedProduct.originalPrice.toLocaleString()} ₫</span>
            )}
          </div>

          {isOutOfStock ? (
            <div className="stock-alert"><FiAlertCircle size={18} /> Sản phẩm đang tạm hết hàng</div>
          ) : null}

          <div className="pd-option-row">
            <span className="opt-label">Khu vực:</span>
            <div className="opt-values">
                {['Hà Nội', 'Hồ Chí Minh'].map(area => (
                    <button 
                        key={area}
                        className={`opt-btn ${selectedArea === area ? 'selected' : ''}`}
                        onClick={() => setSelectedArea(area)}
                    >{area}</button>
                ))}
            </div>
          </div>

          <div className="pd-option-row">
            <span className="opt-label">Trọng lượng:</span>
            <div className="opt-values">
                {[processedProduct.unit || '1 Sản phẩm'].map(type => (
                    <button 
                        key={type}
                        className={`opt-btn ${selectedType === type ? 'selected' : ''}`}
                        onClick={() => setSelectedType(type)}
                    >{type}</button>
                ))}
            </div>
          </div>

          <div className="pd-actions buy-buttons">
            <div className="qty-control" style={{ opacity: isOutOfStock ? 0.5 : 1 }}>
                <button disabled={isOutOfStock} onClick={() => handleQuantity(-1)}>-</button>
              <input disabled={isOutOfStock} type="number" min="1" max={stockNum} value={quantity} onChange={handleQuantityInput} />
                <button disabled={isOutOfStock} onClick={() => handleQuantity(1)}>+</button>
            </div>
            
            <button className="btn-add-cart" disabled={isOutOfStock} onClick={executeAddToCart}>
              Thêm vào giỏ
            </button>
            
            <button className="btn-buy-now" disabled={isOutOfStock} onClick={() => {
              executeAddToCart();
              if(!isOutOfStock && getStoredUser()) navigate('/cart');
            }}>
              Mua ngay
            </button>
          </div>

          <div className="pd-policy" style={{ marginTop: 30 }}>
             <div className="policy-item"><FaCheckCircle color="#10b981"/> <span>100% Tươi sạch</span></div>
             <div className="policy-item"><FaShieldAlt color="#10b981"/> <span>Hoàn tiền nếu hỏng</span></div>
             <div className="policy-item"><FaTruck color="#10b981"/> <span>Giao nhanh 2h</span></div>
          </div>
        </div>
      </div>

      {/* --- PHẦN 2: MÔ TẢ & ĐÁNH GIÁ --- */}
      <div className="pd-tabs-section">
        <div className="pd-tabs-header">
          <button
            className={`tab-btn ${activeTab === 'description' ? 'active' : ''}`}
            onClick={() => setActiveTab('description')}
          >
            Mô tả sản phẩm
          </button>
          <button
            className={`tab-btn ${activeTab === 'reviews' ? 'active' : ''}`}
            onClick={() => setActiveTab('reviews')}
          >
            Đánh giá ({reviews.length})
          </button>
        </div>

        <div className="pd-tabs-content">
          {activeTab === 'description' && (
            <div className="pd-bottom-section">
              <div className="pd-description">
                  <div className="desc-header">MÔ TẢ SẢN PHẨM</div>
                  <div className={`desc-content ${isExpanded ? 'expanded' : ''}`}>
                      {hasDescription ? (
                        descriptionParagraphs.map((paragraph, index) => (
                          <p key={`desc-${index}`}>{paragraph}</p>
                        ))
                      ) : (
                        <p>Chưa có mô tả chi tiết cho sản phẩm này.</p>
                      )}
                  </div>
                  {canExpandDescription ? (
                    <button className="btn-toggle-desc" onClick={() => setIsExpanded(!isExpanded)}>
                        {isExpanded ? 'Thu gọn ▲' : 'Xem thêm ▼'}
                    </button>
                  ) : null}
              </div>

              <div className="pd-sidebar">
                  <div className="sidebar-header">THÔNG TIN CHI TIẾT</div>
                  <table className="specs-table">
                      <tbody>
                          <tr><td>Đơn vị</td><td>{processedProduct.unit}</td></tr>
                          <tr><td>Xuất xứ</td><td>{processedProduct.origin || 'Việt Nam'}</td></tr>
                          <tr><td>Tình trạng</td><td>{stockNum > 0 ? 'Còn hàng' : 'Hết hàng'}</td></tr>
                      </tbody>
                  </table>
              </div>
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className="pd-reviews-section">
              <div className="reviews-list">
                {isLoadingReviews ? (
                  <div className="review-item">Đang tải đánh giá...</div>
                ) : reviews.length === 0 ? (
                  <div className="review-item">Chưa có đánh giá nào cho sản phẩm này.</div>
                ) : reviews.map((review) => (
                  <div key={review.id} className="review-item">
                    <div className="review-header">
                      <div className="review-user-info">
                        <div className="review-avatar">{review.user.charAt(0)}</div>
                        <div>
                          <span className="review-user">{review.user}</span>
                          <span className="review-date">{review.date}</span>
                        </div>
                      </div>
                      <div className="review-rating">
                        {[...Array(5)].map((_, i) => (
                          <FiStar key={i} className={`star-icon ${i < review.rating ? 'filled' : ''}`} />
                        ))}
                      </div>
                    </div>
                    <p className="review-comment">{review.comment}</p>
                    {review.image ? <img src={review.image} alt="Review" className="review-image" onClick={() => setIsZoomed(review.image)} style={{cursor: 'pointer'}} /> : null}
                  </div>
                ))}
              </div>

              <div className="review-form-container">
                <h3>Viết đánh giá của bạn</h3>
                {canRate ? (
                  <form onSubmit={handleReviewSubmit} className="review-form">
                    <div className="form-group">
                      <label>Đánh giá:</label>
                      <div className="rating-select">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <FiStar
                            key={star}
                            className={`star-icon ${star <= newReview.rating ? 'filled' : ''} interactive`}
                            onClick={() => setNewReview({ ...newReview, rating: star })}
                          />
                        ))}
                      </div>
                    </div>
                    <div className="form-group">
                      <label>Nhận xét:</label>
                      <textarea
                        value={newReview.comment}
                        onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                        placeholder="Chia sẻ cảm nhận của bạn về sản phẩm..."
                        rows="4"
                        required
                      ></textarea>
                    </div>
                    <div className="form-group">
                      <label>Ảnh thực tế (tùy chọn):</label>
                      <input type="file" accept="image/*" onChange={handleReviewImageChange} />
                      {newReview.imagePreview ? (
                        <img src={newReview.imagePreview} alt="Preview" className="review-image preview" />
                      ) : null}
                    </div>
                    <button type="submit" className="btn-submit-review" disabled={isSubmittingReview}>
                      {isSubmittingReview ? 'Đang gửi...' : 'Gửi đánh giá'}
                    </button>
                  </form>
                ) : (
                  <div className="review-gate-message">
                    {ratingGateMessage}
                    {!getStoredUser() ? (
                      <span>
                        {' '}<Link to="/login">Đăng nhập ngay</Link>
                      </span>
                    ) : null}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* --- PHẦN 3: SẢN PHẨM TƯƠNG TỰ ĐÃ ÁP DỤNG KHUYẾN MÃI THẬT --- */}
      {relatedProducts.length > 0 && (
        <div className="related-section">
            <h2 className="related-title">SẢN PHẨM TƯƠNG TỰ</h2>
            <div className="products-grid">
                {relatedProducts.map(item => (
                    <div key={item.id} className="modern-product-card">
                      
                      <div className="card-badges">
                        {item.hasDiscount && <span className="badge-discount">{item.badgeText}</span>}
                        {Number(item.stock) === 0 && <span className="badge-hot" style={{background: '#ef4444'}}>Hết</span>}
                      </div>
                      
                      <Link to={`/product/${item.id}`} className="card-img-link">
                        <img src={item.image} alt={item.name} />
                      </Link>
                      
                      <div className="card-body">
                        <div className="card-category">{item.category}</div>
                        <div className="card-rating">
                          <FiStar className="star-icon filled" /><FiStar className="star-icon filled" />
                          <FiStar className="star-icon filled" /><FiStar className="star-icon filled" />
                          <FiStar className="star-icon filled" />
                          <span>(5.0)</span>
                        </div>
                        
                        <Link to={`/product/${item.id}`} className="card-title">
                          {item.name}
                        </Link>
                        
                        <div className="card-price-row">
                          <div className="price-info">
                            <span className="current-price">{item.price.toLocaleString()}đ</span>
                            {item.hasDiscount && (
                              <span className="old-price">{item.originalPrice.toLocaleString()}đ</span>
                            )}
                          </div>
                          <button 
                            className="btn-add-cart-icon"
                            disabled={Number(item.stock) === 0}
                            style={{ opacity: Number(item.stock) === 0 ? 0.5 : 1 }}
                            onClick={(e) => {
                              e.preventDefault();
                              if (!getStoredUser()) {
                                alert("Vui lòng đăng nhập!");
                                navigate('/login');
                                return;
                              }
                              addToCart(item, 1);
                              alert("Đã thêm vào giỏ!");
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
        </div>
      )}

      {/* --- IMAGE ZOOM MODAL --- */}
      {isZoomed && (
        <div className="image-zoom-modal" onClick={() => setIsZoomed(false)}>
          <button className="close-modal-btn" onClick={() => setIsZoomed(false)}>
            <FaTimes />
          </button>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <img src={typeof isZoomed === 'string' ? isZoomed : productImages[currentImageIndex]} alt="Zoomed" className="zoomed-image" />
            {productImages.length > 1 && typeof isZoomed !== 'string' && (
              <>
                <button className="modal-nav-btn prev-btn" onClick={handlePrevImage}><FaChevronLeft /></button>
                <button className="modal-nav-btn next-btn" onClick={handleNextImage}><FaChevronRight /></button>
              </>
            )}
          </div>
        </div>
      )}

    </div>
  );
};

export default ProductDetail;