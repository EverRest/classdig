angular.module('classDigApp')
  .controller('distinguishedModalInstanceCtrl', function ($uibModalInstance, $rootScope, items, $timeout, $http, appSettings, $log) {

    var $ctrl = this;

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

    //
    // $uibModalInstance.opened.then(function() {
    //   $timeout(function () {
    //     $rootScope.$broadcast('add-distinguished-in-modal', items.students);
    //   })
    // });

    // $rootScope.$on('add-to-distinguished-list', function(event, start, end, currentClass) {
    //   $ctrl.arrayOfId = [];
    //   for(var key in $ctrl.selectedUsers) {
    //     $ctrl.arrayOfId.push(+key);
    //   }
    //   $http.post(appSettings.link + '/distinguished', {'user_ids': $ctrl.arrayOfId, 'class_id' : currentClass, 'week_start' : start, 'week_end' : end})
    //     .success(function (response) {
    //       $rootScope.$broadcast('need-to-be-reloaded', start, end, currentClass);
    //       $log.log("POST SUCCES");
    //     })
    //     .error(function (data) {
    //       $log.log("Code: " + data.status_code + "; Message: " + data.message);
    //     })
    // });

    // $ctrl.selectAll = function () {
    //   if($ctrl.allSelected) {
    //     $rootScope.$broadcast('selection-changed', true);
    //   } else {
    //     $rootScope.$broadcast('selection-changed', false);
    //   }
    // };
    // $rootScope.$on('not-all-selected', function(event) {
    //   $ctrl.allSelected = false;
    // });


      $ctrl.cancel = function () {
        $uibModalInstance.dismiss('cancel');
      };
      $ctrl.ok = function () {
        $rootScope.$broadcast('add-to-distinguished-list', items.start, items.end, items.class);
        $uibModalInstance.close();
      };
  })
;
