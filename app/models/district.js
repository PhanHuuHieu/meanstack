const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let distric = new Schema({
    maquan: { type: Number },
    tenquan: { type: String },
    matp: { type: Number }
});
module.exports = mongoose.model('Distric', distric)