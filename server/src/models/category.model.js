const { DataTypes } = require('sequelize');
const { connect } = require('../config/connectDB');

const category = connect.define('category', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    nameCategory: {
        type: DataTypes.STRING,
        allowNull: false,
    },
});

module.exports = category;
