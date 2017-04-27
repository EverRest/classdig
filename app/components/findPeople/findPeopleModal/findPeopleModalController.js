angular.module('classDigApp')
  .controller('findPeopleModalInstanceCtrl', function ($uibModalInstance, $rootScope,  items, $timeout, $http, appSettings, $log, $scope,Upload, $routeParams,localStorageService) {

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

    $scope.$watchGroup(['search.username','search.city','search.country','search.school'],function () {
      $scope.SearchNotValid=false;
    });

    $scope.search={};

    $scope.cancel = function () {
      $uibModalInstance.dismiss('cancel');
    };
    $scope.ok = function () {
     if( !$scope.search.username && !$scope.search.country && !$scope.search.city && !$scope.search.school ) {
       $scope.SearchNotValid = true;
       return false;
     } else {
        $http({
          url: appSettings.link + 'detailed-search',
          method: "POST",
          data: $scope.search,
          headers: {'Content-Type': 'application/json'}
        })
          .then(function (response) {
            $rootScope.$broadcast('detailedSearch',response.data.data);
              $uibModalInstance.close();
            },
            function (response) {
            });

     }
    };
  });

