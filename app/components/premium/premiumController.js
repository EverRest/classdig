app.controller('PremiumController', ['$scope',
  '$rootScope',
  '$http',
  '$resource',
  '$location',
  '$uibModal',
  'AuthenticationService',
  'ClassFactory',
  'appSettings',
  'classData',
  '$timeout',
  'DeletedClasses',
  'CurrentClasses',
  '$q',
  '_',
  'Upload',
  'Feed',
  function ($scope, $rootScope, $http, $resource, $location, $uibModal, AuthenticationService, ClassFactory, appSettings, classData, $timeout, DeletedClasses, CurrentClasses, $q,  _,Upload, Feed) {
    var $ctrl = this;
    var role =$rootScope.user.data.role;
    $rootScope.userData = {
      'role': $rootScope.user.data.role,
      'background': $rootScope.user.data.role + '-background',
      'color': $rootScope.user.data.role + '-color',
      'border': $rootScope.user.data.role + '-border'
    };
    $scope.showDiscount=true;
    $scope.functionShowDiscount = function () {
      $scope.showDiscount=false;
    };
    $scope.functionHideDiscount = function () {
      $scope.showDiscount=true;
    };

    $scope.functionEnterClassCode = function(){
      var modalInstance = $uibModal.open({
        animation: $ctrl.animationsEnabled,
        templateUrl: 'components/premium/EnterCodeModal/EnterCode.html',
        controller: 'enterCodeInstanceCtrl',
        controllerAs: '$ctrl',
        size: 'sm',
        resolve: {
          items: function () {
            return 'enter';
          }
        }
      });
    };

    $scope.openPaymentModal = function (data) {
      var modalInstance = $uibModal.open({
        animation: $ctrl.animationsEnabled,
        templateUrl: 'components/premium/paymentModal/paymentModal.html',
        controller: 'paymentModalCtrl',
        controllerAs: '$ctrl',
        resolve: {
          items: function () {
            return data;
          }
        }
      });
    }

  }]);


