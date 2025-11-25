const { DataTypes } = require('sequelize');
const { connect } = require('../config/connectDB');

const coupon = connect.define('coupon', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    nameCoupon: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    discount: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    startDate: {
        type: DataTypes.DATE,
        allowNull: false,
    },
    endDate: {
        type: DataTypes.DATE,
        allowNull: false,
    },
    minPrice: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
});

module.exports = coupon;
