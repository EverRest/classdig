angular.module('classDigApp')

  .directive('multiSelect', ['$rootScope' , function ($rootScope, $parse) {
    return {
      restrict: 'EA',

      link: function (scope, element, attributes) {
        element.on('click', function () {

          scope.$apply();
          var index = scope.multiSelectItem.id;
          var position = scope.multiSelectSelection.selectedItems.indexOf(index);
          if (position === -1) {
            scope.multiSelectSelection.selectedItems.push(index);
            scope.multiSelectSelection.currentItem.push(scope.multiSelectItem);
          }
          else {
            scope.multiSelectSelection.selectedItems.splice(position, 1);
            scope.multiSelectSelection.currentItem.splice(position, 1);
          }
          scope.$apply(scope.multiSelectSelection);
          $rootScope.selection = scope.multiSelectSelection.selectedItems;
        })
      },
      scope: {
        multiSelectItem: '=',
        multiSelectSelection: '='
      }

    };

  }]);

