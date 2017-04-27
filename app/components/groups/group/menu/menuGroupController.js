var app = angular.module("classDigApp");
app.controller("MenuGroupController",
  ['$scope',
    '$http',
    '$routeParams','$rootScope', 'classData', '$timeout', 'Groups', '$log', function ($scope, $http, $routeParams, $rootScope, classData, $timeout, Groups, $log) {

    $scope.activeItem = $rootScope.activeGroupItem;

    var studentId = $routeParams.studentId;
    var groupId = $routeParams.groupId;

    var role= '';
    var roleActive = '-' + $rootScope.user.data.role;


    Groups.getGroupById(groupId, function (group) {
      $rootScope.user.pickedGroup = group;
      $scope.mydata = {
        image : group.image.link,
        name : group.name
      };
      if(group.user_id === +studentId){
        $scope.menuLinks = [
          {
            "Id": 1,
            "icon": "images/menu_class/students/icon-students",
            "role": role,
            "exte": "_3x.png",
            "title": "Discussions",
            "href": "#/group/" + groupId + "/user/" + studentId + "/discussions"
          },
          {
            "Id": 2,
            "icon": "images/menu_class/assignment/icon-assignment",
            "role": role,
            "exte": "_3x.png",
            "title": "Members",
            "href": "#/group/" + groupId + "/user/" + studentId + "/members"
          },
          {
            "Id": 3,
            "icon": "images/menu_class/exams/icon-exams",
            "role": role,
            "exte": "_3x.png",
            "title": "Invite member",
            "href": "#/group/" + groupId + "/user/" + studentId + "/invite"
          }
        ];
        for(var i = 0; i < $scope.menuLinks.length; i++){
          if ($scope.menuLinks[i].Id === $scope.activeItem) {
            $scope.menuLinks[i].role = roleActive;
          }
        }
      } else {
        $scope.menuLinks = [
          {
            "Id": 1,
            "icon": "images/menu_class/students/icon-students",
            "role": role,
            "exte": "_3x.png",
            "title": "Discussions",
            "href": "#/group/" + groupId + "/user/" + studentId + "/discussions"
          },
          {
            "Id": 2,
            "icon": "images/menu_class/assignment/icon-assignment",
            "role": role,
            "exte": "_3x.png",
            "title": "Members",
            "href": "#/group/" + groupId + "/user/" + studentId + "/members"
          }
        ];
        for(var i = 0; i < $scope.menuLinks.length; i++){
          if ($scope.menuLinks[i].Id === $scope.activeItem) {
            $scope.menuLinks[i].role = roleActive;
          }
        }
      }
      $rootScope.$broadcast('group-data-received', group);
    });
  }]);
