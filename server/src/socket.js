const { Server } = require('socket.io');
const { verifyToken } = require('./services/tokenServices');
const modelUser = require('./models/users.model');
require('dotenv').config();

let io;
const connectedUsers = new Map();

async function initSocket(server) {
    io = new Server(server, {
        cors: {
            origin: process.env.CLIENT_URL,
            credentials: true,
        },
    });

    io.on('connection', async (socket) => {
        console.log('A user connected:', socket.id);

        try {
            const cookieHeader = socket.handshake.headers.cookie;
            if (!cookieHeader) {
                console.log('⚠️ Không có cookie, từ chối kết nối:', socket.id);
                socket.disconnect();
                return;
            }

            const tokenCookie = cookieHeader
                .split(';')
                .map((c) => c.trim())
                .find((c) => c.startsWith('token='));

            if (!tokenCookie) {
                console.log('⚠️ Không tìm thấy token trong cookie:', socket.id);
                socket.disconnect();
                return;
            }

            const token = tokenCookie.split('=')[1];
            const { id } = await verifyToken(token); // <-- có thể throw error
            socket.userId = id;

            connectedUsers.set(socket.userId, socket.id);

            const findUser = await modelUser.findOne({ where: { id: socket.userId } });
            if (findUser) {
                await modelUser.update(
                    { lastLoginAt: new Date(), isOnline: 'online' },
                    { where: { id: socket.userId } },
                );
            } else {
                console.log('⚠️ User không tồn tại trong DB');
            }

            socket.on('userConnected', async (userId) => {
                console.log(`User ${userId} connected with socket ID: ${socket.id}`);
            });

            socket.on('disconnect', async () => {
                if (socket.userId) {
                    const findUser = await modelUser.findOne({ where: { id: socket.userId } });
                    if (findUser) {
                        await modelUser.update(
                            { lastLoginAt: new Date(), isOnline: 'offline' },
                            { where: { id: socket.userId } },
                        );
                        console.log('Đã cập nhật trạng thái offline');
                    }
                    connectedUsers.delete(socket.userId);
                }
                console.log('User disconnected:', socket.id);
            });
        } catch (error) {
            console.error('❌ Lỗi xác thực token:', error.message);
            socket.disconnect();
        }
    });

    return io;
}

function getIO() {
    if (!io) throw new Error('Socket.io chưa được khởi tạo!');
    return io;
}

module.exports = { initSocket, getIO, connectedUsers };
