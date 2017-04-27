var app = angular.module("classDigApp");
app.controller('groupInviteController', ['$scope',
  '$rootScope',
  '$http',
  '$resource',
  '$location',
  '$uibModal',
  'AuthenticationService',
  'ClassFactory',
  'appSettings',
  '$timeout',
  '$q',
  '_',
  'Upload',
  '$log',
  'Groups',
  '$routeParams',
  function ($scope, $rootScope, $http, $resource, $location, $uibModal, AuthenticationService, ClassFactory, appSettings, $timeout, $q,  _,Upload, $log, Groups, $routeParams) {

    $rootScope.activeGroupItem = 3;

    $rootScope.userData = {
      'role': $rootScope.user.data.role,
      "iconPlus": 'images/modal/icon-plus-' + $rootScope.user.data.role + '.png',
      'iconCamera': 'images/modal/icon-camera-' + $rootScope.user.data.role + '.png',
      'background': $rootScope.user.data.role + '-background',
      'color': $rootScope.user.data.role + '-color',
      'border': $rootScope.user.data.role + '-border',
      'pollBorder':$rootScope.user.data.role + '-poll-border',
      'iconAddButton': 'images/modal/icon-add-button-' + $rootScope.user.data.role + '.png',
      "iconClock": 'images/poll/icon-clock.png',
      "iconExit": 'images/poll/icon-exit.png',
      "iconFlash": 'images/poll/icon-flash.png',
      "iconClockActive": 'images/poll/icon-clock-'+ $rootScope.user.data.role + '.png',
      "iconExitActive": 'images/poll/icon-exit-'+ $rootScope.user.data.role + '.png',
      "iconFlashActive": 'images/poll/icon-flash-'+ $rootScope.user.data.role + '.png',
      "userListBorder": $rootScope.user.data.role + '-userListBorder'
    };

    $scope.role = $rootScope.user.data.role;

    if($rootScope.userData.role =='teacher'){
      $scope.roles = [
        {id: 'student', description: 'Students', url: 'users'},
        {id: 'parent', description: 'Parents', url: 'parents'}
      ];
    }
    else{
      $scope.roles = [
        {id: 'student', description: 'Students', url: 'users'}
      ];
    }

    // console.log($routeParams);

    $q.all([
      $http.get(appSettings.link + 'group/' + $routeParams.groupId),
      $http.get(appSettings.link + 'user/classes')
    ]).then(function (values) {
      $scope.exception = values[0].data.data.participants;
      $scope.sort = values[1].data.data;
      $scope.sortBy = $scope.sort[0].name;
      $scope.classForRequest = $scope.sort[0];
      $scope.selectedRole = 'users';
      $scope.userRole = 'users';
      $rootScope.$broadcast('invite-members-for-groups', $scope.sort[0], $scope.userRole, $scope.exception);
    });

    // Groups.getGroupById($routeParams.groupId, function (obj) {
    //   console.log("---------->", obj);
    // });

    // $http.get(appSettings.link + 'user/classes')
    //   .success(function (response) {
    //     $scope.sort = response.data;
    //     $scope.sortBy = $scope.sort[0].name;
    //     $scope.classForRequest = $scope.sort[0];
    //     $scope.selectedRole = 'users';
    //     $scope.userRole = 'users';
    //     // if($rootScope.user.pickedGroup) {
    //     //   $rootScope.$broadcast('invite-members-for-groups', $scope.sort[0], $scope.userRole, $rootScope.user.pickedGroup.participants);
    //     // }
    //   });

    // $rootScope.$on('group-data-received', function () {
    //   // if($scope.sort){
    //     $rootScope.$broadcast('invite-members-for-groups', $scope.sort[0], $scope.userRole, $rootScope.user.pickedGroup.participants);
    //   // }
    // });

    $scope.changeSortBy = function (pickedClass) {
      $scope.classForRequest = pickedClass;
      $log.log($scope.classForRequest, $scope.userRole, $rootScope.user.pickedGroup.participants);
      $scope.sortBy = pickedClass.name;
      $rootScope.$broadcast('invite-members-for-groups', $scope.classForRequest, $scope.userRole, $rootScope.user.pickedGroup.participants);
    };


    $scope.selectRole = function (role) {
      $log.log($scope.classForRequest, $scope.userRole, $rootScope.user.pickedGroup.participants);
      $scope.selectedRole = role;
      $scope.userRole = role;
      $rootScope.$broadcast('invite-members-for-groups', $scope.classForRequest, $scope.userRole, $rootScope.user.pickedGroup.participants);
    };

    $scope.ok = function () {
      $rootScope.$broadcast('invite-students-to-group', $rootScope.user.pickedGroup.id)
    };



  }]);
