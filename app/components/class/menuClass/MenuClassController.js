/**
 * Created by ros on 18.10.16.
 */
var app = angular.module("classDigApp");

app.controller("MenuClassController",
  ['$scope',
    '$http',
    '$routeParams','$rootScope', 'classData', '$timeout', function ($scope, $http, $routeParams, $rootScope, classData, $timeout) {
     $scope.activeItem = $rootScope.activeClassItem;

    var studentId = $routeParams.studentId;
    var role='';
    var roleActive = '-' + $rootScope.user.data.role;
    var id = $routeParams.classId;

      classData.getClassById(id, function (data) {
        $rootScope.user.classData = data;
        $scope.mydata = data;
        // console.log("DATA____", data);
        if($rootScope.role === 'student' && $rootScope.user.classData.owner === $rootScope.user.data.id){
          $scope.menuLinks = [
            {
              "Id": 1,
              "icon": "images/menu_class/students/icon-students",
              "role": role,
              "exte": "_3x.png",
              "title": "Classmates",
              "href": "#/class/" + id + "/user/" + studentId + "/students"
            },
            {
              "Id": 5,
              "icon": "images/menu_class/assignment/icon-assignment",
              "role": role,
              "exte": "_3x.png",
              "title": "Assignments",
              "href": "#/class/" + id + "/user/" + studentId + "/assignment"
            },
            {
              "Id": 6,
              "icon": "images/menu_class/exams/icon-exams",
              "role": role,
              "exte": "_3x.png",
              "title": "Exams",
              "href": "#/class/" + id + "/user/" + studentId + "/exams"
            },
            {
              "Id": 7,
              "icon": "images/menu_class/events/icon-events",
              "role": role,
              "exte": "_3x.png",
              "title": "Events",
              "href": "#/class/" + id + "/user/" + studentId + "/events"
            },
            {
              "Id": 8,
              "icon": "images/menu_class/files/icon-files",
              "role": role,
              "exte": "_3x.png",
              "title": "Files",
              "href": "#/class/" + id + "/user/" + studentId + "/files"
            },
            {
              "Id": 9,
              "icon": "images/menu_class/polls/icon-polls",
              "role": role,
              "exte": "_3x.png",
              "title": "Polls",
              "href": "#/class/" + id + "/user/" + studentId + "/polls"
            }
          ]
        } else {
          $scope.menuLinks = [
            {
              "Id": 1,
              "icon": "images/menu_class/students/icon-students",
              "role": role,
              "exte": "_3x.png",
              "title": "Students",
              "href": "#/class/" + id + "/user/" + studentId + "/students"
            },
            {
              "Id": 2,
              "icon": "images/menu_class/attendance/icon-attendance",
              "role": role,
              "exte": "_3x.png",
              "title": "Attendance",
              "href": "#/class/" + id + "/user/" + studentId + "/attendance"
            },
            {
              "Id": 3,
              "icon": "images/menu_class/behaviour/icon-behaviour",
              "role": role,
              "exte": "_3x.png",
              "title": "Behavior",
              // "href": "#/class/" + id + "/behaviour"
              "href": "#/class/" + id + "/user/" + studentId + "/behaviour"
            },
            {
              "Id": 4,
              "icon": "images/menu_class/grades/icon-grades",
              "role": role,
              "exte": "_3x.png",
              "title": "Grades",
              "href": "#/class/" + id + "/user/" + studentId + "/grades"
            },
            {
              "Id": 5,
              "icon": "images/menu_class/assignment/icon-assignment",
              "role": role,
              "exte": "_3x.png",
              "title": "Assignments",
              "href": "#/class/" + id + "/user/" + studentId + "/assignment"
            },
            {
              "Id": 6,
              "icon": "images/menu_class/exams/icon-exams",
              "role": role,
              "exte": "_3x.png",
              "title": "Exams",
              "href": "#/class/" + id + "/user/" + studentId + "/exams"
            },
            {
              "Id": 7,
              "icon": "images/menu_class/events/icon-events",
              "role": role,
              "exte": "_3x.png",
              "title": "Events",
              "href": "#/class/" + id + "/user/" + studentId + "/events"
            },
            {
              "Id": 8,
              "icon": "images/menu_class/files/icon-files",
              "role": role,
              "exte": "_3x.png",
              "title": "Files",
              "href": "#/class/" + id + "/user/" + studentId + "/files"
            },
            {
              "Id": 9,
              "icon": "images/menu_class/polls/icon-polls",
              "role": role,
              "exte": "_3x.png",
              "title": "Polls",
              "href": "#/class/" + id + "/user/" + studentId + "/polls"
            },
            {
              "Id": 10,
              "icon": "images/menu_class/reports/icon-reports",
              "role": role,
              "exte": "_3x.png",
              "title": "Reports",
              "href": "#/class/" + id + "/user/" + studentId + "/reports"
            },
            {
              "Id": 11,
              "icon": "images/menu_class/announcments/icon-announcments",
              "role": role,
              "exte": "_3x.png",
              "title": "Announcments",
              "href": "#/class/" + id + "/user/" + studentId + "/announcments"
            },
            {
              "Id": 12,
              "icon": "images/menu_class/distinguished/icon-distinguished",
              "role": role,
              "exte": "_3x.png",
              "title": "Distinguished",
              "href": "#/class/" + id + "/user/" + studentId + "/distinguished"
            },
            {
              "Id": 13,
              "icon": "images/menu_class/parents/icon-parents",
              "role": role,
              "exte": "_3x.png",
              "title": "Parents",
              "href": "#/class/" + id + "/user/" + studentId + "/parents"
            }

          ];
        }
        for(var i = 0; i < $scope.menuLinks.length; i++){
          if ($scope.menuLinks[i].Id === $scope.activeItem) {
            $scope.menuLinks[i].role = roleActive;
          }
        }
        $rootScope.$broadcast('class-data-was-received', $rootScope.user.classData);
      });
  }]);
