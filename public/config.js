'use strict';

// Init the application configuration module for AngularJS application
var ApplicationConfiguration = (function() {
	// Init module configuration options
	var applicationModuleName = 'identifi';
	var applicationModuleVendorDependencies = ['ngResource', 'ngCookies',  'ngAnimate',  'ngTouch',  'ngSanitize',  'ui.router', 'ui.bootstrap', 'ui.bootstrap-slider', 'ui.utils', 'angularSpinner', 'infinite-scroll', 'persona', 'angular-parallax'];

	// Add a new vertical module
	var registerModule = function(moduleName, dependencies) {
		// Create angular module
		angular.module(moduleName, dependencies || []);

		// Add the module to the AngularJS configuration file
		angular.module(applicationModuleName).requires.push(moduleName);
	};

	return {
		applicationModuleName: applicationModuleName,
		applicationModuleVendorDependencies: applicationModuleVendorDependencies,
		registerModule: registerModule,
    defaultViewpoint: {
      viewpointName: 'Identi.fi',
      viewpointType: 'keyID',
      viewpointValue: '18bHa3QaHxuHAbg9wWtkx2KBiQPZQdTvUT'
    },
    uniqueIdentifierTypes: [
      'url',
      'account',
      'email',
      'bitcoin',
      'bitcoin_address',
      'keyID',
      'gpg_fingerprint',
      'gpg_keyid',
      'phone',
      'tel',
      'google_oauth2'
    ],
    defaultFilters: {
      maxDistance: 0,
      msgType: 'rating',
      receivedOffset: 0,
      sentOffset: 0,
      offset: 0,
      limit: 20,
    }
	};
})();
