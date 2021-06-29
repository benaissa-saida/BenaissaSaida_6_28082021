const app = require('./app');

require('dotenv').config()

const db = {
    user : process.env.DB_USER,
    password : process.env.DB_PASSWORD,
    nameDb : process.env.DB_NAME,
}