'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	errorHandler = require('./errors'),
	Message = mongoose.model('Message'),
	_ = require('lodash');

var bitcoin = require('bitcoin');
var identifi = new bitcoin.Client({
    host: 'localhost',
      port: 4945,
      user: 'identifirpc',
      pass: '7FA6FfaoXr6VzCzQa8X2YBrUxR1ANEvnxtdTugvD5mzc'
});

/**
 * Create a Message
 */
exports.create = function(req, res) {
	var message = new Message(req.body);
	message.user = req.user;

	message.save(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(message);
		}
	});
};

/**
 * Show the current Message
 */
exports.read = function(req, res) {
	res.jsonp(req.message);
};

/**
 * Delete an Message
 */
exports.delete = function(req, res) {
	var message = req.message ;

	message.remove(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(message);
		}
	});
};

/**
 * List of latest Messages
 */
exports.list = function(req, res) {
  identifi.cmd('getlatestmsgs', '20', '0', '', '', '0', 'rating', function(err, identifiRes, identifiResHeaders) {
    if (err) {
      return console.error(err);
    }

    res.jsonp(identifiRes);
  });
};

/**
 * Message middleware
 */
exports.messageByID = function(req, res, next, id) { 
  identifi.cmd('getmsgbyhash', id, function(err, message, identifiResHeaders) {
		if (err) return next(err);
		if (! message[0]) return next(new Error('Failed to load Message ' + id));

    req.message = message[0];
		next();
  });
};

/**
 * Message authorization middleware
 */
exports.hasAuthorization = function(req, res, next) {
	if (req.message.user.id !== req.user.id) {
		return res.status(403).send('User is not authorized');
	}
	next();
};
