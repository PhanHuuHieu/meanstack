angular.module('authServices', [])

    //Auth handles all login/logout functions	
    .factory('Auth', function ($http, AuthToken, $window) {
        var authFactory = {}; // Create the factory object

        // Function to log the user inno
        authFactory.login = function (loginData) {
            return $http.post('/api/authenticate', loginData).then(function (data) {
                AuthToken.setToken(data.data.token); // Endpoint will return a token to set
                return data;
            });
        };

        // Function to check if user is currently logged in
        authFactory.isLoggedIn = function () {
            // CHeck if token is in local storage
            if (AuthToken.getToken()) {
                return true; // Return true if in storage
            } else {
                return false; // Return false if not in storage
            }
        };

        // Function to set token for social media logins
        authFactory.socialMedia = function (token) {
            // AuthToken.setToken(token);
            if (token) {
                $window.localStorage.setItem('token', token); // If so, set the token in local storage
            } else {
                $window.localStorage.removeItem('token'); // Otherwise, remove any token found in local storage (logout)
            }
        };

        // Function to get current user's data
        authFactory.getUser = function () {
            if (AuthToken.getToken()) {
                return $http.post('/api/me'); // Return user's data
            } else {
                $q.reject({ message: 'User has no token' }); // Reject if no token exists
            }
        };

        // Function to logout the user
        authFactory.logout = function () {
            $window.localStorage.setItem('iconFacebook',null);
            $window.localStorage.setItem('iconGoogle',null);
            AuthToken.setToken(); // Removes token from local storage
        };

        return authFactory; // Return object
    })

    .factory('AuthToken', function ($window) {
        var authTokenFactory = {};

        authTokenFactory.setToken = function (token) {
            // Check if token was provided in function parameters
            if (token) {
                $window.localStorage.setItem('token', token); // If so, set the token in local storage
            } else {
                $window.localStorage.removeItem('token'); // Otherwise, remove any token found in local storage (logout)
            }
        };

        // Function to retrieve token found in local storage
        authTokenFactory.getToken = function () {
            return $window.localStorage.getItem('token');
        };

        return authTokenFactory; 
    })

    // AuthInterceptors is used to configure headers with token (passed into config, app.js file)
    .factory('AuthInterceptors', function (AuthToken) {
        var authInterceptorsFactory = {};

        // Function to check for token in local storage and attach to header if so
        authInterceptorsFactory.request = function (config) {
            var token = AuthToken.getToken(); // Check if a token is in local storage
            if (token) config.headers['x-access-token'] = token; //If exists, attach to headers

            return config; 
        };

        return authInterceptorsFactory; 

    });
