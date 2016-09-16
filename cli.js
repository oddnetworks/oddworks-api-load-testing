'use strict';

const url = require('url');
const Promise = require('bluebird');
const U = require('lodash');
const yargs = require('yargs');
const filepath = require('filepath');
const Client = require('./lib/client');
const OddworksClient = require('./lib/oddworks-client');
const Runner = require('./lib/runner');

exports.main = function main() {
	const args = yargs
		.usage('Usage: $0 [options]')
		.option('config', {
			demand: true,
			describe: 'Path to the JSON config file'
		})
		.option('rate', {
			demand: true,
			describe: 'Number of requests per minute',
			type: 'number'
		})
		.option('limit', {
			describe: 'Limit the number of requests',
			default: 50,
			type: 'number'
		})
		.help();

	const argv = args.argv;

	return loadConfigs(argv.config)
		.then(config => {
			config = config || {};

			if (!config.jwtSecret) {
				return Promise.reject(new Error('Config is missing jwtSecret'));
			}
			if (!config.jwtIssuer) {
				return Promise.reject(new Error('Config is missing jwtIssuer'));
			}
			if (!config.channel) {
				return Promise.reject(new Error('Config is missing channel'));
			}
			if (!config.baseUrl) {
				return Promise.reject(new Error('Config is missing baseUrl'));
			}
			if (!U.isString(config.pathPrefix)) {
				return Promise.reject(new Error('Config is missing pathPrefix'));
			}
			if (!config.authHeader) {
				return Promise.reject(new Error('Config is missing authHeader'));
			}
			if (!Array.isArray(config.platforms)) {
				return Promise.reject(new Error('Config is missing platforms'));
			}

			let baseUrl;
			try {
				baseUrl = url.parse(config.baseUrl);
			} catch (err) {
				const uriError = new Error(`Config baseUrl is invalid: ${err.message}`);
				return Promise.reject(uriError);
			}

			return config.platforms.map(spec => {
				if (!spec.id) {
					throw new Error('Config platform is missing an ID');
				}
				if (!Array.isArray(spec.paths)) {
					return Promise.reject(new Error('Config platform is missing a paths Array'));
				}

				return new Client({
					jwtSecret: config.jwtSecret,
					jwtIssuer: config.jwtIssuer,
					channel: config.channel,
					platform: spec.id,
					paths: spec.paths,
					oddworksClient: new OddworksClient({
						protocol: baseUrl.protocol.replace(/:$/, ''),
						host: baseUrl.hostname,
						port: baseUrl.port,
						pathPrefix: config.pathPrefix,
						authHeader: config.authHeader
					})
				});
			});
		})
		.then(clients => {
			const promises = clients.map(client => {
				return client.authenticate();
			});

			return Promise.all(promises);
		})
		.then(clients => {
			const runner = new Runner({
				rate: argv.rate,
				limit: argv.limit,
				clients
			});

			runner.on('response', res => {
				console.log(res);
			});

			return runner.run();
		});
};

function loadConfigs(path) {
	const file = filepath.create(path);
	if (!file.isFile()) {
		throw new Error(`Config path is not a file "${path}"`);
	}

	return file.read().then(text => {
		let config;
		try {
			config = JSON.parse(text);
		} catch (err) {
			const jsonError = new Error(`JSON config file parsing error: ${err.message}`);
			return Promise.reject(jsonError);
		}
		return config;
	});
}
