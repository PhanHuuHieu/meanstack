const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let Landlords = new Schema({
    mact:{type:String},
    hoten:{type:String},
    diachi:{type: String},
    sodt:{type:String},
    email:{type:String},
    cmnd:{type: String}
});
module.exports = mongoose.model('Landlords', Landlords)