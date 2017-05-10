'use strict';

angular.module('classDigServices', [])

  .factory('registerUser',
    ['$resource',
      'appSettings',
      function ($resource, appSettings) {
        var resource = $resource(appSettings.link + '/register', {}, {
          save: {method: 'POST'}
        });
        return resource;
      }])


  .factory('ClassFactory',
    ['$resource',
      'appSettings',
       function ($resource, appSettings) {
        return {
          classs: function () {
            return $resource(appSettings.link + 'class/:id', {id: '@id'} );
          }
        };
      }])

    .factory('AllClasses', function ($resource, appSettings, $rootScope) {
        var id = $rootScope.user.data.id;
        return $resource(appSettings.link + 'class/all?user_id=' + id + '&status=1');
    })


    .factory('chatTitle', function ($rootScope) {
        var obj = {};
        obj.prepare = function (arr) {
            var res = '';
            var len = arr.length - 1;
            var cnt = 0;
            arr.forEach(function (item, index) {
                if ($rootScope.user.data.id != item.id) {
                    res += item.first_name + ' ' + item.last_name;
                    ++cnt;
                    if (index != len && $rootScope.user.data.id != arr[index + 1].id) {
                        res += ', ';
                    }
                }
            });
            return {type: cnt > 1 ? 'group' : 'direct', 'text': res};
        };
        return obj;
    })


    .factory('DialogMessages', function ($http, appSettings, $rootScope, chatTitle, $timeout, ChatGroups, $uibModal) {

    var DialogMessages = function () {
        this.items = null;
        this.busy = false;
        this.after = 1;
        this.lastPage = false;
        this.rooms = {};
        this._unread = -1;
        this.UNREAD_MAX = 99;
        this.activeRoom = -1;

        this.addItem = this.addItem.bind(this);
    };

    Object.defineProperty(DialogMessages.prototype, 'unread', {
        get: function () {
            if (this._unread > this.UNREAD_MAX) {
                return this.UNREAD_MAX + '+';
            }
            else if (this._unread < this.UNREAD_MAX && this._unread > -1) {
                return this._unread;
            }
            this.getUnread();
            return this._unread;
        },
        set: function (value) {
            this._unread = value;
        }
    });

    DialogMessages.prototype.getUnread = function () {
        var that = this;
        var url = appSettings.link + 'chat/unread';
        $http.get(url).success(function (data) {
            that._unread = parseInt(data.unread_count);
            $rootScope.$broadcast('dialog-unread-success');
        });
    };

    DialogMessages.prototype.markRead = function (obj) {
        if (!obj.newRoom) {
            if (obj.unread_count > 0) {
                if (this.activeRoom != obj.room || obj.unread_count > 0) {
                    this._unread -= obj.unread_count;
                    $rootScope.$broadcast('dialog-unread-success');
                    obj.unread_count = 0;
                }
                $http.put(appSettings.link + 'chat', {status: 'read', id: obj.room})
                    .success(function (resp) {
                    })
            }
        }
    };

    // DialogMessages.prototype.setUnread = function (room, val) {
    //     for (var i = 0; i < this.items.length; i++) {
    //         var item = this.items[i];
    //         if (room == item.room) {
    //             this.items[i].unread_count += val;
    //             this._unread += val;
    //             $rootScope.$broadcast('dialog-unread-success');
    //           $http.put(appSettings.link + 'chat', {status: 'sent', id: room})
    //             .success(function (resp) {
    //               console.log("response",resp)
    //             })
    //             .error(function (error) {
    //
    //             });
    //         }
    //     }
    // };

    DialogMessages.prototype.nextPage = function (bool) {
        // console.log(this.busy, this.lastPage, !bool && this.after == 1);
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

        $http.get(appSettings.link + 'chat/last-message?orderBy=updated_at&sortedBy=desc' + "&page=" + that.after)
          .success(function (data) {

            if(that.items === null) that.items = [];

            var items = data.data;

            for (var i = 0; i < items.length; i++) {
                var item = items[i];

                if (item.status === "") {
                    item.newRoom = chatTitle.prepare(item.recipients);
                }

              items[i].chat = new ChatGroups();
              items[i].seen = false;
              that.addItem(items[i]);

            }

            if (data.meta.pagination.total_pages > 1 && data.meta.pagination.total_pages > that.after) {
                ++that.after;
            }
            else {
                that.lastPage = true;
            }


            $('#dialog-loader').hide();
            that.busy = false;

            if (bool) {
                $rootScope.$broadcast('chat-dialog-success');
            }
        }.bind(this));
    };

    DialogMessages.prototype.addItem = function (item) {
      this.items.unshift(item);
      this.rooms[item.room] = item;
    };

    DialogMessages.prototype.updateItem = function (obj) {

        $rootScope.$broadcast('new-message-was-received');

        var item = this.items.find(function (object) {
          return object.room === obj.room;
        });

        if(item){
          if(!item.chat) item.chat = new ChatGroups();

          if(!item.hasOwnProperty('seen')) {
            if(this.activeRoom != obj.room) {
              item.seen = false;
            } else {
              item.seen = true;
            }
          }

          item.unread_count = this.activeRoom != item.room
                           ? item.unread_count + 1
                           : item.unread_count;

          item.content = obj.content;

          item.date_time = obj.date_time;
          item.recipients = obj.recipients;
          item.sender = obj.sender;
          item.status = obj.status;

          item.chat.items.push(obj);

          var ind = this.items.indexOf(item);
          this.items.splice(ind, 1);
          this.items.push(item);

        }


        // var ind = $scope.dialog.items.indexOf($scope.currentRoom);
        // $scope.dialog.items.splice(ind, 1);
        // $scope.dialog.items.push($scope.currentRoom);
        // $scope.currentRoom.content = mess.content;
        // $scope.currentRoom.sender = mess.sender;
        // $scope.currentRoom.date_time.date = mess.date_time.date;

        // if (this.rooms[obj.room]) {
        //     for (var i = 0; i < this.items.length; i++) {
        //         var item = this.items[i];
        //         if (item.room == obj.room) {
        //             obj.unread_count = this.activeRoom != obj.room
        //                 ? this.items[i].unread_count + 1
        //                 : this.items[i].unread_count;
        //             obj.recipients = this.items[i].recipients;
        //
        //             if(this.activeRoom === obj.room){
        //
        //             }
        //
        //             this.items[i] = obj;
        //         }
        //     }
        // }
        else {

            item = angular.copy(obj);
            item.unread_count = 1;
            item.chat = new ChatGroups();
            if(this.activeRoom != item.room) {
              item.seen = false;
            } else {
              item.seen = true;
            }
            item.chat.items.push(obj);
            // if (typeof obj.recipients[0] !== 'object') {
            //     obj.recipients = [{
            //         id: obj.sender.id,
            //         first_name : obj.sender.first_name,
            //         last_name : obj.sender.last_name,
            //         image: obj.sender.image
            //     }]
            // }
            //
            this.items.push(item);
        }

        if (this.activeRoom != obj.room) {
            this._unread += 1;
            $rootScope.$broadcast('dialog-unread-success');
        }
        else {
            $rootScope.dialog.markRead(obj, true);
        }
    };

    DialogMessages.prototype.newRoom = function (users, success, error) {
        var url = appSettings.link + 'chat/channel';
        $http.post(url, {users: users})
          .success(function (resp) {
              success(resp.data.room_id);
          }).error(function (err) {
            $uibModal.open({
              templateUrl: 'components/classes/confirmationModal/confirmationModal.html',
              controller: 'confirmationModalController',
              size: 'sm',
              resolve : {
                items : function () {
                  return 'Chat already exists.';
                }
              }
            });
              // $log.error(err);
              // if (error) {
              //     error(err);
              // }
          })
    };

    return DialogMessages;

})
    .factory('offsetTZ', function () {
        return {
            val: new Date().getTimezoneOffset()
        }
    })
    .filter('datechat', ['moment', 'offsetTZ', function (moment, offsetTZ) {
        return function (date) {
            // return moment(date).local().format('MMMM YYYY');
            if (offsetTZ.val < 0)
                return moment(date).add(-(offsetTZ.val), 'minutes').format('MMMM DD');
            return moment(date).subtract(offsetTZ.val, 'minutes').format('MMMM DD');
        }
    }])
    .filter('datemessage', ['moment', 'offsetTZ', function (moment, offsetTZ) {
        return function (date) {
            //return moment(date).local().format('h:mm');
            if (offsetTZ.val < 0)
                return moment(date).add(-(offsetTZ.val), 'minutes').format('h:mm');
            return moment(date).subtract(offsetTZ.val, 'minutes').format('h:mm');
        }
    }])

  .factory('Chat', function ($http, appSettings, $log, $rootScope, $timeout) {
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

        var url = appSettings.link + 'chat/message';

        if(upload){
          var messPre = angular.copy(mess);
          var id = messPre.attachments[0];
          messPre.attachments[0] = {
            id : id,
            link : upload.link
          };
          this.items.push(messPre);
        } else {
          this.items.push(angular.copy(mess));
        }

        $http.post(url, mess).success(function (resp) {
            $rootScope.$broadcast('current-user-message-sent', mess);
            $log.log(resp);
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

    Chat.prototype.nextPage = function (room, bool) {

        if ((this.busy || this.lastPage[room] || room === -1 || $('#chat').scrollTop() !== 0) && !bool) return;

        var that = this;

        if (bool && that.rooms[room]) {
            var el = $('#chat');
            var height = 0;
            height = el[0].scrollHeight;
            $(el).scrollTop(height);
            that.setInputMessageState();
            return;
        }

        this.busy = true;
        if (!that.after[room])
            that.after[room] = 1;
        $('#chat-loader').show();
        var url = appSettings.link + 'chat/room/' + room + '/messages?page=' + that.after[room];
        $http.get(url).success(function (data) {
            var items = data.data;
            that.countItems = items.length;
            for (var i = 0; i < items.length; i++) {


              items[i].contentR = slitJoin(items[i]);

              that.items.unshift(items[i]);

            }
            if (data.meta.pagination.total_pages > 1 && data.meta.pagination.total_pages > that.after[room]) {
                ++that.after[room];
            }
            else {
                that.lastPage[room] = true;
            }
            that.busy = false;
            that.rooms[room] = items;

            $('#chat-loader').hide();
            if (that.after[room] == 2 || that.after[room] == 1) {
                $log.log('focus');
                that.setInputMessageState();
            }

        }.bind(this));
    };

    return Chat;

})
    .factory('Users', function ($http, appSettings, $log, $rootScope) {
        var Users = function () {
            this.items = [];
            this.busy = false;
            this.after = 1;
            this.lastPage = {};
            this.request = null;
        };

        Users.prototype.nextPage = function (digClass, selectedRole, array) {

            if (!digClass)
                return;

            if (!this.lastPage[digClass]) {
                this.lastPage[digClass] = {};
                this.lastPage[digClass][selectedRole] = false;
            }

            if (this.busy || this.lastPage[digClass][selectedRole] ) return;

            $('#user-loader').show();
            this.busy = true;
            var that = this;
            var url = appSettings.link + 'class/' + digClass + "/list/" + selectedRole + "?page=" + that.after;
            this.request = $http.get(url).success(function (data) {
                var items = data.data;
                for (var i = 0; i < items.length; i++) {
                    var item = items[i];
                      if ($rootScope.user.data.id !== item.id) {
                        item.type = selectedRole;
                        item.class = digClass;
                       }
                       if(array) {
                        var sameElement = array.find(function (el) {
                          return item.id === el.id
                        })
                       }
                        if(array) {
                          if(!sameElement) { that.items.push(item); }
                        } else {
                          that.items.push(item);
                        }
                }
                that.lastPage[digClass][selectedRole] = true;
                // if (data.meta.pagination.total_pages > 1 && data.meta.pagination.total_pages > that.after) {
                //     ++that.after;
                // }
                // else {
                //     that.lastPage[digClass][selectedRole] = true;
                // }
                that.busy = false;
                if(array) {$rootScope.$broadcast('u-can-render')}
                $('#user-loader').hide();
            }.bind(this)).error(function (err) {
                $log.error(err);
            });
        };



        return Users;
    })

    .factory('classData', function ($http, AuthenticationService, appSettings, $routeParams, $rootScope, $q, _) {
      var obj = {};
      obj.pickedClass = {};

      obj.init = function () {
        obj.pickedClass = {};
      };

      obj.setPickedClass = function (classObj) {
        obj.pickedClass = classObj;
        $rootScope.user.classData = classObj;
        // console.log(obj.pickedClass)
      };

      obj.getClassById = function (id, cb) {
        if(_.isEmpty(obj.pickedClass)){
          $http.get(appSettings.link + 'class/' + $routeParams.classId)
            .success(function (response) {
              obj.pickedClass = response.data;
              if(obj.pickedClass.status !== 2) {obj.pickedClass.classInArchived = false;
              } else {obj.pickedClass.classInArchived = true; }
              cb(obj.pickedClass);
            })
            .error(function (data) {

            });
        } else {
          cb(obj.pickedClass);
        }
      };
      return obj;
    })


    .factory('Polls', function ($http, appSettings, $log, $rootScope, $routeParams) {
  var Polls = function () {
    this.items = [];
    this.busy = false;
    this.after = 1;
    this.lastPage = {};
    this.request = null;
  };

  Polls.prototype.nextPage = function () {

    if (this.busy ) return;

   // $('#user-loader').show();
    this.busy = true;
    var that = this;
    var url = appSettings.link + 'poll?search=class_id:'+$routeParams.classId+"&page="+that.after;
    this.request = $http.get(url).success(function (data) {
      var items = data.data;
      for (var i = 0; i < items.length; i++) {
        var item = items[i];
        for (var j = 0; j < item.poll.questions.length; j++) {
          item.poll.questions[j].userAnswers = []
        }

      }
     // that.lastPage[digClass][selectedRole] = true;
      // if (data.meta.pagination.total_pages > 1 && data.meta.pagination.total_pages > that.after) {
      //     ++that.after;
      // }
      // else {
      //     that.lastPage[digClass][selectedRole] = true;
      // }
      that.busy = false;
      // $('#user-loader').hide();
    }.bind(this)).error(function (err) {
      $log.error(err);
    });
  };


  return Polls;
})

  .factory('behaviorPreParser', function ($http, AuthenticationService, appSettings, $routeParams, $rootScope, $q, _) {
    var obj = {};

    var greenColors = ['#0D7257', '#187E62', '#3D8E78', '#49AD92', '#24A280', '#36CDA4', '#7BCCB6'];
    var redColors =   ['#D0021B', '#E40924', '#F10D29', '#F54157', '#F75D70', '#F47080', '#F58E9B'];

    var configChart = {
      "positiveLabels": [],
      "positiveBackgroundColor": [],
      "negativeLabels": [],
      "negativeBackgroundColor": [],
      options: {
        tooltips: {enabled: false},
        animation: {duration: 0},
        legend: {display: false},
        line: {borderWidth: 0},
        elements: {arc: {borderWidth: 0}}
      }
    };

    obj.createConfigObj = function(arr) {

      var config = angular.copy(configChart);

      for(var i = 0; i < arr.length; i++){
        if(arr[i].type === 1){
          config.positiveLabels.push(arr[i].description)
        } else {
          config.negativeLabels.push(arr[i].description)
        }
      }
      config.positiveBackgroundColor = greenColors;
      config.negativeBackgroundColor = redColors;

      return config;
    };

    obj.generateTemplate = function (arr) {
      var countG = 0;
      var countR = 0;

      var obj = {
        1 : {},
        2 : {}
      };
      for(var i = 0; i < arr.length; i++){
        if(arr[i].type === 1){
          if(arr[i].id === 1) {
              obj[1]['Working hard'] = {
                count : 0,
                color : greenColors[countG]
              }
            } else {
              obj['1'][arr[i].description] = {
                count : 0,
                color : greenColors[countG]
              };
          }
          countG++;
        } else {
          obj['2'][arr[i].description] = {
            count : 0,
            color : redColors[countR]
          };
          countR++;
        }
      }
      return obj;
    };

    obj.generateDataForDiagram = function (array, type) {
      var genObj = [
        {
          values : []
        }
      ];

      for(var i = 0; i <  array.length; i++) {
        if(array[i].type === type) {
          var obj = {
            label : array[i].description,
            value : 0,
            color : type === 1 ? "#1ea66d" : "#f93640"
          };
          genObj[0].values.push(obj);
        }
      }
      return genObj;
    };






    return obj;
  });




