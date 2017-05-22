'use strict';

/**
 * @ngdoc overview
 * @name classApp
 * @description
 * # classApp
 *
 * Main module of the application.
 */


// declare modules
angular.module('Authentication', []);
angular.module('Dashboard', []);

var app = angular.module('classDigApp', [
    'Authentication',
    'Dashboard',
    'classDigServices',
    'ngAnimate',
    'ngAria',
    'ngCookies',
    'ngMessages',
    'ngResource',
    'ngRoute',
    'ngSanitize',
    'ngTouch',
    'ngFileUpload',
    'LocalStorageModule',
    'ui.bootstrap',
    'ui.calendar',
    'ui.bootstrap.datetimepicker',
    'infinite-scroll',
    'ui.slimscroll',
    // 'classDigServices',
    'chart.js',
    'slickCarousel',
    'nvd3',
    'rzModule',
    'socialLogin',
    'youtube-embed'
]);
app.constant('_',
    window._
);
app.constant('io',
    window.io
);
app.constant('moment',
    window.moment
);

app.constant('uiDatetimePickerConfig', {
    closeOnDateSelection: true,
    closeOnTimeNow: true,
    enableDate: true
});


app.config(function ($logProvider) {
    $logProvider.debugEnabled(false);
});

app.config(function ($routeProvider) {
    $routeProvider
        .when('/', {
            // controller: 'HomeController',
            // controllerAs: 'main',
            redirectTo: '/classes'
            // templateUrl: 'components/classes/classes.html',
            // auth: true

        })
        .when('/login', {
            controller: 'LoginController',
            hideMenus: true,
            templateUrl: 'components/authentication/login/login.html'
        })
        .when('/signup', {
            controller: 'RegistrationController',
            templateUrl: 'components/authentication/registration/registration.html'
        })
        .when('/auth/change/:token', {
            templateUrl: 'components/authentication/change-password/change-password.html',
            controller: 'ChangePasswordCtrl'
        })
        .when('/auth/forgot', {
            templateUrl: 'components/authentication/forgot-password/forgot-password.html',
            controller: 'ForgotPasswordCtrl'
        })
        .when('/classes', {
            url: '/classes',
            templateUrl: 'components/classes/classes.html',
            activeTab: 'class',
            auth: true
        })
        .when('/class', {
            url: '/class',
            templateUrl: 'components/class/class.html',
            // controller: 'ClassesController'
            activeTab: 'class',
            auth: true
        })

        .when('/class/:classId/students', {
            url: '/class/:classId/students',
            templateUrl: 'components/class/dashboard/students/students.html',
            controller: 'studentsController',
            activeTab: 'class',
            auth: true
        })
        .when('/class/:classId/user/:studentId/students', {
            url: '/class/:classId/user/:studentId/students',
            templateUrl: 'components/class/dashboard/students/students.html',
            controller: 'studentsController',
            activeTab: 'class',
            auth: true
        })
        .when('/class/:classId/user/:studentId/attendance', {
            url: '/class/attendance',
            templateUrl: 'components/class/dashboard/attendance/attendance.html',
            controller: 'attendanceController',
            activeTab: 'class',
            auth: true
        })
        .when('/class/:classId/user/:studentId/behaviour', {
            // .when('/class/:classId/behaviour/', {
            url: '/class/behaviour',
            templateUrl: 'components/class/dashboard/behaviour/behaviour.html',
            controller: 'behaviourController',
            auth: true,
            activeTab: 'class'
        })

        .when('/class/:classId/user/:studentId/polls', {
            url: '/class/polls',
            templateUrl: 'components/class/dashboard/polls/polls.html',
            controller: 'pollsController',
            activeTab: 'class',
            auth: true
        })

        .when('/class/:classId/user/:studentId/grades', {
            url: '/class/grades',
            templateUrl: 'components/class/dashboard/grades/grades.html',
            controller: 'gradesController',
            activeTab: 'class',
            auth: true
        })
        .when('/class/:classId/user/:studentId/assignment', {
            url: '/class/assignment',
            templateUrl: 'components/class/dashboard/assignment/assignment.html',
            controller: 'assignmentController',
            activeTab: 'class',
            auth: true
        })
        .when('/class/:classId/user/:studentId/exams', {
            url: '/class/exams',
            templateUrl: 'components/class/dashboard/exams/exams.html',
            controller: 'examsController',
            activeTab: 'class',
            auth: true
        })
        .when('/class/:classId/user/:studentId/events', {
            url: '/class/events',
            templateUrl: 'components/class/dashboard/events/events.html',
            controller: 'eventsController',
            activeTab: 'class',
            auth: true
        })
        .when('/class/:classId/user/:studentId/files', {
            url: '/class/files',
            templateUrl: 'components/class/dashboard/files/files.html',
            controller: 'filesController',
            activeTab: 'class',
            auth: true
        })
        .when('/class/:classId/user/:studentId/reports', {
            url: '/class/reports',
            templateUrl: 'components/class/dashboard/reports/reports.html',
            activeTab: 'class',
            controller: 'reportsController',
            auth: true
        })
        .when('/class/:classId/user/:studentId/announcments', {
            url: '/class/announcments',
            templateUrl: 'components/class/dashboard/announcments/announcments.html',
            controller: 'announcmentsController',
            activeTab: 'class',
            auth: true
        })
        .when('/class/:classId/user/:studentId/distinguished', {
            url: '/class/distinguished',
            templateUrl: 'components/class/dashboard/distinguished/distinguished.html',
            controller: 'distinguishedController',
            activeTab: 'class',
            auth: true
        })
        .when('/class/:classId/user/:studentId/parents', {
            url: '/class/parents',
            templateUrl: 'components/class/dashboard/parents/parents.html',
            controller: 'parentsController',
            activeTab: 'class',
            auth: true

        })
        .when('/feed', {
            url: '/feed',
            templateUrl: 'components/feed/feed.html',
            controller: 'FeedController',
            activeTab: 'feed',
            auth: true
        })
        .when('/message', {
            templateUrl: 'components/message/message.html',
            controller: 'MessageCtrl',
            reloadOnSearch: false,
            activeTab: 'messages',
            auth: true
        })
        .when('/main', {
            templateUrl: 'views/main.html'
        })
        .when('/premium', {
          url: '/premium',
          templateUrl: 'components/premium/premium.html',
          controller: 'PremiumController',
          activeTab: 'premium',
          auth: true
        })

        .when('/profile', {
          url: '/profile',
          templateUrl: 'components/profile/profile.html',
          controller: 'ProfileController',
          activeTab: 'profile',
          auth: true
        })

        .when('/findPeople', {
          url: '/findPeople',
          templateUrl: 'components/findPeople/findPeople.html',
          controller: 'findPeopleController',
          activeTab: 'findPeople',
          auth: true
        })

        .when('/notifications', {
          url: '/notifications',
          templateUrl: 'components/notifications/notifications.html',
          controller: 'notificationsController',
          activeTab: 'notifications',
          // activeTab: 'findPeople',
          auth: true
        })

        .when('/settings', {
          url: '/settings',
          templateUrl: 'components/settings/settings.html',
          controller: 'settingsController',
          activeTab: '',
          auth: true
        })

        .when('/groups', {
          url: '/groups',
          templateUrl: 'components/groups/groups.html',
          controller: 'groupsController',
          activeTab: 'groups',
          auth: true
        })
        .when('/group/:groupId/user/:studentId/members', {
          url: '/group/members',
          templateUrl: 'components/groups/group/dashboard/members/members.html',
          controller: 'groupMembersController',
          activeTab: 'groups',
          auth: true
        })
        .when('/group/:groupId/user/:studentId/discussions', {
          url: '/group/discussions',
          templateUrl: 'components/groups/group/dashboard/discussions/discussions.html',
          controller: 'groupDiscussionsController',
          activeTab: 'groups',
          auth: true
        })
        .when('/group/:groupId/user/:studentId/invite', {
          url: '/group/invite',
          templateUrl: 'components/groups/group/dashboard/invite/invite.html',
          controller: 'groupInviteController',
          activeTab: 'groups',
          auth: true
        })
        .otherwise({
            redirectTo: '/login'
        });
});

