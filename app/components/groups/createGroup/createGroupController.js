angular.module('classDigApp')
  .controller('createStudentModalInstance', function ($uibModalInstance, $rootScope, items, $timeout, $http, appSettings, $log, $scope, Upload, $routeParams) {

    $scope.newGroup  = {};
    $scope.haveImg = true;

    $uibModalInstance.opened.then(function() {
      if(items){
        $scope.editing = true;
        $scope.haveImg = true;

        $scope.picFile = items.image.link;
        $scope.newGroup.name  = items.name;
        $scope.newGroup.code = items.code;
        $scope.newGroup.image_id  = items.image.id;
        $scope.newGroup.participants = [];

        items.participants.forEach(function (obj) {
          $scope.newGroup.participants.push(obj.id);
        });

      } else {
        $http.get(appSettings.link + 'group/code')
          .success(function (response) {
            $scope.newGroup.code = response.code;
          })
          .error(function (data) {
            $log.log("Code: " + data.status_code + "; Message: " + data.message);
          });
      }
      $rootScope.$broadcast('action-was-not-approved');
    });


    $scope.$watch('picFile', function () {
      if($scope.haveImg)  {
        $scope.haveImg = false;
        return
      }
      if ($scope.picFile) {
        $scope.uploadPic($scope.picFile);
      }
    });
    $scope.uploadPic = function (file) {
        file.upload = Upload.upload({
          url: appSettings.link + 'upload',
          data: {file: file}
        });
        file.upload.then(function (response) {
          file.result = response.data;
          $scope.uploadPictureId = response.data.data.id;
          $scope.newGroup.image_id = $scope.uploadPictureId;
        }, function (response) {
          if (response.status > 0)
            $scope.errorMsg = response.status + ': ' + response.data;
        }, function (evt) {
          file.progress = Math.min(100, parseInt(100.0 * evt.loaded / evt.total));
          $scope.progressNumber = file.progress;
        });
    };

    $scope.addNewGroup = function () {
      $http.post(appSettings.link + 'groups', $scope.newGroup)
        .success(function (response) {
          $rootScope.$broadcast('groups-have-to-be-reloaded-added', response.data)
        })
        .error(function (data) {
          //$log.log("Code: " + data.status_code + "; Message: " + data.message);
        });
    };

    $scope.updateGroup = function () {
      $http.put(appSettings.link + 'groups/' + items.id, $scope.newGroup)
        .success(function (response) {
          $log.log(response);
          $rootScope.$broadcast('groups-have-to-be-reloaded-updated', response.data);
        })
        .error(function (data) {
          $log.log("Code: " + data.status_code + "; Message: " + data.message);
        });
    };

    $scope.cancel = function () {
      $uibModalInstance.dismiss('cancel');
      $log.log($scope.newGroup)
    };

    $scope.ok = function () {
      $log.log($scope.newGroup);
      if($scope.CreateGroupModal.$invalid) {
        return false;
      } else {
        $log.log('valid', $scope.newGroup);
        if(items) {
          $scope.updateGroup();
        } else {
          $scope.addNewGroup();
        }
        $uibModalInstance.close()
      }
    };
  })
;

