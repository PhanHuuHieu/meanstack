var FacebookStrategy = require('passport-facebook').Strategy; 
var TwitterStrategy = require('passport-twitter').Strategy; 
var GoogleStrategy = require('passport-google-oauth20').Strategy;
var User = require('../models/user'); 
var session = require('express-session'); 
var jwt = require('jsonwebtoken'); 
var secret = 'meowmeow';
var Landlord= require('../models/landlords'); 
var nodemailer = require('nodemailer'); 
var sgTransport = require('nodemailer-sendgrid-transport'); 

module.exports = function(app, passport) {
    
    var options = {
        auth: {
            api_user: 'phanhieu',
            api_key: '16110329a'
        }
    }

    var client = nodemailer.createTransport(sgTransport(options)); 

    app.use(passport.initialize());
    app.use(passport.session());
    app.use(session({ secret: 'keyboard cat', resave: false, saveUninitialized: true, cookie: { secure: false } })); 
    passport.serializeUser(function(user, done) {
        // Check user active
        if (user.active) {
            // Check if user's social media account has an error
            if (user.error) {
                token = 'unconfirmed/error'; 
            } else {
                token = jwt.sign({ username: user.username, email: user.email }, secret, { expiresIn: '5s' }); 
            }
        } else {
            token = 'inactive/error'; 
        }
        done(null, user.id); 
    });

    // Deserialize Users once logged out    
    passport.deserializeUser(function(id, done) {
        User.findById(id, function(err, user) {
            done(err, user);
        });
    });

    // Facebook Strategy    
    passport.use(new FacebookStrategy({
            clientID: '2595440337365062', 
            clientSecret: '3517647ffac05971ab7e4939b77e00e6',
            callbackURL: "http://localhost:4200/auth/facebook/callback", 
            profileFields: ['id', 'displayName', 'photos', 'email']
        },
        function(accessToken, refreshToken, profile, done) {
            User.findOne({ email: profile._json.email }).select('username status active password email').exec(function(err, user) {
                if (err) done(err);
                if (user && user !== null && user.status!='Khóa') {
                    done(null, user);
                } else {
                    var user = new User();
                    user.username= profile._json.email;
                    user.name=profile.displayName;
                    user.email=profile._json.email;
                    user.password= "16110329aA@"
                    user.temporarytoken = jwt.sign({ username: user.username, email: user.email }, secret, { expiresIn: '5s' }); // Create a token for activating account through e-mail
                    user.save(function(err) {
                        if (err) {
                            console.log(err);
                        } else {
                            //sent email active
                            var landlords= new Landlord();
                            landlords.mact= profile._json.email;
                            landlords.email= profile._json.email;
                            landlords.hoten=profile.displayName;
                            landlords.save(function(err){
                                if(err) throw err;
                                else {
                                    var email = {
                                        from: 'Hieu Phan, gzzgzgzzgz@gmail.com',
                                        to: [profile.emails[0].value, 'phieu21098@gmail.com'],
                                        subject: 'Your Activation Link',
                                        text: 'Hello ' + profile.displayName + ', thank you for registering at HieuPhan. Please click on the following link to complete your activation: http://localhost:4200/activate/' + user.temporarytoken,
                                        html: 'Hello<strong> ' + profile.displayName + '</strong>,<br><br>Thank you for registering at HieuPhan. Please click on the link below to complete your activation:<br><br><a href="http://localhost:4200/activate/' + user.temporarytoken +'">http://localhost:4200/activate/</a>'
                                    };
                                    // Function to send e-mail to the user
                                    client.sendMail(email, function(err, info) {
                                        if (err) {
                                            console.log(err); 
                                        } else {
                                            console.log(info); 
                                            console.log(user.email); 
                                        }
                                    });
                                }
                                User.findOne({email:profile.emails[0].value}, function(err,data){
                                    if(err) done(err);
                                    else{
                                        done(null,data);
                                    }
                                })
                            })
                          
                        }
                    });
                }
            });
        }
    ));

    // Twitter Strategy // error 
    passport.use(new TwitterStrategy({
            consumerKey: 'nAsRdF40TX5fQ7QivmuJGWWSj', 
            consumerSecret: 'WH4MaKulaiPzrBttgS5KlQzanXmZIKZ4hmAlflfwX8jk3WNTwA', 
            callbackURL: "http://localhost:4200/auth/twitter/callback", 
            userProfileURL: "https://api.twitter.com/1.1/account/verify_credentials.json?include_email=true"
        },
        function(token, tokenSecret, profile, done) {
            if (profile.emails) {
                User.findOne({ email: profile.emails[0].value }).select('username active password email').exec(function(err, user) {
                    if (err) {
                        done(err);
                    } else {
                        if (user && user !== null) {
                            done(null, user);
                        } else {
                            done(err);
                        }
                    }
                });
            } else {
                user = {}; 
                user.id = 'null';
                user.active = true; 
                user.error = true; 
                done(null, user); 
            }
        }
    ));

    // Google Strategy  
    passport.use(new GoogleStrategy({
        clientID: '337183992852-bfl3r66r8gbi1m8jpd6qc75lppdk6hou.apps.googleusercontent.com',
        clientSecret: 'iA5BH0SNvFK_6DFbeZJg1tux',
        callbackURL: "http://localhost:4200/auth/google/callback"
      },
      function(accessToken, refreshToken, profile, done) {
        User.findOne({email:profile.emails[0].value}).select('username active password email').exec(function(err,user){
            if(err) done(err);
            if(user && user !=null){
                done(null,user);
            }
            else {
                var user = new User();
                user.username= profile.name.familyName + profile.provider;
                user.name=profile.displayName;
                user.email=profile.emails[0].value;
                user.password= "16110329aA@"
                user.temporarytoken = jwt.sign({ username: user.username, email: user.email }, secret, { expiresIn: '5s' }); // Create a token for activating account through e-mail
                user.save(function(err) {
                    if (err) {
                        console.log(err);
                    } else {
                        //sent email active
                        var landlords= new Landlord();
                        landlords.mact= profile.name.familyName + profile.provider;;
                        landlords.email= profile.emails[0].value;
                        landlords.hoten=profile.displayName;
                        landlords.save(function(err){
                            if(err) throw err;
                            else {
                                var email = {
                                    from: 'Hieu Phan, gzzgzgzzgz@gmail.com',
                                    to: [profile.emails[0].value, 'phieu21098@gmail.com'],
                                    subject: 'Your Activation Link',
                                    text: 'Hello ' + profile.displayName + ', thank you for registering at HieuPhan. Please click on the following link to complete your activation: http://localhost:4200/activate/' + user.temporarytoken,
                                    html: 'Hello<strong> ' + profile.displayName + '</strong>,<br><br>Thank you for registering at HieuPhan. Please click on the link below to complete your activation:<br><br><a href="http://localhost:4200/activate/' + user.temporarytoken +'">http://localhost:4200/activate/</a>'
                                };
                                // Function to send e-mail to the user
                                client.sendMail(email, function(err, info) {
                                    if (err) {
                                        console.log(err); 
                                    } else {
                                        console.log(info); 
                                        console.log(user.email); 
                                    }
                                });
                            }
                            User.findOne({email:profile.emails[0].value}, function(err,data){
                                if(err) done(err);
                                else{
                                    done(null,data);
                                }
                            })
                        })
                      
                    }
                });
            
            }
        });
      }
    ));

    // Google Routes    
    app.get('/auth/google', passport.authenticate('google', { scope: ['https://www.googleapis.com/auth/plus.login', 'profile', 'email'] }));
    app.get('/auth/google/callback', passport.authenticate('google', { failureRedirect: '/googleerror' }), function(req, res) {
        res.redirect('/google/' + token); 
    });

    // Twitter Routes
    app.get('/auth/twitter', passport.authenticate('twitter'));
    app.get('/auth/twitter/callback', passport.authenticate('twitter', { failureRedirect: '/twittererror' }), function(req, res) {
        res.redirect('/twitter/' + token); 
    });

    // Facebook Routes
    app.get('/auth/facebook/callback', passport.authenticate('facebook', { failureRedirect: '/facebookerror' }), function(req, res) {
        res.redirect('/facebook/' + token); 
    });
    app.get('/auth/facebook', passport.authenticate('facebook', { scope: 'email' }));

    return passport; 
};
