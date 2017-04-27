app.controller('groupsController', ['$scope',
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
  '$log',
  'Groups',
  'groupsPaginator',
  function ($scope, $rootScope, $http, $resource, $location, $uibModal, AuthenticationService, ClassFactory, appSettings, classData, $timeout, DeletedClasses, CurrentClasses, $q,  _,Upload, Feed, $log, Groups, groupsPaginator) {

    //CONSTANTS
    $ctrl = this;

    // var groups = new Groups();
    var role = $rootScope.user.data.role;
    var userId = $rootScope.user.data.id;
    switch(role) {
      case 'student':   $scope.roleColor = '#429c87'; break;
      case 'parent':  $scope.roleColor = '#cf515d'; break;
      case 'teacher': $scope.roleColor = '#4785d6'; break;
    }

    $scope.paginatorCreated = new groupsPaginator('groups/owner?page=');
    $scope.paginatorJoined = new groupsPaginator('groups/member?page=');

    // $scope.paginatorCreated.setUrl();


    $scope.selection = {selectedItems: [], currentItem: []};
    $rootScope.userData = {
      'role': $rootScope.user.data.role,
      "iconPlus": 'images/modal/icon-plus-' + $rootScope.user.data.role + '_3x.png',
      'iconCamera': 'images/modal/icon-camera-' + $rootScope.user.data.role + '_3x.png',
      'background': $rootScope.user.data.role + '-background',
      'color': $rootScope.user.data.role + '-color',
      'border': $rootScope.user.data.role + '-border',
      'iconAddButton': '../images/modal/icon-add-button-' + $rootScope.user.data.role + '_3x.png'
    };

    // $scope.catGroupNames = function (groups) {
    //   for(var i = 0; i < groups.length; i++) {
    //     if(groups[i].name. length > 12) {
    //       groups[i].cated_name = groups[i].name.substring(0, 13) + "...";
    //     } else {
    //       groups[i].cated_name = groups[i].name;
    //     }
    //   }
    // };

    //MODAL WINDOWS
    $scope.openModalJoinClass = function () {
      var modalInstance = $uibModal.open({
        animation: $scope.animationsEnabled,
        ariaLabelledBy: 'modal-title',
        ariaDescribedBy: 'modal-body',
        templateUrl: 'components/groups/joinGroup/joinGroup.html',
        controller: 'joinGroupByCodeModalInstance',
        controllerAs: '$ctrl',
        size: 'sm',
        resolve: {
          items: function () {
            return $scope.items;
          }
        }
      });
    };
    $scope.openModalCreateGroup = function () {
      var modalInstance = $uibModal.open({
        animation: $scope.animationsEnabled,
        ariaLabelledBy: 'modal-title',
        ariaDescribedBy: 'modal-body',
        templateUrl: 'components/groups/createGroup/createGroup.html',
        controller: 'createStudentModalInstance',
        controllerAs: '$ctrl',
        // size: 'sm',
        resolve: {
          items: function () {
            return $scope.items;
          }
        }
      });
    };
    $scope.openAreUSureModal = function (size) {
      var modalInstance = $uibModal.open({
        animation: $ctrl.animationsEnabled,
        templateUrl: 'components/classes/areUSureModal/areUSureModal.html',
        controller: 'areUSureModalCtrl',
        controllerAs: '$ctrl',
        size: size,
        resolve: {
          items: function () {
            return $scope.modalContext;
          }
        }
      });
    };

    // if(role === 'parent'){
    //   $scope.data = {
    //     'items': [],
    //     'onGlobalButtonClick': $scope.openModalJoinClass
    //   };
    // } else {
      $scope.data = {
        'items': [
          {
            'img': 'images/groups/users-group-' + role +'.svg',
            'text': 'Create new group',
            'click': $scope.openModalCreateGroup
          },
          {
            'img': 'images/groups/join-group-' + role +'.svg',
            'text': 'Join group',
            'click': $scope.openModalJoinClass
          }
        ]
      };
    // }



    //UX
    $scope.changeView = function (name) {
      $scope.activeSubtitleTab = name;
      // if(name === 'joined') {
      //   $scope.paginatorJoined = new groupsPaginator('groups/member?page=');
      // }

      angular.element('.classes-subheader-item').css('border-bottom','2px solid white');
      angular.element('#'+name).css('border-bottom','2px solid' + $scope.roleColor);
      $scope.selection.currentItem = [];
      $scope.contextMenu.items[0].state = false;
      $scope.contextMenu.items[1].state = false;
    };
    $scope.selectionWasChanged = function (element) {
      if($scope.selection.currentItem.indexOf(element) !== -1){
        $scope.selection.currentItem = [];
        $scope.contextMenu.items[0].state = false;
        $scope.contextMenu.items[1].state = false;
      } else {
        $scope.selection.currentItem = [element];
        $scope.contextMenu.items[0].state = true;
        $scope.contextMenu.items[1].state = true;
      }
    };

    $scope.deleteGroup = function () {
        $scope.modalContext = {
          'action' : 'deleteGroup',
          'actionTitle' : 'delete',
          'current' : $scope.selection.currentItem
        };
        $scope.openAreUSureModal('sm');
        $rootScope.$on('deleteGroup', function sendRequest() {
          $http({
            method: 'delete',
            url: appSettings.link + 'groups/' +  $scope.selection.currentItem[0].id,
            headers: {'Content-Type': 'application/json'}
          })
            .success(function (response) {
              $log.log("group deleted good", response);
              // $rootScope.$broadcast('groups-have-to-be-reloaded');
              if($scope.selection.currentItem[0]){
                var el = $scope.paginatorCreated.items.find(function (obj) {
                  return obj.id === $scope.selection.currentItem[0].id
                });

                var pos = $scope.paginatorCreated.items.indexOf(el);

                $scope.paginatorCreated.items.splice(pos, 1);
                if(!$scope.paginatorCreated.items.length && !$scope.paginatorJoined.items.length) {
                  $scope.noGroups = true;
                } else if ($scope.paginatorJoined.items.length) {
                  $scope.changeView('joined');
                  $scope.groupsLists.allTypes = false;
                }
                $scope.selection.currentItem = [];
              }
            })
            .error(function () {
              $log.log("error")
            });
          $rootScope.$$listeners['deleteGroup'] = [sendRequest];
        })
    };
    $scope.editGroup = function () {
      var modalInstance = $uibModal.open({
        animation: $scope.animationsEnabled,
        ariaLabelledBy: 'modal-title',
        ariaDescribedBy: 'modal-body',
        templateUrl: 'components/groups/createGroup/createGroup.html',
        controller: 'createStudentModalInstance',
        controllerAs: '$ctrl',
        // size: 'sm',
        resolve: {
          items: function () {
            return $scope.selection.currentItem[0];
          }
        }
      });
    };

    $scope.contextMenu = {
      'items': [
        {
          'img': 'images/context_menu/icon-edit-' + role + '_3x.png',
          'imgDisabled' : 'images/context_menu/icon-edit-default_3x.png',
          'imgHover' : 'images/context_menu/icon-edit-hover_3x.png',
          'state' : false,
          'text': 'Edit',
          'active' : true,
          'distinguished' : false,
          'click': $scope.editGroup
        },
        {
          'img': 'images/context_menu/icon-delete-' + role + '_3x.png',
          'imgDisabled' : 'images/context_menu/icon-delete-default_3x.png',
          'imgHover' : 'images/context_menu/icon-delete-hover_3x.png',
          'state' : false,
          'text': 'Delete',
          'active' : true,
          'distinguished' : false,
          'click': $scope.deleteGroup
        }
      ]
    };



    $scope.init = function () {
      if($rootScope.groupDiscussions) $rootScope.groupDiscussions.activeGroupId = -1;
      Groups.getGroups()
        .then(function (values) {
          var obj = {};

          obj.created = values[0].data.data;
          obj.joined = values[1].data.data;

          $scope.noGroups = false;

          if(obj.created.length && obj.joined.length){
            obj.allTypes = true;
            $scope.changeView('created');
          } else if(obj.created.length && !obj.joined.length){
            obj.allTypes = false;
            $scope.changeView('created');
          } else if(!obj.created.length && obj.joined.length) {
            obj.allTypes = false;
            $scope.changeView('joined');
          } else {
            $scope.noGroups = true;
          }
          $scope.groupsLists = obj;
        });
    };

    $scope.openGroup = function (group) {
      Groups.setPickedGroup(group);
      $location.path("/group/" + group.id + "/user/" + userId + "/discussions");
    };

    //EVENT LISTENERS
    $rootScope.$on('action-was-not-approved', function () {
      $scope.selection.currentItem = [];
      $scope.contextMenu.items[0].state = false;
      $scope.contextMenu.items[1].state = false;
    });

    $scope.$on('groups-have-to-be-reloaded-added', function (event, group) {
      $scope.paginatorCreated.catName(group);
      $scope.paginatorCreated.items.unshift(group);
      $scope.init();
    });
    $scope.$on('groups-have-to-be-reloaded-updated', function (event, group) {
      $scope.paginatorCreated.catName(group);
     var el = $scope.paginatorCreated.items.find(function (obj) {
        return obj.id === group.id;
      });
      var pos = $scope.paginatorCreated.items.indexOf(el);
      $scope.paginatorCreated.items[pos] = group;
    });




  }])


  .factory('groupsPaginator', function($http, appSettings, $routeParams, AuthenticationService, $rootScope) {
    var paginator = function(url) {
      this.items = [];
      this.busy = false;
      this.after = '';
      this.url = url;
    };

    paginator.prototype.catName = function (group) {
        if(group.name.length > 12) {
          group.cated_name = group.name.substring(0, 13) + "...";
        } else {
          group.cated_name = group.name;
        }
    };

    // paginator.prototype.setDefault = function () {
    //   this.items = [];
    //   this.busy = false;
    //   this.after = '';
    // };


    paginator.prototype.nextPage = function() {

      if (this.busy) return;

      this.busy = true;


        $http.get(appSettings.link + this.url + this.after)
        .success(function(data) {
          if(data.data.length ===0){
            return
          }
          var items = data.data;

          for (var i = 0; i < items.length; i++) {
            this.catName(items[i]);

            var el = this.items.find(function (obj) {
              return obj.id === items[i].id
            });

            if(!el) this.items.push(items[i]);
          }

          this.after = data.meta.pagination.current_page + 1;

          if(data.meta.pagination.total_pages === data.meta.pagination.current_page){
            return
          }

          this.busy = false;
          $('#user-loader').hide();
        }.bind(this));
    };
    return paginator;
  });
