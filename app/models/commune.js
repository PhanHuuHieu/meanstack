const mongoose = require('mongoose');
const Schema = mongoose.Schema;
let commune = new Schema({
    maphuong: { type: Number },
    tenphuong: { type: String },
    maquan:{type: Number}
});
module.exports = mongoose.model('Commune', commune)