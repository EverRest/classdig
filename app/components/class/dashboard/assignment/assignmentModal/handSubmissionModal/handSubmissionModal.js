angular.module('classDigApp')
  .controller('handSubmissionModalInstanceCtrl', function ($uibModalInstance,$scope, $rootScope, $http, appSettings,$routeParams,items,Upload, $timeout,$log,_) {
    var $ctrl = this;
    $scope.AssignmentServerError = false;

    $scope.assignment = items;
    $scope.notSubmittedStudent = $scope.assignment.participants;
    $scope.notSubmittedStudent = $scope.notSubmittedStudent.filter(filterSubmission);

    $scope.SubmittedStudent = $scope.assignment.participants;
    $scope.SubmittedStudent = $scope.SubmittedStudent.filter(filterSubmissionOk);

   // $rootScope.$broadcast('arrayOfSelectedUsers',$scope.assignment);

    $scope.checkHandSubmission = true;

    function filterSubmission(obj) {
      return obj.submission === 0
    }

    function filterSubmissionOk(obj) {
      return obj.submission === 1
    }

    $scope.cancel = function () {

      $uibModalInstance.dismiss('cancel');

    };

    $scope.ok = function () {
      var userIdKey = Object.keys($scope.selectedUsers);
      function filterSubmittedStudent(obj) {
        for (var i =0; i<userIdKey.length; i++){
          if (obj.id == userIdKey[i]){
            obj.submission = 1;
           // return true
          }

        }
        return true
      }


      $scope.newSubmittedStudent = $scope.assignment.participants;
      $scope.newSubmittedStudent = $scope.newSubmittedStudent.filter(filterSubmittedStudent);
      var allStudentList = [];
      var ollStudentsListId = [];
      allStudentList = $scope.newSubmittedStudent;
      for(var j =0; j<userIdKey.length; j++){
        var markStudent = {};
        markStudent.user_ids =[];
        markStudent.user_ids.push(userIdKey[j]);
        markStudent.file_ids = [];
        markStudent.note = 'hand submission';

        $http({
          url: appSettings.link + 'assignment/'+$scope.assignment.id + '/user',
          method: "PATCH",
          data: markStudent
        })
          .then(function (response) {


            },
            function (response) {
              $scope.AssignmentServerError = true;
            });
      }

      $uibModalInstance.close();
    };
  });
