angular.module('classDigApp')
  .directive('colorPicker', ['$timeout', function ($timeout) {
    return {
      scope: {
        selectedColor: "="
      },
      templateUrl: 'scripts/directives/arrayOfColors/ArrayOfColorsTemplate.html',
      controller: ['$scope', function ($scope) {
        $scope.array_of_colors = [
          {
            'color': '#f93640',
            'id': 'f93640',
            'check': 'true'
          }, {
            'color': '#f05e5b',
            'id': 'f05e5b',
            'check': 'false'
          },
          {
            'color': '#f6ad25',
            'id': 'f6ad25',
            'check': 'false'
          },
          {
            'color': '#e9a07b',
            'id': 'e9a07b',
            'check': 'false'
          },
          {
            'color': '#ff731c',
            'id': 'ff731c',
            'check': 'false'
          },
          {
            'color': '#a7687f',
            'id': 'a7687f',
            'check': 'false'
          },
          {
            'color': '#1ea66d',
            'id': '1ea66d',
            'check': 'false'
          },
          {
            'color': '#61ccf7',
            'id': '61ccf7',
            'check': 'false'
          },
          {
            'color': '#0486c7',
            'id': '0486c7',
            'check': 'false'
          },
          {
            'color': '#9541d1',
            'id': '9541d1',
            'check': 'false'
          },
          {
            'color': '#99127e',
            'id': '99127e',
            'check': 'false'
          },
          {
            'color': '#0f2d52',
            'id': '0f2d52',
            'check': 'false'
          }
        ];


        function colorParser(color){
          var newColor = color;
          if((color.length)>7) {
            newColor ='#'+color.slice(3);

            if(newColor == "#ff2641"){
              newColor = '#f93640'
            }
            if(newColor =="#fd585b"){
              newColor = '#f05e5b'
            }

            if(newColor =="#ffaa14"){
              newColor = '#f6ad25'
            }

            if(newColor =="#f29e7a"){
              newColor = '#e9a07b'
            }

            if(newColor =="#ff6d15"){
              newColor = '#ff731c'
            }
            if(newColor =="#ad6780"){
              newColor = '#a7687f'
            }

            if(newColor =="#00a76a"){
              newColor = '#1ea66d'
            }
            if(newColor =="#33cef8"){
              newColor = '#61ccf7'
            }

            if(newColor =="#0088c9"){
              newColor = '#0486c7'
            }
            if(newColor =="#9542d4"){
              newColor = '#9541d1'
            }
            if(newColor =="#a00780"){
              newColor = '#99127e'
            }
            if(newColor =="#002e53"){
              newColor = '#0f2d52'
            }

                }
          return newColor;
        }

        $scope.functionSelectColor = function (color) {
          //angular.element('#color-default').css('display','none');
          $timeout(function () {
            $scope.$apply(function () {
             $scope.selectedColor = color;
              // if ((angular.element(color).attr('check-attr')) === 'false') {
              //   angular.element('[check-attr]').attr('check-attr', 'false');
              //   angular.element('[check-attr=false]').empty();
              //   angular.element(color).append("<div id='check' ><div id = 'check-border' ><div id = 'check-sign'></div></div></div>");
              //   angular.element(color).attr('check-attr', 'true');
              //
              // }
            });
          });
        };
        $timeout(function () {
          $scope.selectedColor = $scope.selectedColor.toLowerCase();
          $scope.selectedColor = (colorParser($scope.selectedColor));
          if($scope.selectedColor =='#f93640'){
            $scope.functionSelectColor("#99127e");
          }
          $scope.functionSelectColor($scope.selectedColor);
        });

      }]
    }
  }]);
