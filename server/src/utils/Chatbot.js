const Groq = require('groq-sdk');
const { Op } = require('sequelize');
const product = require('../models/products.model');

const GROQ_API_KEY = process.env.GROQ_API_KEY;
if (!GROQ_API_KEY) {
    throw new Error(
        'Missing GROQ_API_KEY environment variable. Please set it in server/.env or your deployment environment.',
    );
}

const client = new Groq({
    apiKey: GROQ_API_KEY,
});

// ===== PURPOSE MAPPING =====
const purposeMapping = {
    gaming: {
        name: 'Chơi Game',
        description: 'PUBG, Liên Quân, Genshin Impact',
        priorities: ['Hiệu năng CPU/GPU', 'RAM lớn', 'Pin trâu', 'Tản nhiệt tốt'],
        keywords: ['game', 'chơi game', 'gaming', 'pubg', 'liên quân', 'genshin', 'fps', 'esport', 'rank'],
    },
    camera: {
        name: 'Chụp ảnh / Quay video',
        description: 'Selfie, chụp đêm, quay vlog',
        priorities: ['Camera chất lượng cao', 'OIS chống rung', 'Màn hình đẹp'],
        keywords: ['chụp ảnh', 'camera', 'selfie', 'chụp hình', 'quay video', 'vlog', 'chụp đêm', 'zoom', 'portrait'],
    },
    student: {
        name: 'Học tập',
        description: 'Học online, đọc tài liệu, zoom',
        priorities: ['Giá hợp lý', 'Pin bền', 'Màn hình rõ'],
        keywords: ['học', 'sinh viên', 'học sinh', 'học online', 'zoom', 'tài liệu', 'trường', 'đại học', 'giá rẻ'],
    },
    office: {
        name: 'Công việc văn phòng',
        description: 'Email, họp online, đa nhiệm',
        priorities: ['Pin bền', 'Hiệu năng ổn định', 'Màn hình lớn'],
        keywords: ['làm việc', 'office', 'văn phòng', 'email', 'họp', 'meeting', 'đa nhiệm', 'công việc', 'kinh doanh'],
    },
    entertainment: {
        name: 'Giải trí',
        description: 'Xem phim, nghe nhạc, mạng xã hội',
        priorities: ['Màn hình đẹp', 'Loa tốt', 'Pin lớn'],
        keywords: ['xem phim', 'netflix', 'youtube', 'nhạc', 'tiktok', 'facebook', 'instagram', 'giải trí'],
    },
};

// ===== DETECT PURPOSE (scoring thay vì if/else cứng) =====
const detectPurpose = (question) => {
    const q = question.toLowerCase();
    const scores = {};

    for (const [key, info] of Object.entries(purposeMapping)) {
        scores[key] = info.keywords.filter((kw) => q.includes(kw)).length;
    }

    const best = Object.entries(scores).sort((a, b) => b[1] - a[1])[0];
    return best[1] > 0 ? best[0] : null;
};

// ===== EXTRACT GIÁ (hỗ trợ nhiều cách nói) =====
const extractPriceRange = (question) => {
    const q = question.toLowerCase().replace(/,/g, '.');

    const toVND = (num, unit) => {
        unit = unit?.toLowerCase() || '';
        if (unit.includes('tr') || unit.includes('triệu')) return Math.round(num * 1_000_000);
        if (unit.includes('k')) return Math.round(num * 1_000);
        return Math.round(num * 1_000_000); // mặc định: triệu
    };

    // "tầm 10-15tr", "khoảng 10 đến 15 triệu", "10~15tr"
    const rangePatterns = [
        /(\d+(?:\.\d+)?)\s*[-~]\s*(\d+(?:\.\d+)?)\s*(tr|triệu|k)?/i,
        /(\d+(?:\.\d+)?)\s*(tr|triệu)?\s*(đến|tới|to|-)\s*(\d+(?:\.\d+)?)\s*(tr|triệu|k)?/i,
    ];

    for (const pattern of rangePatterns) {
        const m = q.match(pattern);
        if (m) {
            if (m[3] && (m[3] === 'đến' || m[3] === 'tới' || m[3] === 'to' || m[3] === '-')) {
                return { min: toVND(parseFloat(m[1]), m[2]), max: toVND(parseFloat(m[4]), m[5]) };
            }
            return { min: toVND(parseFloat(m[1]), m[3]), max: toVND(parseFloat(m[2]), m[3]) };
        }
    }

    // "dưới 15tr", "tối đa 20 triệu", "không quá 12tr"
    const maxPatterns = [/(dưới|dưới khoảng|không quá|tối đa|<|max)\s*(\d+(?:\.\d+)?)\s*(tr|triệu|k)?/i];
    for (const pattern of maxPatterns) {
        const m = q.match(pattern);
        if (m) return { max: toVND(parseFloat(m[2]), m[3]) };
    }

    // "trên 10tr", "từ 8tr trở lên"
    const minPatterns = [
        /(trên|từ|>|min)\s*(\d+(?:\.\d+)?)\s*(tr|triệu|k)?/i,
        /(\d+(?:\.\d+)?)\s*(tr|triệu)\s*(trở lên|trở lên)/i,
    ];
    for (const pattern of minPatterns) {
        const m = q.match(pattern);
        if (m) return { min: toVND(parseFloat(m[2] || m[1]), m[3] || m[2]) };
    }

    // "tầm 10tr", "khoảng 15 triệu" → ±20% buffer
    const approxPatterns = [/(tầm|khoảng|around|~)\s*(\d+(?:\.\d+)?)\s*(tr|triệu|k)?/i];
    for (const pattern of approxPatterns) {
        const m = q.match(pattern);
        if (m) {
            const base = toVND(parseFloat(m[2]), m[3]);
            return { min: Math.round(base * 0.8), max: Math.round(base * 1.2) };
        }
    }

    // số đơn thuần "10tr", "15 triệu"
    const singleMatch = q.match(/(\d+(?:\.\d+)?)\s*(tr|triệu)/i);
    if (singleMatch) {
        const base = toVND(parseFloat(singleMatch[1]), singleMatch[2]);
        return { max: base };
    }

    return {};
};

