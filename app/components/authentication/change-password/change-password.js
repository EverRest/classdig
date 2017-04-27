
angular.module('classDigApp')

.controller('ChangePasswordCtrl', function ($scope, $http, appSettings, $log, $routeParams, $location) {
    $log.log($routeParams.token);
    $log.log($routeParams);
    $scope.data = {};
    $scope.successReset = false;
    $scope.serverMessage = {
        error: false,
        message: ''
    };
    var newUrl = $location.$$url.split("?");
    newUrl = newUrl[0];
    $location.$$url = newUrl;
    $scope.changePassword = function () {
        if (this.form.$valid) {
            $scope.serverMessage.error = false;
            $http.post(appSettings.link + 'reset-password', {
                email: $routeParams.email,
                token: $routeParams.token,
                password: $scope.data.password,
                password_confirmation: $scope.data.password_confirmation
            })
                .success(function (r) {
                    $location.path('/login ');
                })
                .error(function (e) {
                    $log.log(e);
                    $scope.serverMessage = { error: true, message: e !==null && e.message? e.message: 'Something went wrong!'}
                })
            ;
        }
    }
}).directive('pwCheck', ['$timeout', function ($timeout) {
    return {
        require: 'ngModel',
        link: function (scope, elem, attrs, ctrl) {
            var firstPassword = '#' + attrs.pwCheck;
            elem.add(elem).on('keyup', function () {
                scope.$apply(function () {
                    var v = elem.val() === $(firstPassword).val();

                    if (v) {
                        $timeout(function () {
                            $(firstPassword).trigger('keyup');
                        });

                    }

                    ctrl.$setValidity('pwmatch', v);
                });
            });
        }
    }
}]);

