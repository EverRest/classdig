angular.module('classDigApp')
  .controller('pollsController', function ($scope, $rootScope, $uibModal, $log, $document,appSettings, $http, $routeParams, Poll,$timeout) {
    var $ctrl = this;
    $rootScope.activeClassItem = 9;
    $rootScope.userData = {
      'role': $rootScope.user.data.role,
      "iconPlus": 'images/modal/icon-plus-' + $rootScope.user.data.role + '.png',
      'iconCamera': 'images/modal/icon-camera-' + $rootScope.user.data.role + '.png',
      'background': $rootScope.user.data.role + '-background',
      'color': $rootScope.user.data.role + '-color',
      'border': $rootScope.user.data.role + '-border',
      'pollBorder':$rootScope.user.data.role + '-poll-border',
      'iconAddButton': 'images/modal/icon-add-button-' + $rootScope.user.data.role + '.png',
      "iconClock": 'images/poll/icon-clock.png',
      "iconExit": 'images/poll/icon-exit.png',
      "iconFlash": 'images/poll/icon-flash.png',
      "iconClockActive": 'images/poll/icon-clock-'+ $rootScope.user.data.role + '.png',
      "iconExitActive": 'images/poll/icon-exit-'+ $rootScope.user.data.role + '.png',
      "iconFlashActive": 'images/poll/icon-flash-'+ $rootScope.user.data.role + '.png',
      "userListBorder": $rootScope.user.data.role + '-userListBorder'
    };

    $scope.selection = {selectedItems: [], currentItem: []};

    $scope.hideCustomButton = true;

    $rootScope.$on('class-data-was-received', function () {
      if(!$rootScope.user.classData.classInArchived){
        $scope.hideCustomButton = false;
      }

      if($rootScope.user.classData.owner === $rootScope.user.data.id) {
        for (var i = 0; i < $scope.contextMenu.items.length; i++) {
          $scope.contextMenu.items[i].active = true;
        }
      }

    });

    $scope.data = {
      'items': [],
      'onGlobalButtonClick': function () {
      }
    };

    $scope.contextMenu = {
      'items': [
        {
          'img': 'images/context_menu/icon-edit-' + $rootScope.user.data.role + '_3x.png',
          'imgDisabled' : 'images/context_menu/icon-edit-default_3x.png',
          'imgHover' : 'images/context_menu/icon-edit-hover_3x.png',
          'state' : false,
          'active': false,
          'text': 'Edit',
          'multiSelect': false,
          'click': $scope.editPoll
        },

        {
          'img': 'images/context_menu/icon-delete-' + $rootScope.user.data.role + '_3x.png',
          'imgDisabled' : 'images/context_menu/icon-delete-default_3x.png',
          'imgHover' : 'images/context_menu/icon-delete-hover_3x.png',
          'state' : false,
          'active': false,
          'text': 'Delete',
          'multiSelect': ['teacher', 'student'],
          'singleSelect': ['teacher', 'student'],
          'click': $scope.deleteArrayOfPolls
          // 'context': $scope.selection.selectedItems
        }
      ]
    };
    $scope.pollsExist = false;
    $scope.pollsNotExist = false;
    $scope.pollList = new Poll();

   ///GET ALL POLL LIST
    $http.get(appSettings.link + 'poll?search=class_id:'+$routeParams.classId)
      .success(function (response) {
        if (response.data.length !==0) {
          console.log("--->", response.data);
          //console.log(response);
          $scope.pollsExist = true;
          $('#poll-loader').hide();
        }
        else {
          $scope.pollsNotExist = true;
          $('#poll-loader').hide();
        }
      })
      .error(function (data) {
        $('#poll-loader').hide();
        $scope.pollsNotExist = true;
        //console.log("Code: " + data.status_code + "; Message: " + data.message);
      });

///////////////////////EVENT LISTENERS///////////////////////////////////////

    $scope.$on('changePoll', function (event, response) {
      //$log.log('update poll:',response);
     //$scope.pollList.nextPage();
      for (var j = 0; j < response.data.data.poll.questions.length; j++) {
        response.data.data.poll.questions[j].userAnswers = []
      }

      $scope.pollList.items.unshift(response.data.data);
      $scope.pollsExist = true;
      $scope.pollsNotExist = false;
    });

    $scope.$on('updatePoll', function (event, data) {
      $log.log('update poll:',data);
      for (var j = 0; j < data.poll.questions.length; j++) {
       data.poll.questions[j].userAnswers = []
      }

      for (var i = 0; i < $scope.pollList.items.length; i++) {
        if($scope.pollList.items[i].poll.id == data.poll.id){
          $scope.pollList.items[i]= data;
        }
      }

      $scope.pollsExist = true;
      $scope.pollsNotExist = false;

      $scope.selection = {selectedItems: [], currentItem: []};
    });

    $scope.$on('DeletePollFromList',function (event,pollId) {

      for(var i=0;i<$scope.pollList.items.length;i++){
        if($scope.pollList.items[i].poll.id===pollId){
          $scope.pollList.items.splice($scope.pollList.items[i],1)
        }
      }
      $scope.selection = {selectedItems: [], currentItem: []};
      $scope.selectionWasChanged();
    });

    ///////////// OPERATIONS WITH POLL ITEMS//////////////////////////////
    $scope.userVoted = function (voters) {
      var isVoted = false;
      for (var i = 0; i < voters.length; i++) {
        var voter = voters[i];
        if (voter.user_id == $rootScope.user.data.id) {
          isVoted = true;
          break;
        }
      }
      return isVoted;
    };

    $scope.formatDataCreate = function(data){
      var localTime  = moment.utc(data.date).toDate();
      return moment(localTime).format("D MMM  H.mm")
    };

    $scope.getFinishTime = function(timeEnd){
      var timeDuration=0;
      var b = moment(new Date());//now
      var a = moment.unix(timeEnd);
      if(a.diff(b, 'weeks')>0){
        timeDuration = a.diff(b, 'weeks') + ' weeks';
      }
      else if(a.diff(b, 'days')>0){
        timeDuration = a.diff(b, 'days')+ ' days'+(a.diff(b, 'hours'))%24+ ' hours';

      }
      else if(a.diff(b, 'hours')>0){
        timeDuration=a.diff(b, 'hours')+ ' hours'+(a.diff(b, 'minutes'))%60+' minutes';
      }
      else if(a.diff(b, 'minutes')>0){
        timeDuration = a.diff(b, 'minutes')+' minutes'
      }
      return timeDuration
    };

    $scope.userAnswers= [];

    $scope.returnAnswerArray = function(array){
      return angular.copy(array)
    };

   /// function return user voted ////
    $scope.VoteButton = function(array,userId){
      var userVoted = true;
      for(var k=0; k<array.length;k++){
        var obj = array[k].answers;
        for(var i=0;i< obj.length; i++){
          if(obj[i].userVoted){
            userVoted = false
          }
        }

      }
      if(userId === $rootScope.user.data.id){
        userVoted = false
      }
      return userVoted
    };


    $scope.pushVoteToServer = function(pollId, poll, index){
      $scope.pushVote = {};
      $scope.pushVote.poll_id = pollId;
      $scope.pushVote.user_id = $scope.user.data.id;
      $scope.pushVote.answers = poll.poll.questions ;

      var array = [];

      for(var i=0; i<poll.poll.questions.length; i++){
        if(poll.poll.questions[i].userAnswers.length===0){
          return
        }
        array =array.concat(poll.poll.questions[i].userAnswers)
      }

      $scope.pushVote.answers= array;

      $http({
        url: appSettings.link + 'poll/vote',
        method: "POST",
        data: $scope.pushVote
      })
        .then(function (response) {

            for (var j = 0; j < response.data.data.poll.questions.length; j++) {
              response.data.data.poll.questions[j].userAnswers = []
            }

            $scope.pollList.items[index] = response.data.data;

          },
          function (response) {

          });
    };

    $scope.deleteArrayOfPolls = function (selectedItems) {
      $log.log("deletePoll", selectedItems);
      $scope.modalContext = {
        'action': 'deleteFiles',
        'actionTitle': 'delete',
        'selection': $scope.selection.selectedItems,
        'current': $scope.selection.currentItem
      };
      $scope.openAreUSureModal('sm');
      $rootScope.$on('deleteFiles', function () {
        $log.log('selectedItems',selectedItems);
        for(var pollId = 0; pollId<selectedItems.length; pollId++){
          $scope.curenItemDeleteId = selectedItems[pollId];
          $log.log('selectedItems', selectedItems[pollId]);
          $http({
            method: 'DELETE',
            url: appSettings.link + 'poll/'+selectedItems[pollId],
            headers: {'Content-Type': 'application/json'},
            data: {
              "id": selectedItems[pollId]
            }
          })
            .success(function (response) {
              $log.log("all good", response);
              $rootScope.$broadcast('DeletePollFromList', $scope.curenItemDeleteId );
            })
            .error(function () {

            })

        }
      })
    };


/////////////////////////OPEN MODAL//////////////////////////////////////
    $ctrl.animationsEnabled = true;

    $ctrl.openModal = function (size, parentSelector) {
      var parentElem = parentSelector ?
        angular.element($document[0].querySelector('.modal-demo ' + parentSelector)) : undefined;

      var modalInstance = $uibModal.open({
        animation: $ctrl.animationsEnabled,
        ariaLabelledBy: 'modal-title',
        ariaDescribedBy: 'modal-body',
        templateUrl: 'components/class/dashboard/polls/pollsModal/pollsModal.html',
        controller: 'pollModalInstanceCtrl',
        controllerAs: '$ctrl',
        size: size,
        appendTo: parentElem,
        resolve: {
          items: function () {
            return $ctrl.items;
          }
        }
      });

    };

    $scope.openAreUSureModal = function (size) {
      var modalInstance = $uibModal.open({
        animation: $ctrl.animationsEnabled,
        templateUrl: 'components/class/dashboard/polls/areUSureModal/areUSureModal.html',
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


    $scope.editPoll = function (poll) {
      var modalInstance = $uibModal.open({
        templateUrl: 'components/class/dashboard/polls/pollsModal/pollsModal.html',
        controller: 'pollModalInstanceCtrl',
        controllerAs: '$ctrl',
        resolve: {
          items: function () {
            //return $ctrl.items;
            return poll;
          }
        }
      });
    };

    $scope.selectionWasChanged = function (id, obj) {
      if(obj.poll.user_id === $rootScope.user.data.id){
      $timeout(function () {

        $scope.contextMenu.items[1].context = $scope.selection.selectedItems;
        if($scope.selection.selectedItems.length === 1) {
          for (var i = 0; i < $scope.contextMenu.items.length; i++){
            $scope.contextMenu.items[i].state = true;

            if($scope.selection.currentItem[0].voted.length===0 || $scope.selection.currentItem[0].voted ===0 ){
              $scope.contextMenu.items[0].state = true;
            }
            else{
              $scope.contextMenu.items[0].state = false;
            }
            $scope.contextMenu.items[0].context =  $scope.selection.currentItem[0];
           // console.log( $scope.selection.currentItem[0])
          }

        } else if($scope.selection.selectedItems.length === 0) {
          for (var i = 0; i < $scope.contextMenu.items.length; i++){
            $scope.contextMenu.items[i].state = false;
          }
        } else {
          $scope.contextMenu.items[0].state = false;
          $scope.contextMenu.items[1].state = true;
        }

      });
    }

      id = '#'+id;

      $('.poll-list').removeClass($rootScope.userData.pollBorder);
      $(id).addClass($rootScope.userData.pollBorder);
      $scope.activePoll = obj;
      $scope.activePoll.voters = "Voters";
      $scope.users.items = $scope.activePoll.poll.participants;
      $rootScope.$broadcast('arrayOfSelectedUsers',$scope.activePoll.poll);
    };

  })

.factory('Poll', function($http, appSettings, $routeParams) {
  var Poll = function() {
    this.items = [];
    this.busy = false;
    this.after = '';
  };

  Poll.prototype.nextPage = function() {
    if (this.busy) return;

    this.busy = true;
    var url = appSettings.link + 'poll?search=class_id:'+$routeParams.classId+"&page="+this.after;
    $http.get(url)
      .success(function(data) {
        if(data.data.length ===0){
          return
        }
      var items = data.data;

      for (var i = 0; i < items.length; i++) {
        var item = items[i];
        for (var j = 0; j < item.poll.questions.length; j++) {
                  item.poll.questions[j].userAnswers = []
                }
        this.items.push(items[i]);

      }
      this.after =data.meta.pagination.current_page+1;
        if(data.meta.pagination.total_pages === data.meta.pagination.current_page){
          $('#user-loader').hide();
          return
        }
      this.busy = false;
        $('#user-loader').hide();
    }.bind(this));
  };

  return Poll;
});
