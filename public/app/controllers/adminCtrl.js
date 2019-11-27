angular.module('adminController', ['adminServices', 'ngFileUpload', 'userServices'])

    // admin controller : management post, info...of admin or moderator
    .controller('adminCtrl', function (Admin, $scope) {
        var app = this;
        $scope.isBrowse = 0;
        getInfo();
        //Load news at start
        pagination(1);

        app.pagination = function (page) {
            pagination(page);
        }

        //Clear input search
        app.clear = function () {
            $scope.searchKeyword = undefined; // Clear the search word
            $scope.searchFilter = undefined;
        }
        //Get all post of admin when click QLBD
        app.getAllNews = function () {
            $scope.isBrowse = 1;
            pagination(1);
        }

        //Get unapproved posts
        app.browseClick = function () {
            $scope.isBrowse = 0;
            pagination(1);
        }

        //post management of user
        app.userpost = function () {
            $scope.isBrowse = 2;
            pagination(1);
        }

        //browse admin post
        app.browse = function (id, currentPage) {
            Admin.browse(id).then(function (data) {
                if (data.data.success) {
                    if ($scope.newslength == 0) {
                        if (currentPage > 1) {
                            currentPage = currentPage - 1;
                        }


                    }
                    pagination(currentPage);
                }
            })
        }

        //Deletepost of admin
        app.delete = function (id, currentPage) {
            Admin.delete(id).then(function (data) {
                if ($scope.newslength == 0) {
                    if (currentPage > 1) {
                        currentPage = currentPage - 1;
                    }
                }
                pagination(currentPage);
            })
        }
        //pagination news
        function pagination(page) {
            if ($scope.isBrowse == 0) {
                Admin.pagination(page).then(function (data) {
                    if (data.data.pages < page) {
                        return;
                    }
                    app.news = data.data.news;
                    app.currentPage = data.data.currentPage;
                    app.pages = data.data.pages;
                    app.numOfResults = data.data.numOfResults;
                    $scope.newslength = data.data.news.length;
                })
            } else if ($scope.isBrowse == 1) {
                Admin.getnews(page).then(function (data) {
                    if (data.data.pages < page) {
                        return;
                    }
                    app.permission = data.data.permission;
                    app.news = data.data.news;
                    app.currentPage = data.data.currentPage;
                    app.pages = data.data.pages;
                    app.numOfResults = data.data.numOfResults;
                    $scope.newslength = data.data.news.length;
                })
            } else if ($scope.isBrowse == 2) {
                Admin.userpost(page).then(function (data) {
                    if (data.data.pages < page) {
                        return;
                    }
                    app.news = data.data.news;
                    app.currentPage = data.data.currentPage;
                    app.pages = data.data.pages;
                    app.numOfResults = data.data.numOfResults;
                    $scope.newslength = data.data.news.length;
                })
            }
        }

        //get information user's in current
        function getInfo() {
            Admin.getInfo().then(function (data) {
                app.user = data.data.user;
            });
        }

    })


    // controller post news (user, admin)
    .controller('postmanagementCtrl', function (Admin, $scope) {
        var app = this;
        // get news at loadpage
        pagination(1);
        Admin.getInfo().then(function (data) {
            app.user = data.data.user;
        });
        //pagination
        function pagination(page) {
            Admin.getnews(page).then(function (data) {
                if (data.data.pages < page) {
                    return;
                }
                console.log(data.data.pages)
                app.news = data.data.news;
                app.currentPage = data.data.currentPage;
                app.pages = data.data.pages;
                app.numOfResults = data.data.numOfResults;
                $scope.newslength = data.data.news.length;
            })

        }
        app.pagination = function (page) {
            pagination(page);
        }
        app.browse = function (id, currentPage) {
            Admin.browse(id).then(function (data) {
                if (data.data.success) {
                    if ($scope.newslength == 0) {
                        if (currentPage > 1) {
                            currentPage = currentPage - 1;
                        }


                    }
                    pagination(currentPage);
                }
            })
        }
        //Xoa bai dang of admin
        app.delete = function (id, currentPage) {
            Admin.delete(id).then(function (data) {
                if ($scope.newslength < 2) {
                    if (currentPage > 1) {
                        currentPage = currentPage - 1;
                    }
                }
                pagination(currentPage);
            })
        }
    })
    // controller post processing
    .controller('browseCtrl', function (Admin, $scope) {

        var app = this;
        pagination(1);

        Admin.getInfo().then(function (data) {
            app.user = data.data.user;
        });
        app.pagination = function (page) {
            pagination(page);
        }
        // browse the post
        app.browse = function (id, currentPage) {
            Admin.browse(id).then(function (data) {
                if (data.data.success) {
                    if ($scope.newslength == 0) {
                        if (currentPage > 1) {
                            currentPage = currentPage - 1;
                        }
                    }
                    pagination(currentPage);
                }
            })
        }
        //Delete post
        app.delete = function (id, currentPage) {
            Admin.delete(id).then(function (data) {
                if ($scope.newslength < 2) {
                    if (currentPage > 1) {
                        currentPage = currentPage - 1;
                    }
                }
                pagination(currentPage);
            })
        }
        function pagination(page) {
            Admin.pagination(page).then(function (data) {
                if (data.data.pages < page) {
                    return;
                }
                console.log(data.data)
                app.news = data.data.news;
                app.currentPage = data.data.currentPage;
                app.pages = data.data.pages;
                app.numOfResults = data.data.numOfResults;
                $scope.newslength = data.data.news.length;
            })

        }
    })

    // Edit post
    .controller('editpostCtrl', function (Admin, $scope, $routeParams, Upload, $location, $timeout) {
        var app = this;
        app.editpost = function (news) {
            //save information
            app.upload(news);
        }
        app.upload = function (news) {

            app.successMsg
            app.errorMsg
            app.errorImage = false;
            news.id = $routeParams.id;
            news.filename = news.file.name;
            if (news.file != null && news.file != undefined && news.file != '' && news.file != 'null') {
                //save image in folder assets/image
                Upload.upload({
                    url: 'http://localhost:4200/api/upload',
                    data: { file: news.file }
                }).then(function (resp) {
                    if (resp.data.error_code === 0) {
                        //save edit information 
                        Admin.editpost(news).then(function (data) {
                            if (data.data.success) {
                                app.successMsg="Save post success.....Redirect home in 2s";
                                $timeout(function () {
                                   $location.path('/');
                                    app.successMsg=false;
                                }, 2000);
                            } else {
                                app.errorMsg="Save post fail. Please try again";
                                $timeout(function () {
                                    app.errorMsg=false;
                                }, 2000);
                            }
                        });
                    }
                });
            } else {
                Admin.editpost(news).then(function (data) {
                    if (data.data.success) {
                        app.successMsg="Save post success.....Redirect home in 2s";
                        $timeout(function () {
                             $location.path('/');
                             app.successMsg=false;
                         }, 2000);
                    } else {
                        app.errorMsg="Save post fail. Please try again";
                        $timeout(function () {
                            app.errorMsg=false;
                        }, 2000);
                    }
                });
            }
        }

        // inject information to editpost.html
        Admin.getpost($routeParams.id).then(function (data) {
            app.news = {};
            app.news.file = "";
            $scope.file = data.data.news.anhbia;
            app.news.description = data.data.news.mota;
            app.news.title = data.data.news.tieude;
            app.news.category = data.data.news.loaitin;
            app.news.phone = parseInt(data.data.news.sodt);
            app.news.price = parseInt(data.data.news.giaphong);
            app.news.amount = parseInt(data.data.news.songuoi);
            app.news.acreage = parseInt(data.data.news.dientich);
            app.news.sex = data.data.news.doituong;
            app.news.city = data.data.address.tinh_tp;
            app.news.dictric = data.data.address.quan_huyen;
            app.news.commune = data.data.address.xa_phuong;
            app.news.street = data.data.address.duong;
            app.news.address = data.data.address.diachichinhxac;

        })
    })