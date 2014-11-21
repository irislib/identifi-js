'use strict';

angular.module('core').controller('HeaderController', ['$scope', '$location', '$http', 'Authentication', 'Menus', 'Persona',
	function($scope, $location, $http, Authentication, Menus, Persona) {
    Persona.watch({
      loggedInUser: Authentication.user.email,
      onlogin: function(assertion) {
        console.log('login');
        $http.post(
          '/auth/persona', // This is a URL on your website.
          {assertion: assertion}
        ).then(function () {
            // stuff
          });
      },
      onlogout: function() {
        console.log('logout');
      }
    });

    $scope.login = function() {
      Persona.request();
    };

    $scope.logout = function() {
      Persona.logout();
    };

		$scope.authentication = Authentication;
		$scope.isCollapsed = false;
		$scope.menu = Menus.getMenu('topbar');

		$scope.toggleCollapsibleMenu = function() {
			$scope.isCollapsed = !$scope.isCollapsed;
		};

		// Collapsing the menu after navigation
		$scope.$on('$stateChangeSuccess', function() {
			$scope.isCollapsed = false;
		});

    $scope.searchChanged = function() {
      $scope.$root.$broadcast('StartSearch', { queryTerm: $scope.queryTerm });
    };

    $scope.isActive = function(viewLocation) {
        return viewLocation === $location.path();
    };

    $scope.searchKeydown = function(e) {
      $scope.$root.$broadcast('SearchKeydown', { event: e });
    };
	}
]);
