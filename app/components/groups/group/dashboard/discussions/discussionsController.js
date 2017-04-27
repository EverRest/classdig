var app = angular.module("classDigApp");
app.controller('groupDiscussionsController', ['$scope',
  '$rootScope',
  '$http',
  '$resource',
  '$location',
  '$uibModal',
  'AuthenticationService',
  'ClassFactory',
  'appSettings',
  '$timeout',
  '$q',
  '_',
  'Upload',
  '$log',
  'Groups',
  'chatTitle',
  '$routeParams',
  'groupDiscussions',
  'Chat',
  'ChatGroups',
  function ($scope, $rootScope, $http, $resource, $location, $uibModal, AuthenticationService, ClassFactory, appSettings, $timeout, $q,  _,Upload, $log, Groups, chatTitle, $routeParams, groupDiscussions, Chat, ChatGroups) {

    $rootScope.activeGroupItem = 1;

    $rootScope.userData = {
      'role': $rootScope.user.data.role,
      "iconPlus": 'images/modal/icon-plus-' + $rootScope.user.data.role + '_3x.png',
      'iconCamera': 'images/modal/icon-camera-' + $rootScope.user.data.role + '_3x.png',
      'background': $rootScope.user.data.role + '-background',
      'color': $rootScope.user.data.role + '-color',
      'border': $rootScope.user.data.role + '-border',
      'iconAddButton': '../images/modal/icon-add-button-' + $rootScope.user.data.role + '_3x.png'
    };
    $scope.role = $rootScope.user.data.role;
    $scope.user = $rootScope.user.data;

    $scope.content = '';
    $scope.message = {
      content: '',
      sender: {
        id: $rootScope.user.data.id,
        first_name: $rootScope.user.data.details.data.first_name,
        last_name: $rootScope.user.data.details.data.last_name,
        image: $rootScope.user.data.details.data.photo
      },
      date_time: {},
      attachments: []
    };
    $scope.inited = true;

    $scope.init = function () {
      if(!$rootScope.groupDiscussions || $rootScope.groupDiscussions.activeGroupId === -1){
        $rootScope.groupDiscussions = new  groupDiscussions();
        $rootScope.groupDiscussions.setActiveGroup($routeParams.groupId);
        $rootScope.groupDiscussions.nextPageGroups(true);
      }

      $scope.dicussionsCount =  $rootScope.groupDiscussions.items.length;

      if($routeParams.room) {
        $scope.active = $routeParams.room;
        $rootScope.groupDiscussions.activeRoom = $routeParams.room;
      } else {
        $scope.active = -1;
      }
    };


    $scope.openAreUSureModal = function (size) {
      var modalInstance = $uibModal.open({
        // animation: $ctrl.animationsEnabled,
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

    $scope.deleteMessages = function () {
      $scope.modalContext = {
        'action' : 'deleteMessage',
        'actionTitle' : 'delete',
        'students' : $scope.selectedMessages,
        'fromStudents' : false
      };
      $scope.openAreUSureModal('sm');

      $rootScope.$on('deleteMessage', function deleteMessage() {
        var idArr = [];
        $scope.selectedMessages.forEach(function (obj) {
          idArr.push(obj.id)
        });

        $http({
          method: 'delete',
          url: appSettings.link + 'chat/messages',
          headers: {'Content-Type': 'application/json'},
          data : {"messages" : idArr}
        })
          .success(function (response) {
            var curRoom = $rootScope.groupDiscussions.items.find(function (obj) {
              return obj.chat_room === $rootScope.groupDiscussions.activeRoom;
            });

            // var curRoom = $rootScope.dialog.items.find(function (obj) {
            //   return obj.room === $scope.selectedMessages[0].room;
            // });

            idArr.forEach(function (id) {
              var delMes = curRoom.chat.items.find(function (obj) {
                return obj.id === id;
              });
              var delInd = curRoom.chat.items.indexOf(delMes);
              curRoom.chat.items.splice(delInd, 1);
            });

            if(curRoom.chat.items.length){
              curRoom.last_message = curRoom.chat.items[curRoom.chat.items.length - 1].content;
              curRoom.last_activity = curRoom.chat.items[curRoom.chat.items.length - 1].date_time;
              curRoom.sender = curRoom.chat.items[curRoom.chat.items.length - 1].sender;
            } else {
              curRoom.last_message = 'Empty discussion';
              // curRoom.newRoom = {};
              // curRoom.newRoom.text = '';
              // if(curRoom.recipients.length > 2) {
              //   curRoom.newRoom.type = 'group'
              // } else { curRoom.newRoom.type = 'direct' }
              // curRoom.recipients.forEach(function (obj) {
              //   if(obj.id !== $scope.user.id) {
              //     curRoom.newRoom.text += obj.first_name + ' ' + obj.last_name + ', ';
                }
              });
            // }

            $scope.selectedMessages = [];
            $rootScope.$$listeners['deleteMessage'] = [deleteMessage];
            $rootScope.$$listeners['deleteMessage'].splice(0, 1);

          // })
          // .error(function () {
          //   console.log("error")
          // })
      })
    };






    $scope.contextMenu = {
      'items': [
        {
          'img': 'images/context_menu/icon-delete-' + $scope.role + '_3x.png',
          'imgDisabled' : 'images/context_menu/icon-delete-default_3x.png',
          'state' : false,
          'active' : true,
          'text': 'Delete',
          'click': $scope.deleteMessages
        }
      ]
    };

    $scope.selectedMessages = [];

    $scope.selectMessage = function (message) {
      var mes  = $scope.selectedMessages.find(function (obj) {
        return obj.id === message.id;
      });

      if(mes){
        var ind = $scope.selectedMessages.indexOf(mes);
        $scope.selectedMessages.splice(ind, 1);
      } else {
        $scope.selectedMessages.push(message);
      }

      if($scope.selectedMessages.length) {
        $scope.contextMenu.items[0].state = true;
      } else {
        $scope.contextMenu.items[0].state = false;
      }

    };
















    $scope.$on('groups-discussions-received', function (event, count) {
      $scope.dicussionsCount =  count;
    });

    $scope.$on('entered-room-scroll-event', function () {
      $scope.justEntered =  false;
    });

    $rootScope.$on('group-data-received', function sendRequest(event, obj) {
      $rootScope.$$listeners['group-data-received'] = [sendRequest];
    });


    $scope.changeRoom = function (obj) {
        $scope.selectedMessages = [];
        $scope.contextMenu.items[0].state = false;

        $scope.justEntered = true;

        // $scope.enteredRoom = true;
        // $location.search({room: obj.chat_room});
        $scope.currentRoom = obj;
        $rootScope.groupDiscussions.activeRoom = obj.chat_room;
        $scope.active = obj.chat_room;
        if(!obj.seen) obj.chat.nextPage(obj.chat_room, true);
        $rootScope.groupDiscussions.markRead(obj);
        obj.seen = true;

        $scope.chatTitle = obj.name;

      // if($scope.inited) {
        $timeout(function () {
          var el = $('#chat');
          var height = el[0].scrollHeight;
          el.scrollTop(height)
          $scope.inited = false;
        })
      // }
    };

    checkDialog();
    function checkDialog() {
      if (!$rootScope.groupDiscussions) {
        $('#dialog-loader').show();
      }
      else if (!$rootScope.groupDiscussions.items.length) {
        $('#dialog-loader').hide();
        // $scope.emptyDialog = true;
      }
      else {
        if ($routeParams.room) {
          $('#dialog-loader').hide();
          $scope.active = $routeParams.room;
          var result = $rootScope.groupDiscussions.items.find(function(obj) {
              return obj.chat_room === $routeParams.room;
          });
          $scope.changeRoom(result);
        }
      }
    };

    scrollEventHendler = function () {
      if($('#chat').scrollTop() === 0){
        $scope.currentRoom.chat.nextPage($scope.active);
      }
    };

    $scope.sendMessage = function () {
      if($scope.content === '' && !$scope.upload) return;
      if($scope.upload){
        $scope.message.attachments[0] = $scope.upload.id;
      }
      $scope.message.date_time.date = moment(moment().format()).utc().format('YYYY-MM-DD H:m:ss');
      $scope.message.content = $scope.content;
      $scope.message.room = $scope.active;
      $scope.message.type = 2;

      $scope.currentRoom.chat.sendMessage($scope.message, $scope.upload);
      $scope.currentRoom.chat.setInputMessageState();

      $scope.content = '';
      $scope.newMessageSent = true;
      $scope.picFile = undefined;
      $scope.upload = undefined;
    };

    $scope.$on('new-message-sent-scroll-event', function () {
      $scope.newMessageSent =  false;
    });

    $scope.$on('groups-message-sent', function (event, mess) {
      var ind = $rootScope.groupDiscussions.items.indexOf($scope.currentRoom);
      $rootScope.groupDiscussions.items.splice(ind, 1);
      $rootScope.groupDiscussions.items.unshift($scope.currentRoom);
      $scope.currentRoom.last_message = mess.content;
      $scope.message.attachments = [];
    });

    $scope.$on('new-discussion-created', function (event, disc) {
      disc.seen = false;
      disc.chat = new ChatGroups();
      disc.last_message = 'Empty discussion';
      disc.sender = {};
      disc.sender.image = $rootScope.user.data.details.data.photo;
      disc.last_message = "Empty discussion";
      $rootScope.groupDiscussions.items.unshift(disc);
    });

    $scope.$watch('picFile', function () {
      if ($scope.picFile) {
        $scope.loadingImg = true;

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
        $scope.upload = response.data.data;
        $scope.loadingImg = false;
      }, function (response) {
        if (response.status > 0)
          $scope.errorMsg = response.status + ': ' + response.data;
      });
    };

    $scope.createNewDiscussion = function () {
        $scope.modalInstance = $uibModal.open({
          templateUrl: 'components/groups/group/dashboard/discussions/newDiscussionModal/newDiscussionModal.html',
          controller: 'createNewDiscussion',
          controllerAs: '$ctrl',
          size: 'sm',
          resolve: {
            items: function () {
              return $scope.items;
            }
          }
        });
    };

    $scope.data = {
      'items': [],
      'onGlobalButtonClick': $scope.createNewDiscussion
    };

    $scope.resizeArea = function (ev) {
      var messageContainer = angular.element('.type-message')[0];
      var el = ev.currentTarget;
      if (el.scrollHeight < 100) {
        el.style.height = 0;
        el.style.height = el.scrollHeight + 'px';

        var h = 34 + el.scrollHeight;
        $(messageContainer).css({height: h + 'px'});

        var chat = $('#chat');
        var height = chat[0].scrollHeight;
        if(chat.scrollTop() + chat.innerHeight() >= chat[0].scrollHeight - 250){
          $(chat).scrollTop(height);
        }
      }

    };

    $scope.$on('new-massage-in-discussions', function (event, room) {
      $scope.newMessageReceived = true;
      var ind = $rootScope.groupDiscussions.items.indexOf(room);
      $rootScope.groupDiscussions.items.splice(ind, 1);
      $rootScope.groupDiscussions.items.unshift(room);
    });

    $scope.$on("new-message-received-scroll", function () {
      $scope.newMessageReceived = false;
    });



  }])

  .directive('myRepeatDirective', function($rootScope) {
    return function(scope, element, attrs) {

      if (scope.$last){
        var el = $('#chat');
        var height = el[0].scrollHeight;

          if(scope.newMessageReceived) {
            if(el.scrollTop() + el.innerHeight() <= el[0].scrollHeight - 250) {
              $rootScope.$broadcast("new-message-received-scroll");
              return
            } else {
              $rootScope.$broadcast("new-message-received-scroll");
              height = el[0].scrollHeight;
              $(el).scrollTop(height);
              return
            }
          }

          if(scope.currentRoom.chat.after <= 2) {
            $(el).scrollTop(height);
          }
          if(scope.justEntered && scope.currentRoom.seen) {
            $(el).scrollTop(height);
            $rootScope.$broadcast('entered-room-scroll-event')
          }
          if(scope.newMessageSent) {
            $(el).scrollTop(height);
            $rootScope.$broadcast('new-message-sent-scroll-event')
          }
      }
    };
  });

