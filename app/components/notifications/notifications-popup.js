angular.module('classDigApp')
  .directive('notificationsPopup', ['$timeout', '$rootScope', '$location', '$http', 'appSettings','classData', function ($timeout, $rootScope, $location, $http, appSettings, classData) {
    return {
      templateUrl: 'components/notifications/notifications-popup.html',

      link: function (scope, elem, attr) {
        scope.onMessageClick = function (e) {
          e.preventDefault();
        };

        scope.updateNotifications = function (param) {
          $http.get(appSettings.link + "notifications?status=" + param)
            .success(function (response) {
                $rootScope.newNotifications = response.data;
            });
        };

        scope.parseLokation = function (obj) {
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

        scope.readAllNotifications = function () {
          var arr = [];
          $rootScope.newNotifications.forEach(function (obj) {
            arr.push(obj.id)
          });

          $http.put(appSettings.link  + 'notifications', { 'notifications' : arr})
            .success(function (response) {
              $rootScope.newNotifications = [];
              $rootScope.$broadcast('all-notifications-were-red');

            })

        };

        scope.readNotification = function (notification) {
          notification.status = 1;
          $rootScope.$broadcast('notification-was-read', notification);


          $http.put(appSettings.link  + 'notifications', { 'notifications' : [notification.id]})
            .success(function (response) {
              scope.updateNotifications(0);

            });

          $http.get(appSettings.link  + 'class/' + notification.class_id)
            .success(function (response) {
              classData.setPickedClass(response.data);
              $location.path(scope.parseLokation(notification));
            })
        };


        scope.role = $rootScope.role;
        scope.dialog = $rootScope.dialog;
      }
    }
  }]);
