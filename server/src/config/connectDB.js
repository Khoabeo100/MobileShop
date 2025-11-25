require('dotenv').config();
const { Sequelize } = require('sequelize');

const connect = new Sequelize('phone', 'root', process.env.DB_PASSWORD, {
    host: process.env.DB_HOST,
    dialect: 'mysql',
    port: process.env.MYSQL_PORT,
});

const connectDB = async () => {
    try {
        await connect.authenticate();
        console.log('Connect Database Success!');
    } catch (error) {
        console.error('error connect database:', error);
    }
};

module.exports = { connectDB, connect };
