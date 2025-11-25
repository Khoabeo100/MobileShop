const axios = require('axios');
const { Op } = require('sequelize');
const modelProduct = require('../models/products.model');

const Chatbot = async (question, filter = {}) => {
    try {
        // 1. Điều kiện lọc - SỬA LỖI: where không được sử dụng trong query
        const where = {};
        if (filter.maxPrice) where.priceProduct = { [Op.lte]: filter.maxPrice };
        if (filter.category) where.categoryProduct = filter.category;

        // 2. Query sản phẩm với điều kiện lọc
        const products = await modelProduct.findAll({
            where: where, // Thêm where vào query
            limit: 5,
            order: [['priceProduct', 'ASC']],
            attributes: ['nameProduct', 'priceProduct', 'specsProduct'], // Chỉ lấy field cần thiết
        });

        // 3. Nếu không có sản phẩm nào
        if (!products || products.length === 0) {
            return 'Xin lỗi, hiện tại không có sản phẩm phù hợp với yêu cầu của bạn.';
        }

        // 4. Ghép dữ liệu sản phẩm thành context - tối ưu stringify
        const productInfo = products
            .map((p) => {
                const specs =
                    typeof p.specsProduct === 'object'
                        ? Object.entries(p.specsProduct)
                              .map(([key, value]) => `${key}: ${value}`)
                              .join(', ')
                        : p.specsProduct;
                return `Tên: ${p.nameProduct}, Giá: ${p.priceProduct} VND, Cấu hình: ${specs}`;
            })
            .join('\n');

        // 5. Prompt ngắn gọn hơn
        const prompt = `Bạn là nhân viên bán laptop. Danh sách sản phẩm:\n${productInfo}\n\nCâu hỏi: "${question}"\n\nTư vấn ngắn gọn, lịch sự, trả lời bằng tiềng việt nhé:`;

        // 6. Gọi Ollama API với stream: false và timeout
        const response = await axios.post(
            'http://localhost:11434/api/generate',
            {
                model: 'mistral:latest',
                prompt: prompt,
                stream: false, // TẮT STREAM để nhận response ngay lập tức
                options: {
                    num_ctx: 2048, // Giảm context length
                    num_predict: 200, // Giới hạn độ dài response
                    temperature: 0.7,
                    top_p: 0.9,
                },
            },
            {
                timeout: 30000, // Timeout 30 giây
                headers: {
                    'Content-Type': 'application/json',
                },
            },
        );

        return response.data.response || 'Xin lỗi, không thể tạo phản hồi.';
    } catch (error) {
        console.error('Chatbot error:', error.message);

        // Trả về response mặc định nhanh nếu AI fail
        if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
            return 'Dựa vào yêu cầu của bạn, tôi khuyên bạn nên xem các sản phẩm có giá tốt và cấu hình phù hợp. Vui lòng liên hệ để được tư vấn chi tiết hơn.';
        }

        return 'Xin lỗi, hệ thống gặp sự cố. Vui lòng thử lại sau.';
    }
};

module.exports = Chatbot;
