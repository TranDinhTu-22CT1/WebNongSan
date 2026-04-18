// Frontend API utility for backend communication
import { API_BASE } from 'src/config';
import { getAuthToken, getStoredUser } from '../utils/authStorage';

export const BACKEND_BASE_URL = API_BASE;
const API_BASE_URL = BACKEND_BASE_URL;

const parseJsonSafely = (text) => {
  if (!text || !text.trim()) return null;
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
};

const extractRetryAfterSeconds = (message = '') => {
  const m = String(message).match(/(\d+)\s*seconds?/i);
  if (!m) return 0;
  return Number.parseInt(m[1], 10) || 0;
};

const buildApiError = (message, fallbackStatus = 0) => {
  const err = new Error(message || `Request failed: ${fallbackStatus}`);
  const retryAfter = extractRetryAfterSeconds(message || '');
  if (retryAfter > 0) {
    err.retryAfter = retryAfter;
  }
  return err;
};

const normalizeImagePath = (path) => {
  if (!path || typeof path !== 'string') return '';
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  const trimmed = path.replace(/^\/+/, '');
  return `${BACKEND_BASE_URL}/${trimmed}`;
};

const normalizeProduct = (product) => {
  let parsedImages = [];
  if (Array.isArray(product.images)) {
    parsedImages = product.images;
  } else if (typeof product.images === 'string') {
    try {
      const decoded = JSON.parse(product.images);
      parsedImages = Array.isArray(decoded) ? decoded : [];
    } catch {
      parsedImages = [];
    }
  }

  const normalizedImages = parsedImages.map(normalizeImagePath).filter(Boolean);
  const fallbackImage = normalizeImagePath(product.image || '');

  return {
    ...product,
    id: typeof product.id === 'string' ? Number(product.id) : product.id,
    price: typeof product.price === 'string' ? Number(product.price) : product.price,
    images: normalizedImages,
    image: normalizedImages[0] || fallbackImage,
  };
};

const unwrapListPayload = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (payload && Array.isArray(payload.data)) return payload.data;
  return [];
};

const parseVnDateToIso = (vnDate) => {
  if (!vnDate || typeof vnDate !== 'string') return new Date().toISOString();
  const parts = vnDate.split('/');
  if (parts.length !== 3) return new Date().toISOString();
  const [dd, mm, yyyy] = parts;
  return `${yyyy}-${mm.padStart(2, '0')}-${dd.padStart(2, '0')}T00:00:00.000Z`;
};

const normalizeOrderStatus = (deliveryStatus = '', paymentStatus = '') => {
  const source = `${deliveryStatus} ${paymentStatus}`.toLowerCase();

  if (source.includes('hủy')) {
    return { statusKey: 'cancel', statusLabel: 'Đã hủy' };
  }

  if (source.includes('đã giao') || source.includes('hoàn thành')) {
    return { statusKey: 'success', statusLabel: 'Hoàn thành' };
  }

  if (source.includes('đang giao')) {
    return { statusKey: 'pending', statusLabel: 'Đang giao' };
  }

  return { statusKey: 'pending', statusLabel: 'Chờ xử lý' };
};

const normalizeOrder = (order) => {
  const { statusKey, statusLabel } = normalizeOrderStatus(order.deliveryStatus, order.paymentStatus);
  const createdAt = order.created_at || parseVnDateToIso(order.date);

  return {
    ...order,
    id: order.id,
    createdAt,
    date: order.date || new Date(createdAt).toLocaleDateString('vi-VN'),
    total: Number(order.amount ?? order.total ?? order.totalPrice ?? 0),
    totalPrice: Number(order.amount ?? order.total ?? order.totalPrice ?? 0),
    method: order.payment_method || order.paymentMethod || order.method || 'N/A',
    status: statusKey,
    statusKey,
    statusLabel,
    items: Array.isArray(order.items)
      ? order.items.map((item) => ({
          ...item,
          quantity: Number(item.quantity ?? item.qty ?? 1),
          amount: Number(item.amount ?? item.qty ?? 1),
          image: item.image || 'https://via.placeholder.com/60x60?text=SP',
          price: Number(item.price ?? 0),
        }))
      : [],
  };
};

