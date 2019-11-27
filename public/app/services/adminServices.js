angular.module('adminServices', [])

// Auth handles all login/logout functions	
.factory('Admin', function($http) {
    var adminFactory = {}; // Create the factory object
    adminFactory.getnews= function(page) {
        return $http.get('/api/adminnews/'+page);
    }
    adminFactory.pagination= function (page) {
        return $http.get('/api/adminpagination/'+page);
    }
    adminFactory.browse= function (id) {
        return $http.post('/api/browse/'+id);
    }
    adminFactory.delete= function (id) {
        return $http.delete('/api/delete/'+id);
    }
    adminFactory.userpost= function (page) {
        return $http.get('/api/userpost/'+page);
    }

    adminFactory.getInfo = function() {
        return $http.get('/api/infomation');
    }
    adminFactory.editInfo= function(data) {
        return $http.post('/api/editInfo',data);
    }
    adminFactory.getpost= function(id){
        return $http.get('/api/getpost/'+id);
    }
    adminFactory.editpost=function(data){
        return $http.post('/api/editpost',data);
    }
    return adminFactory; 

});
