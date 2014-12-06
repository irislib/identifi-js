'use strict';

//Setting up route
angular.module('identifiers').config(['$stateProvider',
	function($stateProvider) {
		// Identifiers state routing
		$stateProvider.
		state('search', {
			url: '/',
			templateUrl: 'modules/identifiers/views/list-identifiers.client.view.html'
		}).
		state('createIdentifier', {
			url: '/id/create/:value',
			templateUrl: 'modules/identifiers/views/create-identifier.client.view.html'
		}).
		state('viewIdentifier', {
			url: '/id/:idType/:idValue',
			templateUrl: 'modules/identifiers/views/view-identifier.client.view.html'
		}).
		state('editIdentifier', {
			url: '/id/:idType/:idValue/edit',
			templateUrl: 'modules/identifiers/views/edit-identifier.client.view.html'
		});
	}
]);
