angular.module('classDigApp')
  .controller('fileModalInstanceCtrl', function ($uibModalInstance,$scope, $rootScope, $http, appSettings,$routeParams,items,Upload, $timeout,$log,_) {
    var $ctrl = this;
    $scope.ExamServerError = false;
    $scope.showAddFile = true;
    if (items === undefined) {
      $scope.file = {};
      $scope.file.color = "#a7687f";
      $scope.file.parent_id = $rootScope.parentFolderId;
      $scope.file.id = $routeParams.classId;
      if($rootScope.user.data.role ==='student'){
        $scope.file.parent_id = $rootScope.parentFolderStudentId;
      }
      this.modalConstant = {
        header: "Create file",
        buttonSubmit: "CREATE FILE"
      }
    }

    else{
      $scope.showAddFile = false;
      $scope.file =angular.copy(items);
      this.modalConstant = {
        header: "Update File",
        buttonSubmit: "UPDATE FILE"
      };
    }
    $scope.ArrayOfUploadFiles=[];
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
       // $scope.file.file_entry_id=newUploadItem.id;
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
     // $scope.exam.attachments = _.filter($scope.exam.attachments, function(num){ return num != deleteFileId; });
      $scope.ArrayOfUploadFiles = _.filter($scope.ArrayOfUploadFiles,function(obj) { return obj.id != deleteFileId; });
      $(e.target).parent().remove();

    };

    $scope.$watch('UploadFile', function () {
      if ($scope.UploadFile) {
        $scope.uploadFile($scope.UploadFile);
       // $scope.UploadFileHeight += 10;
      }
    });

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

    $scope.ok = function (valid) {
      if(valid){
        return
      }

      if(items === undefined) {
        if($scope.ArrayOfUploadFiles[0] && $scope.file.reference){
          $scope.ExamServerError = true;
          return
        }
        if($scope.ArrayOfUploadFiles[0]){
          $scope.file.file_entry_id = $scope.ArrayOfUploadFiles[0].id;
        }
        else{

        }

        $http({
          url: appSettings.link + 'class/'+$routeParams.classId+'/library/file',
          method: "POST",
          data: $scope.file
        })
          .then(function (response) {
              $rootScope.$broadcast('createFile', response.data.data);
              $uibModalInstance.close();
            },
            function (response) {
              $scope.ExamServerError = true;
            });
      }

      else{

        $http({
          url: appSettings.link + 'library/file/' + $scope.file.id,
          method: "PUT",
          data: $scope.file
        })
          .then(function (response) {
              if($rootScope.user.data.role ==='teacher'){
                $rootScope.$broadcast('DeleteFileFromTeacherList');
              }
              if($rootScope.user.data.role ==='student'){
                $rootScope.$broadcast('DeleteFileFromStudentList');
              }
              $uibModalInstance.close();
            },
            function (response) {
              $scope.ExamServerError = true;
            });
      }
    };
  });
