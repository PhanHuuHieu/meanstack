angular.module('homeServices', [])

.factory('Home', function($http) {
    var homefactory = {}; // Create the homefactory object
    // get information of cities in database
    homefactory.savePost= function (data) {
        return $http.post('/api/savepost',data);
    }
    // get information of city from database
    homefactory.getCities =function(){
        return $http.get('api/cities');
    }
    //get information of districs in database
    homefactory.getDistrics= function(cityId){
        return $http.get('/api/dictrics/' + cityId);
    }

    //get information of streets in database
    homefactory.getStreets = function(communeId){
        return $http.get('/api/streets/'+ communeId);
    }

    //get information communes in database
    homefactory.getCommunes=function(dictricId) {
        return $http.get('/api/communes/'+dictricId);
    }
    // Register users in database
    homefactory.getNewNews = function() {
        return $http.get('/api/newnews');
    }
    // pagination
    homefactory.doPagination = function(pageNumber) {
        return $http.get('/api/pagination/' + pageNumber);
    }
    // Get detail room
    homefactory.getDetailNews= function(newsId){
        return $http.get('/api/detailroom/' + newsId);
    }
    //search news
    homefactory.searchnews = function(searchdata){
        return $http.post('/api/searchnews', searchdata)
    
    }
    return homefactory; // Return homefactory object
});
