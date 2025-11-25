const { DataTypes } = require('sequelize');
const { connect } = require('../config/connectDB');

const notication = connect.define('notication', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    content: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    userId: {
        type: DataTypes.UUID,
        allowNull: true,
    },
    isRead: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: '0',
    },
    idPayment: {
        type: DataTypes.UUID,
        allowNull: true,
    },
});

module.exports = notication;
