angular.module('classDigApp')
  .controller('pollModalInstanceCtrl', function ($uibModalInstance, $scope  ,$routeParams, $rootScope,Upload,appSettings,$http, $timeout,$log,items) {

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

    var $ctrl = this;
    $timeout(function () {

      $('.datetimepickerDate').datetimepicker({
        format: 'LL',
        minDate:new Date()
      }).on('dp.change', function (event) {
        $(this).change();
      }).on('dp.show', function(e) {
        $('.bootstrap-datetimepicker-widget .active')
          .addClass('bg-'+$scope.role)
          .css({'border': 'none', color: 'white'});
        $('.bootstrap-datetimepicker-widget .today').toggleClass('' + $scope.role);
      }).val($scope.startDate);


      $('.datetimepickerTime').datetimepicker({
        format: 'LT'
      }).on('dp.change', function (event) {
        $(this).change();
      }).on('dp.show', function(e) {
        $('.bootstrap-datetimepicker-widget .btn-primary')
          .addClass('bg-'+$scope.role).css({'border': 'none'});
        $('.bootstrap-datetimepicker-widget .btn :not(.btn-primary)')
          .addClass('c-'+$scope.role);

      }).val($scope.startTime);

    });
    $scope.startDate = moment().format('LL');
    $scope.startTime = moment().format('LT');
    var currentDate = new Date();

    $scope.createPollModal = true;
    $scope.addVoters = false;


    $scope.anonim = "anonim";
    $scope.multiSelect = "multiSelect";

    $scope.votersOptions = [
      {'id': 12, 'option': 'Students', 'val': -1},
      {'id': 22, 'option': 'Only Students', 'val': 0},
      {'id': 32, 'option': 'Parents', 'val': 0}
    ];

    //INIT DEFAULT VALUE
    if (items === undefined) {
      this.modalConstant = {
        header: "Create Poll",
        buttonSubmit: "ADD POLL"
      };
      $scope.newPoll = {
        'poll': {}
      };
      $scope.newPoll.poll.user_id = $scope.user.data.id;
      $scope.newPoll.poll.class_id = $routeParams.classId;
      $scope.newPoll.poll.multi_select = 1;
      $scope.newPoll.poll.time_frame = currentDate;
      $scope.newPoll.poll.see_result_id = "1";

      $scope.newPoll.voters = [];
      $scope.newPoll.anonim = 1;
      $scope.newPoll.attachments = [];

      $scope.newPoll.poll.time_frame = moment($scope.newPoll.time_frame).format('LL');
      $scope.timeFrame = $scope.newPoll.poll.time_frame;
      $scope.timeFrameTime = moment($scope.newPoll.time_frame).format('LT');
      $scope.newPoll.blocks = [];
      $scope.newPoll.blocks[0] = {
        'answers': [{}, {}],
        'question': ''
      };

    }
    else{
      $scope.newPoll = {
        'poll': {}
      };

      this.modalConstant = {
        header: "Update Poll",
        buttonSubmit: "UPDATE POLL"
      };

      $scope.newPoll.poll = angular.copy(items);
      $scope.newPoll.blocks =angular.copy(items.questions);
      $scope.newPoll.poll.see_result_id = ''+$scope.newPoll.poll.see_result_id;
      $log.log('newPoll',$scope.newPoll);
      var z =  moment.unix($scope.newPoll.poll.time_frame);
      $log.log(z._d);

      $scope.startDate = moment(z._d).format('LL');
      $scope.startTime = moment(z._d).format('LT');
      $scope.timeFrame=$scope.startDate;
      $scope.timeFrameTime=$scope.startTime;

    }


    $scope.addNewQuestion = function(){
      if($scope.newPoll.blocks.length>=14){
        angular.element('.add-new-qwe').css('display','none');
      }
      $scope.newPoll.blocks.push({'answers': [{ }, { }],
        'question':''});
    };


    setTimeout(function () {
      if($scope.newPoll.poll.time_frame) {

        $('.voitingTimeFrame .form-control').val($scope.newPoll.poll.time_frame);
      }
      else{
        var date = new Date();
        // $('.voitingTimeFrame .form-control').val(date.getFullYear()+'-'+date.getMonth()+'-'+date.getDay())
        $('.voitingTimeFrame .form-control').val( moment(date).format("YYYY-MM-DD") ) ;
      }

    },300);

    $scope.onTimeSet = function (newDate, oldDate) {
      $scope.newPoll.poll.time_frame = newDate;
    };

    $scope.addVoteParticipants = function () {
      $scope.createPollModal = true;
      $scope.addVoters = false;

      var array = $.map($scope.selectedUsers, function(value, index) {
        return [value.id];
      });

      $scope.newPoll.voters = array;

    };


    $scope.cancelVoteParticipants = function(){
      $scope.createPollModal = true;
      $scope.addVoters = false;
    };

    $scope.showParticipantsList = function () {
      $scope.createPollModal =false;
      $scope.addVoters = true;
      $scope.userRole = "users";
      $rootScope.$broadcast('userRoleChanged',$scope.userRole);
    };

    $scope.userRole = "users";

    $ctrl.cancel = function () {
      $uibModalInstance.dismiss('cancel');
    };

    $ctrl.ok = function () {
      if (items === undefined) {
        $scope.newPoll.anonim = +(!$scope.newPoll.anonim);
        $scope.newPoll.poll.multi_select = +(!$scope.newPoll.poll.multi_select);
        var timeStampFormat = moment(new Date($scope.timeFrame + ' ' + $scope.timeFrameTime)).utc().unix();
        $scope.newPoll.poll.time_frame = timeStampFormat;
        $http({
          url: appSettings.link + 'poll',
          method: "POST",
          data: $scope.newPoll

        })
          .then(function (response) {
              $uibModalInstance.close();
              $rootScope.$broadcast('changePoll', response);
              $uibModalInstance.close();
            },
            function (response) {
              $scope.formSubmitted = true;
            });
      }
      else{
        $scope.newPoll.anonim = +(!$scope.newPoll.anonim);
        $scope.newPoll.poll.multi_select = +(!$scope.newPoll.poll.multi_select);

        var timeStampFormat = moment(new Date($scope.timeFrame + ' ' + $scope.timeFrameTime)).utc().unix();
        $scope.newPoll.poll.time_frame = timeStampFormat;
        $scope.newPoll.poll.due_date = timeStampFormat;
        for (var p=0; p<$scope.newPoll.blocks.length; p++){
          if($scope.newPoll.blocks[p].image!=null){
            $scope.newPoll.blocks[p].image =  $scope.newPoll.blocks[p].image.id
           // delete $scope.newPoll.blocks[p].image.filename;
            //delete $scope.newPoll.blocks[p].image.link;
          }
        }

        $http({
          url: appSettings.link + 'poll/'+$scope.newPoll.poll.id,
          method: "PUT",
          data: $scope.newPoll

        })
          .then(function (response) {
              $uibModalInstance.close();
              $rootScope.$broadcast('updatePoll', response.data.data);
              $uibModalInstance.close();
            },
            function (response) {
              $scope.formSubmitted = true;
            });
      }
    };
  });

