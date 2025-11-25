const { getIO, connectedUsers } = require('../socket');

const emitToUser = (userId, event, data) => {
    const socketId = connectedUsers.get(userId.toString());
    if (socketId) {
        getIO().to(socketId).emit(event, data);
    }
};

const socketService = {
    sendMessage: (userId, event, data) => {
        emitToUser(userId, event, data);
    },
};

module.exports = socketService;
