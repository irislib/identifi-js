'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

/**
 * Identifier Schema
 */
var IdentifierSchema = new Schema({
	name: {
		type: String,
		default: '',
		required: 'Please fill Identifier name',
		trim: true
	},
	created: {
		type: Date,
		default: Date.now
	},
	user: {
		type: Schema.ObjectId,
		ref: 'User'
	}
});

mongoose.model('Identifier', IdentifierSchema);