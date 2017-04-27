angular.module('classDigApp').controller('ModalMessageInstanceCtrl',
    function ($uibModalInstance, AllClasses, $scope, Users, $log, _, chatTitle, items, $rootScope, $http) {
    var $ctrl = this;

    $scope.userRole = $rootScope.user.data.role;

    $ctrl.hasClass = false;
    $ctrl.users = new Users();
    $ctrl.selectedRole = 'users';
    $ctrl.selectedUsers = {};
    $ctrl.selectedOption = {opt: 0};
    $ctrl.roles = [
        {id: 'student', description: 'Student', url: 'users'},
        {id: 'parent', description: 'Parent', url: 'parents'}
    ];
    // $ctrl.selectedRole = 'student';

    $ctrl.options = AllClasses.get((function (data) {
        $ctrl.options = data.data;
        if (data.data.length) {
            $ctrl.hasClass = true;
        }
        else {
            $ctrl.noClasses = true;
        }
    }));

      $scope.getTeacher = function (id) {
        $http.get('http://api.classdig.com/current-user/' + id)
        //$http.get('http://loc.classdig.com/current-user/' + id)
          .success(function (response) {
            $ctrl.teacher = response.data;
          })
      };

    $scope.$watch('$ctrl.selectedOption.opt', function (newVal, oldVal) {
        $log.log(newVal);
        if (newVal) {
            $ctrl.teacher = undefined;
            var pickedClass  = $ctrl.options.find(function (obj) {
              return obj.id === newVal;
            });

            if(pickedClass.owner_id !== $rootScope.user.data.id) $scope.getTeacher(pickedClass.owner_id);
            $ctrl.selectRole($ctrl.selectedRole);
        }
    });


    $ctrl.selectUser = function (user) {

        if ($ctrl.selectedUsers[user.id]) {
            delete $ctrl.selectedUsers[user.id];
        }
        else {
            if ($scope.singleRecipient) {
                $ctrl.selectedUsers = {};
            }
            $ctrl.selectedUsers[user.id] = user;
        }
    };

    $ctrl.selectRole = function (role) {
        if($scope.userRole === 'student'){
          role = 'users'
        } else if ($scope.userRole === 'parent') {
          role = 'parents'
        }

        $ctrl.selectedRole = role;
        $ctrl.users.nextPage($ctrl.selectedOption.opt, role);
    };

    $ctrl.canCreateRoom = function () {
        var cntUsers = Object.keys($ctrl.selectedUsers).length;
        var bool = false;
        if ($scope.singleRecipient) {
            if (cntUsers > 0) {
                bool = true;
            }
        }
        else {
            if (cntUsers > 1) {
                bool = true;
            }
        }
        return bool;
    };

    $ctrl.ok = function () {
        if(items) {
          $rootScope.$broadcast('can-move-students', $ctrl.selectedOption.opt);
          $uibModalInstance.close();

        }
        if ($ctrl.canCreateRoom()) {
            $scope.dialog.newRoom(_.pluck($ctrl.selectedUsers, 'id'), function (room) {
                $log.log('Recipients:', $ctrl.selectedUsers);
                var recipients = _.values($ctrl.selectedUsers);
                $log.log('Calculate Recipients:', recipients);
                var title = chatTitle.prepare(recipients);
                $log.log('Room title:', title);
                var obj = {newRoom: title, room: room, recipients: recipients};
                $scope.dialog.items.push(obj);
                $scope.changeRoom(obj);
                $uibModalInstance.close();
            });
        }
    };



    $ctrl.cancel = function () {
      $rootScope.$broadcast('action-was-not-approved');
      $uibModalInstance.dismiss('cancel');
    };

    $ctrl.close = function () {
      $rootScope.$broadcast('action-was-not-approved');
      $uibModalInstance.close();
    };
});
