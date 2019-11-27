angular.module('postServices', [])

.factory('Post', function($http) {
    var postFactory = {}; // Create the userFactory object

    //Call savepost in server
    postFactory.savepost = function (data) { 
        return $http.post('/api/savenews',data);
    }
    return postFactory; // Return userFactory object
});
