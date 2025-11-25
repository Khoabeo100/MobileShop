const  Groq  = require('groq-sdk');
const product = require('../models/products.model'); // Sequelize model

// Khởi tạo client Groq
const client = new Groq({ apiKey: process.env.GROQ_API_KEY });

// Mapping mục đích sử dụng
const purposeMapping = {
    gaming: {
        name: 'Chơi Game',
        description: 'PUBG, Liên Quân, Genshin Impact',
        requirements: {
            chipset: 'Snapdragon 8 Gen 1+ hoặc Dimensity 8100+',
            gpu: 'GPU Adreno/Mali đời mới',
            ram: '8GB - 12GB',
            storage: '128GB+ UFS 3.1',
            display: 'AMOLED 120Hz, cảm ứng mượt',
            battery: 'Pin 4500mAh+, sạc nhanh 67W+',
            cooling: 'Hệ thống tản nhiệt buồng hơi',
        },
        priorities: ['Hiệu năng chipset', 'GPU mạnh', 'Màn hình 120Hz', 'Pin & sạc nhanh', 'Tản nhiệt'],
    },
    office: {
        name: 'Công Việc',
        description: 'Gọi video, email, chat, quản lý file',
        requirements: {
            chipset: 'Snapdragon 7+ Gen 2 hoặc tương đương',
            ram: '8GB',
            storage: '128GB',
            display: 'Màn hình Full HD+, chống chói',
            battery: 'Pin 5000mAh, sạc nhanh 30W+',
            connectivity: '5G, WiFi 6, NFC',
        },
        priorities: ['Thời lượng pin', 'Độ ổn định kết nối', 'Màn hình rõ nét', 'Trọng lượng nhẹ'],
    },
    camera: {
        name: 'Nhiếp Ảnh',
        description: 'Chụp ảnh, chỉnh sửa, lưu giữ kỷ niệm',
        requirements: {
            mainCamera: '50MP+ OIS, khẩu độ lớn',
            ultraWide: '12MP+ góc rộng',
            telephoto: 'Zoom quang 2x-5x',
            selfie: '12-32MP AI Beauty',
            display: 'AMOLED HDR, 100% DCI-P3',
            storage: '256GB để lưu ảnh/video',
        },
        priorities: ['Chất lượng camera', 'OIS chống rung', 'Chụp đêm tốt', 'Màn hình HDR', 'Bộ nhớ đủ lớn'],
    },
    video: {
        name: 'Quay Video',
        description: 'TikTok, YouTube, Vlog, dựng clip',
        requirements: {
            mainCamera: '4K 60fps, chống rung OIS+EIS',
            frontCamera: '1080p 60fps',
            storage: '256GB+',
            chipset: 'Snapdragon 8 Gen 2',
            display: 'AMOLED HDR10+',
            mic: 'Thu âm stereo',
        },
        priorities: ['Quay 4K/8K mượt', 'Chống rung', 'Mic thu tốt', 'Màn hình HDR'],
    },
    social: {
        name: 'Mạng Xã Hội',
        description: 'Facebook, Instagram, TikTok, Zalo',
        requirements: {
            chipset: 'Snapdragon 6 Gen 1+ hoặc tương đương',
            ram: '6-8GB',
            storage: '128GB',
            display: 'AMOLED/IPS Full HD+',
            battery: 'Pin 5000mAh',
            camera: 'Selfie 12MP+ đẹp',
        },
        priorities: ['Pin lâu', 'Camera selfie đẹp', 'Màn hình sáng', 'Hiệu năng vừa đủ'],
    },
    student: {
        name: 'Học Tập',
        description: 'Học online, Google Meet, tra cứu tài liệu',
        requirements: {
            chipset: 'Snapdragon 6/7 Gen 1 hoặc tương đương',
            ram: '6-8GB',
            storage: '128GB',
            display: 'Màn hình lớn 6.5"+, chống mỏi mắt',
            battery: 'Pin 5000mAh+',
            speaker: 'Loa kép rõ ràng',
        },
        priorities: ['Giá rẻ', 'Pin trâu', 'Màn hình lớn', 'Kết nối ổn định'],
    },
};

async function analyzeProductForPurpose(reviewData) {
    try {
        const { purpose, productId } = reviewData;

        // Lấy sản phẩm từ DB
        const productData = await product.findOne({ where: { id: productId } });
        if (!productData) throw new Error('Sản phẩm không tồn tại');

        const purposeInfo = purposeMapping[purpose];
        if (!purposeInfo) throw new Error('Mục đích sử dụng không hợp lệ');

        // HTML hiển thị sản phẩm
        const productHTML = `
            <div style="border:2px solid #007bff;padding:16px;margin:12px 0;border-radius:12px;background:linear-gradient(135deg,#f8f9ff,#e8f0ff);">
                ${
                    productData.imagesProduct
                        ? `<img src="http://localhost:3000/uploads/products/${productData.imagesProduct.split(',')[0]}" 
                               alt="${productData.nameProduct}" 
                               style="width:100px;height:100px;object-fit:cover;border-radius:8px;float:left;margin-right:16px;">`
                        : ''
                }
                <h2 style="color:#007bff;font-size:18px;">${productData.nameProduct}</h2>
                <p style="color:#28a745;font-weight:bold;">💰 Giá: ${Number(productData.priceProduct).toLocaleString(
                    'vi-VN',
                )} VND</p>
                <p style="color:#6c757d;"><strong>Mô tả:</strong> ${productData.descriptionProduct}</p>
            </div>
        `;

        // Prompt
        const prompt = `
        🤖 Bạn là CHUYÊN GIA ĐIỆN THOẠI!
        📋 THÔNG TIN PHÂN TÍCH:
        • Mục đích sử dụng: ${purposeInfo.name} (${purposeInfo.description})
        • Yêu cầu kỹ thuật: 
          ${Object.entries(purposeInfo.requirements)
              .map(([k, v]) => `- ${k}: ${v}`)
              .join('\n  ')}
        • Ưu tiên đánh giá: ${purposeInfo.priorities.join(', ')}

        🔍 SẢN PHẨM:
        ${productHTML}

        📊 Hãy trả về HTML đẹp với các mục:
        1. 🎯 Tổng quan & Điểm số (1-10)
        2. ✅ Điểm mạnh
        3. ❌ Điểm yếu
        4. 💡 Đánh giá chi tiết (chipset, RAM, camera, màn hình, pin, sạc nhanh…)
        5. 📱 Hiệu năng dự đoán (game/app, quay video…)
        6. 💰 Giá trị & so sánh
        7. 🔮 Kết luận & khuyến nghị

        ⚠️ Lưu ý:
        - Phân tích khách quan, dựa trên specs
        - Không bịa thông tin
        - Trả về HTML với icon và màu sắc
        `;

        // Gọi AI Groq SDK
        const result = await client.generate({
            model: 'groq-1.5',
            input: prompt,
            modalities: ['text'],
        });

        return {
            success: true,
            analysis: result.output_text || result.output?.[0]?.content || '', // tùy phiên bản SDK
            purpose: purposeInfo.name,
            productName: productData.nameProduct,
            productId,
        };
    } catch (err) {
        return {
            success: false,
            error: err.message,
            analysis: `<div style="color:#c53030;">❌ Lỗi phân tích: ${err.message}</div>`,
        };
    }
}

module.exports = { analyzeProductForPurpose };
