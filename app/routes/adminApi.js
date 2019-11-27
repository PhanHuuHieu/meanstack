var multer = require('multer');
var News = require('../models/news');
var User = require('../models/user');
var News = require('../models/news');
var Landlord = require('../models/landlords');
var Address = require('../models/address');
var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://127.0.0.1:27017/";
module.exports = function (router) {
    // get post
    router.get('/getpost/:id', function (req, res) {
        News.findOne({ _id: req.params.id }, function (err, news) {
            if (err) throw err;
            Address.findOne({ mabaidang: news.mabd }, function (err, address) {
                if (err) throw err;
                res.json({ news: news, address: address });
            })
        })
    })
    // delete post
    router.delete('/delete/:id', function (req, res) {
        News.findOneAndRemove({ mabd: req.params.id }, function (err, news) {
            if (err) {
                res.json({ success: false, message: 'Xóa không thành công, xin thử lại' })
            } else {
                res.json({ success: true });
            }
        })
    })
    router.get('/adminnews/:page', async (req, res, next) => {
        const resPerPage = 5;
        const page = req.params.page || 1;
        var t = Math.floor(page);
        User.findOne({ username: req.decoded.username }, function (err, user) {
            if (err) throw err;
            if (!user) {
                res.json({ success: false, message: 'No user was found' })
            } else {
                if (user.permission == 'admin' || user.permission == 'moderator') {
                    News.find().select().exec(function (err, data) {
                        numOfProducts = data.length;
                        MongoClient.connect(url, function (err, db) {
                            if (err) throw err;
                            var dbo = db.db("tutorial");
                            dbo.collection('news').aggregate([
                                {
                                    $lookup:
                                    {
                                        from: 'landlords',
                                        localField: 'mact',
                                        foreignField: 'mact',
                                        as: 'landlord'
                                    }
                                },
                            ]).skip((resPerPage * t) - resPerPage).limit(resPerPage).toArray(function (err, news) {
                                if (err) throw err;
                                res.json({
                                    success: true,
                                    news: news,
                                    currentPage: t,
                                    pages: Math.ceil(numOfProducts / resPerPage),
                                    numOfResults: numOfProducts
                                });
                            });
                        });
                    })

                } else if (user.permission == 'user') {
                    User.findOne({ email: user.email }, function (err, userss) {
                        Landlord.findOne({ email: user.email }, function (err, landlord) {
                            News.find({ mact: landlord.mact }, function (err, news) {
                                numOfProducts = news.length;
                                News.find({ mact: landlord.mact }, function (err, news) {

                                    res.json({
                                        success: true,
                                        permission: userss.permission,
                                        news: news,
                                        landlord: landlord,
                                        user: userss,
                                        currentPage: t,
                                        pages: Math.ceil(numOfProducts / resPerPage),
                                        numOfResults: numOfProducts
                                    });
                                }).skip((resPerPage * t) - resPerPage).limit(resPerPage)
                            })
                        })
                    })

                }
            }
        })

    });

    router.get('/adminpagination/:page', async (req, res, next) => {

        const resPerPage = 5;
        const page = req.params.page || 1;
        var t = Math.floor(page);
        var pagi = {};
        const foundProduct = await News.find()
            .skip((resPerPage * t) - resPerPage).limit(resPerPage);
        var numOfProducts1 = await News.find({ trangthai: 'Chưa duyệt' });
        var numOfProducts = numOfProducts1.length;

        Math.floor(page);
        MongoClient.connect(url, function (err, db) {
            if (err) throw err;
            var dbo = db.db("tutorial");
            dbo.collection('news').aggregate([
                {
                    $lookup:
                    {
                        from: 'landlords',
                        localField: 'mact',
                        foreignField: 'mact',
                        as: 'landlord'
                    }
                }, { $match: { trangthai: 'Chưa duyệt' } },
            ]).skip((resPerPage * t) - resPerPage).limit(resPerPage).toArray(function (err, news) {
                if (err) throw err;
                res.json({
                    success: true,
                    news: news,
                    currentPage: t,
                    pages: Math.ceil(numOfProducts / resPerPage),
                    numOfResults: numOfProducts
                });
            });
        });
    });
    router.post('/browse/:id', function (req, res) {
        News.findOne({ _id: req.params.id }).select().exec(function (err, user) {
            if (err) throw err;
            if (!user) {
                res.json({ success: false, message: 'User is not found' });
            } else {
                user.trangthai = "Đã duyệt";
                user.save(function (err) {
                    if (err) throw err;
                    res.json({ success: true, message: 'News has been browsed' })
                })
            }
        })
    });

    router.get('/userpost/:page', function (req, res) {
        User.findOne({ username: req.decoded.username }, function (err, user) {
            if (err) throw err;
            if (!user) {
                res.json({ success: false, message: 'No user was found' })
            } else {
                const resPerPage = 5;
                const page = req.params.page || 1;
                var t = Math.floor(page); Math.floor(page);
                MongoClient.connect(url, function (err, db) {
                    if (err) throw err;
                    var dbo = db.db("tutorial");
                    dbo.collection('users').aggregate([
                        {
                            $lookup:
                            {
                                from: 'landlords',
                                localField: 'email',
                                foreignField: 'email',
                                as: 'landlord'
                            }
                        },
                        {
                            $lookup:
                            {
                                from: 'news',
                                localField: 'mact',
                                foreignField: 'mact',
                                as: 'news'
                            }
                        }
                    ]).skip((resPerPage * t) - resPerPage).limit(resPerPage).toArray(function (err, news) {
                        if (err) throw err;
                        res, json(news);
                        res.json({
                            success: true,
                            news: news,
                            currentPage: t,
                            pages: Math.ceil(numOfProducts / resPerPage),
                            numOfResults: numOfProducts
                        });
                    });
                });
            }
        })
    })

    //Test


    router.get('/infomation', function (req, res) {
        User.findOne({ username: req.decoded.username }, function (err, user) {
            if (err) throw err;
            console.log(user.email);
            Landlord.findOne({ email: user.email }, function (err, landlord) {
                if (err) throw err;
                res.json({ landlord: landlord, user: user });
            })
        })
    })
    router.post('/editInfo', function (req, res) {
        User.findOne({ username: req.decoded.username }, function (err, user) {
            if (err) throw err;
            if (!user) {
                res.json({ success: false, message: 'No user was found' });
            } else {
                var email = email;
                Landlord.findOne({ email: email }, function (err, landlord) {
                    if (err) throw err;
                    if (req.body.phone != undefined && req.body.phone != null) {
                        landlord.sodt = req.body.phone;
                    }
                    if (req.body.address != undefined || req.body.address != null) {
                        landlord.diachi = req.body.address;
                    }
                    landlord.save(function (err) {
                        if (err) throw err;
                        if (req.body.name != undefined && req.body.name != null) {
                            user.name = req.body.name;
                        }
                        if (req.body.email != undefined && req.body.email != null) {
                            user.email = req.body.email;
                        }
                        user.save(function (err) {
                            if (err) throw err;
                            res.json({ success: true });
                        })
                    })
                })

            }
        })
    })

    //Edit post
    router.post('/editpost', function (req, res) {
        // News.find()
        News.findOne({ _id: req.body.id }, function (err, news) {
            if (err) return res.json(err);
            Address.find({ mabaidang: news.mabd }, function (err, addresss) {
                news.mota = req.body.description;
                news.tieude = req.body.title;
                news.loaitin = req.body.category;
                news.giaphong = req.body.price;
                news.sodt = req.body.phone;
                news.songuoi = req.body.amount;
                news.dientich = req.body.acreage;
                news.doituong = req.body.sex;
                news.anhbia = req.body.filename;
                news.save(function (err) {
                    if (err) throw err;
                    Address.findOne({ mabaidang: news.mabd }, function (err, data) {
                        data.diachichinhxac = req.body.address;
                        data.save(function (err) {
                            if (err) console.log(err);
                            else res.json({ success: true })
                        })
                    })
                })
            })
        })
    })
    return router;
};
