const { DataTypes } = require('sequelize');
const { connect } = require('../config/connectDB');

const website = connect.define('website', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    banner: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
});

module.exports = website;
