// Load modules.
var OAuth2Strategy = require('../passport-oauth2'),
	util = require('util'),
	uri = require('url'),
	InternalOAuthError = require('../passport-oauth2').InternalOAuthError,
	axios = require('axios');

/**
 * `Strategy` constructor.
 *
 * The Moneybutton authentication strategy authenticates requests by delegating to
 * Moneybutton using the OAuth 2.0 protocol.
 *
 * Applications must supply a `verify` callback which accepts an `accessToken`,
 * `refreshToken` and service-specific `profile`, and then calls the `cb`
 * callback supplying a `user`, which should be set to `false` if the
 * credentials are not valid.  If an exception occured, `err` should be set.
 *
 * Options:
 *   - `clientID`      your Moneybutton application's client id
 *   - `clientSecret`  your Moneybutton application's client secret
 *   - `callbackURL`   URL to which Moneybutton will redirect the user after granting authorization
 *
 * Examples:
 *
 *     passport.use(new MoneybuttonStrategy({
 *         clientID: '123-456-789',
 *         clientSecret: 'shhh-its-a-secret'
 *         callbackURL: 'https://www.example.net/auth/moneybutton/callback'
 *       },
 *       function(accessToken, refreshToken, profile, cb) {
 *         User.findOrCreate(..., function (err, user) {
 *           cb(err, user);
 *         });
 *       }
 *     ));
 *
 * @constructor
 * @param {object} options
 * @param {function} verify
 * @access public
 */
function Strategy(options, verify) {
	options = options || {};
	options.authorizationURL =
		options.authorizationURL || 'https://www.moneybutton.com/oauth/v1/authorize';
	options.tokenURL = options.tokenURL || 'https://www.moneybutton.com/oauth/v1/token';
	options.state = true;

	console.log('[passport-moneybutton] constructor: ', { options });

	OAuth2Strategy.call(this, options, verify);
	this.name = 'moneybutton';
	this._userProfileURL =
		options.userProfileURL || 'https://www.moneybutton.com/api/v1/auth/user_identity';
	this.options = options;

	this.callbackURL = options.callbackUrl;
	this.clientIDA = options.clientID;
}

// Inherit from `OAuth2Strategy`.
util.inherits(Strategy, OAuth2Strategy);

/**
 * Retrieve user profile from Moneybutton.
 *
 * @param {string} accessToken
 * @param {function} done
 * @access protected
 */
Strategy.prototype.userProfile = function(accessToken, done) {
	var self = this;

	console.log('[passport-moneybutton] userProfile:', { accessToken });

	axios
		.get(this._userProfileURL, { headers: { authorization: `Bearer ${accessToken}` } })
		.then(response => {
			console.log('[passport-moneybutton] userProfile success:', { data: response.data });
			done(null, response.data);
		})
		.catch(err => {
			console.log('[passport-moneybutton] userProfile error:', { data: response.data });
			return done(new InternalOAuthError('Failed to fetch user profile', err));
		});
};

/**
 * Return extra Moneybutton-specific parameters to be included in the authorization
 * request.
 *
 * @param {object} options
 * @return {object}
 * @access protected
 */
Strategy.prototype.authorizationParams = function(options) {
	var params = {};

	return params;
};

module.exports = Strategy;
