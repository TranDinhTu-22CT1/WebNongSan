import React from 'react';
import { Routes, Route } from 'react-router-dom';

// Import các thành phần dùng chung (đảm bảo đuôi .js nếu bạn đã đổi tên)
import Header from './components/Layout/Header.js'; 
import Footer from './components/Layout/Footer.js';
import Chatbox from './components/UI/Chatbox.js';

// Import các trang
import Home from './pages/Home/Home';
import About from './pages/About/About'; 
import ProductDetail from './pages/ProductDetail/ProductDetail';
import Cart from './pages/Cart/Cart';
import Checkout from './pages/Checkout/Checkout';
import Contact from './pages/Contact/Contact';
import Support from './pages/Support/Support';
import Voucher from './pages/Voucher/Voucher';
import NotificationPage from './pages/Notification/NotificationPage.js';

// --- IMPORT NHÓM TRANG AUTH (MỚI) ---
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import ForgotPassword from './pages/Auth/ForgotPassword';
import Profile from './pages/User/Profile';

function App() {
  return (
    <div className="App">
      <Header />

      <div style={{ minHeight: '80vh', backgroundColor: '#f5f5f5', paddingBottom: '20px' }}>
        <Routes>
          {/* --- TRANG CHỦ & SẢN PHẨM --- */}
          <Route path="/" element={<Home />} />
          <Route path="/product/:id" element={<ProductDetail />} />

          {/* --- CÁC TRANG THÔNG TIN --- */}
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/support" element={<Support />} />
          <Route path="/voucher" element={<Voucher />} />

          <Route path="/notifications" element={<NotificationPage />} />

          {/* --- TÀI KHOẢN (AUTH) --- */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/profile" element={<Profile />} />

          {/* --- MUA HÀNG --- */}
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
        </Routes>
      </div>

      <Footer />
      <Chatbox />
    </div>
  );
}

export default App;