// Get JWT token from localStorage
const getToken = () => getAuthToken();

// Helper for API calls
export const apiCall = async (endpoint, method = 'GET', body = null, config = {}) => {
  const { withAuth = true } = config;
  const headers = {};

  if (body !== null) {
    headers['Content-Type'] = 'application/json';
  }

  const token = getToken();
  if (withAuth && token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const options = {
    method,
    ...(Object.keys(headers).length ? { headers } : {}),
    ...(body && { body: JSON.stringify(body) })
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
  const rawText = await response.text();
  const data = parseJsonSafely(rawText);
  
  if (!response.ok) {
    const message = data?.error || data?.message || rawText?.trim() || `Request failed: ${response.status}`;
    throw buildApiError(message, response.status);
  }

  if (data && typeof data === 'object' && !Array.isArray(data) && data.status && data.status !== 'success') {
    throw buildApiError(data.message || 'API request failed', response.status);
  }

  return data;
};

// Auth API
export const authAPI = {
  register: (email, password, name, phone) =>
    apiCall('/register.php', 'POST', { email, password, name, phone }),

  registerInit: (name, email, password, role = 'customer') =>
    apiCall('/register_init.php', 'POST', { name, email, password, role }),

  verifyRegister: (token, otpInput) =>
    apiCall('/verify_register.php', 'POST', { token, otp_input: otpInput }),

  requestPasswordResetOtp: (email) =>
    apiCall('/handle_customers.php?action=forgot_password_init', 'POST', { email }),

  verifyPasswordResetOtp: (token, otpInput) =>
    apiCall('/handle_customers.php?action=verify_reset_otp', 'POST', { token, otp_input: otpInput }),

  resetPassword: (token, password) =>
    apiCall('/handle_customers.php?action=reset_password', 'POST', { token, password }),
  
  login: (email, password, rememberMe = false) =>
    apiCall('/login.php', 'POST', { email, password, remember_me: rememberMe }),
  
  getProfile: async () => {
    const user = getStoredUser() || {};
    if (!user.id) throw new Error('Không tìm thấy thông tin người dùng');
    const response = await apiCall(`/get_profile.php?id=${encodeURIComponent(user.id)}`, 'GET');
    return response?.data || null;
  },
  
  updateProfile: (email, name, phone, address, avatarFile) => {
    const formData = new FormData();
    const user = getStoredUser() || {};
    if (!user.id) {
      return Promise.reject(new Error('Không tìm thấy thông tin người dùng'));
    }

    formData.append('id', user.id);
    formData.append('email', email);
    formData.append('name', name);
    formData.append('phone', phone);
    formData.append('address', address);
    if (avatarFile) {
      formData.append('avatar', avatarFile);
    }

    const token = getToken();
    return fetch(`${API_BASE_URL}/update_profile.php`, {
      method: 'POST',
      headers: token ? { 'Authorization': `Bearer ${token}` } : {},
      body: formData
    }).then(async (res) => {
      const text = await res.text();
      const parsed = parseJsonSafely(text);
      if (!res.ok) throw new Error(parsed?.message || `Request failed: ${res.status}`);
      if (parsed?.status && parsed.status !== 'success') {
        throw new Error(parsed?.message || 'Cập nhật hồ sơ thất bại');
      }
      return parsed;
    });
  },
  
  logout: () => {
    const user = getStoredUser() || {};
    if (!user.id) return Promise.resolve({ status: 'success' });
    return apiCall(`/logout.php?id=${encodeURIComponent(user.id)}`, 'POST');
  }
};

// Products API
export const productsAPI = {
  getAll: async () => {
    const payload = await apiCall('/handle_products.php?action=list', 'GET', null, { withAuth: false });
    return unwrapListPayload(payload).map(normalizeProduct);
  },
  
  getById: async (id) => {
    const products = await productsAPI.getAll();
    return products.find((product) => String(product.id) === String(id)) || null;
  },
  
  getByCategory: async (category) => {
    const products = await productsAPI.getAll();
    return products.filter((product) => product.category === category);
  },

  search: async (query) => {
    const keyword = (query || '').trim().toLowerCase();
    const products = await productsAPI.getAll();
    if (!keyword) return products;

    return products.filter((product) => {
      const haystack = [product.name, product.category, product.description]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return haystack.includes(keyword);
    });
  }
};

// Orders API
export const ordersAPI = {
  create: (items, totalPrice, shippingAddress, paymentMethod, customerPhone, customerName, voucherMeta = null) =>
    apiCall('/api_orders.php?action=create_order', 'POST', {
      items,
      totalPrice,
      shippingAddress,
      paymentMethod,
      customerPhone,
      customerName,
      voucherCode: voucherMeta?.code || '',
      voucherDiscount: Number(voucherMeta?.discountAmount || 0),
    }),
  
  getAll: async () => {
    const payload = await apiCall('/get_invoices.php', 'GET');
    return unwrapListPayload(payload).map(normalizeOrder);
  },
  
  getById: async (id) => {
    const orders = await ordersAPI.getAll();
    return orders.find((order) => String(order.id) === String(id)) || null;
  },
  
  updateStatus: (id, status) =>
    apiCall('/api_orders.php?action=update_status', 'POST', { db_id: id, status })
};

// Notifications API
export const notificationsAPI = {
  getAll: async () => {
    const payload = await apiCall('/admin_notifications.php?action=list_user', 'GET');
    const items = unwrapListPayload(payload);
    return items.map((item) => ({
      id: item.notify_key || `${item.source || 'system'}:${item.source_id || item.id}`,
      source: item.source || 'system',
      sourceId: Number(item.source_id ?? item.id ?? 0),
      title: item.title || 'Thong bao',
      desc: item.content || '',
      time: item.created_at ? new Date(item.created_at).toLocaleString('vi-VN') : 'Vua xong',
      unread: Number(item.unread ?? 1) === 1,
      image: 'https://cdn-icons-png.flaticon.com/512/3602/3602145.png',
    }));
  },
  
  markAsRead: (notification) => {
    if (notification && typeof notification === 'object') {
      return apiCall('/admin_notifications.php?action=mark_read_user', 'POST', {
        id: notification.id,
        source: notification.source || undefined,
      });
    }

    return apiCall('/admin_notifications.php?action=mark_read_user', 'POST', { id: notification });
  },
  
  markAllAsRead: () =>
    apiCall('/admin_notifications.php?action=mark_all_read_user', 'POST', {})
};

// Contact API
export const contactAPI = {
  submit: (name, email, message) =>
    apiCall('/message.php?action=submit_contact', 'POST', { name, email, message }),
};

// Voucher API
export const vouchersAPI = {
  getAll: async () => {
    const payload = await apiCall('/promotions.php?action=get_user_vouchers', 'GET');
    const items = unwrapListPayload(payload);

    return items.map((item) => {
      const isPercent = String(item.type || '').toLowerCase() === 'percent';
      const valueNum = Number(item.value || 0);
      const discount = isPercent ? `Giam ${valueNum}%` : `Giam ${valueNum.toLocaleString('vi-VN')}d`;

      return {
        id: item.id,
        code: item.code,
        discount,
        desc: item.name || item.description || 'Khuyen mai AgriMarket',
        date: item.end_date ? new Date(item.end_date).toLocaleDateString('vi-VN') : '',
        minOrder: Number(item.min_order_value || 0),
        maxDiscount: item.max_discount_value != null ? Number(item.max_discount_value) : null,
        type: item.type || 'percent',
        value: valueNum,
      };
    });
  },

  validateCode: async (code, orderTotal) => {
    const payload = await apiCall('/promotions.php?action=validate_code', 'POST', {
      code,
      order_total: Number(orderTotal || 0),
    });
    return payload?.data || null;
  },
};

// Support Chat API
export const supportAPI = {
  getHistory: async () => {
    const payload = await apiCall('/message.php?action=support_history', 'GET');
    return unwrapListPayload(payload);
  },

  sendMessage: (text) =>
    apiCall('/message.php?action=support_send', 'POST', { text }),
};

export const messagesAPI = {
  getConversations: async (userId) => {
    const token = getToken();
    if (!token || !userId) return [];

    const res = await fetch(`${API_BASE_URL}/message.php?action=get_conversations&user_id=${encodeURIComponent(userId)}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const text = await res.text();
    const data = parseJsonSafely(text);
    if (!res.ok) {
      const message = data?.message || text || `Request failed: ${res.status}`;
      throw buildApiError(message, res.status);
    }

    const items = Array.isArray(data) ? data : [];
    return items.map((item) => ({
      id: Number(item.id),
      partnerId: Number(item.partner_id || 0),
      name: item.name || 'Nha cung cap',
      avatar: normalizeImagePath(item.avatar || ''),
      lastMessage: item.lastMessage || '',
      time: item.time || '',
      unread: Number(item.unread || 0),
    }));
  },

  getMessages: async (conversationId, userId) => {
    const token = getToken();
    if (!token || !conversationId || !userId) return [];

    const url = `${API_BASE_URL}/message.php?action=get_messages&conversation_id=${encodeURIComponent(conversationId)}&user_id=${encodeURIComponent(userId)}`;
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const text = await res.text();
    const data = parseJsonSafely(text);
    if (!res.ok) {
      const message = data?.message || text || `Request failed: ${res.status}`;
      throw buildApiError(message, res.status);
    }

    const items = Array.isArray(data) ? data : [];
    return items.map((item) => ({
      id: Number(item.id),
      sender: item.sender === 'me' ? 'user' : 'vendor',
      text: item.text || '',
      time: item.time || '',
    }));
  },

  sendMessage: async ({ conversationId, senderId, receiverId, text }) => {
    const token = getToken();
    if (!token) {
      throw new Error('Unauthorized');
    }

    const formData = new FormData();
    formData.append('action', 'send_message');
    formData.append('conversation_id', String(conversationId || ''));
    formData.append('sender_id', String(senderId || ''));
    formData.append('receiver_id', String(receiverId || ''));
    formData.append('text', String(text || '').trim());

    const res = await fetch(`${API_BASE_URL}/message.php`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });

    const responseText = await res.text();
    const data = parseJsonSafely(responseText);

    if (!res.ok || data?.status !== 'success') {
      const message = data?.message || responseText || 'Send message failed';
      throw buildApiError(message, res.status);
    }

    return {
      conversationId: Number(data?.conversation_id || conversationId || 0),
    };
  },
};

export const vendorsAPI = {
  getAll: async () => {
    const payload = await apiCall('/handle_vendors.php', 'GET', null, { withAuth: false });
    const items = unwrapListPayload(payload);

    return items.map((item) => ({
      id: Number(item.id || 0),
      name: item.name || 'Nha cung cap',
      avatar: normalizeImagePath(item.avatar || ''),
      status: String(item.status || 'Offline'),
    }));
  },
};

// Payments API
export const paymentsAPI = {
  process: (orderId, amount, method, cardDetails) =>
    apiCall('/payments/process', 'POST', { orderId, amount, method, cardDetails }),
  
  verify: (transactionId) =>
    apiCall(`/payments/verify/${transactionId}`, 'POST'),
  
  getStatus: (orderId) =>
    apiCall(`/payments/status/${orderId}`, 'GET')
};
