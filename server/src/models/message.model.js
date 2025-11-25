const { DataTypes } = require('sequelize');
const { connect } = require('../config/connectDB');

const Message = connect.define(
    'message',
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        senderId: {
            type: DataTypes.UUID,
            allowNull: false,
        },
        receiverId: {
            type: DataTypes.UUID,
            allowNull: false,
        },
        text: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        isRead: {
            type: DataTypes.STRING,
            defaultValue: '0',
        },
        createdAt: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
        },
    },
    {
        tableName: 'messages',
        timestamps: false, // vì schema mongoose bạn để timestamps: false
    },
);

module.exports = Message;
