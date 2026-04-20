import React, { useEffect, useState } from 'react';
import { contactAPI } from '../../api/apiClient';
import './Contact.css';

const Contact = () => {
  const MAX_MESSAGE_LENGTH = 2000;
  const getLockoutMessage = (seconds) => `He thong tam gioi han gui lien he. Vui long thu lai sau ${seconds}s.`;
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [lockSeconds, setLockSeconds] = useState(0);

  useEffect(() => {
    if (lockSeconds <= 0) return undefined;
    const timer = setInterval(() => {
      setLockSeconds((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [lockSeconds]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
      setError('Vui long nhap day du thong tin.');
      return;
    }

    if (lockSeconds > 0) {
      setError(getLockoutMessage(lockSeconds));
      return;
    }

    if (formData.message.trim().length > MAX_MESSAGE_LENGTH) {
      setError(`Noi dung toi da ${MAX_MESSAGE_LENGTH} ky tu.`);
      return;
    }

    try {
      setLoading(true);
      const response = await contactAPI.submit(formData.name.trim(), formData.email.trim(), formData.message.trim());
      setSuccess(response?.message || 'Da gui tin nhan lien he thanh cong.');
      setFormData({ name: '', email: '', message: '' });
    } catch (err) {
      setError(err.message || 'Khong the gui lien he. Vui long thu lai.');
      if (Number(err?.retryAfter) > 0) {
        setLockSeconds(Number(err.retryAfter));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="contact-container">
      {/* Bên trái: Form liên hệ */}
      <div className="contact-info">
        <h2>Liên hệ với chúng tôi</h2>
        <p>Gửi thắc mắc hoặc góp ý của bạn, chúng tôi sẽ phản hồi sớm nhất.</p>
        
          <form className="contact-form" onSubmit={handleSubmit}>
            {error && <p style={{ color: '#d32f2f', marginTop: 0 }}>{error}</p>}
            {success && <p style={{ color: '#2e7d32', marginTop: 0 }}>{success}</p>}
            <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="Ho ten cua ban" disabled={loading} />
            <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="Email lien he" disabled={loading} />
            <textarea rows="5" name="message" value={formData.message} onChange={handleChange} placeholder="Noi dung loi nhan..." disabled={loading} maxLength={MAX_MESSAGE_LENGTH}></textarea>
            <div style={{ fontSize: '12px', color: '#777', textAlign: 'right' }}>
              {formData.message.length}/{MAX_MESSAGE_LENGTH}
            </div>
            <button className="send-btn" disabled={loading}>{loading ? 'Dang gui...' : 'Gui tin nhan'}</button>
            {lockSeconds > 0 && <p className="lockout-hint">{getLockoutMessage(lockSeconds)}</p>}
        </form>
      </div>

      {/* Bên phải: Google Maps */}
      <div className="contact-map">
        <h2>Bản đồ</h2>
        {}
        <iframe 
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3724.096814183571!2d105.78009331476332!3d21.02881188599839!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3135ab4cd0c66f71%3A0x65e634b475d9e666!2zSMOgIE7huqFpLCBWaeG7h3QgTmFt!5e0!3m2!1svi!2s!4v1626078654817!5m2!1svi!2s" 
          width="100%" 
          height="350" 
          style={{border:0, borderRadius: '8px'}} 
          allowFullScreen="" 
          loading="lazy">
        </iframe>
      </div>
    </div>
  );
};

export default Contact;
