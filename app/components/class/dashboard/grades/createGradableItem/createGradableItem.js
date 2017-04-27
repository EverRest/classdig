angular.module('classDigApp')
  .controller('createGradableItemCtrl', function ($uibModalInstance,$scope, $rootScope, $http, appSettings,$routeParams,items, $log,_, category) {
    var $ctrl = this;
    $scope.ExamServerError = false;

    if (items === undefined) {

      this.modalConstant = {
        header: "Create gradable item",
        buttonSubmit: "CREATE GRADABLE ITEM"
      }
    }

    else{
      $scope.newGradableItem =angular.copy(items);

      this.modalConstant = {
        header: "Update gradable item",
        buttonSubmit: "UPDATE GRADABLE ITEM"
      };

    }

    $scope.options = category;

    $scope.createCategory = function(){
      if($scope.newCategory){
        $http({
          url: appSettings.link + 'category',
          method: "POST",
          data: { 'name': $scope.newCategory}
        })
          .then(function (response) {

              function getListOfCategory(){
                $http({
                  url: appSettings.link + 'category',
                  method: "GET"
                })
                  .then(function (response) {
                      $log.log( 'category!!!!',response.data.data);
                      $scope.optionsList= [];
                      for (var i=0; i<response.data.data.length; i++){
                        $scope.optionsList[i]={};
                        $scope.optionsList[i].id = response.data.data[i].id;
                        $scope.optionsList[i].option = response.data.data[i].name;
                        $scope.optionsList[i].val = response.data.data[i].id;
                      }

                    $scope.options = $scope.optionsList;
                    },
                    function (response) {
                     // console.log('fail category')
                    });
              }
              getListOfCategory();
              $scope.newCategory = undefined;

            },
            function (response) {
              if(response.data.errors.weight[0]){
                $('#server-error-create-item').html(response.data.errors.weight[0]).css({'width':'210px','left':'280px','top':'10px'})
              }
              $log.log(response.data.errors.weight[0]);
              $scope.ExamServerError = true;
            });
      }
    };

    $scope.cancel = function () {
      $uibModalInstance.dismiss('cancel');
    };

    $scope.ok = function (valid) {
      if(valid){
        return
      }
      if(isNaN(+$scope.newGradableItem.max_grade)){
        $scope.maxGradeIsNumb = true;
        return
      }
      if(isNaN(+$scope.newGradableItem.weight)){
        $scope.weightIsNumb = true;
        return
      }

      if(items === undefined) {
         $scope.newGradableItem.class_id = $routeParams.classId;
         $scope.newGradableItem.max_grade = +$scope.newGradableItem.max_grade;
         $scope.newGradableItem.weight = +$scope.newGradableItem.weight;
         $http({
           url: appSettings.link + 'gradable/item',
           method: "POST",
           data: $scope.newGradableItem
         })
           .then(function (response) {
               $uibModalInstance.close();
              $rootScope.$broadcast('createNewGradableItem', response.data.data);
             },
             function (response) {
               var obj = response.data.errors;
               var error_message = obj[Object.keys(obj)[0]];
               $('#server-error-create-item').html(error_message).css({'width':'210px','left':'280px','top':'10px'});

               // if(response.data.errors.weight[0]){
               //   $('#server-error-create-item').html(response.data.errors.weight[0]).css({'width':'210px','left':'280px','top':'10px'})
               // }
               $log.log(response.data.errors.weight[0]);
               $scope.ExamServerError = true;
             });
       }

       else{
        $scope.newGradableItem.max_grade = +$scope.newGradableItem.max_grade;
        $scope.newGradableItem.weight = +$scope.newGradableItem.weight;
        $http({
          url: appSettings.link + 'gradable/item/'+$scope.newGradableItem.id,
          method: "PUT",
          data: $scope.newGradableItem
        })
          .then(function (response) {
              $uibModalInstance.close();
              $rootScope.$broadcast('updateGradableItem', response.data.data);
            },
            function (response) {
              if(response.data.errors.weight[0]){
                $('#server-error-create-item').html(response.data.errors.weight[0]).css({'width':'210px','left':'280px','top':'10px'})
              }
              $log.log(response.data.errors.weight[0]);
              $scope.ExamServerError = true;
            });
       }

    };
  });
