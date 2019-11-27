angular.module('userApp', ['adminServices','appRoutes','adminController', 'userControllers','postServices', 'userServices','postController' ,'ngAnimate', 'mainController', 'authServices', 'emailController', 'managementController','homeController','homeServices'])

.config(function($httpProvider) {
    $httpProvider.interceptors.push('AuthInterceptors');
});
