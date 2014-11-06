'use strict';

module.exports = function(app) {
	var users = require('../../app/controllers/users');
	var identifiers = require('../../app/controllers/identifiers');

	// Identifiers Routes
	app.route('/id/:idValue?')
		.get(identifiers.search);

	app.route('/id/:idType/:idValue')
		.get(identifiers.search);

	app.route('/id/:idType/:idValue/overview')
		.get(identifiers.overview);

	app.route('/id/:idType/:idValue/connections')
		.get(identifiers.connections);

	app.route('/id/:idType/:idValue/trustpaths')
		.get(identifiers.trustpaths);

	app.route('/id/:idType/:idValue/sent')
		.get(identifiers.sent);

	app.route('/id/:idType/:idValue/received')
		.get(identifiers.received);

	app.route('/id/:idType/:idValue/connectingmsgs')
		.get(identifiers.connectingmsgs);

	// Finish by binding the Identifier middleware
	app.param('identifierId', identifiers.identifierByID);
};
