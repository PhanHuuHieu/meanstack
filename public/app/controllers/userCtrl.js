angular.module('userControllers', ['userServices'])

//  regCtrl is used for users to register an account
.controller('regCtrl', function($http, $location, $timeout, User, $scope) {

    var app = this;

    //  registers the user in the database      
    this.regUser = function(regData, valid, confirmed) {
        app.disabled = true; 
        app.loading = true; 
        app.errorMsg = false; 

           
        if (valid && confirmed) {
            app.regData.name = app.regData.firstName + " " + app.regData.lastName; 
            User.create(app.regData).then(function(data) {
                if (data.data.success) {
                    app.loading = false; 
                    $scope.alert = 'alert alert-success'; 
                    app.successMsg = data.data.message + '...Redirecting'; 
                    
                    $timeout(function() {
                        $location.path('/');
                    }, 2000);
                } else {
                    app.loading = false; 
                    app.disabled = false; 
                    $scope.alert = 'alert alert-danger'; 
                    app.errorMsg = data.data.message; 
                }
            });
        } else {
            app.disabled = false; 
            app.loading = false; 
            $scope.alert = 'alert alert-danger'; 
            app.errorMsg = 'Please ensure form is filled our properly'; 
        }
    };

    //  Custom function that checks if username is available for user to use    
    this.checkUsername = function(regData) {
        app.checkingUsername = true; 
        app.usernameMsg = false; 
        app.usernameInvalid = false; 
        User.checkUsername(app.regData).then(function(data) {
            
            if (data.data.success) {
                app.checkingUsername = false; 
                app.usernameMsg = data.data.message; 
            } else {
                app.checkingUsername = false; 
                app.usernameInvalid = true; 
                app.usernameMsg = data.data.message; 
            }
        });
    };

    // Custom function that checks if e-mail is available for user to use       
    this.checkEmail = function(regData) {
        app.checkingEmail = true; 
        app.emailMsg = false; 
        app.emailInvalid = false; 

             
        User.checkEmail(app.regData).then(function(data) {
            if (data.data.success) {
                app.checkingEmail = false; 
                app.emailMsg = data.data.message; 
            } else {
                app.checkingEmail = false; 
                app.emailInvalid = true; 
                app.emailMsg = data.data.message; 
            }
        });
    };
})

// Custom directive to check matching passwords 
.directive('match', function() {
    return {
        restrict: 'A', // Restrict to HTML Attribute
        controller: function($scope) {
            $scope.confirmed = false; // Set matching password to false by default

            $scope.doConfirm = function(values) {
                values.forEach(function(ele) {
                    // Check if inputs match and set variable in $scope
                    if ($scope.confirm == ele) {
                        $scope.confirmed = true; // If inputs match
                    } else {
                        $scope.confirmed = false; // If inputs do not match
                    }
                });
            };
        },

        link: function(scope, element, attrs) {

            // Grab the attribute and observe it            
            attrs.$observe('match', function() {
                scope.matches = JSON.parse(attrs.match); 
                scope.doConfirm(scope.matches); 
            });

            // Grab confirm ng-model and watch it           
            scope.$watch('confirm', function() {
                scope.matches = JSON.parse(attrs.match);
                scope.doConfirm(scope.matches); 
            });
        }
    };
})

.controller('facebookCtrl', function($routeParams, Auth, $location, $window, $scope,$rootScope) {

    var app = this;
    app.iconFacebook=false;
    app.errorMsg = false; 
    app.expired = false; 
    app.disabled = true; 
    $window.localStorage.setItem('iconFacebook', false);
    // Check if callback was successful 
    if ($window.location.pathname == '/facebookerror') {
        $window.localStorage.setItem('iconFacebook', false);
        $scope.alert = 'alert alert-danger'; 
        app.errorMsg = 'Facebook e-mail not found in database or locked'; 
    } else if ($window.location.pathname == '/facebook/inactive/error') {
        $window.localStorage.setItem('iconFacebook', false);
        app.expired = true;
        $scope.alert = 'alert alert-danger';
        app.errorMsg = 'Account is not yet activated. Please check your e-mail for activation link.'; 
    } else {
        Auth.socialMedia($routeParams.token); 
        $window.localStorage.setItem('iconFacebook', true);
        $location.path('/'); 
    }
})

// twitterCtrl is used finalize facebook login  
.controller('twitterCtrl', function($routeParams, Auth, $location, $window, $scope) {

    var app = this;
    app.errorMsg = false; 
    app.expired = false; 
    app.disabled = true; 

    // Check if callback was successful         
    if ($window.location.pathname == '/twittererror') {
        $scope.alert = 'alert alert-danger'; 
        app.errorMsg = 'Twitter e-mail not found in database.'; 
    } else if ($window.location.pathname == '/twitter/inactive/error') {
        app.expired = true; 
        $scope.alert = 'alert alert-danger'; 
        app.errorMsg = 'Account is not yet activated. Please check your e-mail for activation link.'; 
    } else if ($window.location.pathname == '/twitter/unconfirmed/error') {
        $scope.alert = 'alert alert-danger'; 
        app.errorMsg = 'Your twitter account is either inactive or does not have an e-mail address attached to it.'; 
    } else {
        Auth.socialMedia($routeParams.token); 
        $location.path('/'); 
    }
})

// Controller: googleCtrl is used finalize facebook login   
.controller('googleCtrl', function($routeParams, Auth, $location, $window, $scope) {;
    var app = this;
    app.errorMsg = false; 
    app.expired = false; 
    app.disabled = true; 
    $window.localStorage.setItem('iconGoogle', false);
    // Check if callback was successful         
    if ($window.location.pathname == '/googleerror') {
        $scope.alert = 'alert alert-danger'; 
        app.errorMsg = 'Google e-mail not found in database.'; 
        $window.localStorage.setItem('iconGoogle', false);
    } else if ($window.location.pathname == '/google/inactive/error') {
        $window.localStorage.setItem('iconGoogle', false);
        app.expired = true; 
        $scope.alert = 'alert alert-danger'; 
        app.errorMsg = 'Account is not yet activated. Please check your e-mail for activation link.'; 
    } else {
        $window.localStorage.setItem('iconGoogle', true);
        Auth.socialMedia($routeParams.token); 
        $location.path('/'); 
    }
});
