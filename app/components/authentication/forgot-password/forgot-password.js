
angular.module('classDigApp')

.controller('ForgotPasswordCtrl', function ($scope, $http, appSettings, $log) {
    $scope.data = {};
    $scope.successReset = false;
    $scope.serverMessage = {
        error: false,
        message: ''
    };
    $scope.forgotPassword = function () {
        if (this.forgotPasswordForm.$valid) {
            $scope.serverMessage.error = false;
            $http.post(appSettings.link + 'forgot-password', {email: $scope.data.email})
                .success(function (r) {
                    $scope.successReset = true;
                })
                .error(function (e) {
                    $log.log(e);
                    $scope.serverMessage = { error: true, message: e !==null && e.message? e.message: 'Something went wrong!'}
                })
            ;
        }
    }
});
