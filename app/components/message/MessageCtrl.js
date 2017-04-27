
angular.module('classDigApp').controller('MessageCtrl',
    ['$scope',
        '$rootScope',
        'appSettings',
        '$log',
        'Chat',
        '$uibModal',
        'Users',
        '$timeout',
        'AllClasses',
        '$routeParams',
        '$location',
        'chatTitle',
        'moment',
        'Upload',
        'ChatGroups',
        '$http',
        function ($scope, $rootScope, appSettings, $log, Chat, $uibModal, Users, $timeout,
                  AllClasses, $routeParams, $location, chatTitle, moment, Upload, ChatGroups, $http) {
            var $ctrl = this;

            $scope.user = $rootScope.user.data;
            $scope.active = -1;
            $scope.unread = 0;

            $scope.dialog = $rootScope.dialog;


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

            $ctrl.role = $scope.role = $rootScope.user.data.role;

            $scope.unread = $rootScope.dialog._unread;
            $scope.$on('dialog-unread-success', function () {
              $log.info('Unread messages', $rootScope.dialog._unread);
              $scope.unread = $rootScope.dialog._unread;
            });


          scrollEventHendlerChat = function () {
            if($('#chat').scrollTop() === 0){
              $scope.currentRoom.chat.nextPage($scope.active, true);
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

                  var curRoom = $rootScope.dialog.items.find(function (obj) {
                    return obj.room === $scope.selectedMessages[0].room;
                  });

                  idArr.forEach(function (id) {
                    var delMes = curRoom.chat.items.find(function (obj) {
                      return obj.id === id;
                    });
                    var delInd = curRoom.chat.items.indexOf(delMes);
                    curRoom.chat.items.splice(delInd, 1);
                  });

                  if(curRoom.chat.items.length){
                    curRoom.content = curRoom.chat.items[curRoom.chat.items.length - 1].content;
                    curRoom.date_time = curRoom.chat.items[curRoom.chat.items.length - 1].date_time;
                    curRoom.sender = curRoom.chat.items[curRoom.chat.items.length - 1].sender;
                  } else {
                    curRoom.newRoom = {};
                    curRoom.newRoom.text = '';
                    if(curRoom.recipients.length > 2) {
                      curRoom.newRoom.type = 'group'
                    } else { curRoom.newRoom.type = 'direct' }
                    curRoom.recipients.forEach(function (obj) {
                      if(obj.id !== $scope.user.id) {
                        curRoom.newRoom.text += obj.first_name + ' ' + obj.last_name + ', ';
                      }
                    })
                  }

                  $scope.selectedMessages = [];
                  $rootScope.$$listeners['deleteMessage'] = [deleteMessage];
                  $rootScope.$$listeners['deleteMessage'].splice(0, 1);

                })
                .error(function () {

                })
            })
          };

          $scope.contextMenu = {
            'items': [
              {
                'img': 'images/context_menu/icon-delete-' + $scope.role + '_3x.png',
                'imgDisabled' : 'images/context_menu/icon-delete-default_3x.png',
                'imgHover' : 'images/context_menu/icon-delete-hover_3x.png',
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


          $scope.$watch('picFile', function () {
            if ($scope.picFile) {
              $scope.loadingImg = true;

              $scope.uploadPic($scope.picFile);
            }
          }); ///TODO WORKING FINE
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
          };   ///TODO WORKING FINE


          $scope.sendMessage = function () {
                if($scope.content === '' && !$scope.upload) return;
                if($scope.upload){
                  $scope.message.attachments[0] = $scope.upload.id;
                }
                if($scope.currentRoom.newRoom) delete $scope.currentRoom.newRoom;

                $scope.message.type = 1;

                $scope.message.date_time.date = moment(moment().format()).utc().format('YYYY-MM-DD H:m:ss');
                $scope.message.content = $scope.content;
                $scope.message.room = $scope.active;
                $scope.currentRoom.chat.sendMessage($scope.message, $scope.upload);
                $scope.currentRoom.chat.setInputMessageState();

                $scope.content = '';
                $scope.newMessageSent = true;
                $scope.picFile = undefined;
                $scope.upload = undefined;
            };  ///TODO WORKING FINE

          $scope.$on('groups-message-sent', function (event, mess) {
            var ind = $scope.dialog.items.indexOf($scope.currentRoom);
            $scope.dialog.items.splice(ind, 1);
            $scope.dialog.items.push($scope.currentRoom);
            $scope.currentRoom.content = mess.content;
            $scope.currentRoom.sender = mess.sender;
            $scope.currentRoom.date_time.date = mess.date_time.date;
            $scope.message.attachments = [];
          });  ///TODO WORKING FINE




          $rootScope.$on('new-message-was-received', function () {
            $scope.newMessageReceived = true;
          });
          $rootScope.$on("new-message-received-scroll-e", function () {
            $scope.newMessageReceived = false;
          });

            $scope.changeRoom = function (obj) {
                if(obj){
                  $scope.selectedMessages = [];
                  $scope.contextMenu.items[0].state = false;

                  $scope.justEntered = true;
                  $scope.currentRoom = obj;
                  $scope.active = obj.room;
                  $location.search({room: obj.room});

                  if(!obj.seen && !obj.newRoom) obj.chat.nextPage(obj.room, true);

                  if(obj.newRoom) {
                    obj.seen = false;
                    obj.chat = new ChatGroups();
                    obj.date_time ={};
                    obj.date_time.date = moment(moment().format()).utc().format('YYYY-MM-DD H:m:ss');
                  }

                  $scope.chatTitle = chatTitle.prepare(obj.recipients);

                  $scope.dialog.markRead(obj);
                  $rootScope.dialog.activeRoom = obj.room;
                  obj.chat.setInputMessageState();

                  obj.seen = true;
                }
                var el = $('#chat');
                $timeout(function () {
                  var height = el[0].scrollHeight;
                  $(el).scrollTop(height);
                });
            };  ///TODO WORKING FINE

            $scope.$on('room-changed-from-popup', function (e, obj) {
              $scope.changeRoom(obj);
              // $scope.enteredRoom = true;
              // console.log('from event');
              // $scope.currentRoom = obj;
              // $scope.chatTitle = chatTitle.prepare(obj.recipients);
              // $scope.active = obj.room;
              // $rootScope.dialog.activeRoom = obj.room;
              // $scope.chat.setInputMessageState();
              //
              // var el = $('#chat');
              // $timeout(function () {
              //   var height = el[0].scrollHeight;
              //   $(el).scrollTop(height);
              // });
          });  ///TODO WORKING FINE
            checkDialog();                     ///TODO WORKING FINE
            function checkDialog() {
                if ($scope.dialog.items === null) {
                    $('#dialog-loader').show();
                }
                else if (!$rootScope.dialog.items.length) {
                    $('#dialog-loader').hide();
                    $scope.emptyDialog = true;
                }
                else {
                    if ($routeParams.room) {
                        $('#dialog-loader').hide();
                        $scope.active = $routeParams.room;
                        $scope.changeRoom($scope.dialog.rooms[$routeParams.room]);
                    }
                }
            }       ///TODO WORKING FINE
            $scope.$on('chat-dialog-success', function () {
                $('#dialog-loader').hide();
                checkDialog();
            }); ///TODO WORKING FINE



          // $scope.$on('current-user-message-sent', function (event, mess) {
          //
          //   var ind = $scope.dialog.items.indexOf($scope.currentRoom);
          //   $scope.dialog.items.splice(ind, 1);
          //   $scope.currentRoom.content = mess.content;
          //   $scope.currentRoom.sender = mess.sender;
          //   $scope.currentRoom.date_time.date = mess.date_time.date;
          //   $scope.dialog.items.push($scope.currentRoom);
          //
          // });



          // $scope.$on("new-message-parsed-without-scroll", function () {
          //   $scope.newMessageReceived = false;
          //   console.log("no scroll");
          // });
          //
          // $scope.$on("new-message-parsed-with-scroll", function () {
          //   $scope.newMessageReceived = false;
          //   console.log("scroll");
          // });
          //
          // $rootScope.$on('update-chats-list', function (e, data) {
          //   var ind = $scope.dialog.items.indexOf(data);
          //   $scope.dialog.items.splice(ind, 1);
          //   $scope.dialog.items.push(data);
          //   if($scope.active === data.room) {
          //     $scope.newMessageReceived = true;
          //   }
          // });


          function init() {
            $scope.selectedRole = 'users';
            $scope.activeClass = 1;
            $scope.singleRecipient = false;
            $scope.startRequest = false;
            $scope.startRooms = false;
          } ///TODO WORKING FINE
          init(); ///TODO WORKING FINE


            $scope.groupMessages = function () {
                init();
                $scope.modalInstance = $uibModal.open({
                    templateUrl: 'components/message/selectPeople.html',
                    controller: 'ModalMessageInstanceCtrl',
                    controllerAs: '$ctrl',
                    scope: $scope,
                    resolve : {
                      items : function () {
                        return false;
                      }
                    }
                });
            };
            $scope.directMessage = function () {
                init();
                $scope.singleRecipient = true;
                $scope.modalInstance = $uibModal.open({
                    templateUrl: 'components/message/selectPeople.html',
                    controller: 'ModalMessageInstanceCtrl',
                    controllerAs: '$ctrl',
                    scope: $scope,
                    resolve : {
                      items : function () {
                        return false;
                      }
                    }
                });
            };

            $scope.data = {
                'items': [
                    {
                        'img': 'images/message/direct-message-' + $scope.role + '.png',
                        'text': 'Direct Message',
                        'click': $scope.directMessage
                    },
                    {
                        'img': 'images/message/group-message-' + $scope.role + '.png',
                        'text': 'Group Message',
                        'click': $scope.groupMessages
                    }
                ],
                'onGlobalButtonClick': null
            }; ///TODO WORKING FINE
            $scope.resizeArea = function (ev) {
                var messageContainer = angular.element('.type-message')[0];
                var el = ev.currentTarget;
                if (el.scrollHeight < 100) {
                    el.style.height = 0;
                    el.style.height = el.scrollHeight + 'px';
                    // c.style.height = c.style.height - (el.scrollHeight + 60) + 'px';

                    var h = 34 + el.scrollHeight;
                    $(messageContainer).css({height: h + 'px'});

                    var chat = $('#chat');
                    var height = chat[0].scrollHeight;
                    if(chat.scrollTop() + chat.innerHeight() >= chat[0].scrollHeight - 250){
                      $(chat).scrollTop(height);
                    }
                }

            };  ///TODO WORKING FINE

          $rootScope.$on('chat-entered-room-scroll-event', function () {
            $scope.justEntered = false;
          });
          $rootScope.$on('chat-new-message-sent-scroll-event', function () {
            $scope.newMessageSent = false;
          });

        }]
)
  .filter('orderObjectBy', function() {
        return function(items, field, reverse){
          var strRef = function (object, reference) {
            function arr_deref(o, ref, i) {
              return !ref ? o : (o[ref.slice(0, i ? -1 : ref.length)]);
            }
            function dot_deref(o, ref) {
              return !ref ? o : ref.split('[').reduce(arr_deref, o);
            }
            return reference.split('.').reduce(dot_deref, object);
          };

          var filtered = [];

          angular.forEach(items, function(item) {
            filtered.push(item);
          });
          filtered.sort(function (a, b) {
            return (strRef(a, field) > strRef(a, field) ? 1 : -1);
          });
          if(reverse) filtered.reverse();
          return filtered;
        };
    })

    .directive('chatScrolDir', function($rootScope) {
      return function(scope, element, attrs) {

        if (scope.$last){
          var el = $('#chat');
          var height = el[0].scrollHeight;

          if(scope.newMessageReceived) {
            if(el.scrollTop() + el.innerHeight() <= el[0].scrollHeight - 250) {
              $rootScope.$broadcast("new-message-received-scroll-e");
              return
            } else {
              $rootScope.$broadcast("new-message-received-scroll-e");
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
            $rootScope.$broadcast('chat-entered-room-scroll-event')
          }
          if(scope.newMessageSent) {
            $(el).scrollTop(height);
            $rootScope.$broadcast('chat-new-message-sent-scroll-event')
          }
        }
      };
    });
  // .if (scope.$last){
// var el = $('#chat');
// var height = el[0].scrollHeight;
//
// if(scope.newMessageReceived) {
//   if(el.scrollTop() + el.innerHeight() <= el[0].scrollHeight - 250) {
//     $rootScope.$broadcast("new-message-received-scroll");
//     return
//   } else {
//     $rootScope.$broadcast("new-message-received-scroll");
//     height = el[0].scrollHeight;
//     $(el).scrollTop(height);
//     return
//   }
// }
//
// if(scope.currentRoom.chat.after <= 2) {
//   $(el).scrollTop(height);
// }
// if(scope.justEntered && scope.currentRoom.seen) {
//   $(el).scrollTop(height);
//   $rootScope.$broadcast('entered-room-scroll-event')
// }
// if(scope.newMessageSent) {
//   $(el).scrollTop(height);
//   $rootScope.$broadcast('new-message-sent-scroll-event')
// }
// }


