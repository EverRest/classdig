angular.module('classDigApp')
  .controller('editProfileModalInstanceCtrl', function ($uibModalInstance, $rootScope,  items, $timeout, $http, appSettings, $log, $scope,Upload, $routeParams, localStorageService, $uibModal) {
    $rootScope.userData = {
      'role': $rootScope.user.data.role,
      "iconPlus": 'images/modal/icon-plus-' + $rootScope.user.data.role + '_3x.png',
      'iconCamera': 'images/modal/icon-camera-' + $rootScope.user.data.role + '_3x.png',
      'background': $rootScope.user.data.role + '-background',
      'color': $rootScope.user.data.role + '-color',
      'border': $rootScope.user.data.role + '-border',
      'iconAddButton': '../images/modal/icon-add-button-' + $rootScope.user.data.role + '_3x.png',
      'arrow' : 'images/distinguished/icon-arrow-' + $rootScope.user.data.role + '_3x.png'
    };

    // $http.get(appSettings.link + 'current-user/' + id)

    if(typeof items === 'object') {
      $scope.selfEdit = true;
    } else {
      $scope.selfEdit = false;
      $http.get(appSettings.link + 'current-user/' + items)
        .success(function (response) {
          $scope.user = angular.copy(response.data.details.data);
          $scope.studentImage = $scope.user.photo;
        })
    }

    var classId = $routeParams.classId;

    if($scope.selfEdit) {
      $scope.user = angular.copy(items);
      $scope.user.email = $rootScope.user.data.email;
    }


    $scope.uploadPic = function (file) {
      file.upload = Upload.upload({
        url: appSettings.link + 'upload',
        data: {file: file}
      });
      file.upload.then(function (response) {
        $scope.user['image_id'] = response.data.data.id;
        window.localStorage.last_update = new Date();
      }, function (error) {

      });
    };

    if(items && $scope.selfEdit) {

      $scope.studentImage = items.photo;
    }

    $scope.uploaded = function (files) {
      $scope.uploadPic(files[0]);
    };

    $scope.setGender = function (gender) {
        $scope.user.gender = gender;
    };


    $scope.cancel = function () {
      $uibModalInstance.dismiss('cancel');

    };


    $scope.ok = function () {
      if($scope.CreateStudentModal.$invalid) {
        return false;
      } else if ($scope.selfEdit){
        $scope.user.phone = +$scope.user.phone;

        $http({
          url: appSettings.link + 'user/'+$rootScope.user.data.id+'/details',
          method: "PUT",
          data: $scope.user,
          headers: {'Content-Type': 'application/json'}
        })
          .then(function (response) {

              $rootScope.user.data.details = response.data;
              $rootScope.$broadcast('updateUserProfile', response.data);
              $uibModalInstance.close();
              $scope.localStorageData =  localStorage.getItem('ls.storage');
              $scope.localStorageData = JSON.parse($scope.localStorageData);
              $scope.localStorageData.data.details = response.data;
              localStorageService.set('storage', $scope.localStorageData);
            },
            function (response) {

            });

      } else if(!$scope.selfEdit) {
        if($scope.user.phone) $scope.user.phone = +$scope.user.phone;
        $http({
          url: appSettings.link + 'user/'+ items +'/details',
          method: "PUT",
          data: $scope.user,
          headers: {'Content-Type': 'application/json'}
        })
          .then(function (response) {

              $rootScope.$broadcast('user-was-updated');
              $uibModal.open({
                templateUrl: 'components/classes/confirmationModal/confirmationModal.html',
                controller: 'confirmationModalController',
                size: 'sm',
                resolve : {
                  items : function () {
                    return 'Student profile was successfully updated.';
                  }
                }
              });
              $uibModalInstance.close();
            },
            function (response) {

            });

      }
    };
  })
;

