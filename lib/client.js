'use strict';

const EventEmitter = require('events');
const oddworksIdentityQueries = require('@oddnetworks/oddworks/lib/services/identity/queries/');

class Client extends EventEmitter {
	// spec.jwtSecret
	// spec.jwtIssuer
	// spec.channel
	// spec.platform
	// spec.paths
	// spec.oddworksClient
	constructor(spec) {
		super();

		this.channel = spec.channel;
		this.platform = spec.platform;
		this.paths = spec.paths;
		this.lastPathIndex = 0;

		this.signOddworksJwt = oddworksIdentityQueries({options: {
			jwtSecret: spec.jwtSecret,
			jwtIssuer: spec.jwtIssuer
		}}).sign;

		this.oddworksClient = spec.oddworksClient;
		this.oddworksClient.on('error', err => {
			this.emit('error', err);
		});
	}

	authenticate() {
		const params = {
			audience: ['platform'],
			channel: this.channel,
			platform: this.platform
		};

		return this.signOddworksJwt(params).then(jwt => {
			this.jwt = jwt;
			return this;
		});
	}

	nextPath() {
		const i = this.lastPathIndex;

		this.lastPathIndex += 1;
		if (this.lastPathIndex >= this.paths.length) {
			this.lastPathIndex = 0;
		}

		return this.paths[i];
	}

	makeNextRequest() {
		const path = this.nextPath();
		const jwt = this.jwt;
		const start = Date.now();
		return this.oddworksClient.get({path, jwt}).then(res => {
			res = res.toJSON();
			const req = res.request;

			return {
				start,
				end: Date.now(),
				method: req.method,
				href: req.uri.href,
				uri: req.uri,
				status: res.statusCode,
				contentLength: parseInt(res.headers['content-length'], 10),
				body: res.body
			};
		});
	}
}

module.exports = Client;
