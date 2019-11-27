const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let street = new Schema({
    maduong: { type: Number },
    tenduong: { type: String },
    maphuong: { type: Number }
});
module.exports = mongoose.model('Street', street)