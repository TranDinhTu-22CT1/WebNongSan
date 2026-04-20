import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import { useCart } from "../../store/CartContext";
import { productsAPI, reviewsAPI } from '../../api/apiClient';
import { getStoredUser } from '../../utils/authStorage';
import { FaStar, FaCheckCircle, FaTruck, FaShieldAlt, FaSearchPlus, FaTimes, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { FiStar, FiShoppingBag, FiMessageSquare } from 'react-icons/fi';
import './ProductDetail.css';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
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

  // Fetch product and all products from backend
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const data = await productsAPI.getById(id);
        setProduct(data);
      } catch (err) {
        console.error('Failed to fetch product:', err);
        setProduct(null);
      } finally {
        setLoading(false);
      }
    };

    const fetchAllProducts = async () => {
      try {
        const data = await productsAPI.getAll();
        setAllProducts(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Failed to fetch products:', err);
        setAllProducts([]);
      }
    };

    fetchProduct();
    fetchAllProducts();
  }, [id]);

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

  // Reset state when product changes
  useEffect(() => {
    if (product && allProducts.length > 0) {
      setCurrentImageIndex(0);
      setQuantity(1);
      setIsExpanded(false);
      
      // Generate related products from same category
      const related = allProducts
        .filter(p => p.category === product.category && p.id !== product.id)
        .slice(0, 4);
      setRelatedProducts(related);

      setTimeout(() => {
        window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
        document.documentElement.scrollTop = 0;
        document.body.scrollTop = 0;
      }, 10);
    }
  }, [product, allProducts]);

  useEffect(() => {
    return () => {
      if (newReview.imagePreview) {
        URL.revokeObjectURL(newReview.imagePreview);
      }
    };
  }, [newReview.imagePreview]);

  if (loading) {
    return <div className="not-found">Đang tải sản phẩm... <Link to="/">Về trang chủ</Link></div>;
  }

  if (!product) {
    return <div className="not-found">Không tìm thấy sản phẩm! <Link to="/">Về trang chủ</Link></div>;
  }

  // Get product images from backend or use placeholder
  const getProductImages = () => {
    if (product.images && Array.isArray(product.images) && product.images.length > 0) {
      return product.images;
    }
    if (product.image) {
      return [product.image, product.image, product.image, product.image];
    }
    return ['https://via.placeholder.com/500x500?text=' + encodeURIComponent(product.name)];
  };

  const productImages = getProductImages();
  const voucherFromQuery = new URLSearchParams(location.search).get('voucher') || '';
  const vendorId = product.vendor_id || product.vendorId || product.seller_id || product.user_id || '';
  const vendorName = product.vendor_name || product.vendorName || product.seller_name || 'Nha cung cap';
  const descriptionText = String(product.description || product.desc || '').trim();
  const descriptionParagraphs = descriptionText
    ? descriptionText.split(/\r?\n+/).map((paragraph) => paragraph.trim()).filter(Boolean)
    : [];
  const hasDescription = descriptionParagraphs.length > 0;
  const canExpandDescription = descriptionText.length > 280 || descriptionParagraphs.length > 3;

  const handleQuantity = (num) => {
    if (quantity + num >= 1) setQuantity(quantity + num);
  };

  const handleQuantityInput = (e) => {
    const next = Number.parseInt(e.target.value, 10);
    if (Number.isNaN(next)) return;
    setQuantity(Math.max(1, next));
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
    if (newReview.imagePreview) {
      URL.revokeObjectURL(newReview.imagePreview);
    }

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

      if (newReview.imagePreview) {
        URL.revokeObjectURL(newReview.imagePreview);
      }

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

  const handleBuyNow = () => {
    const added = addToCart(product, Math.max(1, quantity));
    if (added) {
      if (voucherFromQuery.trim()) {
        localStorage.setItem('selectedVoucherCode', voucherFromQuery.trim().toUpperCase());
      }
      navigate('/checkout');
    }
  };

  return (
    <div className="pd-page-container">
      {/* --- PHẦN 1: THÔNG TIN TRÊN --- */}
      <div className="pd-top-section">
        {/* CỘT TRÁI: ẢNH */}
        <div className="pd-image-gallery">
          <div className="pd-main-image" onClick={() => setIsZoomed(true)}>
            <span className="discount-badge">-15%</span>
            <img src={productImages[currentImageIndex]} alt={product.name} />
            
            <button className="img-nav-btn prev-btn" onClick={handlePrevImage}>
              <FaChevronLeft />
            </button>
            <button className="img-nav-btn next-btn" onClick={handleNextImage}>
              <FaChevronRight />
            </button>
            
            <div className="zoom-hint">
              <FaSearchPlus /> Phóng to
            </div>
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
            Danh mục: <Link to="/shop" style={{ color: '#2e7d32', fontWeight: 'bold', textDecoration: 'none' }}>{product.category}</Link>
          </div>
          <h1 className="pd-title">{product.name} - AgriMarket</h1>
          
          <div className="pd-rating">
            <span className="stars">
                {[...Array(5)].map((_, i) => <FaStar key={i} color="#ffc107" />)}
            </span>
            <span className="review-count">({reviews.length} đánh giá) | 120 đã bán</span>
          </div>

          <div className="pd-price-box">
            <span className="current-price">{product.price.toLocaleString()} ₫</span>
            <span className="old-price">{(product.price * 1.15).toLocaleString()} ₫</span>
          </div>

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
                {['500 G', '1 kg'].map(type => (
                    <button 
                        key={type}
                        className={`opt-btn ${selectedType === type ? 'selected' : ''}`}
                        onClick={() => setSelectedType(type)}
                    >{type}</button>
                ))}
            </div>
          </div>

          <div className="pd-actions">
            <div className="qty-control">
                <button onClick={() => handleQuantity(-1)}>-</button>
              <input type="number" min="1" value={quantity} onChange={handleQuantityInput} />
                <button onClick={() => handleQuantity(1)}>+</button>
            </div>
            <button className="btn-add-cart" onClick={() => addToCart(product, Math.max(1, quantity))}>Thêm vào giỏ</button>
            {vendorId ? (
              <Link to={`/messages?vendor=${encodeURIComponent(vendorId)}&name=${encodeURIComponent(vendorName)}`} className="btn-buy-now" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '6px', color: '#fff' }}>
                <FiMessageSquare style={{ color: '#fff' }} /> Chat voi nha cung cap
              </Link>
            ) : null}
            <button className="btn-buy-now" onClick={handleBuyNow}>Mua ngay</button>
          </div>

          <div className="pd-policy">
             <div className="policy-item"><FaCheckCircle color="green"/> <span>100% Tươi sạch</span></div>
             <div className="policy-item"><FaShieldAlt color="green"/> <span>Hoàn tiền nếu hỏng</span></div>
             <div className="policy-item"><FaTruck color="green"/> <span>Giao nhanh 2h</span></div>
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
                          <p key={`${product.id}-desc-${index}`}>{paragraph}</p>
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
                          <tr><td>Trọng lượng</td><td>{selectedType}</td></tr>
                          <tr><td>Xuất xứ</td><td>Việt Nam</td></tr>
                          <tr><td>Bảo quản</td><td>Tủ lạnh</td></tr>
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
                    {review.image ? <img src={review.image} alt="Review" className="review-image" /> : null}
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

      {/* --- PHẦN 3: SẢN PHẨM TƯƠNG TỰ (MỚI THÊM) --- */}
      {relatedProducts.length > 0 && (
        <div className="related-section">
            <h2 className="related-title">SẢN PHẨM TƯƠNG TỰ</h2>
            <div className="products-grid">
                {relatedProducts.map(item => (
                    <div key={item.id} className="modern-product-card">
                      <div className="card-badges">
                        <span className="badge-discount">-15%</span>
                      </div>
                      
                      <Link to={`/product/${item.id}`} className="card-img-link">
                        <img src={item.image} alt={item.name} />
                      </Link>
                      
                      <div className="card-body">
                        <div className="card-category">{item.category}</div>
                        <div className="card-rating">
                          <FiStar className="star-icon filled" />
                          <FiStar className="star-icon filled" />
                          <FiStar className="star-icon filled" />
                          <FiStar className="star-icon filled" />
                          <FiStar className="star-icon filled" />
                          <span>(4.5)</span>
                        </div>
                        
                        <Link to={`/product/${item.id}`} className="card-title">
                          {item.name}
                        </Link>
                        
                        <div className="card-price-row">
                          <div className="price-info">
                            <span className="current-price">{item.price.toLocaleString()}đ</span>
                            <span className="old-price">{(item.price * 1.15).toLocaleString()}đ</span>
                          </div>
                          <button 
                            className="btn-add-cart-icon"
                            onClick={(e) => {
                              e.preventDefault();
                              addToCart(item);
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
            <img src={productImages[currentImageIndex]} alt={product.name} className="zoomed-image" />
            <button className="modal-nav-btn prev-btn" onClick={handlePrevImage}>
              <FaChevronLeft />
            </button>
            <button className="modal-nav-btn next-btn" onClick={handleNextImage}>
              <FaChevronRight />
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

export default ProductDetail;