// ====================== login ========================
app.run(['$rootScope', '$location', 'AuthenticationService', 'DialogMessages', 'socket', '$log', 'Chat', 'groupDiscussions', '$interval', '$http', 'appSettings', 'localStorageService',
  function ($rootScope, $location, AuthenticationService, DialogMessages, socket, $log, Chat, groupDiscussions, $interval, $http, appSettings, localStorageService) {

    $interval(function() {
      $http.get(appSettings.link + "notifications?status=0")
        .success(function (response) {
          $rootScope.newNotifications = response.data;
          // console.log("response", $rootScope.newNotifications);
        });
    }, 5000);

        function splitJoin(mess) {
          var array = mess.content.split("\n");
          for(var i = array.length - 1; i >= 0; i--) {
            if(array[i] === "") {
              array.splice(i, 1);
            }
          }
          return array.join("<br>");
        }

        socket.io.on('connect', function (data) {
            console.log('connected to socket.io');
            if ($rootScope.user)
                socket.init($rootScope.user.data.id, true);
        }).on('chat-message', function (data) {
                // console.log("------>", data);
            // if (data.sender.id != $rootScope.user.data.id) {
                $log.info('From server', data);

                data.contentR = splitJoin(data);


                if(data.type){

                  if(data.type === 1 && $rootScope.dialog) {
                    $rootScope.dialog.updateItem(data);
                  } else if(data.type === 2 && $rootScope.groupDiscussions) {
                    $rootScope.groupDiscussions.updateItem(data);
                  }

                }
                $rootScope.$apply();
            // }
        });
        function reloadScope() {
            $rootScope.user = AuthenticationService.getUserData();
            if($rootScope.user ) {
              $http.get(appSettings.link + 'current-user/'+ $rootScope.user.data.id)
                .then(function (response) {
                    $rootScope.user.data.details = response.data.data.details;
                    if(!response.data.data.settings) {
                      response.data.data.settings = {
                        'data' : {
                          'notifications' : true,
                          'protected_follow' : false
                        }
                      };
                      $http.put(appSettings.link + '/user-settings', {"protected_follow": false, "notifications" : true});
                    }
                    $rootScope.user.data.settings = response.data.data.settings.data;
                    $rootScope.notificationsEnabled = $rootScope.user.data.settings.notifications;
                    $rootScope.protectedEnable = $rootScope.user.data.settings.protected_follow;

                    var localStorageData =  localStorage.getItem('ls.storage');
                    localStorageData = JSON.parse(localStorageData);
                    localStorageData.data.details = response.data.data.details;
                    localStorageService.set('storage', localStorageData);
                  },
                  function (response) {
                    console.log('fail');
                  });
            }



            if ($rootScope.user) {
                socket.init($rootScope.user.data.id);
                if (angular.isUndefined($rootScope.dialog)) {
                    $rootScope.dialog = new DialogMessages();
                }
                if ($rootScope.dialog.items === null) {
                    $rootScope.dialog.nextPage(true);
                }
            }
        }

        $rootScope.$on('$routeChangeStart', function (event, next, current) {
            reloadScope();
            if (next.$$route) {
                if (next.$$route.activeTab) {
                    $rootScope.activeTab = next.$$route.activeTab;
                }
                if (next.$$route.auth ) {
                    $log.log('routeChange');

                  if($rootScope.dialog) $rootScope['dialog']['activeRoom'] = -1;

                    if (!$rootScope.user || $rootScope.user === null)
                    {
                        $location.path('/login');
                    }
                }
            }
        });


        $rootScope.$on('$locationChangeStart', function (event, next, current) {
            reloadScope();
        });

    }]);


app.controller('HomeCtrl', function () {
    var ctrl = this;

});
// =================== end. translate ====================

app.value('appSettings', {
    link: 'http://api.classdig.oyihost.com/'
    //link: 'http://api.classdig.loc/'
    //link: 'http://api.classdig.com/'
});

app.factory('socket', function (appSettings) {
     var socket = io('http://api.classdig.loc:3001');
    //var socket = io('http://api.classdig.com:3001');
    // var socket = io('http://classdig.oyihost.com:3001');
    // console.log("socket is running");
    return {
        io: socket,
        socketUsers: {},
        init: function (user, bool) {
            if (!this.socketUsers[user] || bool) {
                this.io.send({
                    event: 'init',
                    user: user
                });
                this.socketUsers[user] = user;
            }
        }
    };
});












