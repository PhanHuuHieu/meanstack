const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let Rate = new Schema({
    madg: { type: String },
    noidung: { type: String },
    MaBD: { type: String },
});
module.exports = mongoose.model('Rate', Rate)