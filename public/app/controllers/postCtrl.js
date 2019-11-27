angular.module('postController',['homeServices','ngFileUpload','postServices'])

//controller handle post processing
.controller('postCtrl',function (Home, $scope, Post,Upload, $location){
    var app= this;
    //Load city from database
    getCities();
    //check  validate form and call controller backend
    app.postnews= function (data) {
        if(app.postForm.file.$valid && data.file) {
            app.upload(data.file,data);
        }
    }

    app.upload = function(file,data) {
        app.errorImage=false;
        data.filename=data.file.name;
        if(data.file.length>3) {
            app.errorImage="Bạn chỉ được chọn tối đa 3 hình ảnh";
        }

        Upload.upload({
            url:'http://localhost:4200/api/upload',
            data:{file:file}
        }). then(function (resp) {
            if(resp.data.error_code===0) {  
                Post.savepost(data).then(function(err,data){
                    $location.path('/');// return home
                })
            }
        });
       

    }
    function getCities() {
        Home.getCities().then(function (data) {
            if (data.data.success) {
                 app.cities = data.data.provinces;
            }
            else {
                app.cities = undefined;
            }
        });

    }
    $scope.onChangeCities = function (citiesId) {
        if (citiesId!="" || citiesId!=undefined || citiesId!=null) {
           Home.getDistrics(citiesId).then(function (data) {
               if (data.data.success) {
                   app.dictrics = data.data.districs;
               } else {
                   app.dictrics = undefined
               }
           })
       }else {
           app.dictrics=undefined;
       }
   };
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
           app.communes = undefined;
       }
   };

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

}) 