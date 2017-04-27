angular.module('classDigApp')
  .controller('folderModalInstanceCtrl', function ($uibModalInstance,$scope, $rootScope, $http, appSettings,$routeParams,items,Upload, $timeout,$log,_) {
    var $ctrl = this;
    $scope.ExamServerError = false;
    if (items === undefined) {
      $scope.folder = {};
      $scope.folder.color = "#a7687f";
      $scope.folder.parent_id = $rootScope.parentFolderId;
      $scope.folder.id = $routeParams.classId;
      if($rootScope.user.data.role ==='student'){
        $scope.folder.parent_id = $rootScope.parentFolderStudentId;
      }
      this.modalConstant = {
        header: "Add Folder",
        buttonSubmit: "ADD FOLDER"
      }
    }

    else{
      $scope.folder =angular.copy(items);

      this.modalConstant = {
        header: "Update Folder",
        buttonSubmit: "UPDATE FOLDER"
      };
    }

    $scope.cancel = function () {
      $uibModalInstance.dismiss('cancel');
    };

    $scope.ok = function (valid) {
      if(valid){
        return
      }
      if(items === undefined) {
        $http({
          url: appSettings.link + 'class/'+$routeParams.classId+'/library/folder',
          method: "POST",
          data: $scope.folder
        })
          .then(function (response) {
              $uibModalInstance.close();
              $rootScope.$broadcast('createFile', response.data.data);
            },
            function (response) {
              $scope.ExamServerError = true;
            });
      }
      else{

        $http({
          url: appSettings.link + 'library/folder/' + $scope.folder.id,
          method: "PUT",
          data: $scope.folder
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
