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
