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

var Memcached = require('memcached');
var bitcoin = require('bitcoin');
var identifi = new bitcoin.Client({
    host: 'localhost',
      port: 4945,
      user: 'identifirpc',
      pass: '7FA6FfaoXr6VzCzQa8X2YBrUxR1ANEvnxtdTugvD5mzc'
});
identifi.memcached = new Memcached();
identifi.cachedCmd = function() {
  var cmdSignature = Array.prototype.slice.call(arguments, 0, -1).join();
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
  identifi.cachedCmd('getlatestmsgs', req.query.limit || '20', req.query.offset || '0', req.query.viewpointType || '', req.query.viewpointValue || '', req.query.maxDistance || '0', req.query.msgType || '', function(err, identifiRes, identifiResHeaders) {
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
  identifi.cachedCmd('getmsgbyhash', id, function(err, message, identifiResHeaders) {
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
