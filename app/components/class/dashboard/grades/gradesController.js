app.controller('gradesController',
  ['$scope',
    '$rootScope',
    '$uibModal',
    '$routeParams',
    '$log',
    '$http',
    'appSettings',
    '$timeout',function ($scope, $rootScope,$uibModal,$routeParams,$log,$http,appSettings,$timeout) {
    var $ctrl = this;

    $scope.role = $rootScope.user.data.role;

    $ctrl.animationsEnabled = true;
    $rootScope.activeClassItem = 4;
    $scope.hideCustomButton = true;
    $rootScope.userData = {
      'role': $rootScope.user.data.role,
      "iconPlus": 'images/modal/icon-plus-' + $rootScope.user.data.role + '_3x.png',
      'iconCamera': 'images/modal/icon-camera-' + $rootScope.user.data.role + '_3x.png',
      'background': $rootScope.user.data.role + '-background',
      'color': $rootScope.user.data.role + '-color',
      'border': $rootScope.user.data.role + '-border',
      'iconAddButton': 'images/modal/icon-add-button-' + $rootScope.user.data.role + '_3x.png'
    };


    $rootScope.$on('class-data-was-received', function () {
      if(!$rootScope.user.classData.classInArchived){
        $scope.hideCustomButton = false;
      }
      if($rootScope.role === 'student' && $rootScope.user.classData.owner !== $rootScope.user.data.id){
        $scope.hideCustomButton = true;
      }

      if (Array.isArray($rootScope.user.classData.members)) {
        $scope.arrayOfChildrenId = [];
        var pickedName = $rootScope.user.classData.members[0].first_name;
        $scope.pickedChildId = $rootScope.user.classData.members[0].id;
        for (var i = 0; i < $rootScope.user.classData.members.length; i++) {
          $scope.arrayOfChildrenId.push($rootScope.user.classData.members[i].first_name);
        }
        $timeout(function () {
          $scope.childName = pickedName;
          $scope.changeChildren($scope.childName);
        });
      }
    });

    $rootScope.$on('createNewGradableItem',function (ev,data) {
      $scope.listOfGradableItems.unshift(data);
      getListOfGrades();
    });

    ////////////////////////////////////////////

    $rootScope.$on('updateGradableItem', function(event,data){
      for( var i=0;i<$scope.listOfGradableItems.length;i++){
        if($scope.listOfGradableItems[i].id === data.id){
          $scope.listOfGradableItems[i]=data;
        }
      }
    });
    $scope.data = {
      'items': [],
      'onGlobalButtonClick': function () {
      }

    };

    $scope.mouseOverItem = function () {
      this.grade.class = "grey-td-background";
      console.log(this);
    };

    $scope.mouseOverItem = function () {
      this.grade.class = true;
    };

    $scope.mouseLeaveItem = function () {
      this.grade.class = false;
    };
    $scope.calculateTotalMark = function (member) {
      var newTotal = member.total;
      if(member.bonus_mark){
        newTotal = newTotal+member.bonus_mark;
        if( newTotal>100){
          newTotal=100;
        }
      }
      return newTotal
    };

    getStudents ();
    function getStudents () {
      $http.get(appSettings.link + 'class/' + $routeParams.classId + '/list/users')
        .success(function (response) {
              $scope.listOfStudents =response.data;

        })
        .error(function (data) {
         // console.log("Code: " + data.status_code + "; Message: " + data.message);
        });
    }


    getListOfGrades();
    function getListOfCategory(){
      $http({
        url: appSettings.link + 'category',
        method: "GET"
      })
        .then(function (response) {
            $scope.optionsList= [];
            for (var i=0; i<response.data.data.length; i++){
              $scope.optionsList[i]={};
              $scope.optionsList[i].id = response.data.data[i].id;
              $scope.optionsList[i].option = response.data.data[i].name;
              $scope.optionsList[i].val = response.data.data[i].id;
            }


          },
          function (response) {

          });
    }
    getListOfCategory();

    function getListOfGradableItems(){
      $http({
        url: appSettings.link + 'gradable/item?search=class_id:' + $routeParams.classId,
        method: "GET"
      })
        .then(function (response) {
          $log.log(response.data);
            $scope.listOfGradableItems = response.data.data;



            //console.log($scope.listOfGradableItems);
            $('#user-loader').hide();
            if (response.data.data.length !== 0) {
              $scope.examExist = true;
              if($scope.listOfGradableItems.length) {
                $( ".add-gradable-items-button" ).hover(function() {
                  $( '.grades-hint').css('display','block');
                }, function() {
                  $( '.grades-hint').css('display','none');
                });
              }
            }
            else {
              $scope.examNotExist = true;
            }
            $scope.hideLoader = true;
          },
          function (response) {
            $scope.hideLoader = true;
          });
    }

    getListOfGradableItems();

    function getListOfGrades(){
      $http({
        url: appSettings.link + 'class/' + $routeParams.classId+'/grades',
        method: "GET"
      })
        .then(function (response) {
            $log.log('listOfGrades',response);
            $scope.listOfGrades = response.data.data;

            for(var j=0; j<$scope.listOfGrades.length; j++){
             // console.log($scope.listOfGrades[j]);
              $scope.listOfGrades[j].total=Math.round($scope.listOfGrades[j].total)
            }
          if($scope.userData.role ==='student'){
            for(var i=0; i<$scope.listOfGrades.length; i++){
              if($scope.listOfGrades[i].user.id===$rootScope.user.data.id){
                $log.log('current list',$scope.listOfGrades[i]);
                $scope.currentUserListOfGrades = $scope.listOfGrades[i]
              }
            }
          }
            $('#user-loader').hide();
            if (response.data.data.length !== 0) {
              $scope.examExist = true;
            }
            else {
              $scope.examNotExist = true;
            }

            $scope.categoryIndex=0;

            var categoriesArray = _.keys($scope.listOfGrades[0].items);
            //console.log(categoriesArray);
            $scope.itemKey = categoriesArray[$scope.categoryIndex];
            $scope.calcmainSectionWidth = (68*$scope.listOfGrades[0].items[$scope.itemKey].length);
            $scope.calcmainContainerWidth = 447+200+125;
            $('.mainContainerWidth').css('width',$scope.calcmainContainerWidth);

          $scope.hideLoader = true;
          },
          function (response) {
            $scope.hideLoader = true;
          });
    }

    getListOfGrades();

    /////////////////SHOW DIFFERENT PART OF GRADES dynamic///////////////////////////

    $scope.functionNextCategory = function(obj){
      var categoriesArray = _.keys(obj);
      if($scope.categoryIndex<categoriesArray.length-1) {
        $scope.categoryIndex++;
        $scope.itemKey = categoriesArray[$scope.categoryIndex];
        $scope.calcmainSectionWidth = (68 * $scope.listOfGrades[0].items[$scope.itemKey].length);
      }
    };

    $scope.functionPreviousCategory = function(obj){
      if($scope.categoryIndex>0) {
        var categoriesArray = _.keys(obj);
        $scope.categoryIndex--;
        $scope.itemKey = categoriesArray[$scope.categoryIndex];
        $scope.calcmainSectionWidth = (68 * $scope.listOfGrades[0].items[$scope.itemKey].length);
      }
    };

    /////////////////SHOW DIFFERENT PART OF GRADES///////////////////////////

    $scope.checkSumItemWeight = function () {
      var weightSum=0;
      var isMore = true;
      if($scope.listOfGradableItems){
      for( var i=0;i<$scope.listOfGradableItems.length;i++){
        weightSum+=$scope.listOfGradableItems[i].weight;
      }
      if(weightSum===100){
        isMore = false;
      }
      }
      return isMore
    };

    $scope.createGradableItem = function(){
        var modalInstance = $uibModal.open({
          animation: $ctrl.animationsEnabled,
          ariaLabelledBy: 'modal-title',
          ariaDescribedBy: 'modal-body',
          templateUrl: 'components/class/dashboard/grades/createGradableItem/createGradableItem.html',
          controller: 'createGradableItemCtrl',
          controllerAs: '$ctrl',
          resolve: {
            items: function () {
              return $ctrl.items;
            },
            category: function () {
              return $scope.optionsList;
            }

          }
        });
      };

    $scope.updateGradableItem = function (item) {
      var modalInstance = $uibModal.open({
        animation: $ctrl.animationsEnabled,
        templateUrl: 'components/class/dashboard/grades/createGradableItem/createGradableItem.html',
        controller: 'createGradableItemCtrl',
        controllerAs: '$ctrl',
        resolve: {
          items: function () {
            return item
          },
          category: function () {
            return $scope.optionsList;
          }
        }
      });
    };

    $scope.CreateNewGrade = function (id, userId, member) {
      $scope.maxGrade = member.max_grade;
      if(this.grade.mark===null){
        $scope.newGrade = this.grade;
        if($('#'+id).html()!=='-'){
          return
        }

        var input_field = '<input type="number" min="0" id="newMark">';
        $('#'+id).html(input_field);
        $('#newMark').attr('placeholder',$scope.maxGrade);

        $('#newMark').focus();
          $('#newMark').blur(function()	{
            var val = $(this).val();
            if(val===''){
              $(this).parent().empty().html('-');
              return
            }
            $(this).parent().empty().html(val);
            $scope.newGrade.mark = val;
            $scope.newGrade.class_id = $routeParams.classId;
            $scope.newGrade.user_id = userId;
            $http({
              url: appSettings.link + 'grade',
              method: "POST",
              data: $scope.newGrade
            })
              .then(function (response) {
                  getListOfGrades();
                },
                function (response) {
                  $log.log(response);
                });
          });
      }

      else{
        $scope.updateGrade = this.grade;
        if(+$('#'+id).html()==NaN ){
          return
        }

        var input_field = '<input type="number" min="0" id="newMark">';
        $('#'+id).html(input_field);
        $('#newMark').attr('placeholder',$scope.maxGrade);
        $('#newMark').focus();
        $('#newMark').blur(function()	{
          var val = $(this).val();
          if(val===''){
            $(this).parent().empty().html('-');
            $http({
              url: appSettings.link + 'grade/'+$scope.updateGrade.grade_id,
              method: "DELETE",
              data: $scope.updateGrade.grade_id
            })
              .then(function (response) {
                  getListOfGrades();
                },
                function (response) {
                 // $log.log(response);
                });

            return
          }
          $(this).parent().empty().html(val);
          $scope.updateGrade.mark = val;
          $scope.updateGrade.class_id = $routeParams.classId;
          $scope.updateGrade.user_id = userId;
          $http({
            url: appSettings.link + 'grade/'+$scope.updateGrade.grade_id,
            method: "PUT",
            data: $scope.updateGrade
          })
            .then(function (response) {
                getListOfGrades();
              },
              function (response) {
                //$log.log(response);
              });
         });
      }

    };


    $scope.changeChildren = function (name) {
      $scope.childName = name;
      $scope.countClass = 0;
      angular.element('.children').css('border-bottom', '2px solid white');
      angular.element('#' + name).css('border-bottom', '2px solid rgb(207, 81, 93)');
      for (var i = 0; i < $rootScope.user.classData.members.length; i++) {
        if ($rootScope.user.classData.members[i].first_name == $scope.childName) {
          var pickedName = $scope.childName;
          $scope.pickedChildId = $rootScope.user.classData.members[i].id;
          $scope.pickedChild = $rootScope.user.classData.members[i];
          for(var i=0; i<$scope.listOfGrades.length; i++) {
            if ($scope.listOfGrades[i].user.id === $scope.pickedChildId) {
              $log.log('current list', $scope.listOfGrades[i]);
              $scope.currentUserListOfGrades = $scope.listOfGrades[i]
            }
          }

        }
      }
    };


    $scope.fixedHeight = ($('.class-menu-item-block-center').outerHeight()-$('.table-fixed-header').outerHeight())+'px';

    //////////////// Listeners for scroll////////////

    var container = $('.container');
    var topscroll = $('.topscroll');
    var centerscroll = $('.centerscroll');


    topscroll.scroll(function(e){
      container.addClass('hideScroll');
      container.scrollTop($(this).scrollTop());
      centerscroll.scrollTop($(this).scrollTop());

      return false;
    });
    container.scroll(function(e){
      container.addClass('hideScroll');
      topscroll.scrollTop($(this).scrollTop());
      centerscroll.scrollTop($(this).scrollTop());

      return false;
    });
    centerscroll.scroll(function(e){
      container.addClass('hideScroll');
      topscroll.scrollTop($(this).scrollTop());
      container.scrollTop($(this).scrollTop());
      return false;
    });

    var headerGradeScroll = $('.headerGradeScroll');
    var tableGradeScroll = $('.tableGradeScroll');

    headerGradeScroll.scroll(function(e){
      tableGradeScroll.scrollLeft($(this).scrollLeft());
      if(container.hasClass('hideScroll')){
        container.deleteClass('hideScroll');
      }
      return false;
    });
    tableGradeScroll.scroll(function(e){
      headerGradeScroll.scrollLeft($(this).scrollLeft());
      if(container.hasClass('hideScroll')){
        container.deleteClass('hideScroll');
      }
      return false;
    });
//////////////////////////////////////////////////

    $scope.gradeExport = function () {
      var modalInstance = $uibModal.open({
        animation: $ctrl.animationsEnabled,
        templateUrl: 'components/class/dashboard/grades/gradeExport/gradeExport.html',
        controller: 'gradeExportCtrl',
        controllerAs: '$ctrl'
      });
    };

    $scope.restoreChanges=function () {
      $http({
        url: appSettings.link + 'grade-restore/'+$routeParams.classId,
        method: "PUT"
      })
        .then(function (response) {
            getListOfGrades();
          },
          function (response) {
            $log.log(response);
          });
    };

    $(document).ready(function () {
      $(document).on('mouseenter', '.button-inside', function () {
        $(this).find(".img-hover").show();
      }).on('mouseleave', '.button-inside', function () {
        $(this).find(".img-hover").hide();
      });
    });

    if($scope.checkSumItemWeight()){
     // console.log('created');
      $scope.data = {
        'items': [
          {
            'img': 'images/feed/icon-export.svg ',
            'imgHover': 'images/hover_img/restore.png',
            'text': 'Restore changes',
            'click': $scope.restoreChanges
          },
          {
            'img': 'images/feed/icon-restore-changes.svg',
            'imgHover': 'images/hover_img/export.png',
            'text': 'Export',
            'click': $scope.gradeExport
          }
        ],
        'onGlobalButtonClick': ''
      };
    }

  }]);