// ===== DETECT INTENT (so sánh, hỏi specs, gợi ý...) =====
const detectIntent = (question) => {
    const q = question.toLowerCase();
    if (/so sánh|khác nhau|nên chọn.*hay|.*vs\s/.test(q)) return 'compare';
    if (/thông số|specs|cấu hình|ram|pin|camera|màn hình/.test(q)) return 'specs';
    if (/gợi ý|tư vấn|nên mua|recommend|phù hợp/.test(q)) return 'recommend';
    if (/giá|bao nhiêu|rẻ nhất|đắt nhất/.test(q)) return 'price';
    return 'general';
};

// ===== DETECT BRAND =====
const detectBrand = (question) => {
    const brands = ['samsung', 'apple', 'iphone', 'xiaomi', 'oppo', 'vivo', 'realme', 'nokia', 'sony'];
    const q = question.toLowerCase();
    return brands.find((b) => q.includes(b)) || null;
};

// ===== MAIN CHATBOT =====
const Chatbot = async (question) => {
    try {
        const where = {};

        // 1. Lọc theo giá
        const price = extractPriceRange(question);
        if (price.min && price.max) {
            where.priceProduct = { [Op.between]: [price.min, price.max] };
        } else if (price.max) {
            where.priceProduct = { [Op.lte]: price.max };
        } else if (price.min) {
            where.priceProduct = { [Op.gte]: price.min };
        }

        // 2. Lọc theo brand (nếu có)
        const brand = detectBrand(question);
        if (brand) {
            where.nameProduct = { [Op.iLike]: `%${brand}%` };
        }

        // 3. Lấy sản phẩm
        let products = await product.findAll({
            where,
            limit: 5,
            order: [['priceProduct', 'ASC']],
            attributes: ['id', 'nameProduct', 'priceProduct', 'descriptionProduct', 'specsProduct'],
        });

        // Fallback: nếu không có sản phẩm → lấy 3 rẻ nhất
        if (!products.length) {
            products = await product.findAll({
                limit: 3,
                order: [['priceProduct', 'ASC']],
                attributes: ['id', 'nameProduct', 'priceProduct', 'descriptionProduct', 'specsProduct'],
            });
        }

        // 4. Format danh sách sản phẩm
        const productList = products
            .map(
                (p, i) => `
📱 ${i + 1}. ${p.nameProduct}
💰 Giá: ${Number(p.priceProduct).toLocaleString('vi-VN')} VND
📝 Mô tả: ${p.descriptionProduct || 'Không có mô tả'}
🔧 Thông số: ${p.specsProduct || 'Không có thông số'}`,
            )
            .join('\n---\n');

        // 5. Phân tích câu hỏi
        const purpose = detectPurpose(question);
        const purposeInfo = purposeMapping[purpose];
        const intent = detectIntent(question);

        // 6. Xây dựng system prompt theo intent
        const intentGuide = {
            compare: 'So sánh điểm mạnh/yếu của từng máy, đưa ra kết luận rõ ràng nên chọn máy nào và lý do.',
            specs: 'Tập trung phân tích thông số kỹ thuật liên quan đến câu hỏi, giải thích dễ hiểu.',
            recommend: 'Gợi ý 1-2 máy phù hợp nhất, giải thích lý do phù hợp với nhu cầu.',
            price: 'Sắp xếp và phân tích theo giá, chỉ ra máy nào đáng tiền nhất.',
            general: 'Trả lời tự nhiên, thân thiện, đưa ra gợi ý hữu ích.',
        };

        const prompt = `
Bạn là chuyên gia tư vấn điện thoại thông minh tại Việt Nam, nói chuyện thân thiện và dễ hiểu.

${
    purposeInfo
        ? `🎯 Nhu cầu khách hàng: ${purposeInfo.name} (${purposeInfo.description})
✅ Ưu tiên: ${purposeInfo.priorities.join(', ')}`
        : ''
}

📋 Sản phẩm hiện có:
${productList}

💬 Câu hỏi: "${question}"

📌 Hướng dẫn trả lời:
- ${intentGuide[intent]}
- Chỉ dùng thông tin từ danh sách sản phẩm trên, KHÔNG bịa thêm
- Nếu không có sản phẩm phù hợp, hãy nói thật và gợi ý thay thế
- Trả lời bằng tiếng Việt, ngắn gọn súc tích
- Dùng emoji hợp lý để dễ đọc
`;

        // 7. Gọi AI
        const result = await client.chat.completions.create({
            model: 'llama-3.3-70b-versatile',
            messages: [
                {
                    role: 'system',
                    content:
                        'Bạn là chuyên gia tư vấn điện thoại tại Việt Nam. Luôn trả lời bằng tiếng Việt, thân thiện, chính xác dựa trên dữ liệu được cung cấp.',
                },
                { role: 'user', content: prompt },
            ],
            temperature: 0.5, // ít "sáng tạo" hơn → ít bịa hơn
            max_tokens: 800,
        });

        return result.choices[0].message.content;
    } catch (error) {
        console.error('[Chatbot Error]', error);
        return '😅 Xin lỗi, tôi đang gặp sự cố. Vui lòng thử lại sau!';
    }
};

module.exports = Chatbot;
