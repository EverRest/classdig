'use strict';

/**
 * @ngdoc overview
 * @name classApp
 * @description
 * # classApp
 *
 * Main module of the application.
 */
var app = angular.module('classDigApp', [ //'ngRoute' ]);
  'ngAnimate',
  'ngAria',
  'ngCookies',
  'ngMessages',
  'ngResource',
  'ngRoute',
  'ngSanitize',
  'ngTouch'
]);

// var app1 = angular.module('headerCtrl', ['ngRoute']);

app.config(function ($routeProvider) {
  $routeProvider
    .when('/', {
      templateUrl: 'views/main.html',
      controller: 'MainController',
      controllerAs: 'main'
    })
    .when('/login', {
      templateUrl: 'components/login/login.html',
      // controller: 'LoginController'
    })
    .when('/logout', {
      templateUrl: 'components/login/logout.html'
      // controller: 'logoutCtrl'
    })
    .when('/help', {
      templateUrl: 'components/login/logout.html'
      // controller: 'logoutCtrl'
    })
    .otherwise({
      redirectTo: '/'
    });
  // $locationProvider.html5Mode(false).hashPrefix('!');
  // use the HTML5 History API
  // $locationProvider.html5Mode(true);

});


