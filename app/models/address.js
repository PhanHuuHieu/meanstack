const mongoose = require('mongoose');
const Schema = mongoose.Schema;
let Address = new Schema({
    mabaidang:{type:Number},
    tinh_tp:{type:String},
    quan_huyen:{type: String},
    duong:{type:String},
    xa_phuong:{type:String},
    diachichinhxac:{type:String}
});
module.exports = mongoose.model('Address', Address)