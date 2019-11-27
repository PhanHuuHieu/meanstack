var multer = require('multer');
var News = require('../models/news');
var User = require('../models/user');
var moment = require('moment');
var Address = require('../models/address');
var Province = require('../models/province');
var Dictric = require('../models/district');
var Commune = require('../models/commune');
var Street = require('../models/street');


module.exports = function (router) {

    var storage = multer.diskStorage({ //multers disk storage settings
        destination: function (req, file, cb) {
            cb(null, 'public/assets/images/');
        },
        filename: function (req, file, cb) {
            var datetimestamp = Date.now();

            cb(null, file.originalname);
        }
    });
    var upload = multer({ //multer settings
        storage: storage
    }).single('file');

    router.post('/upload', function (req, res) {
        upload(req, res, function (err) {
            if (err) {
                console.log(err);
            }
            res.json({ error_code: 0, err_desc: null });
        });
    })
    router.post('/savenews', function (req, res) {
        var newId = {};
        var datetime = new Date();
        var date1 = moment(new Date());
        News.find().select('mabd').sort({ 'mabd': -1 }).limit(1).exec(function (err, data) {
            if (err) return res.json(err);
            var username = req.decoded.username;
            newId = data[0].mabd + 1;
            var news = new News();
            news.mabd = newId;
            news.tieude = req.body.title;
            news.sodt = req.body.phone;
            news.mact = req.decoded.username;
            news.ngaydang = datetime.toISOString().slice(0, 10);
            news.giodang = datetime.getHours() + ":" + datetime.getMinutes() + ":" + datetime.getMinutes();
            news.mota = req.body.decription;
            news.giaphong = req.body.price;
            news.dientich = req.body.acreage;
            news.songuoi = req.body.amount;
            news.loaitin = req.body.categorynews;
            news.doituong = req.body.sex;
            news.anhbia = req.body.filename;
            news.ngayhethan = date1.add(30, 'd').toISOString().slice(0, 10);;
            news.username = req.decoded.username;
            var address = new Address();
            address.mabaidang = newId;
            address.diachichinhxac = req.body.address;

            news.save(function (err) {
                if (err) res.json({ success: false });
                Province.find().select().exec(function (err, data) {
                    if (err) console.log(err);
                    for (var i = 0; i < data.length; i++) {
                        if (data[i].matp == req.body.city) {
                            address.tinh_tp = data[i].tentp;
                        }
                    }
                    Dictric.find({ maquan: req.body.dictric }).select().exec(function (err, data) {
                        if (err) console.log(err);
                        address.quan_huyen = data[0].tenquan;
                        Commune.find({ maphuong: req.body.commune }).select().exec(function (err, data) {
                            address.xa_phuong = data[0].tenphuong;
                            Street.find({ maduong: req.body.street }).select().exec(function (err, data) {
                                address.duong = data[0].tenduong;
                                address.save(function (err) {
                                    if (err)  res.json({ success: false });
                                     else res.json({success: true, message:'News Posted'});
                                })
                            })
                        })
                    })
                })
            })
        });
    })
    return router;
};
