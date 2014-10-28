'use strict';

// Configuring the Articles module
angular.module('messages').run(['Menus',
	function(Menus) {
		// Set top bar menu items
		Menus.addMenuItem('topbar', 'Messages', 'messages', 'dropdown', '/messages(/create)?');
		Menus.addSubMenuItem('topbar', 'messages', 'List Messages', 'messages');
		Menus.addSubMenuItem('topbar', 'messages', 'New Message', 'messages/create');
	}
]);