var User = require('../models/user'); // Import User Model
var jwt = require('jsonwebtoken'); // Import JWT Package
var secret = 'harrypotter'; // Create custom secret for use in JWT
var Province = require('../models/province');
var Distric = require('../models/district');
var Commune = require('../models/commune');
var Street = require('../models/street');
var News = require('../models/news');
var Address = require('../models/address');
var LandLord= require('../models/landlords');
var Images= require('../models/image');
// mongoose.connect('mongodb://localhost:27017/tutorial')
var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://127.0.0.1:27017/";

module.exports = function (router) {

    router.get('/cities', function (req, res) {
        Province.find().select().exec(function (err, province) {
            if (err) return res.send(err);
            res.json({ success: true, provinces: province });
        });
    });
    router.get('/streets/:maphuong', function (req, res) {
        Street.find({ 'maphuong': req.params.maphuong }, function (err, street) {
            if (err) throw err;
            res.json({ success: true, streets: street });
        })
    });
    router.get('/dictrics/:matp', function (req, res) {
        Distric.find({ 'matp': req.params.matp }, function (err, districs) {
            if (err) throw err;
            res.json({ success: true, districs: districs });
        })
    });
    router.get('/communes/:maquan', function (req, res) {
        Commune.find({ 'maquan': req.params.maquan }).select().exec(function (err, data) {
            res.json({ success: true, commune: data })
        });

    })

    router.get('/news', function (req, res) {
        MongoClient.connect(url, function (err, db) {
            if (err) throw err;
            var dbo = db.db("tutorial");
            dbo.collection('news').aggregate([
                {
                    $lookup:
                    {
                        from: 'addresses',
                        localField: 'mabaidang',
                        foreignField: 'mabd',
                        as: 'newsDetail'
                    }
                }
            ]).toArray(function (err, news) {
                if (err) throw err;
                db.close();
                res.json(news);
            });
        })
    });
    router.get('/newnews', function (req, res) {
        News.find().select().sort({ 'mabd': -1 }).limit(1).exec(function (err, newnews) {
            if (err) return res.json(err);
            res.json({ success: true, newnews: newnews });
        });
    });
    router.get('/pagination/:page', async (req, res, next) => {
        const resPerPage = 2;
        const page = req.params.page || 1;
        var t = Math.floor(page);
        var numOfProducts1 = await News.find({trangthai: 'Đã duyệt'});
        var numOfProducts = numOfProducts1.length;
        Math.floor(page);
        MongoClient.connect(url, function (err, db) {
            if (err) throw err;
            var dbo = db.db("tutorial");
            dbo.collection('news').aggregate([
                {
                    $lookup:
                    {
                        from: 'addresses',
                        localField: 'mabd',
                        foreignField: 'mabaidang',
                        as: 'address'
                    }
                },{ $match: {trangthai:'Đã duyệt'}},
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
    router.get('/address', function (req, res) {
        Address.find().select().exec(function (err, address) {
            if (err) throw err;
            res.json({ success: true, address: address });
        })
    })

    router.get('/detailroom/:id', function(req,res){
        MongoClient.connect(url, function (err, db) {
            if (err) throw err;
            var dbo = db.db("tutorial");
            dbo.collection('news').aggregate([
                {
                    $lookup:
                    {
                        from: 'addresses',
                        localField: 'mabd',
                        foreignField: 'mabaidang',
                        as: 'address'
                    }
                }, { $match: {mabd: Math.floor(req.params.id)} },
                {
                    $lookup:
                    {
                        from: 'landlords',
                        localField: 'mact',
                        foreignField: 'mact',
                        as: 'landlord'
                    }
                },
                {
                    $lookup:
                    {
                        from: 'images',
                        localField: 'mabd',
                        foreignField: 'mabd',
                        as: 'images'
                    }
                }
            ]).toArray(function (err, news) {
                if (err) throw err;
                if(news.length==0){
                    res.json({success: false, message: 'Room is not exist'});
                }
                else {
                    res.json({
                        success: true,
                        news: news
                   });
                }
            });
        });
    })

    router.get('/landlord/:id', function(req,res){
        MongoClient.connect(url, function (err, db) {
            if (err) throw err;
            var dbo = db.db("tutorial");
            dbo.collection('news').aggregate([
                {
                    $lookup:
                    {
                        from: 'addresses',
                        localField: 'mabd',
                        foreignField: 'mabaidang',
                        as: 'address'
                    }
                },  { $match: {mabd: Math.floor(req.params.id)} },
                {
                    $lookup:
                    {
                        from: 'landlords',
                        localField: 'mact',
                        foreignField: 'mact',
                        as: 'landlord'
                    }
                }
            ]).toArray(function (err, news) {
                if (err) throw err;
                if(news.length==0){
                    res.json({success: false, message: 'Room is not exist'});
                }
                else {
                    res.json({
                        success: true,
                        news: news
                   });
                }
            });
        });

    }) 
    router.post('/searchnews', function(req,res){
        var city = req.body.city;
        var commune =req.body.commune;
        var dictric = req.body.dictric;
        var street = req.body.street;
        var sex=req.body.sex;
        var categorynews=req.body.categorynews;
        var price=req.body.price;
        var acreage =req.body.acreage;
        
        var cityname="";
        var dictricname="";
        var communename= "";
        var streetname= "";
        Province.find().select().exec(function(err,data){
            if(err) throw err;
            if(data.length>0){
                for(var q = 0; q <data.length;q++){
                    if(city==data[q].matp){ 
                        cityname= data[q].tentp;
                    }
                }
            }
            
        });
        Distric.find().select().exec(function(err, data){
            if(err) throw err;
            if(data.length>0){
                for(var w = 0; w <data.length;w++){
                    if(dictric==data[w].maquan){
                        dictricname= data[w].tenquan;
                    }
                }
            }
        });
        Commune.find().select().exec(function(err,data){
            if(err) throw err;
            if(data.length>0){
                for(var e = 0; e <data.length;e++){
                    if(commune==data[e].maphuong){
                        communename= data[e].tenphuong;
                    }
                }
            }
        });
        Street.find().select().exec(function(err, data){
            if(err) throw err;
            if(data.length>0){
                for(var r = 0; r <data.length;r++){
                    if(street==data[r].maduong){
                        streetname= data[r].tenduong;
                    }
                }
            }
        });

        MongoClient.connect(url, function (err, db) {
            if (err) throw err;
            var dbo = db.db("tutorial");
            dbo.collection('news').aggregate([
                {
                    $lookup:
                    {
                        from: 'addresses',
                        localField: 'mabd',
                        foreignField: 'mabaidang',
                        as: 'address'
                    }
                },
                {
                    $lookup:
                    {
                        from: 'landlords',
                        localField: 'mact',
                        foreignField: 'mact',
                        as: 'landlord'
                    }
                },{ $match: {trangthai:'Đã duyệt'}},
            ]).toArray(function (err, news) {
                if (err) throw err;
                if(news.length==0){
                    res.json({success: false, message: 'Room is not exist'});
                }
                else {
                    if(categorynews !=null && categorynews!=undefined && categorynews!=""){
                        for(var i = 0; i < news.length; i++){
                            
                                if(news[i].loaitin!=categorynews){
                                    news.splice(i,1);
                                    i--;
                                }
                         }
                    }
                    if(sex!=null && sex != undefined && sex !=""){
                        for(var j = 0;j < news.length; j++){
                        
                                if(news[j].doituong!=sex ){
                                    news.splice(j,1);
                                    j--;
                                }
                         }
                    }
                    if(city!=null && cityname!=undefined && cityname!="")
                    {
                        for(var k = 0;k < news.length; k++){
                            if(news[k].address[0].tinh_tp!=cityname ){
                                news.splice(k,1);
                                 k--;
                            }
                        }
                    }
                   if(dictricname !=null && dictricname !=undefined && dictricname !=""){
                        for(var u = 0; u< news.length; u++){
                            if(news[u].address[0].quan_huyen!=dictricname){
                                news.splice(u,1);
                                u--;
                            }
                        }
                   }
                   if(communename!=null && communename!=undefined && communename !=""){
                    console.log(communename)
                        for(var o = 0; o< news.length; o++){
                            if(news[o].address[0].xa_phuong!==communename){
                                news.splice(o,1);
                                o--;
                            }
                        }
                   }
                    if(streetname != null && streetname !="" && streetname!=undefined){
                        for(var p = 0; p< news.length; p++){
                            if(news[p].address[0].duong!=streetname){
                                news.splice(p,1);
                                p--;
                            }
                        }
                    }
                    if(price !="" && price!=null && price !=undefined){
                        for(var a = 0; a< news.length; a++){
                            if(price==0) {
                                if(news[a].giaphong>=500000){
                                    news.splice(a,1);
                                    a--;
                                }
                            }
                            if(price == 1) {
                                if(news[a].giaphong<500000 || news[a].giaphong>1000000 ){
                                    news.splice(a,1);
                                    a--;
                                }
                            }
                            if(price == 2) {
                                if(news[a].giaphong<1000000 || news[a].giaphong>2500000 ){
                                    news.splice(a,1);
                                    a--;
                                }
                            }
                            if(price == 3){
                                if(news[a].giaphong<2500000 ){
                                    news.splice(a,1);
                                    a--;
                                }
                            }
                        }
                    }
                    if(acreage !=null && acreage !="" && acreage !=undefined ){
                        for(var s = 0; s< news.length; s++){
                            if(acreage==0){
                                console.log(news[s].dientich)
                                if(news[s].dientich>=20){
                                    console.log(news[s].dientich+ " s")
                                    news.splice(s,1);
                                    s--;
                                }
                            }
                            if(acreage == 1){
                                if(news[s].dientich<20 || news[s].dientich>30){
                                    news.splice(s,1);
                                    s--;
                                }
                            }
                            if(acreage == 2){
                                if(news[s].dientich<=30){
                                    news.splice(s,1);
                                    s--;
                                }
                            }
                        }
                    }
                    res.json({news:news})
                }
            });
        });
    });
    
    router.post('/image', function(req ,res){
        var image = new Images();
        image.mabd=6;
        image.hinh1='7.jpg';
        image.hinh2='8.jpg';
        image.hinh3='9.jpg';
        image.save(function(err ){
            if(err) console.log(err)
            else {
                console.log('sc');
            }
        })
    })
    return router;
};

    


