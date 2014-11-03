'use strict';

angular.module('identifi').filter('urlencode', [
	function() {
    return encodeURIComponent;
	}
]);
