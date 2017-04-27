angular.module('classDigApp')
  .controller('announcmentsController',['$scope', '$rootScope', '$uibModal', '$log', '$document', 'appSettings', '$http', '$routeParams', 'Announcement', '$timeout', '$q', function ($scope, $rootScope, $uibModal, $log, $document,appSettings, $http, $routeParams, Announcement,$timeout, $q) {

    var $ctrl = this;
    $rootScope.activeClassItem = 11;
    $rootScope.userData = {
      'role': $rootScope.user.data.role,
      'background': $rootScope.user.data.role + '-background',
      'color': $rootScope.user.data.role + '-color',
      'border': $rootScope.user.data.role + '-border',
      "userListBorder": $rootScope.user.data.role + '-userListBorder',
      'announcementPage':$rootScope.user.data.role + '-announcement-page',
      'pollBorder':$rootScope.user.data.role + '-poll-border'
    };

    $scope.selection = {selectedItems: [], currentItem: []};
    // $scope.selection.selectedItems = [];
    // $scope.selection.currentItem = [];

    $scope.announcementPage = $rootScope.user.data.role + '-announcement-page';

    $scope.hideCustomButton = true;
    $rootScope.$on('class-data-was-received', function () {
      if(!$rootScope.user.classData.classInArchived){
        $scope.hideCustomButton = false;
      }
      if($rootScope.role === 'student' && $rootScope.user.classData.owner !== $rootScope.user.data.id){
        $scope.hideCustomButton = true;
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
          'active': true,
          'text': 'Edit',
          'multiSelect': false,
          'click': $scope.editAnnouncement
        },

        {
          'img': 'images/context_menu/icon-delete-' + $rootScope.user.data.role + '_3x.png',
          'imgDisabled' : 'images/context_menu/icon-delete-default_3x.png',
          'imgHover' : 'images/context_menu/icon-delete-hover_3x.png',
          'state' : false,
          'active': true,
          'text': 'Delete',
          'multiSelect': ['teacher', 'student'],
          'singleSelect': ['teacher', 'student'],
          'context': $scope.selection.selectedItems,
          'click': $scope.deleteArrayOfAnnouncements

        }
      ]
    };

    $scope.pollsExist = false;
    $scope.pollsNotExist = false;
    $scope.announcementList = new Announcement();

   ///GET ALL POLL LIST
    function getListOfAnnouncements(){
    $http.get(appSettings.link + 'announcement?search=class_id:'+$routeParams.classId)
      .success(function (response) {
        if (response.data.length !==0) {
          $scope.pollsExist = true;
          $('#announcement-loader').hide();
        }
        else {
          $scope.pollsNotExist = true;
          $('#announcement-loader').hide();
        }
      })
      .error(function (data) {
        $scope.pollsNotExist = true;
        $('#announcement-loader').hide();
       // console.log("Code: " + data.status_code + "; Message: " + data.message);
      });
    }
    getListOfAnnouncements();
//////////////////////////////////////////////////////////////

    $scope.formatDataCreate = function(data){
      return moment(data).format("D MMM H.mm");
    };


    // $scope.$on('deleteFromAnnouncementList',function (event,pollId) {
    //   $log.log('--lll---',$scope.announcementList.items);
    //   $log.log('--pollId---',pollId);
    //   for(var i=0;i<$scope.announcementList.items.length;i++){
    //     if($scope.announcementList.items[i].id===pollId){
    //       $scope.announcementList.items.splice($scope.announcementList.items[i],1)
    //     }
    //   }
    //   $scope.selection = {selectedItems: [], currentItem: []};
    //   console.log("--->", $scope.selection);
    // });


    $rootScope.$on('deleteFromAnnouncementList',function req(event,arrOfId) {
      $log.log('--lll---',$scope.announcementList.items);
      $log.log('--pollId---',arrOfId);
      $rootScope.$$listeners['deleteFromAnnouncementList'] = [req];

      for(var q = 0; q < arrOfId.length; q++){
        for(var i=0;i<$scope.announcementList.items.length;i++){
          if($scope.announcementList.items[i].id===arrOfId[q]){
            $scope.announcementList.items.splice($scope.announcementList.items[i],1)
          }
        }
      }
      // $scope.selection = {selectedItems: [], currentItem: []};
      $scope.selection.selectedItems = [];
      $scope.selection.currentItem = [];
      // console.log("--->", $scope.selection);
      console.log($rootScope.$$listeners['deleteFromAnnouncementList']);

      // $rootScope.$$listeners['deleteFromAnnouncementList'].splice(0, 1);

    });



    $ctrl.animationsEnabled = true;

    $ctrl.openModal = function (size, parentSelector) {
      var parentElem = parentSelector ?
        angular.element($document[0].querySelector('.modal-demo ' + parentSelector)) : undefined;

      var modalInstance = $uibModal.open({
        animation: $ctrl.animationsEnabled,
        ariaLabelledBy: 'modal-title',
        ariaDescribedBy: 'modal-body',
        templateUrl: 'components/class/dashboard/announcments/announcementsModal/announcementsModal.html',
        controller: 'announcementsModalInstanceCtrl',
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
        templateUrl: 'components/class/dashboard/announcments/areUSureModal/areUSureModal.html',
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

    $scope.editAnnouncement = function (announcement) {
      $log.log(announcement);
      var modalInstance = $uibModal.open({
        animation: $ctrl.animationsEnabled,
        templateUrl: 'components/class/dashboard/announcments/announcementsModal/announcementsModal.html',
        controller: 'announcementsModalInstanceCtrl',
        controllerAs: '$ctrl',
        resolve: {
          items: function () {
            return announcement
          }
        }
      });
    };

    $rootScope.$on('announcement-changed', function () {
      $scope.announcementList.reinitialize();
      // $scope.selection = {selectedItems: [], currentItem: []};
      $scope.selection.selectedItems = [];
      $scope.selection.currentItem = [];
      $scope.activeAnnouncement = null;
      $scope.contextMenu.items[0].state = false;
      $scope.contextMenu.items[1].state = false;
      $scope.showButtonSelection = false;
    });

    $scope.activateAnnouncement = function(id){
      id = '#'+id;
      $('.poll-list').removeClass($rootScope.userData.pollBorder);
      $(id).addClass($rootScope.userData.pollBorder);
      // $scope.activeAnnouncement = obj;
      // $scope.activeAnnouncement.seem_by= "Seen by";
      // $rootScope.$broadcast('arrayOfSeenBy',$scope.activeAnnouncement);
    };

    $scope.deleteArrayOfAnnouncements = function (ar) {

      $scope.deletingInProgress = true;

      $scope.modalContext = {
        'action': 'deleteAnnouncements',
        'actionTitle': 'delete'
      };

      $scope.openAreUSureModal('sm');

      $rootScope.$on('deleteAnnouncements', function () {
        if ($scope.deletingInProgress) {
          $scope.deletingInProgress = false;
          $log.log('selectedItems', ar);

          $scope.promises = [];

          for (var i = 0; i < ar.length; i++) {

            $scope.promises.push($http({
              method: 'DELETE',
              url: appSettings.link + 'announcement/' + ar[i],
              headers: {'Content-Type': 'application/json'},
              data: {
                "id": ar[i]
              }
            }));




            // $http({
            //   method: 'DELETE',
            //   url: appSettings.link + 'announcement/' + ar[i],
            //   headers: {'Content-Type': 'application/json'},
            //   data: {
            //     "id": ar[i]
            //   }
            // })
            //   .success(function (response) {
            //     $log.log("all good", response);
            //     // $scope.announcementList.reinitialize();
            //   })
            //   .error(function () {
            //
            //   });
          }
          console.log($scope.promises);
          $q.all($scope.promises).then(function () {
            console.log('all resolved');
            // $timeout(function () {
            //   $scope.announcementList.reinitialize();
            // })
            // $scope.announcementList.reinitialize();
            $rootScope.$broadcast('deleteFromAnnouncementList', ar);

          })
        }
      });

    };

    $scope.$on('createAnnouncement', function (event, response) {
      $log.log('createAnnouncement:',response);
      // $scope.announcementList.items.unshift(response);
      $scope.pollsExist = true;
      $scope.pollsNotExist = false;
      $scope.announcementList.reinitialize();

    });

    $scope.selectionWasChanged = function () {
      $timeout(function () {

        console.log('sel - >', $scope.selection.currentItem[0], $scope.selection.selectedItems);


        if($scope.selection.currentItem[0]) {
          $scope.activeAnnouncement = $scope.selection.currentItem[0];
          $scope.activeAnnouncement.seem_by= "Seen by";
          $rootScope.$broadcast('arrayOfSeenBy',$scope.activeAnnouncement);
        }

        if($scope.selection.currentItem[0]) {
          $scope.showButtonSelection = true;
        } else {
          $scope.showButtonSelection  = false;
        }

        if($scope.selection.selectedItems.length === 1) {
          for (var i = 0; i < $scope.contextMenu.items.length; i++){
            $scope.contextMenu.items[i].state = true;

            if($scope.selection.currentItem[0].seen_by.length===0 ){
              $scope.contextMenu.items[0].state = true;
            }
            else{
              $scope.contextMenu.items[0].state = false;
            }
            $scope.contextMenu.items[0].context =  $scope.selection.currentItem[0];

          }

        } else if($scope.selection.selectedItems.length === 0) {
          for (var i = 0; i < $scope.contextMenu.items.length; i++){
            $scope.contextMenu.items[i].state = false;
          }
        } else {
          $scope.contextMenu.items[0].state = false;
          $scope.contextMenu.items[1].state = true;
        }
      })
    };

    ///////////See first elements in list///////////////////////
    var startIterator=0;
   $(document).ready(function(){
      $('#announcementList').bind('scroll',chk_scroll);
      $timeout(function CheckFirstElements() {
        var bottomPosition =$('#announcementList').height();
        for (var i=0;i<$scope.announcementList.items.length;i++){
          var id='#'+i;
          var elementPosition = $(id).offset().top+$(id).height()-$('#announcementList').offset().top;
          if(elementPosition<bottomPosition){
            startIterator = i;
            if(checkSeenByUser($scope.announcementList.items[i].seen_by)==='notSeen'){
              $http({
                url: appSettings.link + 'announcement/'+$scope.announcementList.items[i].id,
                method: "POST"
              })
                .then(function (response) {

                  },
                  function (response) {

                  });
            }
          }
          else{
            return
          }
        }
      },8000);

   });

    function checkSeenByUser(array){
      var seen = 'notSeen';
      for (var j=0;j<array.length; j++){
        if (array[j].id === $rootScope.user.data.id){
          seen = 'seen';
        }
      }
      return seen
    }

    function chk_scroll(e) {
      var bottomPosition =$('#announcementList').height();
      for (var i=startIterator;i<$scope.announcementList.items.length;i++){
        var id='#'+i;
        var topPosition = $('#announcementList').offset().top;
        var elementPosition = $(id).offset().top+$(id).height()-$('#announcementList').offset().top;
        if(elementPosition<bottomPosition && checkSeenByUser($scope.announcementList.items[i].seen_by)==='notSeen' && !($scope.announcementList.items[i].seen==='ok')){
          //console.log('elem'+i + 'seen',$scope.announcementList.items[i]);
          var announcementId = $scope.announcementList.items[i].id;
          $scope.announcementList.items[i].seen='ok';

          $http({
            url: appSettings.link + 'announcement/'+$scope.announcementList.items[i].id,
            method: "POST"
          })
            .then(function (response) {


              },
              function (response) {

              });
        }
      }
    }

  }])

.factory('Announcement', function($http, appSettings, $routeParams) {
  var Announcement = function() {
    this.items = [];
    this.busy = false;
    this.after = '';
  };

  Announcement.prototype.reinitialize = function () {
    this.items = [];
    this.busy = false;
    this.after = '';
    this.nextPage();
  };

  Announcement.prototype.nextPage = function() {
    if (this.busy) return;

    this.busy = true;
    $('#announcement-loader').show();
    var url = appSettings.link + 'announcement?search=class_id:'+$routeParams.classId+"&page="+this.after;
    $http.get(url)
      .success(function(data) {
        if(data.data.length ===0){
          return
        }
      var items = data.data;
      for (var i = 0; i < items.length; i++) {
        var item = items[i];
        this.items.push(items[i]);

      }
      this.after =data.meta.pagination.current_page+1;
        if(data.meta.pagination.total_pages === data.meta.pagination.current_page){
          $('#announcement-loader').hide();
          return
        }
        $('#announcement-loader').hide();
        this.busy = false;

    }.bind(this));
  };

  return Announcement;
});


