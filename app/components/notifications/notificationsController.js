angular.module('classDigApp')
  .controller('notificationsController',
  ['$scope',
    '$rootScope',
    'appSettings',
    '$log',
    'Chat',
    '$uibModal',
    'Users',
    '$timeout',
    'AllClasses',
    '$routeParams',
    '$location',
    'chatTitle',
    'moment',
    'Upload',
    'ChatGroups',
    '$http',
    'classData',
    function ($scope, $rootScope, appSettings, $log, Chat, $uibModal, Users, $timeout,
              AllClasses, $routeParams, $location, chatTitle, moment, Upload, ChatGroups,
              $http, classData) {

      $scope.init = function () {
        $scope.updateNotifications(1);
      };

      $scope.parseLokation = function (obj) {
        var url;
        switch(obj.type) {
          case 'add_user_to_class':  url = "/class/" + obj.class_id + "/user/" + obj.user_id  + "/students"; break;
          case 'add_new_exam': url = "/class/" + obj.class_id + "/user/" + obj.user_id  + "/exams"; break;
          case 'add_new_assignment':   url = "/class/" + obj.class_id + "/user/" + obj.user_id  + "/assignment"; break;
          case 'add_new_announcement':   url = "/class/" + obj.class_id + "/user/" + obj.user_id  + "/announcments"; break;
          case 'add_new_poll':   url = "/class/" + obj.class_id + "/user/" + obj.user_id  + "/polls"; break;
          case 'add_new_event':   url = "/class/" + obj.class_id + "/user/" + obj.user_id  + "/events"; break;
        }
        return url
      };

      $scope.merjNotifications = function () {
        if( $rootScope.newNotifications && $scope.notifications){
          $rootScope.newNotifications.forEach(function (obj) {
            var el = $scope.notifications.find(function (notif) {
              return notif.id === obj.id;
            });
            if(!el) $scope.notifications.unshift(obj);
          });
        }
      };

      $rootScope.$watch('newNotifications', function () {
        $scope.merjNotifications();
      });

      $scope.$on('all-notifications-were-red', function () {
        $scope.updateNotifications(1);
      });

      $scope.updateNotifications = function (param) {
        $http.get(appSettings.link + "notifications?status=" + param)
          .success(function (response) {
            if(param === 0) {
              $rootScope.newNotifications = response.data;
            } else if(param === 1){
              $scope.notifications = response.data;
              $scope.merjNotifications();
            }
          });
      };

      $scope.$on('notification-was-read', function (event, notification) {
        var el = $scope.notifications.find(function (obj) {
          return obj.id === notification.id;
        });
        if(el) el.status = 1;
      });

      $scope.readNotification = function (notification) {
        if(notification.status === 1) return;
        notification.status = 1;

        $http.put('http://api.classdig.com/notifications', { 'notifications' : [notification.id]})
        //$http.put('http://loc.classdig.com', { 'notifications' : [notification.id]})
          .success(function (response) {
            $scope.updateNotifications(0);
          });

        $http.get(appSettings.link  + 'class/' + notification.class_id)
          .success(function (response) {
            classData.setPickedClass(response.data);
            $location.path($scope.parseLokation(notification));
          });
      }
    }
  ]);
