'use strict';

angular.module('core').filter('urlencode', [
	function() {
		return function(input) {
			// Urlencode directive logic
			// ...

			return 'urlencode filter: ' + input;
		};
	}
]);
