var User = require('../models/user'); 
var jwt = require('jsonwebtoken'); 
var secret = 'meowmeow'; //harrypotter
var nodemailer = require('nodemailer'); 
var sgTransport = require('nodemailer-sendgrid-transport'); 
var Landlord= require('../models/landlords');

module.exports = function(router) {

    var options = {
        auth: {
            api_user: 'phanhieu',
            api_key: '16110329a'
        }
    }

    var client = nodemailer.createTransport(sgTransport(options)); 

    // Register new user
    router.post('/users', function(req, res) {
        var user = new User(); 
        user.username = req.body.username;
        user.password = req.body.password; 
        user.email = req.body.email; 
        user.name = req.body.name;
        user.temporarytoken = jwt.sign({ username: user.username, email: user.email }, secret, { expiresIn: '24h' }); // Create a token for activating account through e-mail

        if (req.body.username === null || req.body.username === '' || req.body.password === null || req.body.password === '' || req.body.email === null || req.body.email === '' || req.body.name === null || req.body.name === '') {
            res.json({ success: false, message: 'username, email, and password not empty' });
        } else {
            user.save(function(err) {
                if (err) {
                    // check validate
                    if (err.errors !== null) {
                        if (err.errors.name) {
                            res.json({ success: false, message: err.errors.name.message }); 
                        } else if (err.errors.email) {
                            res.json({ success: false, message: err.errors.email.message }); 
                        } else if (err.errors.username) {
                            res.json({ success: false, message: err.errors.username.message }); 
                        } else if (err.errors.password) {
                            res.json({ success: false, message: err.errors.password.message }); 
                        } else {
                            res.json({ success: false, message: err }); 
                        }
                    } else if (err) {
                        // Check if duplication error exists
                        if (err.code == 11000) {
                            if (err.errmsg[61] == "u") {
                                res.json({ success: false, message: 'That username is already taken' }); // Display error if username already taken
                            } else if (err.errmsg[61] == "e") {
                                res.json({ success: false, message: 'That e-mail is already taken' }); // Display error if e-mail already taken
                            }
                        } else {
                            res.json({ success: false, message: err }); // Display any other error
                        }
                    }
                } else {
                    //sent email active
                    var landlords= new Landlord();
                    landlords.mact= req.body.username;
                    landlords.email= req.body.email;
                    landlords.hoten= req.body.name;
                    landlords.save(function(err){
                        if(err) throw err;
                        else {
                            var email = {
                                from: 'Hieu Phan, gzzgzgzzgz@gmail.com',
                                to: [user.email, 'phieu21098@gmail.com'],
                                subject: 'Your Activation Link',
                                text: 'Hello ' + user.name + ', thank you for registering at HieuPhan. Please click on the following link to complete your activation: http://localhost:4200/activate/' + user.temporarytoken,
                                html: 'Hello<strong> ' + user.name + user.temporarytoken+ '</strong>,<br><br>Thank you for registering at HieuPhan. Please click on the link below to complete your activation:<br><br><a href="http://localhost:4200/activate/' + user.temporarytoken +'">http://localhost:4200/activate/</a>'
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
                            res.json({ success: true, message: 'Account registered! Please check your e-mail for activation link.' }); 
                        }
                    })
                  
                }
            });
        }
    });

    // check username when registering account 
    router.post('/checkusername', function(req, res) {
        User.findOne({ username: req.body.username }).select('username').exec(function(err, user) {
            if (err){
                res.json({ success: false, message: 'error, please register again' });
            } else {
                if (user) {
                    res.json({ success: false, message: 'That username is already taken' }); // If user is returned, then username is taken
                } else {
                    res.json({ success: true, message: 'Valid username' }); // If user is not returned, then username is not taken
                }
            }
        });
    });

     // check email when registering account  
    router.post('/checkemail', function(req, res) {
        User.findOne({ email: req.body.email }).select('email').exec(function(err, user) {
            if (err) {
                res.json({ success: false, message: 'Error. Please try again ' });
            } else {
                if (user) {
                    res.json({ success: false, message: 'That e-mail is already taken' }); 
                } else {
                    res.json({ success: true, message: 'Valid e-mail' }); 
                }
            }
        });
    });

    // Login user
    router.post('/authenticate', function(req, res) {
        var loginUser = (req.body.username).toLowerCase(); // username in lowercase database
        User.findOne({ username: loginUser }).select('email username password active').exec(function(err, user) {
            if (err) {
                res.json({ success: false, message: 'Error. Please try again' });
            } else {       
                if (!user) {
                    res.json({ success: false, message: 'Username not found' }); // Username not found in database
                } else if (user) {
                    if (!req.body.password) {
                        res.json({ success: false, message: 'Please enter password' }); 
                    } else {
                        var validPassword = user.comparePassword(req.body.password); 
                        if (!validPassword) {
                            res.json({ success: false, message: 'Username or password incorect' }); // Password not match in database
                        } else if (!user.active) {
                            res.json({ success: false, message: 'Account is not yet activated. Please check your e-mail for activation link.', expired: true }); // Account is not activated 
                        } else if(user.status=="Khóa") {
                            res.json({ success: false, message: 'Account locked', expired: true }); // Account is not activated 
                        } else {
                            var token = jwt.sign({ username: user.username, email: user.email }, secret, { expiresIn: '5s' }); 
                            res.json({ success: true, message: 'User authenticated!', token: token }); 
                        }
                    }
                }
            }
        });
    });

    router.put('/activate/:token', function(req, res) {
        User.findOne({ temporarytoken: req.params.token }, function(err, user) {
            if (err) {
                res.json({ success: false, message: 'Error. Please try again' });
            } else {
                var token = req.params.token; 
                jwt.verify(token, secret, function(err, decoded) {
                    if (err) {
                        res.json({ success: false, message: 'Activation link has expired.' }); 
                    } else if (!user) {
                        res.json({ success: false, message: 'Activation link has expired.' }); // not match in database
                    } else {
                        user.temporarytoken = false; // Remove temporary token
                        user.active = true; // Change account status to Activated
                        user.save(function(err) {
                            if (err) {
                                console.log(err); 
                            } else {
                                var email = {
                                    from: 'Hieu Phan, gzzgzgzzgz@gmail.com',
                                    to: user.email,
                                    subject: 'Account Activated',
                                    text: 'Hello ' + user.name + ', Your account has been successfully activated!',
                                    html: 'Hello<strong> ' + user.name + '</strong>,<br><br>Your account has been successfully activated!'
                                };
                                client.sendMail(email, function(err, info) {
                                    if (err) console.log(err); 
                                });
                                res.json({ success: true, message: 'Account activated!' }); 
                            }
                        });
                    }
                });
            }
        });
    });

    //Verify user credentials before re-sending a new activation link 
    router.post('/resend', function(req, res) {
        User.findOne({ username: req.body.username }).select('username password active').exec(function(err, user) {
            if (err) {
                res.json({ success: false, message: 'Error. Please try again' });
            } else {
                if (!user) {
                    res.json({ success: false, message: 'User not found' }); // Username does not match in database
                } else if (user) {
                    // Check if password is sent in request
                    if (req.body.password) {
                        var validPassword = user.comparePassword(req.body.password); 
                        if (!validPassword) {
                            res.json({ success: false, message: 'Password incorect' }); // Password does not match  in database
                        } else if (user.active) {
                            res.json({ success: false, message: 'Account is already activated.' }); // Account is already activated
                        } else {
                            res.json({ success: true, user: user });
                        }
                    } else {
                        res.json({ success: false, message: 'Please enter password' }); 
                    }
                }
            }
        });
    });

    //send user a new activation link  credentials have been verified
    router.put('/resend', function(req, res) {
        User.findOne({ username: req.body.username }).select('username name email temporarytoken').exec(function(err, user) {
            if (err) {
                res.json({ success: false, message: 'Error. Please try again' });
            } else {
                user.temporarytoken = jwt.sign({ username: user.username, email: user.email }, secret, { expiresIn: '24h' });
                user.save(function(err) {
                    if (err) {
                        console.log(err); 
                    } else {
                        var email = {
                            from: 'Hieu Phan, gzzgzgzzgz@gmail.com',
                            to: user.email,
                            subject: 'Activation Link Request',
                            text: 'Hello ' + user.name + ', You recently requested a new account activation link. Please click on the following link to complete your activation: https://localhost:4200/activate/' + user.temporarytoken,
                            html:'Hello<strong> ' + user.name+ '<a href="http://localhost:4200/activate/' + user.temporarytoken+'">Click</a>'
                        };
                        client.sendMail(email, function(err, info) {
                            if (err) console.log(err);
                        });
                        res.json({ success: true, message: 'Activation link has been sent to ' + user.email + '!' });
                    }
                });
            }
        });
    });

    // send user's username to e-mail
    router.get('/resetusername/:email', function(req, res) {
        User.findOne({ email: req.params.email }).select('email name username').exec(function(err, user) {
            if (err) {
                res.json({ success: false, message: err }); // Error if cannot connect
            } else {
                if (!user) {
                    res.json({ success: false, message: 'E-mail was not found' }); // Return error if e-mail cannot be found in database
                } else {
                    // If e-mail found in database
                    var email = {
                        from: 'gzzgzgzzgz@gmail.com',
                        to: user.email,
                        subject: 'Localhost Username Request',
                        text: 'Hello ' + user.name + ', You recently requested your username. Please save it in your files: ' + user.username,
                        html: 'Hello<strong> ' + user.name + '</strong>,<br><br>You recently requested your username. Please save it in your files: ' + user.username
                    };

                    client.sendMail(email, function(err, info) {
                        if (err) {
                            console.log(err); 
                        } else {
                            console.log(info); 
                        }
                    });
                    res.json({ success: true, message: 'Username has been sent to e-mail! ' }); 
                }
            }
        });
    });

    // Route to send reset link to the user
    router.put('/resetpassword', function(req, res) {
        User.findOne({ username: req.body.username }).select('username active email resettoken name').exec(function(err, user) {
            if (err) {
                res.json({ success: false, message: 'Error. Please try again' });
            } else {
                if (!user) {
                    res.json({ success: false, message: 'Username was not found' }); 
                } else if (!user.active) {
                    res.json({ success: false, message: 'Account has not yet been activated' }); 
                } else {
                    user.resettoken = jwt.sign({ username: user.username, email: user.email }, secret, { expiresIn: '24h' }); 
                    user.save(function(err) {
                        if (err) {
                            res.json({ success: false, message: err }); 
                        } else {
                            var email = {
                                from: 'HieuPhan, gzzgzgzzgz@gmail.com',
                                to: user.email,
                                subject: 'Reset Password Request',
                                text: 'Hello ' + user.name + ', You recently request a password reset link. Please click on the link below to reset your password:<br><br><a href="localhost:4200/reset/' + user.resettoken,
                                html: 'Hello<strong> ' + user.name + '</strong>,<br><br>You recently request a password reset link. Please click on the link below to reset your password:<br><br><a href="localhost:4200/reset/' + user.resettoken + '">localhost:4200/reset/</a>'
                            };
                            client.sendMail(email, function(err, info) {
                                if (err) {
                                    console.log(err); 
                                } else {
                                    console.log(info); 
                                    console.log('sent to: ' + user.email);
                                }
                            });
                            res.json({ success: true, message: 'Please check your e-mail for password reset link' }); 
                        }
                    });
                }
            }
        });
    });

    // Route to verify user's e-mail activation link
    router.get('/resetpassword/:token', function(req, res) {
        User.findOne({ resettoken: req.params.token }).select().exec(function(err, user) {
            if (err) {
                res.json({ success: false, message: 'Error. Please try again' });
            } else {
                var token = req.params.token; 
                // Function to verify token
                jwt.verify(token, secret, function(err, decoded) {
                    if (err) {
                        res.json({ success: false, message: 'Password link has expired' });
                    } else {
                        if (!user) {
                            res.json({ success: false, message: 'Password link has expired' }); 
                        } else {
                            res.json({ success: true, user: user });
                        }
                    }
                });
            }
        });
    });

    // Save user's new password to database
    router.put('/savepassword', function(req, res) {
        User.findOne({ username: req.body.username }).select('username email name password resettoken').exec(function(err, user) {
            if (err) { 
                res.json({ success: false, message: 'Error. Please try again' });
            } else {
                if (req.body.password === null || req.body.password === '') {
                    res.json({ success: false, message: 'Please enter password' });
                } else {
                    user.password = req.body.password; 
                    user.resettoken = false;
                    user.save(function(err) {
                        if (err) {
                            res.json({ success: false, message: err });
                        } else {
                            var email = {
                                from: 'HieuPhan, gzzgzgzzgz@gmail.com',
                                to: user.email,
                                subject: 'Password Recently Reset',
                                text: 'Hello ' + user.name + ', This e-mail is to notify you that your password was recently reset at localhost.com',
                                html: 'Hello<strong> ' + user.name + '</strong>,<br><br>This e-mail is to notify you that your password was recently reset at localhost.com'
                            };
                            // Function to send e-mail to the user
                            client.sendMail(email, function(err, info) {
                                if (err) console.log(err); // If error with sending e-mail, log to console/terminal
                            });
                            res.json({ success: true, message: 'Password has been reset!' }); // Return success message
                        }
                    });
                }
            }
        });
    });

    router.use(function(req, res, next) {
        var token = req.body.token || req.body.query || req.headers['x-access-token']; 
        if (token) {
            jwt.verify(token, secret, function(err, decoded) {
                if (err) {
                    return next();
                    // res.json({ success: false, message: 'Token invalid' }); // Token has expired or is invalid
                } else {
                    req.decoded = decoded; 
                    next();
                }
            });
        } else {
            return next(); 
       
        }
    });

    //get  currently logged user    
    router.post('/me', function(req, res) {
        res.send(req.decoded);
    });

    // renew session
    router.get('/renewToken/:username', function(req, res) {
        User.findOne({ username: req.params.username }).select('username email').exec(function(err, user) {
            if (err) {
                res.json({ success: false, message: 'Error. Please try  again' });
            } else {
                if (!user) {
                    res.json({ success: false, message: 'No user was found' }); 
                } else {
                    var newToken = jwt.sign({ username: user.username, email: user.email }, secret, { expiresIn: '24h' }); // Give user a new token
                    res.json({ success: true, token: newToken });
                }
            }
        });
    });

    // Route to get the current user's permission level
    router.get('/permission', function(req, res) {
        User.findOne({ username: req.decoded.username }, function(err, user) {
            if (err) {
                res.json({ success: false, message: 'Error. Please try again' });
            } else {
                if (!user) {
                    res.json({ success: false, message: 'No user was found' });
                } else {
                    res.json({ success: true, permission: user.permission }); 
                }
            }
        });
    });

    router.get('/management', function(req, res) {
        User.find({}, function(err, users) {
            if (err) {  
                res.json({ success: false, message: 'Error. Please try again' });
            } else {
                User.findOne({ username: req.decoded.username }, function(err, mainUser) {
                    if (err) {
                        res.json({ success: false, message: 'Error. Please try again' });
                    } else {
                        if (!mainUser) {
                            res.json({ success: false, message: 'No user found' }); 
                        } else {
                         // check edit/ delete
                            if (mainUser.permission === 'admin' || mainUser.permission === 'moderator') {
                                if (!users) {
                                    res.json({ success: false, message: 'Users not found' }); 
                                } else {
                                    res.json({ success: true, users: users, permission: mainUser.permission }); 
                                }
                            } else {
                                res.json({ success: false, message: 'not Permissions' });
                            }
                        }
                    }
                });
            }
        });
    });

    //   delete a user
    router.delete('/management/:username', function(req, res) {
        var deletedUser = req.params.username;
        User.findOne({ username: req.decoded.username }, function(err, mainUser) {
            if (err) {
                res.json({ success: false, message: 'Error. Please try again' });
            } else {
                if (!mainUser) {
                    res.json({ success: false, message: 'No user found' }); 
                } else {
                    if (mainUser.permission !== 'admin') {
                        res.json({ success: false, message: 'not Permissions' }); 
                    } else {
                        User.findOneAndRemove({ username: deletedUser }, function(err, user) {
                            if (err) {
                                res.json({ success: false, message: 'Please try again' });
                            } else {
                                res.json({ success: true }); 
                            }
                        });
                    }
                }
            }
        });
    });

    // Edit user
    router.get('/edit/:id', function(req, res) {
        var editUser = req.params.id; 
        User.findOne({ username: req.decoded.username }, function(err, mainUser) {
            if (err) {
                res.json({ success: false, message: 'Error. Please try again' });
            } else {
                if (!mainUser) {
                    res.json({ success: false, message: 'No user found' });
                } else {
                    if (mainUser.permission === 'admin' || mainUser.permission === 'moderator'||mainUser.permission === 'user') {
                        User.findOne({ _id: editUser }, function(err, user) {
                            if (err) {
                                res.json({ success: false, message: 'Error. Please try again' });
                            } else {
                                
                                if (!user) {
                                    res.json({ success: false, message: 'No user found' }); 
                                } else {
                                    res.json({ success: true, user: user }); 
                                }
                            }
                        });
                    } else {
                        res.json({ success: false, message: 'not Permission' }); 
                    }
                }
            }
        });
    });

    // update/edit a user
    router.put('/edit', function(req, res) {
        var editUser = req.body._id; 
        if (req.body.name) 
            var newName = req.body.name; 
        if (req.body.username) 
            var newUsername = req.body.username; 
        if (req.body.email)
            var newEmail = req.body.email;
        if (req.body.permission) 
            var newPermission = req.body.permission;
        User.findOne({ username: req.decoded.username }, function(err, mainUser) {
            if (err) {
                res.json({ success: false, message: 'Error. Please try again' });
            } else {
                if (!mainUser) {
                    res.json({ success: false, message: "no user found" }); 
                } else {
                    if (newName) {
                        if (mainUser.permission === 'admin' || mainUser.permission === 'moderator'||mainUser.permission === 'user') {
                            User.findOne({ _id: editUser }, function(err, user) {
                                if (err) {
                                    res.json({ success: false, message: 'Error. Please try again' });
                                } else {
                                    if (!user) {
                                        res.json({ success: false, message: 'No user found' }); 
                                    } else {
                                        user.name = newName; 
                                        user.save(function(err) {
                                            if (err) {
                                                console.log(err); 
                                            } else {
                                                res.json({ success: true, message: 'Name has been updated!' }); 
                                            }
                                        });
                                    }
                                }
                            });
                        } else {
                            res.json({ success: false, message: 'not Permissions' }); 
                        }
                    }
                    if (newUsername) {
                        if (mainUser.permission === 'admin' || mainUser.permission === 'moderator') {
                            // Look for user in database
                            User.findOne({ _id: editUser }, function(err, user) {
                                if (err) {
                                    res.json({ success: false, message: 'Error. Please try again' });
                                } else {
                                    if (!user) {
                                        res.json({ success: false, message: 'No user found' }); 
                                    } else {
                                        user.username = newUsername; 
                                        user.save(function(err) {
                                            if (err) {
                                                console.log(err);
                                            } else {
                                                res.json({ success: true, message: 'Username has been updated' }); // Return success
                                            }
                                        });
                                    }
                                }
                            });
                        } else {
                            res.json({ success: false, message: 'not Permissions' });
                        }
                    }
                    if (newEmail) {
                        if (mainUser.permission === 'admin' || mainUser.permission === 'moderator'|| mainUser.permission === 'user') {
                            User.findOne({ _id: editUser }, function(err, user) {
                                if (err) {
                                    res.json({ success: false, message: 'Error. Please try again' });
                                } else {
                                    if (!user) {
                                        res.json({ success: false, message: 'No user found' });
                                    } else {
                                        user.email = newEmail; 
                                        user.save(function(err) {
                                            if (err) {
                                                console.log(err); 
                                            } else {
                                                res.json({ success: true, message: 'E-mail has been updated' });
                                            }
                                        });
                                    }
                                }
                            });
                        } else {
                            res.json({ success: false, message: 'not Permissions' });
                        }
                    }
                    if (newPermission) {
                        if (mainUser.permission === 'admin' || mainUser.permission === 'moderator' || mainUser.permission === 'user') {
                            User.findOne({ _id: editUser }, function(err, user) {
                                if (err) {
                                    res.json({ success: false, message: 'Error. Please try again' });
                                } else {
                                    if (!user) {
                                        res.json({ success: false, message: 'No user found' }); 
                                    } else {
                                        if (newPermission === 'user') {
                                            if (user.permission === 'admin') {
                                                if (mainUser.permission !== 'admin') {
                                                    res.json({ success: false, message: 'not Permissions. You must be an admin to downgrade an admin.' }); 
                                                } else {
                                                    user.permission = newPermission; 
                                                    user.save(function(err) {
                                                        if (err) {
                                                            console.log(err); 
                                                        } else {
                                                            res.json({ success: true, message: 'Permissions have been updated!' }); 
                                                        }
                                                    });
                                                }
                                            } else {
                                                user.permission = newPermission; 
                                                user.save(function(err) {
                                                    if (err) {
                                                        console.log(err); 
                                                    } else {
                                                        res.json({ success: true, message: 'Permissions have been updated!' });
                                                     }
                                                });
                                            }
                                        }
                                        if (newPermission === 'moderator') {
                                            if (user.permission === 'admin') {
                                                if (mainUser.permission !== 'admin') {
                                                    res.json({ success: false, message: 'not Permissions. You must be an admin to downgrade another admin' }); // Return error
                                                } else {
                                                    user.permission = newPermission;
                                                    user.save(function(err) {
                                                        if (err) {
                                                            console.log(err); 
                                                        } else {
                                                            res.json({ success: true, message: 'Permissions have been updated!' }); 
                                                        }
                                                    });
                                                }
                                            } else {
                                                user.permission = newPermission; 
                                                user.save(function(err) {
                                                    if (err) {
                                                        console.log(err); 
                                                    } else {
                                                        res.json({ success: true, message: 'Permissions have been updated!' }); 
                                                    }
                                                });
                                            }
                                        }

                                       
                                        if (newPermission === 'admin') {
                                            if (mainUser.permission === 'admin') {
                                                user.permission = newPermission; 
                                                user.save(function(err) {
                                                    if (err) {
                                                        console.log(err); 
                                                    } else {
                                                        res.json({ success: true, message: 'Permissions have been updated!' }); }
                                                });
                                            } else {
                                                res.json({ success: false, message: 'not Permissions. You must be an admin to upgrade someone to the admin level' }); 
                                            }
                                        }
                                    }
                                }
                            });
                        } else {
                            res.json({ success: false, message: 'not Permissions' }); 
                        }
                    }
                }
            }
        });
    });

    // Lock user account's
    router.get('/lockuser/:username', function(req,res) {
        User.findOne({username:req.params.username},function (err,user) {
            if(err) throw err;
            if(!user) {
                res.json({success:false, message:'Please try again'});
            } else if(user.permission!='admin' || user.permission !='moderator'){
                res.json({success: false, message:' you are not allow to do this. Permission not permit'})
            } else{
                user.status="Khóa";
                user.save(function (err) {
                    if(err) throw err;
                    res.json({success: true});
                })
            }
        })
    })

    // unlock user account's
    router.get('/unlockuser/:username', function(req,res) {
        User.findOne({username:req.params.username},function (err,user) {
            if(err) throw err;
            if(!user) {
                res.json({success:false, message:'Please try again'});
            } if(user.permission!='admin' || user.permission!='moderator'){
                res.json({success: false, message:'You are not allow to do this. Permission was wrong'})
            } else {
                user.status="Mở";
                user.save(function (err) {
                    if(err) throw err;
                    res.json({success: true});
                })
            }
        })
    })
    return router;
};
