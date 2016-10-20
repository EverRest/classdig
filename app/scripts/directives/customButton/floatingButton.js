angular.module('classDigApp')
  .controller("myController", function ($scope) {

    var click = function () {
      console.log('ok')
    }

    $scope.data = {
      'items': [
        {
          'img': 'images/banner-01.png',
          'text': 'Positive',
          'click': click
        },
        {
          'img': 'images/banner-01.png',
          'text': 'Add bonus',
          'click': click
        },
        {
          'img': 'images/banner-01.png',
          'text': 'Need work',
          'click': click
        }
      ],
      'onGlobalButtonClick': click
    };


  })

  .directive('customButton', ['$timeout', function ($timeout) {

    return {
      template: " <div  id = 'datalist' ng-show = 'showlist'><ul class = 'custom-button-ul'><li ng-repeat='x in data.items'><div><p class = 'grey-bg'> {{x.text}}</p><button class = 'button-inside' ng-click = x.click()><img src={{x.img}}></button></div></li></ul></div>" + "<button class ='custom_button' ng-click = 'CustomButtonClick()' ><div id = 'rotate_btn'>+</div></button>",
      controller: ['$scope', function ($scope) {

        $scope.showlist = false;
        var rotate = 0;
        $scope.CustomButtonClick = function () {
          if ($scope.data.items.length === 0) {
            $scope.data.onGlobalButtonClick();
          }
          else {

            $scope.showlist = !$scope.showlist;
            if (!$scope.showlist) {
              angular.element('#rotate_btn').animate({
                borderSpacing: 0
              }, {
                step: function (now, fx) {
                  $(this).css('-webkit-transform', 'rotate(' + now + 'deg)');
                },
                duration: 500
              }, 'linear');

            }

            else {
              angular.element('#rotate_btn').animate({
                borderSpacing: 45
              }, {
                step: function (now, fx) {
                  $(this).css('-webkit-transform', 'rotate(' + now + 'deg)');
                },
                duration: 500
              }, 'linear');


            }
          }


        };

      }]
    }
  }])

