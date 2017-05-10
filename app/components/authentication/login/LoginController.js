// angular.module('classDigApp')
//
// .controller('LoginController', function ($scope) {
//     console.log("Error AUTH");
// });


'use strict';

angular.module('Authentication')

  .controller('LoginController',
    ['$scope', '$rootScope', '$location', 'localStorageService', 'AuthenticationService', 'appSettings', 'classData', 'Groups', '$timeout', '$http',
      function ($scope, $rootScope, $location, localStorageService, AuthenticationService, appSettings, classData, Groups, $timeout, $http) {

        $scope.clear = function () {
          if($rootScope.fbInfo)  delete $rootScope.fbInfo;
        };

        $rootScope.$on('authorized-via-fb', function () {
          FB.login(function(response) {
            statusChangeCallback(response);
          });
        });

        function statusChangeCallback(response) {
          console.log('eeee');
          
          if (response.status === 'connected') {

            $scope.facebookNotLogged = false;

            testAPI(response.authResponse.accessToken);

            var token = response.authResponse.accessToken;

            $http.post('http://api.classdig.oyihost.com/login/facebook', {code : token})
              .success(function (response) {
                AuthenticationService.setUserData(response);
                Groups.init();
                classData.init();
                $location.path('/');

              })
              .error(function (error) {
                $location.path('/signup');
              });
          } else {
            $scope.facebookNotLogged = true;
            $scope.fixedStyle = {'margin' : '25px 0 0 0'}
          }
        }

        $scope.checkLoginState = function() {
          FB.login(function(response) {
            statusChangeCallback(response);
          });
        };

        window.fbAsyncInit = function() {
          FB.init({
            appId      : '1097012913686902',
            cookie     : true,
            xfbml      : true,
            version    : 'v2.7'
          });
        };

        (function(d, s, id) {
          var js, fjs = d.getElementsByTagName(s)[0];
          if (d.getElementById(id)) return;
          js = d.createElement(s); js.id = id;
          js.src = "//connect.facebook.net/en_US/sdk.js";
          fjs.parentNode.insertBefore(js, fjs);
        }(document, 'script', 'facebook-jssdk'));

        function testAPI(token) {
          FB.api('/me', { fields: ['last_name', 'first_name', 'email', 'gender', 'middle_name']},
            function(response) {
              $rootScope.fbInfo = response;
              $rootScope.fbInfo.code = token;
              $http.get("https://graph.facebook.com/v2.7/" + $rootScope.fbInfo.id + "/picture?type=large&redirect=0")
                .success(function (resp) {
                  $rootScope.fbInfo.picture = resp;
                })
            });
        }
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

        // reset login status
        AuthenticationService.clearCredentials();

        $scope.login = function () {

          $scope.dataLoading = true;
          AuthenticationService.login($scope.username, $scope.password, function (response) {

              if (response.data) {

                AuthenticationService.setCredentials($scope.username, $scope.password);
                Groups.init();
                classData.init();
                $rootScope.newNotifications = [];

                $location.path('/');
              }
              else {

                $scope.error = data.message;
                $scope.dataLoading = false;
              }

          });

        };

      }]);

// ====================== AuthInterceptor ==============

// create Interceptor
app.factory('BearerAuthInterceptor', function ($rootScope, localStorageService, $q) {

  return {
    request: function (config) {

      //console.log("Interceptor");

      if ($rootScope.user) {
        config.headers.Authorization = 'Bearer ' + $rootScope.user.data.token;
        $rootScope.config = config.headers;
        //   console.log("autorization");
      }
      return config;
    },
    response: function (response) {
      if (response.status === 401) {
        // handle the case where the user is not authenticated
      }
      return response || $q.when(response);
    }
  };

});


// add Interceptor
app.config(function ($httpProvider) {
  $httpProvider.interceptors.push('BearerAuthInterceptor');
});
