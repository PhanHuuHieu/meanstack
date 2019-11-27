angular.module('mainController', ['authServices', 'userServices'])

//  mainCtrl is used to handle login and main index functions 
.controller('mainCtrl', function(Auth,$route, $timeout, $location, $rootScope, $window, $interval, User, AuthToken, $scope) {
    var app = this;
    // reload webpage
    $scope.reloadRoute = function() {
        $location.path('/');
        $route.reload();
     }
    app.loadme = false; // Hide main HTML until data is obtained in AngularJS
    if ($window.location.pathname === '/') app.home = true; 
    // Check if user's session has expired upon opening page for the first time
    if (Auth.isLoggedIn()) {
        // Check if a the token expired
        Auth.getUser().then(function(data) {
            if (data.data.username === undefined) {
                Auth.logout(); 
                app.isLoggedIn = false; // Set session to false
                $location.path('/'); 
                app.loadme = true; 
            }
        });
    }


    // Function to run an interval that checks if the user's token has expired
    app.checkSession = function() {
        if (Auth.isLoggedIn()) {
            app.checkingSession = true; 
            var interval = $interval(function() {
                var token = $window.localStorage.getItem('token'); 
                if (token === null) {
                    $interval.cancel(interval);
                } else {
                    self.parseJwt = function(token) {
                        var base64Url = token.split('.')[1];
                        var base64 = base64Url.replace('-', '+').replace('_', '/');
                        return JSON.parse($window.atob(base64));
                    };
                    var expireTime = self.parseJwt(token); // Save parsed token into variable
                    var timeStamp = Math.floor(Date.now() / 1000); 
                    var timeCheck = expireTime.exp - timeStamp; 
                    // Check if token has less than 30 minutes till expiration
                    if (timeCheck <= 1800) {
                        showModal(1); 
                        $interval.cancel(interval); // Stop interval
                    }
                }
            }, 30000);
        }
    };

    app.checkSession(); // Ensure check is ran check, even if user refreshes

    // Function to open  modal     
    var showModal = function(option) {
        app.choiceMade = false;
        app.modalHeader = undefined; 
        app.modalBody = undefined; 
        app.hideButton = false; 

        // Check which modal option to activate (option 1: session expired or about to expire; option 2: log the user out)      
        if (option === 1) {
            app.modalHeader = 'Timeout Warning'; // Set header
            app.modalBody = 'Your session will expired in 30 minutes. Would you like to renew your session?'; // Set body
            $("#myModal").modal({ backdrop: "static" }); // Open modal
            // Give user 10 seconds to make a decision 'yes'/'no'
            $timeout(function() {
                if (!app.choiceMade) app.endSession(); // If no choice is made after 10 seconds, select 'no' for them
            }, 10000);
        } else if (option === 2) {
            app.hideButton = true;
            app.modalHeader = 'Logging Out'; 
            $("#myModal").modal({ backdrop: "static" }); 
            
            $timeout(function() {
                Auth.logout(); 
                $location.path('/logout'); 
                hideModal(); 
            }, 2000);
        }
    };

    // Function that allows user to renew their token to stay logged in (activated when user presses 'yes')
    app.renewSession = function() {
        app.choiceMade = true;
        User.renewSession(app.username).then(function(data) {
            if (data.data.success) {
                AuthToken.setToken(data.data.token); 
                app.checkSession();
            } else {
                app.modalBody = data.data.message; 
            }
        });
        hideModal(); 
    };

    // Function to expire session and logout (activated when user presses 'no)
    app.endSession = function() {
        app.choiceMade = true; 
        hideModal();
        $timeout(function() {
            showModal(2);
        }, 1000);
    };

    var hideModal = function() {
        $("#myModal").modal('hide'); 
    };

    // Check if user is on the home page
    $rootScope.$on('$routeChangeSuccess', function() {
        if ($window.location.pathname === '/') {
            app.home = true; // Set home page div
        } else {
            app.home = false; // Clear home page div
        }
    });

    // Will run code every time a route changes
    $rootScope.$on('$routeChangeStart', function() {
        app.iconFacebook=false;
        app.iconGoogle= false;
        if (!app.checkingSession) app.checkSession();

        // Check if user is logged in
        if (Auth.isLoggedIn()) {
            // Custom function to retrieve user data
            Auth.getUser().then(function(data) {
                if (data.data.username === undefined) {
                    app.iconGoogle=false;
                    app.iconFacebook=false;
                    app.isLoggedIn = false; 
                    Auth.logout();
                    app.isLoggedIn = false;
                    $location.path('/');
                } else {
                    app.isLoggedIn = true;
                    app.username = data.data.username;
                    checkLoginStatus = data.data.username;
                    app.useremail = data.data.email; 
                    User.getPermission().then(function(data) {
                        if (data.data.permission==='user'||data.data.permission === 'admin' || data.data.permission === 'moderator') {
                            app.authorized = true; 
                            app.loadme = true;
                            app.iconFacebook=$window.localStorage.getItem('iconFacebook');
                            app.iconGoogle=$window.localStorage.getItem('iconGoogle');
                        } else {
                            app.iconFacebook=false;
                            app.iconGoogle=false;
                            app.authorized = false;
                            app.loadme = true; 

                        }
                    });
                }
            });
        } else {
            app.isLoggedIn = false;
            app.username = '';
            app.loadme = true;
        }
        if ($location.hash() == '_=_') $location.hash(null); // Check if facebook hash is added to URL
        app.disabled = false; 
        app.errorMsg = false;

    });

    // Function to redirect users to facebook authentication page
    this.facebook = function() {
        app.disabled = true;
        $window.location = $window.location.protocol + '//' + $window.location.host + '/auth/facebook';
    };

    // Function to redirect users to twitter authentication page        
    this.twitter = function() {
        app.disabled = true;
        $window.location = $window.location.protocol + '//' + $window.location.host + '/auth/twitter';
    };

    // Function to redirect users to google authentication page
    this.google = function() {
        app.disabled = true;
        $window.location = $window.location.protocol + '//' + $window.location.host + '/auth/google';
    };

    // Function that performs login
    this.doLogin = function(loginData) {
        app.loading = true; 
        app.errorMsg = false; 
        app.expired = false; // Clear expired whenever user attempts a login 
        app.disabled = true; // Disable form on submission
        $scope.alert = 'default';

        // Function that performs login
        Auth.login(app.loginData).then(function(data) {
            if (data.data.success) {
                app.loading = false; 
                $scope.alert = 'alert alert-success'; 
                app.successMsg = data.data.message + '...Redirecting';
                $timeout(function() {
                    $location.path('/');
                    app.loginData = '';
                    app.successMsg = false; 
                    app.disabled = false; 
                    app.checkSession();
                }, 2000);
            } else {
                // Check if the user's account is expired
                if (data.data.expired) {
                    app.expired = true; 
                    app.loading = false; 
                    $scope.alert = 'alert alert-danger'; 
                    app.errorMsg = data.data.message;
                } else {
                    app.loading = false;
                    app.disabled = false; 
                    $scope.alert = 'alert alert-danger';
                    app.errorMsg = data.data.message; 
                }
            }
        });
    };
    app.logout = function() {
        showModal(2);
    };


});
