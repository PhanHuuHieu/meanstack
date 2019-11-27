const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let Apartment_Number = new Schema({
    masn: { type: String },
    tensn: { type: String },
    makp: { type: String }
});
module.exports = mongoose.model('Apartment_Number', Apartment_Number)