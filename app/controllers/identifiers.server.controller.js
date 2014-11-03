'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	errorHandler = require('./errors'),
	Identifier = mongoose.model('Identifier'),
	_ = require('lodash');


var bitcoin = require('bitcoin');
var identifi = new bitcoin.Client({
    host: 'localhost',
      port: 4945,
      user: 'identifirpc',
      pass: '7FA6FfaoXr6VzCzQa8X2YBrUxR1ANEvnxtdTugvD5mzc'
});

/**
 * Show the current Identifier
 */
exports.read = function(req, res) {
	res.jsonp(req.identifier);
};

/**
 * Search for Identifiers
 */
exports.search = function(req, res) {
  identifi.cmd('search', req.params.idValue || '', req.params.idType || '', '20', '0', 'keyID', '18bHa3QaHxuHAbg9wWtkx2KBiQPZQdTvUT', function(err, identifiRes, identifiResHeaders) {
    if (err) {
      return console.error(err);
    }

    res.jsonp(identifiRes);
  });
};

/**
 * Overview
 */
exports.overview = function(req, res) {
  identifi.cmd('overview', req.params.idType, req.params.idValue, 'keyID', '18bHa3QaHxuHAbg9wWtkx2KBiQPZQdTvUT', function(err, identifiRes, identifiResHeaders) {
    if (err) {
      return console.error(err);
    }

    res.jsonp(identifiRes);
  });
};

/**
 * Connections
 */
exports.connections = function(req, res) {
  identifi.cmd('getconnections', req.params.idType, req.params.idValue, req.query.limit || '20', req.query.offset || '0', req.query.viewpointType || 'keyID', req.query.viewpointValue || '18bHa3QaHxuHAbg9wWtkx2KBiQPZQdTvUT', function(err, identifiRes, identifiResHeaders) {
    if (err) {
      return console.error(err);
    }

    res.jsonp(identifiRes);
  });
};

/**
 * Trust path
 */
exports.trustpath = function(req, res) {
  identifi.cmd('getpaths', req.query.viewpointType || 'keyID', req.query.viewpointValue || '18bHa3QaHxuHAbg9wWtkx2KBiQPZQdTvUT', req.params.idType, req.params.idValue, function(err, identifiRes, identifiResHeaders) {
    if (err) {
      return console.error(err);
    }

    res.jsonp(identifiRes);
  });
};

/**
 * Messages by author
 */
exports.sent = function(req, res) {
  identifi.cmd('getmsgsbyauthor', req.params.idType, req.params.idValue, req.query.limit || '20', req.query.offset || '0', req.query.viewpointType || 'keyID', req.query.viewpointValue || '18bHa3QaHxuHAbg9wWtkx2KBiQPZQdTvUT', '0', 'rating', function(err, identifiRes, identifiResHeaders) {
    if (err) {
      return console.error(err);
    }

    res.jsonp(identifiRes);
  });
};

/**
 * Messages by recipient 
 */
exports.received = function(req, res) {
  identifi.cmd('getmsgsbyrecipient', req.params.idType, req.params.idValue, req.query.limit || '20', req.query.offset || '0', req.query.viewpointType || 'keyID', req.query.viewpointValue || '18bHa3QaHxuHAbg9wWtkx2KBiQPZQdTvUT', '0', 'rating', function(err, identifiRes, identifiResHeaders) {
    if (err) {
      return console.error(err);
    }

    res.jsonp(identifiRes);
  });
};

/**
 * Connecting messages
 */
exports.connectingmsgs = function(req, res) {
  identifi.cmd('getconnectingmsgs', req.params.idType, req.params.idValue, req.query.id2Type, req.query.id2Value, req.query.limit || '20', req.query.offset || '0', req.query.viewpointType || 'keyID', req.query.viewpointValue || '18bHa3QaHxuHAbg9wWtkx2KBiQPZQdTvUT', '0', function(err, identifiRes, identifiResHeaders) {
    if (err) {
      return console.error(err);
    }

    res.jsonp(identifiRes);
  });
};

/**
 * Identifier middleware
 */
exports.identifierByID = function(req, res, next, id) { 
  identifi.cmd('overview', req.params.idType, req.params.idValue, function(err, identifier, identifiResHeaders) {
		if (err) return next(err);
		if (! identifier) return next(new Error('Failed to load Identifier ' + id.type + ': ' + id.value));

    req.identifier = identifier;
		next();
  });
};

/**
 * Identifier authorization middleware
 */
exports.hasAuthorization = function(req, res, next) {
	if (req.identifier.user.id !== req.user.id) {
		return res.status(403).send('User is not authorized');
	}
	next();
};
