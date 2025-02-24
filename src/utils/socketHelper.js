let io;

const initializeSocket = (serverIo) => {
    io = serverIo;
};

const sendNotification = async (userId, message) => {
    if (io) {
        io.to(`user_${userId}`).emit('receiveNotification', message);
    } else {
        console.error('Socket.IO is not initialized.');
    }
};

export default {
    initializeSocket,
    sendNotification,
};
