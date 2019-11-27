angular.module('emailController', ['userServices'])

    //  emailCtrl is used to activate the user's account    
    .controller('emailCtrl', function ($routeParams, User, $timeout, $location) {

        var app = this;

        // Check function that grabs token from URL and checks database runs on page load
        User.activateAccount($routeParams.token).then(function (data) {
            app.errorMsg = false;
            if (data.data.success) {
                app.successMsg = data.data.message + '...Redirecting';
                $timeout(function () {
                    $location.path('/login');
                }, 2000);
            } else {
                app.errorMsg = data.data.message + '...Redirecting';
                $timeout(function () {
                    $location.path('/login');
                }, 2000);
            }
        });
    })

    //  resendCtrl is used to resend an activation link to the user's e-mail
    .controller('resendCtrl', function (User, $scope) {

        var app = this;

        // Custom function that check's the user's credentials against the database
        app.checkCredentials = function (loginData, valid) {
            if (valid) {
                app.disabled = true; // Disable the form when user submits to prevent multiple requests to server
                app.errorMsg = false;

                User.checkCredentials(app.loginData).then(function (data) {
                    if (data.data.success) {
                        User.resendLink(app.loginData).then(function (data) {
                            if (data.data.success) {
                                $scope.alert = 'alert alert-success';
                                app.successMsg = data.data.message;
                            } else {
                                $scope.alert = 'alert alert-danger';
                                app.errorMsg = data.data.message;
                            }
                        });
                    } else {
                        app.disabled = false;
                        $scope.alert = 'alert alert-danger';
                        app.errorMsg = data.data.message;
                    }
                });
            } else {
                $scope.alert = 'alert alert-danger';
                app.errorMsg = 'Please enter form  filled out';
            }

        };
    })

    //  usernameCtrl is used to send the user his/her username to e-mail if forgotten    
    .controller('usernameCtrl', function (User, $scope) {

        var app = this;

        // Function to send username to e-mail provided        
        app.sendUsername = function (userData, valid) {
            app.errorMsg = false;
            app.loading = true;
            app.disabled = true;

            if (valid) {
                // Runs function to send username to e-mail provided   
                User.sendUsername(app.userData.email).then(function (data) {
                    app.loading = false; // Stop loading icon

                    if (data.data.success) {
                        $scope.alert = 'alert alert-success';
                        app.successMsg = data.data.message;
                    } else {
                        app.disabled = false;
                        $scope.alert = 'alert alert-danger';
                        app.errorMsg = data.data.message;
                    }
                });
            } else {
                app.disabled = false;
                app.loading = false;
                $scope.alert = 'alert alert-danger';
                app.errorMsg = 'Please enter a valid e-mail';
            }
        };
    })

    //passwordCtrl is used to send a password reset link to the user
    .controller('passwordCtrl', function (User, $scope) {

        app = this;
        app.sendPassword = function (resetData, valid) {
            app.errorMsg = false;
            app.loading = true; // Start loading icon
            app.disabled = true;

            if (valid) {
                User.sendPassword(app.resetData).then(function (data) {
                    app.loading = false; // Stop loading icon

                    if (data.data.success) {
                        $scope.alert = 'alert alert-success';
                        app.successMsg = data.data.message;
                    } else {
                        $scope.alert = 'alert alert-danger';
                        app.disabled = false;
                        app.errorMsg = data.data.message;
                    }
                });
            } else {
                app.disabled = false;
                app.loading = false;
                $scope.alert = 'alert alert-danger';
                app.errorMsg = 'Please enter a valid username';
            }
        };
    })

    // Controller resetCtrl is used to save change user's password
    .controller('resetCtrl', function (User, $routeParams, $scope, $timeout, $location) {

        app = this;
        app.hide = true; // Hide form until token can be verified to be valid

        User.resetUser($routeParams.token).then(function (data) {
            if (data.data.success) {
                app.hide = false; // Show form
                $scope.alert = 'alert alert-success';
                app.successMsg = 'Please enter a new password';
                $scope.username = data.data.user.username;
            } else {
                $scope.alert = 'alert alert-danger';
                app.errorMsg = data.data.message;
            }
        });

        // Function to save user's new password to database
        app.savePassword = function (regData, valid, confirmed) {
            app.errorMsg = false;
            app.successMsg = false;
            app.disabled = true; // Disable form while processing
            app.loading = true;

            if (valid && confirmed) {
                app.regData.username = $scope.username;

                User.savePassword(app.regData).then(function (data) {
                    app.loading = false;
                    if (data.data.success) {
                        $scope.alert = 'alert alert-success';
                        app.successMsg = data.data.message + '...Redirecting';
                        $timeout(function () {
                            $location.path('/login');
                        }, 2000);
                    } else {
                        $scope.alert = 'alert alert-danger';
                        app.disabled = false;
                        app.errorMsg = data.data.message;
                    }
                });
            } else {
                $scope.alert = 'alert alert-danger';
                app.loading = false;
                app.disabled = false;
                app.errorMsg = 'Please ensure form is filled out properly';
            }
        };
    });
