'use strict';

module.exports = function(app) {
	var users = require('../../app/controllers/users');
	var identifiers = require('../../app/controllers/identifiers');

	// Identifiers Routes
	app.route('/api/id/:idValue?')
		.get(identifiers.search);

	app.route('/api/id/:idType/:idValue')
		.get(identifiers.search);

	app.route('/api/id/:idType/:idValue/overview')
		.get(identifiers.overview);

	app.route('/api/id/:idType/:idValue/getname')
		.get(identifiers.getname);

	app.route('/api/id/:idType/:idValue/connections')
		.get(identifiers.connections);

	app.route('/api/id/:idType/:idValue/trustpaths')
		.get(identifiers.trustpaths);

	app.route('/api/id/:idType/:idValue/sent')
		.get(identifiers.sent);

	app.route('/api/id/:idType/:idValue/received')
		.get(identifiers.received);

	app.route('/api/id/:idType/:idValue/connectingmsgs')
		.get(identifiers.connectingmsgs);

	// Finish by binding the Identifier middleware
	app.param('identifierId', identifiers.identifierByID);
};
