'use strict';

angular.module('classDigApp')

  .factory('AuthenticationService',
    ['$http',
      '$location',
      'localStorageService',
      '$cookieStore',
      '$rootScope',
      '$timeout',
      'appSettings',
      function ($http, $location, localStorageService, $cookieStore, $rootScope, $timeout, appSettings) {

        var service = {};
        var res = {};
        $rootScope.user;

        $rootScope.config = {
         headers: {"Accept": "application/json"}
        };

        service.login = function (username, password, callback) {

          var loginData = {
            email: username,
            password: password
          };

          $('#login-button').hide();
          $('#login-loader').show();

          // set delay for spinner
          // setTimeout(function() {

            console.log(appSettings.link);

            var localAPiserver = 'localhost/';

          $http.post(appSettings.link + 'login', loginData, $rootScope.config)
          // $http.post(appSettings.link + 'login', loginData, $rootScope.config)
            .success(function (response) {
              service.setUserData(response);
              $rootScope.loginError = '';
              callback(response);
            })
            .error(function (data) {
              $rootScope.loginError = data.message;
            })

          // delay for spinner
          // }, 5000);

          $('#login-loader').hide();
          $('#login-button').show();

        };

        service.setCredentials = function (username, password) {


          $http.defaults.headers.common['Authorization'] = 'Basic ' + username + ":" + password; // jshint ignore:line
          // $cookieStore.put('globals', $rootScope.globals);

        };

        service.clearCredentials = function () {
          $rootScope.globals = {};
          //$cookieStore.remove('globals');
          $http.defaults.headers.common.Authorization = 'Basic ';
        };

        service.setUserData = function (response) {
          localStorageService.set('storage', response);
          $rootScope.user = response;
        }

        service.getUserData = function () {
          if (($rootScope.user === null) || (!$rootScope.user )) {
            $rootScope.user = localStorageService.get('storage');
          }
          return $rootScope.user
        }

        service.getToken = function () {
          return $rootScope.user.data.token;
        }

        service.getUserRole = function () {
          return $rootScope.user.data.role;
        }

        service.getUserId = function () {
          return $rootScope.user.data.id;
        }

        service.getUserName = function () {
          return ($rootScope.user.data.details.data.first_name + ' ' + $rootScope.user.data.details.data.last_name);
        }

        service.logout = function () {
          delete $rootScope.config;
          delete $rootScope.role;
          delete $rootScope.user;
          delete $rootScope.globals;
          delete $rootScope.userData;
          delete $rootScope.fbInfo;
          delete $rootScope.dialog;
          localStorageService.clearAll();
        };

        return service;
      }])

  .config(function(socialProvider){
    // socialProvider.setGoogleKey("YOUR GOOGLE CLIENT ID");
    // socialProvider.setLinkedInKey("YOUR LINKEDIN CLIENT ID");
    socialProvider.setFbKey({appId: "1097012913686902", apiVersion: "v2.7"});
  });

