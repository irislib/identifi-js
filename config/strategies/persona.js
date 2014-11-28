'use strict';

/**
 * Module dependencies.
 */
var passport = require('passport'),
	url = require('url'),
	PersonaStrategy = require('passport-persona').Strategy,
	config = require('../config'),
	users = require('../../app/controllers/users');

module.exports = function() {
	// Use Persona strategy
  passport.use(new PersonaStrategy({
      audience: 'http://seed1.identifi.org:3000'
    },
    function(email, done) {
			var providerUserProfile = {
				displayName: email,
				email: email,
				provider: 'persona',
				providerIdentifierField: 'email',
        providerData: { email: email }
			};

      var req = {};
			// Save the user OAuth profile
			users.saveOAuthUserProfile(req, providerUserProfile, done);
    }
  ));

/*
	passport.use(new PersonaStrategy({
      audience: config.persona.audience,
			callbackURL: config.persona.callbackURL,
			passReqToCallback: true
		},
		function(req, accessToken, refreshToken, profile, done) {
			// Set the provider data and include tokens
			var providerData = profile._json;
			providerData.accessToken = accessToken;
			providerData.refreshToken = refreshToken;

			// Create the user OAuth profile
			var providerUserProfile = {
				firstName: profile.name.givenName,
				lastName: profile.name.familyName,
				displayName: profile.displayName,
				email: profile.emails[0].value,
				username: profile.username,
				provider: 'persona',
				providerIdentifierField: 'id',
				providerData: providerData
			};

			// Save the user OAuth profile
			users.saveOAuthUserProfile(req, providerUserProfile, done);
		}
	));
*/
};
