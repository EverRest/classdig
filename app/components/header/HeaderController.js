var app = angular.module('classDigApp');

app.controller('HeaderController', [
    '$scope',
    '$rootScope',
    '$http',
    '$location',
    'localStorageService',
    'AuthenticationService',
    function ($scope, $rootScope, $http, $location, localStorageService, AuthenticationService) {
        $scope.activeTab = $rootScope.activeTab;
        $scope.user = AuthenticationService.getUserData();
        $scope.username = AuthenticationService.getUserName();
        $scope.role = AuthenticationService.getUserRole();
        $scope.unread = $rootScope.dialog.unread;

        $scope.$on('dialog-unread-success', function () {
            $scope.unread = $rootScope.dialog.unread;
        });
        $rootScope.role = AuthenticationService.getUserRole();


        $scope.onMessageClick = function (e, par) {
          e.preventDefault();
        };

        if ($rootScope.role === "teacher") {
            $rootScope.bgClass = "bg-teacher";
            $rootScope.bgIcon = "bg-icon-teacher";
        }
        else if ($rootScope.role === "student") {
            $rootScope.bgClass = "bg-student";
            $rootScope.bgIcon = "bg-icon-student";
        }
        else {
            $rootScope.bgClass = "bg-parents";
            $rootScope.bgIcon = "bg-icon-parents";
        }

        // ============= Logout =============
        $scope.logout = function () {
            $http.defaults.headers.common['Authorization'] = null;
            AuthenticationService.logout();
            $location.path('/');
        };

    }]);
