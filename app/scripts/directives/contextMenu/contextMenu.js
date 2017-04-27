angular.module('classDigApp')

  .directive('contextMenu', ['$timeout', function ($timeout) {
    return {
      templateUrl: 'scripts/directives/contextMenu/contextMenuTemplate.html',
      controller: ['$scope', '$rootScope', function ($scope, $rootScope) {

        $rootScope.userData = {
          'role': $rootScope.user.data.role,
          "iconPlus": 'images/modal/icon-plus-' + $rootScope.user.data.role + '_3x.png',
          'iconCamera': 'images/modal/icon-camera-' + $rootScope.user.data.role + '_3x.png',
          'background': $rootScope.user.data.role + '-background',
          'color': $rootScope.user.data.role + '-color',
          'border': $rootScope.user.data.role + '-border',
          'iconAddButton': '../images/modal/icon-add-button-' + $rootScope.user.data.role + '_3x.png',
          'arrow' : '../images/distinguished/icon-arrow-' + $rootScope.user.data.role + '_3x.png'
        };

        $(document).ready(function () {
          $(document).on('mouseenter', '.context-menu-active', function () {
            $(this).addClass($rootScope.userData.background);
            $(this).find('.context-menu-button-title').addClass($rootScope.userData.color);
            $(this).find('.context-menu-button-title').addClass($rootScope.userData.border);
          }).on('mouseleave', '.context-menu-active', function () {
            $(this).removeClass($rootScope.userData.background);
            $(this).find('.context-menu-button-title').removeClass($rootScope.userData.color);
            $(this).find('.context-menu-button-title').removeClass($rootScope.userData.border);
          });
        });

      }]
    }
  }]);

