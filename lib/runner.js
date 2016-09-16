'use strict';

const EventEmitter = require('events');
const Promise = require('bluebird');

class Runner extends EventEmitter {
	// spec.rate
	// spec.limit
	// spec.clients
	constructor(spec) {
		super();

		this.rate = spec.rate;
		this.limit = spec.limit;
		this.clients = spec.clients;
		this.nextClientIndex = 0;
	}

	run() {
		const self = this;
		const interval = Math.round(60000 / this.rate);

		return new Promise((resolve, reject) => {
			let count = 0;

			function makeRequest() {
				count += 1;
				if (count > self.limit) {
					return resolve(this);
				}
				self.makeRequest().catch(reject);
				setTimeout(makeRequest, interval);
			}

			makeRequest();
		});
	}

	nextClient() {
		const i = this.nextClientIndex;
		this.nextClientIndex += 1;
		if (this.nextClientIndex >= this.clients.length) {
			this.nextClientIndex = 0;
		}
		return this.clients[i];
	}

	makeRequest() {
		const client = this.nextClient();
		this.emit('request', client);
		return client.makeNextRequest().then(res => {
			this.emit('response', res);
			return res;
		});
	}
}

module.exports = Runner;
