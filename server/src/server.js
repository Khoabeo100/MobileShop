require('dotenv').config();
const express = require('express');
const app = express();
const port = 3001;

const { connectDB } = require('./config/connectDB');
const sync = require('./models/sync');
const { initSocket } = require('./socket');
const { createServer } = require('node:http');
const server = createServer(app);

const cors = require('cors');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const route = require('./routes/index.routes.js');
const path = require('path');
const Chatbot = require('./utils/Chatbot');
const { analyzeProductForPurpose } = require('./utils/AIReview');
const { verifyToken } = require('./services/tokenServices');
const modelUser = require('./models/users.model');
const modelMessage = require('./models/message.model');

app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(express.static(path.join(__dirname, '../src')));

connectDB();

sync();

route(app);

app.post('/api/review', async (req, res) => {
    const reviewData = await analyzeProductForPurpose(req.body);
    return res.status(200).json({ reviewData });
});

app.post('/api/chatbot', async (req, res) => {
    try {
        const { question, filter = {} } = req.body;

        if (!question) {
            return res.status(400).json({
                success: false,
                message: 'Question is required',
            });
        }

        const answer = await Chatbot(question, filter);

        // Nếu người dùng đang đăng nhập thì lưu câu trả lời chatbot vào lịch sử tin nhắn
        const token = req.cookies?.token;
        if (token) {
            try {
                const decoded = await verifyToken(token);
                const userId = decoded?.id;
                const admin = await modelUser.findOne({ where: { role: 'admin' } });

                if (userId && admin) {
                    await modelMessage.create({
                        senderId: admin.id,
                        receiverId: userId,
                        text: answer,
                    });
                }
            } catch (authError) {
                console.warn('Chatbot history not saved: user not authenticated');
            }
        }

        return res.status(200).json({
            success: true,
            answer,
        });
    } catch (error) {
        console.error('Chatbot route error:', error);

        return res.status(500).json({
            success: false,
            message: 'Lỗi chatbot máy chủ',
        });
    }
});

app.use((err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    res.status(statusCode).json({
        success: false,
        message: err.message || 'Lỗi server',
    });
});

initSocket(server);

server.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});
