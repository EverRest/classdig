angular.module('classDigApp')
  .controller('moveFilesModalCtrl', function ($uibModalInstance,$scope, $rootScope, $http, appSettings,$routeParams,Upload, $timeout,$log,_, files, folders, studentFolders) {
    console.log(files, folders, studentFolders);

    $scope.iconFolderImage ='images/files-library/icon-folder-' + $rootScope.user.data.role + '.svg';

    $scope.folders = [];
    $scope.moveBackDisabled = false;
    $scope.moveDisabled = true;

    function prepareFolders(folders) {
      folders.forEach(function (obj) {
        if(files.indexOf(obj.id) === -1){
          $scope.folders.push(obj);
        }
      });
    }

    if($rootScope.user.data.role === 'teacher') {
      prepareFolders(folders);
    } else if ($rootScope.user.data.role === 'student') {
      prepareFolders(studentFolders);
    }

    if($rootScope.parentFolderId === 0){
      $scope.moveBackDisabled = true;
    }

    if(!$scope.folders.length) {
      $scope.moveDisabled = true;
    }



    $scope.selectionWasChanged = function (folder) {
      if($scope.selectedFolder === folder.id) {
        $scope.selectedFolder = undefined;
      } else $scope.selectedFolder = folder.id;

      if($scope.selectedFolder) {
        $scope.moveBackDisabled = true;
        $scope.moveDisabled = false;
      } else {
        $scope.moveBackDisabled = false;
        $scope.moveDisabled = true;
      }

      if($rootScope.parentFolderId === 0){
        $scope.moveBackDisabled = true;
      }

      if(!$scope.folders.length) {
        $scope.moveDisabled = true;
      }
    };

    $scope.cancel = function () {
      $uibModalInstance.dismiss('cancel');
    };


    $scope.InsertLibraryEntries = function(data, folderToMoveIn){
      $rootScope.$broadcast('ChangeInsertStateTrue');
      $http({
        method: 'POST',
        url: appSettings.link + 'class/'+$routeParams.classId+'/library/move',
        headers: {'Content-Type': 'application/json'},
        data: {
          "entries_id": data,
          "parent_id":folderToMoveIn,
          "id":+$routeParams.classId
        }
      })
        .success(function (response) {
          if($rootScope.user.data.role ==='teacher') {
            $rootScope.$broadcast('DeleteFileFromTeacherList')
          }
          if($rootScope.user.data.role ==='student'){
            $rootScope.$broadcast('DeleteFileFromStudentList')
          }
          $rootScope.$broadcast('ChangeInsertState');
        })
        .error(function () {

        })
    };

    $scope.ok  = function (bool) {
      if(!bool && $scope.moveBackDisabled) return;
      if(bool && $scope.moveDisabled) return;

      if(bool) $scope.InsertLibraryEntries(files, $scope.selectedFolder);

      if(!bool) {
        if($rootScope.folderChain.length === 1) $scope.InsertLibraryEntries(files, 0);
        if($rootScope.folderChain.length >= 2 && $rootScope.user.data.role === 'teacher') $scope.InsertLibraryEntries(files, $rootScope.folderChain[$rootScope.folderChain.length -2]);
        if($rootScope.folderChain.length >= 2 && $rootScope.user.data.role === 'student') $scope.InsertLibraryEntries(files, $rootScope.studentFolderChain[$rootScope.studentFolderChain.length -2]);
      }

      $uibModalInstance.close();
    }

  });
