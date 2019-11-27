const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let Images = new Schema({
    mabd:{type:Number},
    hinh1:{type: String},
    hinh2:{type: String},
    hinh3:{type: String}
});
module.exports = mongoose.model('Images', Images)