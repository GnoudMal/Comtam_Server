const mongoose = require('mongoose')
require('dotenv').config();

const DB_NAME = process.env.DB_NAME;

mongoose.connect('mongodb://localhost:27017/' + DB_NAME)
    .catch((err) => {
        console.log("Loi ket noi CSDL");
        console.log(err);
    });

module.exports = { mongoose }