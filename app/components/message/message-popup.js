angular.module('classDigApp')
    .directive('messagePopup', ['$timeout', '$rootScope', '$location', function ($timeout, $rootScope, $location) {
        return {
            templateUrl: 'components/message/message-popup.html',

            link: function (scope, elem, attr) {
                scope.selectRoom = function (room, obj) {
                  $rootScope.$broadcast('room-changed-from-popup', obj);
                  scope.dialog.markRead(obj);
                  $rootScope.dialog.markRead(obj);
                  $location.path('message').search({room: room});
                };
                scope.role = $rootScope.role;
                scope.dialog = $rootScope.dialog;
            }
        }
    }]);
