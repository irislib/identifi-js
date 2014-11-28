'use strict';

module.exports = function(app) {
	// Root routing
	var core = require('../../app/controllers/core');
	app.route('/').get(core.index);
	app.route('/messages*').get(core.index);
	app.route('/id*').get(core.index);
	app.route('/about*').get(core.index);
};
