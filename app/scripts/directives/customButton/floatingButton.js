angular.module('classDigApp')

  .controller("myBtnController", function ($scope) {

    var click = function () {

    };


    // $(document).ready(function () {
    //   console.log('12321321');
    //   $(document).on('mouseenter', '.button-inside', function () {
    //     console.log('12321321');
    //     $(this).find(".img-hover").show();
    //     $(this).find(".basic-img").hide();
    //   }).on('mouseleave', '.button-inside', function () {
    //     $(this).find(".img-hover").hide();
    //     $(this).find(".basic-img").show();
    //   });
    // });

    // $( ".button-inside" ).hover(
    //   function() {
    //     console.log('12321321');
    //   }, function() {
    //     console.log('------');
    //   }
    // );

    $scope.data = {
      'items': [
        {
          'img': 'images/banner-01_3x.png',
          'text': 'Positive',
          'click': click
        },
        {
          'img': 'images/banner-01_3x.png',
          'text': 'Add bonus',
          'click': click
        },
        {
          'img': 'images/banner-01_3x.png',
          'text': 'Need work',
          'click': click
        }
      ],
      'onGlobalButtonClick': click
    };


  })

  .directive('customButton', ['$timeout', '$rootScope', function ($timeout, $rootScope) {

    return {

      templateUrl: 'scripts/directives/customButton/floatingButtonTemplate.html',
      controller: ['$scope', function ($scope) {
        if($scope.data && $scope.data.hide){
          for(var i = 0; i < $scope.data.hide.length; i++){
            if($scope.data.hide[i] == $rootScope.user.data.role) {
              $scope.dontDisplay = true
            } else {
              $scope.dontDisplay = false
            }
          }
        }
        $scope.showlist = false;
        var rotate = 0;
        $scope.CustomButtonClick = function () {
          if ($scope.data.items.length === 0) {
            $scope.data.onGlobalButtonClick();
          }

          else {
            $scope.showlist = !$scope.showlist;
            if (!$scope.showlist) {
              angular.element('.rotate_btn').animate({
                borderSpacing: 0
              }, {
                step: function (now, fx) {
                  $(this).css('-webkit-transform', 'rotate(' + now + 'deg)');
                },
                duration: 0
              }, 'linear');

            }

            else {
              angular.element('.rotate_btn').animate({
                borderSpacing: 45
              }, {
                step: function (now, fx) {
                  $(this).css('-webkit-transform', 'rotate(' + now + 'deg) translate(0px, 0px)');
                },
                duration: 0
              }, 'linear');


            }
          }


        };

      }]
    }
  }]);

