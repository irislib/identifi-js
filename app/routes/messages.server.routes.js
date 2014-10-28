'use strict';

module.exports = function(app) {
	var users = require('../../app/controllers/users');
	var messages = require('../../app/controllers/messages');

	// Messages Routes
	app.route('/messages')
		.get(messages.list)
		.post(users.requiresLogin, messages.create);

	app.route('/messages/:messageId')
		.get(messages.read)
		.delete(users.requiresLogin, messages.hasAuthorization, messages.delete);

	// Finish by binding the Message middleware
	app.param('messageId', messages.messageByID);
};
