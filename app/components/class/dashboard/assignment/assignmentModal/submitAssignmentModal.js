angular.module('classDigApp')
  .controller('submitAssignmentModalInstanceCtrl', function ($uibModalInstance,$scope, $rootScope, $http, appSettings,$routeParams,items,Upload, $timeout,$log,_, assignmentId, index,assign) {
    var $ctrl = this;
    $scope.AssignmentServerError = false;

    if (items === undefined) {
      $scope.assignmentSubmit = {};
      $scope.assignmentSubmit.user_ids=[];
      $scope.assignmentSubmit.user_ids[0]= $rootScope.user.data.id;
      $scope.assignmentSubmit.file_ids = [];
      $scope.ArrayOfUploadFiles=[];
      this.modalConstant = {
        header: "Submit assignment"
      };
    }
    else{
      $scope.assignmentSubmit =angular.copy(items);



      $scope.ArrayOfUploadFiles = $scope.assignmentSubmit.file_ids.map(function(obj){
        var newUploadItem = {};
        newUploadItem.name = obj.filename;
        newUploadItem.id = obj.id;
        return newUploadItem;
      });

      $scope.hand_submission = !!($scope.assignment.hand_submission);
      $scope.assignment.attachments = _.pluck($scope.assignment.attachments, 'id');
      setTimeout(function(){$scope.functionCheckPriority($scope.assignment.priority)}, 300);

      this.modalConstant = {
        header: "Update assignment"
      };
    }


    for(var k=0; k< assign.participants.length; k++){
      if(assign.participants[k].id===$rootScope.user.data.id && assign.participants[k].files.length>0){
        var object = assign.participants[k].files[assign.participants[k].files.length-1];
        $scope.ArrayOfUploadFiles =[];
        var newUploadItem = {};
        newUploadItem.name = object.filename;
        newUploadItem.id = object.id;

        $scope.ArrayOfUploadFiles.push(newUploadItem );
        $scope.assignmentSubmit.file_ids.push(object.id);
        $scope.assignmentSubmit.note = assign.participants[k].user_note;
        this.modalConstant = {
          header: "Update assignment"
        };

      }

    }

    $scope.UploadFileHeight = -20;
    $scope.$watch('UploadFile', function () {
      if ($scope.UploadFile) {
        $scope.uploadFile($scope.UploadFile);
        $scope.UploadFileHeight += 10;
      }
    });

////////// FUNCTION UPLOAD FILE TO SERVER //////////////////
    $scope.uploadFile = function (file) {
      file.upload = Upload.upload({
        url: appSettings.link + 'upload',
        data: {file: file}
      });

      file.upload.then(function (response) {
        file.result = response.data;
        var newUploadItem = {};
        newUploadItem.id = response.data.data.id;
        newUploadItem.name = file.name;
        $scope.ArrayOfUploadFiles[0]=newUploadItem;
        $scope.assignmentSubmit.file_ids[0]=newUploadItem.id;
      }, function (response) {
        if (response.status > 0) {
          $scope.errorMsg = response.status + ': ' + response.data;
          $scope.ExamServerError = true;
          setTimeout(function(){ $scope.ExamServerError = false; }, 5000);
        }
      }, function (evt) {
        file.progress = Math.min(100, parseInt(100.0 * evt.loaded / evt.total));
        $scope.progressNumber = file.progress;
      });
    };
    $scope.arrayOfFilesToDelete = [];
////////// FUNCTION DELETE FILE FROM SERVER AND LIST OF UPLOAD FILES//////////////////
    $scope.DeleteFileFromSyllabus = function (e) {
      var deleteFileId = $(e.target).parent().attr('id');
      $scope.arrayOfFilesToDelete.push(+deleteFileId);
      $scope.exam.attachments = _.filter($scope.exam.attachments, function(num){ return num != deleteFileId; });
      $scope.ArrayOfUploadFiles = _.filter($scope.ArrayOfUploadFiles,function(obj) { return obj.id != deleteFileId; });
      $(e.target).parent().remove();

    };

    function deleteAttachments(array){
      for(var i=0;i<array.length;i++){
        $http({
          url: appSettings.link + 'upload/' + array[i],
          method: "DELETE"
        }).then(function (response) {
          },
          function (response) {
            $scope.ExamServerError = true;
          });
      }
    }

    $scope.cancel = function () {
      $uibModalInstance.dismiss('cancel');
    };

    $scope.ok = function () {
      if($scope.assignmentSubmit.file_ids.length===0){
        $scope.AssignmentServerError = true;
        return

      }
      if(items === undefined) {
        $http({
          url: appSettings.link + 'assignment/'+assignmentId + '/user',
          method: "PATCH",
          data: $scope.assignmentSubmit
        })
          .then(function (response) {
              $uibModalInstance.close();
              $rootScope.$broadcast('submitAssignmentByStudent', assignmentId, index);
            },
            function (response) {
              $scope.AssignmentServerError = true;
            });
      }

    };
  });
