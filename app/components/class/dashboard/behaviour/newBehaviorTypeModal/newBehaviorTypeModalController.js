angular.module('classDigApp')
  .controller('newBehaviorTypeModal', function ($uibModalInstance, $rootScope, items, $timeout, $http, appSettings, $log, $scope, Upload, $routeParams) {


    $rootScope.userData = {
      'role': $rootScope.user.data.role,
      "iconPlus": 'images/modal/icon-plus-' + $rootScope.user.data.role + '_3x.png',
      'iconCamera': 'images/modal/icon-camera-' + $rootScope.user.data.role + '_3x.png',
      'background': $rootScope.user.data.role + '-background',
      'color': $rootScope.user.data.role + '-color',
      'border': $rootScope.user.data.role + '-border',
      'iconAddButton': 'images/modal/icon-add-button-' + $rootScope.user.data.role + '_3x.png'
    };

    $scope.newBehaviorType = angular.copy(items);

    console.log(items);

    // $scope.loadImg = function (imgSrc) {
    //   var img = new File();
    //   img.src = imgSrc;
    //   // console.log("--->", e.target);
    //   $scope.uploadPic(img)
    // };

    $scope.images = [];
    for(var i = 1; i <= 9; i++){
      if( items.type === 1 ) {
        var img = 'images/behavior/good_behaviour_' + i + '@2x.png'
      } else {
        img = 'images/behavior/bad_behaviour_' + i + '@2x.png'
      }
      $scope.images.push({
        'img' : img,
        'id' : 4455 + i,
        'type' : items.type,
        'active' : false
      });
    }

    $scope.selectIcon = function (e, imgObj) {
      $scope.images.forEach(function (obj) {
        obj.active = false
      });
      imgObj.active = true;
      imgObj.type === 1 ? $scope.newBehaviorType.name = 'Positive' : $scope.newBehaviorType.name = 'Need work';
      $scope.newBehaviorType.id = imgObj.id;
    };


    // $scope.justEntered = true;
    // if(items) $scope.picFile = $scope.newBehaviorType.image;
    if(items.image) $scope.editing = true;
    delete $scope.newBehaviorType.image;



    $scope.cancel = function () {
      $uibModalInstance.dismiss('cancel');
    };

    $scope.ok = function () {
      $log.log('new', $scope.newBehaviorType);

      if($scope.CreateBehaviorModal.$invalid) {
        return false;
      } else if(!items.image){
        $log.log('valid', $scope.newBehaviorType);
        $http.post(appSettings.link + '/behavior', $scope.newBehaviorType)
        .success(function () {
          $rootScope.$broadcast('new-category-created', $scope.newBehaviorType);
          $uibModalInstance.close();
        });
      } else {
        $http.put(appSettings.link + '/behavior/' + $scope.newBehaviorType.id, $scope.newBehaviorType)
          .success(function () {
            $rootScope.$broadcast('new-category-created', $scope.newBehaviorType);
            $uibModalInstance.close();
          });
      }
    };

  });


