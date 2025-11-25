const { DataTypes } = require('sequelize');
const { connect } = require('../config/connectDB');

const favouriteProduct = connect.define('favouriteProduct', {
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
});

module.exports = favouriteProduct;
