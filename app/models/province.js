const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let province = new Schema({
    matp: { type: String },
    tentp: { type: String },
});
module.exports = mongoose.model('Province', province)