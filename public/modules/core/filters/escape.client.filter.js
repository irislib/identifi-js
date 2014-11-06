'use strict';

angular.module('identifi').filter('escape', [
	function() {
    return function(input) {
      return encodeURIComponent(encodeURIComponent(input));
    };
	}
]);
