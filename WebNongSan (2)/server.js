// 🔥 DÒNG NÀY PHẢI NẰM TRÊN CÙNG
require("dotenv").config(); 

const express = require("express");
const cors = require("cors");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const mysql = require('mysql2/promise');
const fs = require('fs'); // 🔥 Thêm module xử lý file
const path = require('path'); // 🔥 Thêm module xử lý đường dẫn

console.log("=========================================");
if (process.env.GEMINI_API_KEY) {
  console.log("👉 ĐÃ TÌM THẤY API KEY:", process.env.GEMINI_API_KEY.substring(0, 10) + "...");
} else {
  console.log("❌ LỖI NGHIÊM TRỌNG: KHÔNG TÌM THẤY API KEY");
}
console.log("=========================================");

// 🔥 TẠO THƯ MỤC LƯU LOG NẾU CHƯA CÓ
const logDir = path.join(__dirname, 'chat_logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
  console.log("📁 Đã tạo thư mục lưu log: /chat_logs");
}

const app = express();
app.use(cors());
app.use(express.json());

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',      
  password: '',      
  database: 'uxi', // Database của bạn
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

app.post("/chat", async (req, res) => {
  try {
    // 🔥 Lấy thêm userId từ Frontend gửi lên
    const { message, history, userId } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Thiếu message" });
    }

    // Nếu không có userId, gán tạm là 'khach_vang_lai'
    const currentUserId = userId || 'khach_vang_lai';
    const logFilePath = path.join(logDir, `log_user_${currentUserId}.txt`);
    const timeNow = new Date().toLocaleString('vi-VN');

    // 🔥 1. GHI LOG CÂU HỎI CỦA NGƯỜI DÙNG VÀO FILE
    const userLog = `[${timeNow}] USER: ${message}\n`;
    fs.appendFileSync(logFilePath, userLog, 'utf8');

    // 2. QUERY LẤY DỮ LIỆU TỪ DATABASE
    const [sales] = await pool.query("SELECT name, type, discount_value FROM sale WHERE status = 'Active'");
    let saleText = sales.length > 0 
      ? sales.map(s => `- ${s.name} (${s.type}): Giảm ${s.discount_value}`).join('\n')
      : "Hiện tại cửa hàng chưa có chương trình khuyến mãi đặc biệt nào.";

    const [products] = await pool.query("SELECT name, price, images FROM products WHERE status = 'Còn hàng' AND is_banned = 0 LIMIT 5");
    let productText = products.map((p, index) => {
      let imageUrl = "";
      try {
        const parsedImages = JSON.parse(p.images);
        imageUrl = Array.isArray(parsedImages) ? parsedImages[0] : p.images;
      } catch (e) {
        imageUrl = p.images; 
      }
      return `${index + 1}. Tên: ${p.name} - Giá: ${p.price}đ - Link Ảnh: ${imageUrl}`;
    }).join('\n');

    // 3. TẠO SYSTEM PROMPT
    const systemPrompt = `
      Bạn là trợ lý ảo bán hàng của trang web nông sản AgriMarket.
      Giọng điệu: Thân thiện, nhiệt tình, lịch sự, tư vấn như một người bán hàng chuyên nghiệp.

      🛑 BẮT BUỘC PHẢI TUÂN THỦ CÁC QUY TẮC SAU:
      1. KHI KHÁCH CHÀO: Hãy chào lại thân thiện và LUÔN giới thiệu các chương trình khuyến mãi hiện có.
      2. KHI KHÁCH HỎI VỀ ĐƠN HÀNG (kiểm tra đơn, mã đơn, giao hàng, hủy đơn): Hãy giải đáp cơ bản và BẮT BUỘC yêu cầu khách hàng truy cập trang liên hệ Admin tại link: http://localhost:3000/messages để được hỗ trợ chi tiết nhất.
      3. KHI KHÁCH HỎI SẢN PHẨM: Dựa vào danh sách "Sản phẩm đang có" bên dưới để tư vấn. Tối đa chỉ đưa ra 5 sản phẩm.
      4. HÌNH ẢNH LÀ BẮT BUỘC: Khi giới thiệu bất kỳ sản phẩm nào, PHẢI kèm theo hình ảnh bằng đúng cú pháp Markdown này: ![Tên sản phẩm](Link Ảnh).

      📦 DỮ LIỆU THỰC TẾ TỪ DATABASE:
      --- KHUYẾN MÃI ĐANG CHẠY ---
      ${saleText}

      --- SẢN PHẨM ĐANG CÓ ---
      ${productText}
    `;

    // 4. GỌI GEMINI
    const model = genAI.getGenerativeModel({
        model: "gemini-2.5-flash",      
        systemInstruction: systemPrompt,
    });
    
    const chat = model.startChat({
      history: history || [], 
    });

    const result = await chat.sendMessage(message);

    if (!result || !result.response) {
      return res.status(500).json({ error: "Gemini không trả response" });
    }

    const replyText = result.response.text();

    // 🔥 5. GHI LOG CÂU TRẢ LỜI CỦA BOT VÀO FILE
    const botLog = `[${timeNow}] BOT: ${replyText}\n--------------------------------------------------\n`;
    fs.appendFileSync(logFilePath, botLog, 'utf8');

    res.json({ reply: replyText });

  } catch (err) {
    console.error("❌ ERROR FULL:", err);
    res.status(500).json({
      error: "Lỗi từ Server, Database hoặc Gemini",
      detail: err.message || "Unknown error"
    });
  }
});

app.listen(5000, () => {
  console.log("✅ Server Backend đang chạy tại: http://localhost:5000");
});