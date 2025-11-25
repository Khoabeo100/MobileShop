const { DataTypes } = require('sequelize');
const { connect } = require('../config/connectDB');

const previewProduct = connect.define('previewProduct', {
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
    content: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    rating: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
});

module.exports = previewProduct;
