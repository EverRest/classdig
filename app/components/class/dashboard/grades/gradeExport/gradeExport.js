angular.module('classDigApp')
  .controller('gradeExportCtrl', function ($uibModalInstance,$scope, $rootScope, $http, appSettings,$routeParams, $log,_,$uibModal) {
    var $ctrl = this;
    $scope.ExamServerError = false;
    $scope.selection = {selectedItems: [], currentItem: []};
    //
    // $scope.showAssignment=true;
    // $scope.showExam = true;
    // $scope.showProjects = true;

    // $scope.exportItems = [
    //   {
    //     'img':"images/grades/icon-grade-export-all.svg",
    //     'imgActive':"images/grades/icon-grade-export-all-active.svg",
    //     'id':4
    //     //'show': showProjects
    //   },
    //   {
    //     'img':"images/grades/icon-grade-export-assignments.svg",
    //     'imgActive':"images/grades/icon-grade-export-assignments-active.svg",
    //     'id':1,
    //     'show': $scope.showAssignment
    //   },
    //   {
    //     'img':"images/grades/icon-grade-export-exams.svg",
    //     'imgActive':"images/grades/icon-grade-export-exams-active.svg",
    //     'id':2,
    //     'show': $scope.showExam
    //   },
    //   {
    //     'img':"images/grades/icon-grade-export-project.svg",
    //     'imgActive':"images/grades/icon-grade-export-projects-active.svg",
    //     'active':'-active',
    //     'ext':'.svg',
    //     'title': "Grades",
    //     'id': 3,
    //     'show': $scope.showProjects
    //   }
    // ];


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

            console.log(response.data);

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
            }
            else {
              $scope.examNotExist = true;
            }
            $scope.hideLoader = true;
            console.log('gradable.items', response.data);
            $scope.listOfGradableItems = response.data.data;
          for(var i=0; i<$scope.listOfGradableItems.length; i++){
              console.log($scope.listOfGradableItems[i].category);
            if($scope.listOfGradableItems[i].category=="Projects"){
                $scope.showProjects =true;
                $scope.projectsId = $scope.listOfGradableItems[i].id;
            }
            if($scope.listOfGradableItems[i].category=="Exam"){
              $scope.showExam =true;
              $scope.examId = $scope.listOfGradableItems[i].id;
            }
            if($scope.listOfGradableItems[i].category=="Assignment"){
              $scope.showAssignment =true;
              $scope.assignmentId = $scope.listOfGradableItems[i].id;
            }
          }

            $scope.exportItems = [
              {
                'img':"images/grades/icon-grade-export-all.svg",
                'imgActive':"images/grades/icon-grade-export-all-active.svg",
                'imgNotActive':"images/grades/icon-grade-export-all-grey.svg",
                'id':4,
                'show': ($scope.showAssignment && $scope.showExam) || ($scope.showAssignment && $scope.showProjects) || ($scope.showExam && $scope.showProjects)
              },
              {
                'img':"images/grades/icon-grade-export-assignments.svg",
                'imgActive':"images/grades/icon-grade-export-assignments-active.svg",
                'imgNotActive':"images/grades/icon-grade-export-assignments-grey.svg",
                'id':$scope.assignmentId,
                'show': $scope.showAssignment
              },
              {
                'img':"images/grades/icon-grade-export-exams.svg",
                'imgActive':"images/grades/icon-grade-export-exams-active.svg",
                'imgNotActive':"images/grades/icon-grade-export-exams-grey.svg",
                'id':$scope.examId,
                'show': $scope.showExam
              },
              {
                'img':"images/grades/icon-grade-export-project.svg",
                'imgActive':"images/grades/icon-grade-export-projects-active.svg",
                'imgNotActive':"images/grades/icon-grade-export-projects-grey.svg",
                'active':'-active',
                'ext':'.svg',
                'title': "Grades",
                'id': $scope.projectsId,
                'show': $scope.showProjects
              }
            ];
          },
          function (response) {
            $scope.hideLoader = true;
          });
    }
    getListOfGradableItems();


    $scope.cancel = function () {
      $uibModalInstance.dismiss('cancel');
    };

    $scope.hoverIn = function(){
      this.hoverEdit = true;
      console.log(this.hoverEdit)
    };

    $scope.hoverOut = function(){
      this.hoverEdit = false;
    };
    $scope.ok = function () {
      $scope.exportGrades={};
      $scope.exportGrades.types=[];
      $scope.exportGrades.classes=[$routeParams.classId];
      for(var i=0;i<$scope.selection.currentItem.length;i++){
        console.log($scope.selection.currentItem[i]);
        $scope.exportGrades.types.push($scope.selection.currentItem[i].id);
        if($scope.selection.currentItem[i].id===4){
          $scope.exportGrades.types=[1,2,3]
        }
      }

      if($scope.exportGrades.types.length>0){

      var modalInstance = $uibModal.open({
        animation: $ctrl.animationsEnabled,
        templateUrl: 'components/class/dashboard/grades/gradeExport/enterEmail/enterEmail.html',
        controller: 'enterEmailGradeCtrl',
        controllerAs: '$ctrl',
        size:'sm',
        resolve: {
          items: function () {
            return $scope.exportGrades;
          }
        }
      });

      }
      else {
        $scope.typeError = true;
      }
      };

      $scope.hideError = function () {
        $scope.typeError = false;
      }

  });
