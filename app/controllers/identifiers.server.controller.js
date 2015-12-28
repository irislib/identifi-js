'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	errorHandler = require('./errors'),
	Identifier = mongoose.model('Identifier'),
	_ = require('lodash');

var config = require('../../config/config.js');

var Memcached = require('memcached');
var bitcoin = require('bitcoin');
var identifi = new bitcoin.Client({
    host: config.identifi.host,
      port: config.identifi.port,
      user: config.identifi.user,
      pass: config.identifi.pass
});
identifi.memcached = new Memcached();
identifi.cachedCmd = function() {
  var cmdSignature = Array.prototype.slice.call(arguments, 0, -1).join();
  cmdSignature = escape(cmdSignature);
  var params = arguments;
  var _this = this;
  this.memcached.get(cmdSignature, function(err, data) {
    if (err || !data) {
      if (!err) {
        console.log('Cache miss ' + cmdSignature);
        params = Array.prototype.slice.call(params);
        var originalCallback = params.pop();
        params.push(function(identifiErr, identifiRes) {
          if (!identifiErr)
            _this.memcached.set(cmdSignature, identifiRes, 100, function(err) {});
          else 
            console.log('Identifi error: ' + identifiErr);
          originalCallback.call(_this, identifiErr, identifiRes);
        });
        _this.cmd.apply(_this, params);
      } else {
        console.log('Memcached error: ' + err);
        _this.cmd.apply(_this, params);
      }
    } else {
      console.log('Cache hit ' + cmdSignature);
      params[params.length - 1].call(_this, undefined, data);
    }
  });
};

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
  identifi.cachedCmd('search', req.params.idValue || '', req.params.idType || '', req.query.limit || '20', req.query.offset || '0', req.query.viewpointType || '', req.query.viewpointValue || '', function(err, identifiRes, identifiResHeaders) {
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
  identifi.cachedCmd('overview', req.params.idType, req.params.idValue, req.query.viewpointType || '', req.query.viewpointValue || '', req.query.maxDistance || '0', function(err, identifiRes, identifiResHeaders) {
    if (err) {
      return console.error(err);
    }

    res.jsonp(identifiRes);
  });
};


/**
 * Getname 
 */
exports.getname = function(req, res) {
  identifi.cachedCmd('getname', req.params.idType, req.params.idValue, function(err, identifiRes, identifiResHeaders) {
    if (err) {
      return console.error(err);
    }

    res.jsonp({ name: identifiRes });
  });
};
/**
 * Connections
 */
exports.connections = function(req, res) {
  identifi.cachedCmd('getconnections', req.params.idType, req.params.idValue, req.query.limit || '20', req.query.offset || '0', req.query.viewpointType || '', req.query.viewpointValue || '', req.query.maxDistance || '0', function(err, identifiRes, identifiResHeaders) {
    if (err) {
      return console.error(err);
    }

    res.jsonp(identifiRes);
  });
};

/**
 * Trust path
 */
exports.trustpaths = function(req, res) {
  identifi.cachedCmd('getpaths', req.query.viewpointType || config.defaultViewpoint.type, req.query.viewpointValue || config.defaultViewpoint.value, req.params.idType, req.params.idValue, function(err, identifiRes, identifiResHeaders) {
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
  identifi.cachedCmd('getmsgsbyauthor', req.params.idType, req.params.idValue, req.query.limit || '20', req.query.offset || '0', '', '', '0', req.query.msgType || '', function(err, identifiRes, identifiResHeaders) {
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
  identifi.cachedCmd('getmsgsbyrecipient', req.params.idType, req.params.idValue, req.query.limit || '20', req.query.offset || '0', req.query.viewpointType || '', req.query.viewpointValue || '', req.query.maxDistance || '0', req.query.msgType || '', function(err, identifiRes, identifiResHeaders) {
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
  identifi.cachedCmd('getconnectingmsgs', req.params.idType, req.params.idValue, req.query.id2Type, req.query.id2Value, req.query.limit || '20', req.query.offset || '0', req.query.viewpointType || '', req.query.viewpointValue || '', '0', function(err, identifiRes, identifiResHeaders) {
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
  identifi.cachedCmd('overview', req.params.idType, req.params.idValue, function(err, identifier, identifiResHeaders) {
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
