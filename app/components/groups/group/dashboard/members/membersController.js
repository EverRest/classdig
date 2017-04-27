var app = angular.module("classDigApp");
app.controller('groupMembersController', ['$scope',
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

    $rootScope.activeGroupItem = 2;

    var groupId = $routeParams.groupId;
    $scope.role  = $rootScope.user.data.role;

    $scope.userData = {
      'role': $rootScope.user.data.role,
      "iconPlus": 'images/modal/icon-plus-' + $rootScope.user.data.role + '_3x.png',
      'iconCamera': 'images/modal/icon-camera-' + $rootScope.user.data.role + '_3x.png',
      'background': $rootScope.user.data.role + '-background',
      'color': $rootScope.user.data.role + '-color',
      'border': $rootScope.user.data.role + '-border',
      'iconAddButton': '../images/modal/icon-add-button-' + $rootScope.user.data.role + '_3x.png',
      'userListBorder' : $rootScope.user.data.role + '-userListBorder'
    };


    $scope.students = [];
    $scope.selectedStudent = [];

    $rootScope.$on('group-data-received', function () {

      if($rootScope.user.pickedGroup.user_id === $rootScope.user.data.id){
        $scope.admin = true;
      }

      $scope.students = $rootScope.user.pickedGroup.participants;
    });

    $scope.$watch('selectedStudent', function () {
      if($scope.selectedStudent.length){
        $log.log('change')
      }
    });

    $scope.pickStudent = function(student){
      if($scope.selectedStudent.indexOf(student) !== -1){
        $scope.selectedStudent = [];
      } else {
        $scope.selectedStudent = [student];
      }
    };
    $scope.confirmAction = function () {
      var modalInstance = $uibModal.open({
        // animation: $ctrl.animationsEnabled,
        templateUrl: 'components/groups/confirmationModalGroups/confirmationModalGroups.html',
        controller: 'confirmationModalCroupsController',
        size: 'sm',
        resolve : {
          items : function () {
            return $scope.action;
          }
        }
      });
    };


    $scope.accept = function (student) {

      $scope.action = 'accept';
      $scope.confirmAction();

      $http.post(appSettings.link + 'group/accept',  {"user_id": student.id, 'group_id': groupId})
        .success(function (response) {
          $log.log(response);
          student.status = 1;
        })
        .error(function () {
          $log.log("error")
        })
    };
    $scope.rejectRemove = function (student, selfDel) {
      
      $scope.action = 'reject';
      if( !selfDel) {
        $scope.confirmAction();
      }
///
      ///D8SD9UUF50
      ///FD8SD9UUF50
      ///0KQSUPJK40
      ///W3WPUKLV46
      $http({
        method: 'delete',
        url: appSettings.link + 'group/reject',
        headers: {'Content-Type': 'application/json'},
        data : {"user_id": student.id, 'group_id': groupId}
      })
        .success(function () {
          $log.log('rejected good');
          if(selfDel) {
            $location.path('/groups');
          }
          var ind = $scope.students.indexOf(student);
          $scope.students.splice(ind, 1);
        })
        .error(function () {
          $log.log("error")
        })
    };
  }]);
