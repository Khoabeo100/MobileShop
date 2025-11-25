const { DataTypes } = require('sequelize');
const { connect } = require('../config/connectDB');

const payments = connect.define('payments', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    idPayment: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    userId: {
        type: DataTypes.UUID,
        allowNull: false,
    },
    productId: {
        type: DataTypes.UUID,
        allowNull: false,
    },
    quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    totalPrice: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    fullName: {
        type: DataTypes.STRING,
    },
    phoneNumber: {
        type: DataTypes.STRING,
    },
    address: {
        type: DataTypes.STRING,
    },
    nameCoupon: {
        type: DataTypes.STRING,
    },
    typePayment: {
        type: DataTypes.ENUM('cod', 'momo', 'vnpay'),
        allowNull: false,
    },
    status: {
        type: DataTypes.ENUM('pending', 'confirm', 'shipping', 'success', 'failed'),
        defaultValue: 'pending',
        allowNull: false,
    },
    note: {
        type: DataTypes.STRING,
    },
    email: {
        type: DataTypes.STRING,
    },
});

module.exports = payments;
