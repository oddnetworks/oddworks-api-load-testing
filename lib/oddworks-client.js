'use strict';

const EventEmitter = require('events');
const Promise = require('bluebird');
const U = require('lodash');
const request = require('request');

class OddworksClient extends EventEmitter {
	// spec.jwt
	// spec.protocol
	// spec.host
	// spec.port
	// spec.pathPrefix
	// spec.authHeader
	// spec.headers
	constructor(spec) {
		spec = spec || {};
		super();

		this.jwt = spec.jwt || null;
		this.protocol = spec.protocol || 'http';
		this.host = spec.host || 'localhost';
		this.port = parseInt(spec.port, 10) || 80;
		this.pathPrefix = spec.pathPrefix || '';
		this.authHeader = spec.authHeader || 'Authorization';
		this.headers = spec.headers || {};
	}

	// args.path *required
	get(args) {
		const params = U.cloneDeep(args || {});
		params.method = 'GET';
		return this.request(params);
	}

	// args.method *required
	// args.path *required
	// args.jwt
	// args.qs
	// args.protocol
	// args.host
	// args.port
	// args.pathPrefix
	// args.headers
	// args.authHeader
	request(args) {
		args = args || {};

		const qs = args.qs;
		const jwt = args.jwt || this.jwt;
		const method = args.method || 'GET';
		const protocol = args.protocol || this.protocol;
		const host = args.host || this.host;
		const port = parseInt(args.port, 10) || this.port;
		const pathPrefix = args.pathPrefix || this.pathPrefix;
		const path = args.path || '/';
		const authHeader = args.authHeader || this.authHeader;

		let url;
		if ((protocol === 'http' && port === 80) || (protocol === 'https' && port === 443)) {
			url = `${protocol}://${host}${pathPrefix}${path}`;
		} else {
			url = `${protocol}://${host}:${port}${pathPrefix}${path}`;
		}

		const headers = Object.assign({}, this.headers, args.headers);

		if (authHeader === 'Authorization') {
			headers.Authorization = `Bearer ${jwt}`;
		} else {
			headers[authHeader] = jwt;
		}

		const params = {method, url, headers};

		if (args.json) {
			params.json = args.json;
		}

		if (args.qs) {
			params.qs = qs;
		}

		const self = this;
		return new Promise((resolve, reject) => {
			request(params, (err, res) => {
				if (err) {
					return reject(err);
				}

				if (res.body && U.isObject(res.body)) {
					return resolve(res);
				}

				let body;
				try {
					body = JSON.parse(res.body);
				} catch (err) {
					const jsonError = new Error(`Response body JSON parsing error: ${err.message}`);
					jsonError.code = 'EJSON_PARSING';
					jsonError.res = res.toJSON();
					self.emit('error', jsonError);

					body = res.body;
				}

				res.body = body;
				return resolve(res);
			});
		});
	}
}

module.exports = OddworksClient;
