const mongoose = require('mongoose');
const Schema = mongoose.Schema;
let Town= new Schema({
    makp: { type: String },
    tenkp: { type: String },
    maphuong: { type: String }
});
module.exports = mongoose.model('Town', Town)