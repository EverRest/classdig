angular.module('classDigApp')
  .controller('paymentModalCtrl', function ($uibModalInstance,$scope, $rootScope, $http, appSettings,$routeParams, $log,_,items,$uibModal) {
    var $ctrl = this;
    $scope.ExamServerError = false;
    $scope.afterDiscount='$$$';
    $scope.paymentData=angular.copy(items);
    $scope.showPaymentCode=false;

    $scope.$watch('amountOfTeacher',function () {
      $scope.amountOfTeacher=+$scope.amountOfTeacher;
      if($scope.amountOfTeacher>40) {
        $scope.afterDiscount = Math.round(29.99*$scope.amountOfTeacher*50)/100;
        $scope.price = $scope.afterDiscount;
        $scope.afterDiscount='$'+ $scope.afterDiscount
      }
      else if($scope.amountOfTeacher>30) {
        $scope.afterDiscount = Math.round(29.99*$scope.amountOfTeacher*60)/100;
        $scope.price = $scope.afterDiscount;
        $scope.afterDiscount='$'+ $scope.afterDiscount
      }
      else if($scope.amountOfTeacher>24) {
        $scope.afterDiscount = Math.round(29.99*$scope.amountOfTeacher*70)/100;
        $scope.price = $scope.afterDiscount;
        $scope.afterDiscount='$'+ $scope.afterDiscount
      }
      else if($scope.amountOfTeacher>0){
        $scope.afterDiscount = Math.round(29.99*$scope.amountOfTeacher*100)/100;
        $scope.price = $scope.afterDiscount;
        $scope.afterDiscount='$'+ $scope.afterDiscount
      }
    });

    $scope.cancel = function () {
      $uibModalInstance.dismiss('cancel');
    };

    $scope.ok = function (valid) {
      var $form = $('#payment-form');

      if(isNaN($scope.amountOfTeacher) && $scope.paymentData.cummon){
        $form.find('.payment-errors').text('Please enter amount of teacher');
        return
      }
      if($scope.schoolName===undefined && $scope.paymentData.cummon){
        $form.find('.payment-errors').text('Please enter school name');
        return
      }
      $('#payment-form').css('opacity',0.6);
      $('#user-loader').show();
      Stripe.card.createToken($form,stripeResponseHandler);
      };

      $scope.hideError = function () {
        $scope.typeError = false;
      };

    function stripeResponseHandler(status, response) {
      // Grab the form:
      var $form = $('#payment-form');

      if (response.error) {
        // Show the errors on the form:
        $form.find('.payment-errors').text(response.error.message);
        $form.find('.submit').prop('disabled', false);
        $('#user-loader').hide();
        $('#payment-form').css('opacity',1);
      } else {


        // Token was created! Get the token ID:
        var token = response.id;
        $scope.sendDataToServer={};
        $scope.sendDataToServer.token=token;
        if($scope.paymentData.cummon){
          $scope.sendDataToServer.period=2;
          $scope.sendDataToServer.price=$scope.price;
          $scope.sendDataToServer.discount=$scope.paymentData.discount;
          $scope.sendDataToServer.school_name=$scope.schoolName;
          $scope.sendDataToServer.persons = $scope.amountOfTeacher;
        }
        else{
          $scope.sendDataToServer.period=$scope.paymentData.period;
          $scope.sendDataToServer.price=$scope.paymentData.money;
        }
        getPremiumCode($scope.sendDataToServer);

      }
    }


    function getPremiumCode(payData) {
      $http({

        url: appSettings.link + 'stripe/pay',
        method: "POST",
        headers: {'Content-Type': 'application/json'},
        data: payData
      })
        .then(function (response) {
            $scope.premiumCode=response.data.data.code;
          $scope.showPaymentCode=true;
            $('#user-loader').hide();
            $('#payment-form').css('opacity',1);
            $('#congratulation-form').animate({opacity:'1'},"slow");
          },
          function (response) {
            $scope.premiumCode='fail';
            $('#user-loader').hide();
            $('#payment-form').css('opacity',1);
          });
    }

  });



