angular.module('classDigApp')
  .controller('classExportCtrl', function ($uibModalInstance,$scope, $rootScope, $http, appSettings,$routeParams, $log,_,items,$uibModal) {
    var $ctrl = this;
    $scope.ExamServerError = false;
    $scope.selection = {selectedItems: [], currentItem: []};
    $scope.exportItems = [
      {
        'img':"images/classExport/icon-export-students-",
        'imgActive':"images/classExport/icon-export-students-active-",
        'active':'-active',
        'ext':'.jpg',
        'title': "Students",
        'id':1
      },
      {
        'img':"images/classExport/icon-export-attendance-",
        'imgActive':"images/classExport/icon-export-attendance-active-",
        'active':'-active',
        'ext':'.svg',
        'title': "Attendance",
        'id':2
      },
      {
        'img':"images/classExport/icon-export-behaviour-",
        'imgActive':"images/classExport/icon-export-behaviour-active-",
        'active':'-active',
        'ext':'.svg',
        'title': "Behaviour",
        'id':3
      },
      {
        'img':"images/classExport/icon-export-grades-",
        'imgActive':"images/classExport/icon-export-grades-active-",
        'active':'-active',
        'ext':'.svg',
        'title': "Grades",
        'id': 4
      }
    ];


    $scope.$on('class-was-exported', function () {
      $uibModalInstance.dismiss('cancel');
    });

    $scope.cancel = function () {
      $uibModalInstance.dismiss('cancel');
    };

    $scope.ok = function () {
      $scope.exportClass={};
      $scope.exportClass.classes=items;
      $scope.exportClass.types=[];
      for(var i=0;i<$scope.selection.currentItem.length;i++){
        $scope.exportClass.types.push($scope.selection.currentItem[i].id)
      }

      if($scope.exportClass.types.length>0){

      var modalInstance = $uibModal.open({
        animation: $ctrl.animationsEnabled,
        templateUrl: 'components/classes/classExport/enterEmail/enterEmail.html',
        controller: 'enterEmailCtrl',
        controllerAs: '$ctrl',
        size:'sm',
        resolve: {
          items: function () {
            return $scope.exportClass;
          },
          classId:function () {
            return items;
          }
        }
      });

      }
      else {
        $scope.typeError = true;
      }
      };

      $scope.hideError = function () {
        $scope.typeError = false;
      }

  });
