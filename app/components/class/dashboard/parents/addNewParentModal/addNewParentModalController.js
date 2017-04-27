angular.module('classDigApp')
  .controller('addNewParentModalInstanceCtrl', function ($uibModalInstance, $rootScope, items, $timeout, $http, appSettings, $log, $scope, Upload, $routeParams) {

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

    var classId = $routeParams.classId;

    $scope.newParent = {};
    $scope.newParent.gender = 1;
    $scope.createParentClicked = false;

    $scope.uploadPic = function (file) {
      file.upload = Upload.upload({
        url: appSettings.link + 'upload',
        data: {file: file}
      });
      file.upload.then(function (response) {
        $scope.newParent['image_id'] = response.data.data.id;
      }, function (error) {

      });
    };

    $scope.uploaded = function (files) {
      $scope.uploadPic(files[0]);
    };

    $scope.setGender = function (gender) {
        $scope.newParent.gender = gender;
    };

    $scope.addNewParent = function () {
      console.log([ $scope.newParent ]);
      $rootScope.$broadcast('parent-added-to-class');
      $uibModalInstance.close();

      // $http.post(appSettings.link + 'class/'+ classId +'/add/new/user', {'users' : [ $scope.newParent ]})
      //   .success(function (response) {
      //
      //   })
      //   .error(function () {
      //
      //   })
    };


    $scope.cancel = function () {
      $uibModalInstance.dismiss('cancel');

    };
    $scope.ok = function () {
      if($scope.CreateParentModal.$invalid) {
        return false;
      } else {
        $scope.addNewParent();
      }
    };
  })
;


