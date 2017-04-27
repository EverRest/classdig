'use strict';

angular.module('classDigServices')

      .factory('Groups', function ($http, AuthenticationService, appSettings, $routeParams, $rootScope, $q, _, $log) {
        var Groups = {};

        Groups.pickedGroup = {};

        Groups.init = function () {
          Groups.pickedGroup = {}
        };

        Groups.setPickedGroup = function (group) {
          Groups.pickedGroup = group;
          $rootScope.user.pickedGroup = group;
        };

        Groups.getGroups = function () {
           return $q.all([
            $http.get(appSettings.link + 'groups/owner'),
            $http.get(appSettings.link + 'groups/member')
          ])
        };

        Groups.getGroupById = function (id, cb) {
          if(_.isEmpty(Groups.pickedGroup)){
            $http.get(appSettings.link + 'group/' + id)
              .success(function (response) {
                Groups.pickedGroup = response.data;
                cb(Groups.pickedGroup);
              })
              .error(function (data) {
                $log.log("Code: " + data.status_code + "; Message: " + data.message);
              });
          } else {
            cb(Groups.pickedGroup);
          }
        };

        return Groups;
      })



  .factory('groupDiscussions', function ($http, appSettings, $rootScope, chatTitle, $timeout, ChatGroups) {

    var groupDiscussions = function () {

      this.activeRoom = -1;
      this.activeGroupId = -1;
      this.items = [];
      this.busy = false;
      this.after = 1;
      this.lastPage = false;

    };

    groupDiscussions.prototype.setActiveGroup = function (id) {
      this.activeGroupId = +id
    };


    groupDiscussions.prototype.updateItem = function (message) {

      var room = this.items.find(function (obj) {
        return obj.chat_room === message.room
      });
      if(room) {
        room.last_message = message.content;
        room.sender = message.sender;
        if(this.activeRoom !== message.room) room.unread_count++;
        room.last_activity = message.data_time;
        room.chat.items.push(message);
        $rootScope.$broadcast('new-massage-in-discussions', room);
      }

    };

    groupDiscussions.prototype.nextPageGroups = function (bool) {

      if (this.busy || this.lastPage || (!bool && this.after == 1)) return;

      var loader = $('#dialog-loader');
      loader.show();

      if(this.items >= 10) {
        var container = $('#dialog-list');
        var height = container[0].scrollHeight;
        container.scrollTop(height);
      }


      this.busy = true;

      var that = this;
      var url = appSettings.link + 'group/'+ this.activeGroupId  +'/discussion' + "?page=" + that.after;

      $http.get(url).success(function (data) {
        var items = data.data;
        for (var i = 0; i < items.length; i++) {
          items[i].chat = new ChatGroups();
          items[i].seen = false;
          if(items[i].last_message === "") items[i].last_message = "Empty discussion";
          that.items.push(items[i]);
        }
        if (data.meta.pagination.total_pages > 1 && data.meta.pagination.total_pages > that.after) {
          ++that.after;
        }
        else {
          that.lastPage = true;
        }
        loader.hide();
        that.busy = false;
        $rootScope.$broadcast('groups-discussions-received', that.items.length);
      }.bind(this));
    };

    groupDiscussions.prototype.markRead = function (obj) {
      if(obj.chat_count > 0) {
        if (this.activeRoom != obj.chat_room || obj.chat_count > 0) {
          $http.put(appSettings.link + 'chat', {status: 'read', id: obj.chat_room})
            .success(function (resp) {
              obj.unread_count = 0;
            })
        }
      }
    };


    return groupDiscussions;

  })


  .factory('ChatGroups', function ($http, appSettings, $log, $rootScope, $timeout) {
    var Chat = function () {

      this.items = [];
      this.busy = false;
      this.after = 1;
      this.lastPage = false;

    };

    function slitJoin(mess) {
      var array = mess.content.split("\n");
      for(var i = array.length - 1; i >= 0; i--) {
        if(array[i] === "") {
          array.splice(i, 1);
        }
      }
      return array.join("<br>");
    }

    Chat.prototype.sendMessage = function (mess, upload) {
      $log.info('appendMess:', mess);

      mess.contentR = slitJoin(mess);

      // if(upload){
      //   var messPre = angular.copy(mess);
      //   var id = messPre.attachments[0];
      //   messPre.attachments[0] = {
      //     id : id,
      //     link : upload.link
      //   };
      //   this.items.push(messPre);
      // } else {
      //   this.items.push(angular.copy(mess));
      // }

      $http.post(appSettings.link + 'chat/message', mess)
        .success(function (resp) {
          $log.log(resp);
          $rootScope.$broadcast('groups-message-sent', mess)
        }).error(function (err) {
          $log.error(err);
        })

    };

    Chat.prototype.setInputMessageState = function () {
      $timeout(function () {
        var $tm = $('#type-message');
        $tm.focus();
        $tm.trigger('keyup');
      }, 0);
    };

    Chat.prototype.nextPage = function (room) {
      if (this.busy || this.lastPage || this.items.length && this.after === 1 || $('#chat').scrollTop() !== 0) return;

      var that = this;
      this.busy = true;
      $('#chat-loader').show();


      $http.get(appSettings.link + 'chat/room/' + room + '/messages?page=' + that.after)
      .success(function (data) {
        var items = data.data;
        var countItems = items.length;
        for (var i = 0; i < items.length; i++) {
          items[i].contentR = slitJoin(items[i]);
          that.items.unshift(items[i]);
        }

        if (data.meta.pagination.total_pages > 1 && data.meta.pagination.total_pages > that.after) {
          ++that.after;
        } else {
          that.lastPage = true;
        }

        that.busy = false;
        $('#chat-loader').hide();

        if (that.after == 2 || that.after == 1) {
          that.setInputMessageState();
        }

        var elements = document.querySelectorAll('#container-chat > .message-container');
        var height = 0;
        for(var i = 0; i < elements.length; i++){
          if(i <= countItems){
            height += elements[i].scrollHeight;
          }
        }
        $('#chat').scrollTop(height);

      }.bind(this));
    };

    return Chat;

  });

