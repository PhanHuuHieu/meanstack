'use strict';
angular.module('homeController', ['homeServices', 'userServices'])

    //controller handle all home page processing
    .controller('homeCtrl', function (User, Home, $scope, $routeParams) {
        var app = this;
        app.loadme = false;
        getCities();
        // load new post in database
        getNewNews();
        // get all post
        getNews();

        // search post follow information  input user's
        app.search = function (searchForm) {
            Home.searchnews(searchForm).then(function (data) {
                app.notsearch = false;
                app.searchnews = data.data.news;
                app.searchlength = app.searchnews.length
            })
        }
        //Load information city 
        function getCities() {
            Home.getCities().then(function (data) {
                if (data.data.success) {
                    app.cities = data.data.provinces;
                }
                else {
                    app.cities = '--Chọn TP/Tỉnh--';
                }
            });

        }

        app.getPage = function (pageNumber) {
            doPagination(pageNumber);
        }
        function doPagination(pageNumber) {
            var index = 1;
            Home.doPagination(pageNumber).then(function (data) {
                if (data.data.pages < pageNumber) {
                    return;
                }
                app.news = data.data.news;
                app.currentPage = data.data.currentPage;
                app.numOfResults = data.data.numOfResults;
                app.pages = data.data.pages;
                app.pager = []; // number of pages
            })
        }

        function getNews() {
            app.notsearch = true;
            doPagination(1);
        }

        // Load dictric when on change dropdown city
        $scope.onChangeCities = function (citiesId) {
            if (citiesId != "") {
                Home.getDistrics(citiesId).then(function (data) {
                    if (data.data.success) {
                        app.districs = data.data.districs;
                    } else {
                        app.dictrics = undefined;
                    }
                })
            } else {
                app.dictrics = undefined;
            }
        };
        // Load dictric when on change dropdown dictric
        $scope.onChangeDistrics = function (districId) {
            if (districId) {
                Home.getCommunes(districId).then(function (data) {
                    if (data.data.success) {
                        app.communes = data.data.commune;
                    } else {
                        app.commune = undefined;
                    }
                })
            } else {
                app.commune = undefined;
            }
        };

        // Load dictric when on change dropdown commune
        $scope.onChangeCommunes = function (communeId) {
            if (communeId) {
                Home.getStreets(communeId).then(function (data) {
                    if (data.data.success) {
                        app.streets = data.data.streets;
                    } else {
                        app.streets = undefined;
                    }
                })
            } else {
                app.streets = undefined;
            }
        };

        function getNewNews() {
            app.notsearch = true;
            Home.getNewNews().then(function (data) {
                if (data.data.success) {
                    app.newnews = data.data.newnews;
                }
            })
        }
    })

    // controller get detailroom processing
    .controller('detailroomCtrl', function ($scope, Home, $routeParams) {
        var app = this;
        getDetailNews($routeParams.id);
        getNewNews();
        function getDetailNews(newsId) {
            Home.getDetailNews(newsId).then(function (data) {
                app.detailnews = data.data.news;
                console.log(data.data.news[0].sodt)
                $scope.photos = [
                    { src: data.data.news[0].images[0].hinh1, desc: 'Image 01' },
                    { src: data.data.news[0].images[0].hinh2, desc: 'Image 02' },
                    { src: data.data.news[0].images[0].hinh3, desc: 'Image 03' }
                ];

                // initial image index
                $scope._Index = 0;

                // if a current image is the same as requested image
                $scope.isActive = function (index) {
                    return $scope._Index === index;
                };

                // show prev image
                $scope.showPrev = function () {
                    $scope._Index = ($scope._Index > 0) ? --$scope._Index : $scope.photos.length - 1;
                };

                // show next image
                $scope.showNext = function () {
                    $scope._Index = ($scope._Index < $scope.photos.length - 1) ? ++$scope._Index : 0;
                };

                // show a certain image
                $scope.showPhoto = function (index) {
                    $scope._Index = index;
                };
            })

        }
        function getNewNews() {

            Home.getNewNews().then(function (data) {
                if (data.data.success) {
                    app.newnews = data.data.newnews;
                }
            })
        }



    })




