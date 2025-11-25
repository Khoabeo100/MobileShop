const { DataTypes } = require('sequelize');
const { connect } = require('../config/connectDB');

const cart = connect.define('cart', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
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
    note: {
        type: DataTypes.STRING,
    },
    email: {
        type: DataTypes.STRING,
    },
});

module.exports = cart;
