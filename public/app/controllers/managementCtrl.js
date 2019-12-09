angular.module('managementController', [])

    //  User to control the management page and managing of user accounts
    .controller('managementCtrl', function (User, $scope, Admin) {
        var app = this;
        app.loading = true;
        app.accessDenied = true;
        app.errorMsg = false;
        app.editAccess = false;
        app.deleteAccess = false;
        app.limit = 5; // Set a default limit to ng-repeat
        app.searchLimit = 0; // Set the default search page results limit to zero

        //get current user
        getInfo();
        function getInfo() {
            Admin.getInfo().then(function (data) {
                app.user = data.data.user;
            });
        }
        // lock account user's
        app.lockUser = function (username) {
            User.lockUser(username).then(function (data) {
                getUsers();
            })
        }
        // unlock account user's
        app.unlockUser = function (username) {
            User.unlockUser(username).then(function (data) {
                getUsers();
            })
        }

        // get all the users from database
        function getUsers() {
            User.getUsers().then(function (data) {
                if (data.data.success) {
                    if (data.data.permission === 'admin' || data.data.permission === 'moderator') {
                        app.users = data.data.users;
                        app.loading = false;
                        app.accessDenied = false; // Show table
                        if (data.data.permission === 'admin') {
                            app.editAccess = true; // Show edit button
                            app.deleteAccess = true; // Show delete button
                        } else if (data.data.permission === 'moderator') {
                            app.editAccess = true;
                        }
                    } else {
                        app.errorMsg = 'Insufficient Permissions'; // Reject edit and delete options
                        app.loading = false;
                    }
                } else {
                    app.errorMsg = data.data.message;
                    app.loading = false;
                }
            });
        }

        getUsers();

        //  Show more results on page
        app.showMore = function (number) {
            app.showMoreError = false;
            // Run function only if a valid number above zero
            if (number > 0) {
                app.limit = number;
            } else {
                app.showMoreError = 'Please enter a valid number';
            }
        };

        //  Show all results on page
        app.showAll = function () {
            app.limit = undefined;
            app.showMoreError = false;
        };

        // Delete a user
        app.deleteUser = function (username) {
            User.deleteUser(username).then(function (data) {
                if (data.data.success) {
                    getUsers(); // Reset users on page
                } else {
                    app.showMoreError = data.data.message;
                }
            });
        };

        // Perform a basic search function
        app.search = function (searchKeyword, number) {
            if (searchKeyword) {
                if (searchKeyword.length > 0) {
                    app.limit = 0;
                    $scope.searchFilter = searchKeyword;
                    app.limit = number;
                } else {
                    $scope.searchFilter = undefined;
                    app.limit = 0;
                }
            } else {
                $scope.searchFilter = undefined;
                app.limit = 0;
            }
        };

        // Clear all fields
        app.clear = function () {
            $scope.number = ' ';
            app.limit = 0;
            $scope.searchKeyword = undefined;
            $scope.searchFilter = undefined;
            app.showMoreError = false;
        };

        app.advancedSearch = function (searchByUsername, searchByEmail, searchByName) {
            if (searchByUsername || searchByEmail || searchByName) {
                $scope.advancedSearchFilter = {}; // Create the filter object
                if (searchByUsername) {
                    $scope.advancedSearchFilter.username = searchByUsername;
                }
                if (searchByEmail) {
                    $scope.advancedSearchFilter.email = searchByEmail;
                }
                if (searchByName) {
                    $scope.advancedSearchFilter.name = searchByName;
                }
                app.searchLimit = undefined;
            }
        };

        // Set sort order of results
        app.sortOrder = function (order) {
            app.sort = order;
        };
    })

    // Used to edit users
    .controller('editCtrl', function ($scope, $routeParams, User, $timeout) {
        var app = this;
        $scope.nameTab = 'active'; // Set the 'name' tab to the default active tab
        app.phase1 = true; // Set the 'name' tab to default view

        //get the user that needs to be edited
        User.getUser($routeParams.id).then(function (data) {
            if (data.data.success) {
                $scope.newName = data.data.user.name;
                $scope.newEmail = data.data.user.email;
                $scope.newUsername = data.data.user.username;
                $scope.newPermission = data.data.user.permission;
                app.currentUser = data.data.user._id;
            } else {
                app.errorMsg = data.data.message;
                $scope.alert = 'alert alert-danger';
            }
        });

        //  Set the name pill to active
        app.namePhase = function () {
            $scope.nameTab = 'active';
            $scope.usernameTab = 'default';
            $scope.emailTab = 'default';
            $scope.permissionsTab = 'default';
            app.phase1 = true;
            app.phase2 = false;
            app.phase3 = false;
            app.phase4 = false;
            app.errorMsg = false;
        };

        //  Set the e-mail pill to active
        app.emailPhase = function () {
            $scope.nameTab = 'default';
            $scope.usernameTab = 'default';
            $scope.emailTab = 'active';
            $scope.permissionsTab = 'default';
            app.phase1 = false;
            app.phase2 = false;
            app.phase3 = true;
            app.phase4 = false;
            app.errorMsg = false;
        };

        //Set the username pill to active
        app.usernamePhase = function () {
            $scope.nameTab = 'default';
            $scope.usernameTab = 'active';
            $scope.emailTab = 'default';
            $scope.permissionsTab = 'default'; // CLear permissions tab
            app.phase1 = false;
            app.phase2 = true;
            app.phase3 = false;
            app.phase4 = false;
            app.errorMsg = false;
        };

        // Set the permission pill to active
        app.permissionsPhase = function () {
            $scope.nameTab = 'default';
            $scope.usernameTab = 'default';
            $scope.emailTab = 'default';
            $scope.permissionsTab = 'active';
            app.phase1 = false;
            app.phase2 = false;
            app.phase3 = false;
            app.phase4 = true;
            app.disableUser = false;
            app.disableModerator = false;
            app.disableAdmin = false;
            app.errorMsg = false;
            // Check which permission was set and disable that button
            if ($scope.newPermission === 'user') {
                app.disableUser = true;
            } else if ($scope.newPermission === 'moderator') {
                app.disableModerator = true;
            } else if ($scope.newPermission === 'admin') {
                app.disableAdmin = true;
            }
        };

        // = Update the user's name
        app.updateName = function (newName, valid) {
            app.errorMsg = false;
            app.disabled = true; // Disable form while processing
            if (valid) {
                var userObject = {};
                userObject._id = app.currentUser;
                userObject.name = $scope.newName;
                User.editUser(userObject).then(function (data) {
                    if (data.data.success) {
                        $scope.alert = 'alert alert-success';
                        app.successMsg = data.data.message;
                        //After two seconds, clear and re-enable
                        $timeout(function () {
                            app.nameForm.name.$setPristine();
                            app.nameForm.name.$setUntouched();
                            app.successMsg = false;
                            app.disabled = false;
                        }, 2000);
                    } else {
                        $scope.alert = 'alert alert-danger';
                        app.errorMsg = data.data.message;
                        app.disabled = false;
                    }
                });
            } else {
                $scope.alert = 'alert alert-danger';
                app.errorMsg = 'Please ensure form is filled out properly';
                app.disabled = false;
            }
        };

        // Update the user's e-mail
        app.updateEmail = function (newEmail, valid) {
            app.errorMsg = false;
            app.disabled = true; // Lock form while processing
            if (valid) {
                var userObject = {};
                userObject._id = app.currentUser;
                userObject.email = $scope.newEmail;
                User.editUser(userObject).then(function (data) {
                    if (data.data.success) {
                        $scope.alert = 'alert alert-success';
                        app.successMsg = data.data.message;
                        $timeout(function () {
                            app.emailForm.email.$setPristine();
                            app.emailForm.email.$setUntouched();
                            app.successMsg = false;
                            app.disabled = false;
                        }, 2000);
                    } else {
                        $scope.alert = 'alert alert-danger';
                        app.errorMsg = data.data.message;
                        app.disabled = false;
                    }
                });
            } else {
                $scope.alert = 'alert alert-danger';
                app.errorMsg = 'Please ensure form is filled out properly';
                app.disabled = false;
            }
        };

        //Update the user's username
        app.updateUsername = function (newUsername, valid) {
            app.errorMsg = false;
            app.disabled = true;
            if (valid) {
                var userObject = {};
                userObject._id = app.currentUser;
                userObject.username = $scope.newUsername;
                User.editUser(userObject).then(function (data) {
                    if (data.data.success) {
                        $scope.alert = 'alert alert-success';
                        app.successMsg = data.data.message;

                        $timeout(function () {
                            app.usernameForm.username.$setPristine();
                            app.usernameForm.username.$setUntouched();
                            app.successMsg = false;
                            app.disabled = false;
                        }, 2000);
                    } else {
                        app.errorMsg = data.data.message;
                        app.disabled = false;
                    }
                });
            } else {
                app.errorMsg = 'Please ensure form is filled out properly';
                app.disabled = false;
            }
        };

        // Function: Update the user's permission
        app.updatePermissions = function (newPermission) {
            app.errorMsg = false;
            app.disableUser = true;
            app.disableModerator = true;
            app.disableAdmin = true;
            var userObject = {};
            userObject._id = app.currentUser;
            userObject.permission = newPermission;
            User.editUser(userObject).then(function (data) {
                if (data.data.success) {
                    $scope.alert = 'alert alert-success';
                    app.successMsg = data.data.message;
                    $timeout(function () {
                        app.successMsg = false;
                        $scope.newPermission = newPermission;

                        if (newPermission === 'user') {
                            app.disableUser = true; // Lock the 'user' button
                            app.disableModerator = false; // Unlock the 'moderator' button
                            app.disableAdmin = false; // Unlock the 'admin' button
                        } else if (newPermission === 'moderator') {
                            app.disableModerator = true; // Lock the 'moderator' button
                            app.disableUser = false; // Unlock the 'user' button
                            app.disableAdmin = false; // Unlock the 'admin' button
                        } else if (newPermission === 'admin') {
                            app.disableAdmin = true;
                            app.disableModerator = false;
                            app.disableUser = false;
                        }
                    }, 2000);
                } else {
                    $scope.alert = 'alert alert-danger';
                    app.errorMsg = data.data.message;
                    app.disabled = false;
                }
            });
        };
    });
