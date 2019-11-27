const mongoose = require('mongoose');
const Schema = mongoose.Schema;
let news = new Schema({
    mabd:{type:Number},
    tieude: { type: String },
    mact: { type: String },
    ngaydang: { type: String },
    giodang: { type: String },
    soluongphong: { type: String, default:1 },
    mota: { type: String },
    giaphong: { type: String },
    dientich: { type: String },
    songuoi: { type: String },
    loaitin: { type: String },
    doituong: { type: String },
    anhbia: { type: String },
    trangthai: { type: String ,default:'Chưa duyệt'},
    ngayhethan: { type: String },
    sodt:{type:String},
    hinh:{type:Number}
});
module.exports = mongoose.model('News', news)