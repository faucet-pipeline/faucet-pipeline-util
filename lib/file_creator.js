"use strict";

let mkdirp = require("mkdirp");
let fs = require("fs");
let path = require("path");

const KNOWN = {}; // avoids redundant `mkdirp` invocations
const LOCKS = {};

let writeFile = promisify(fs.writeFile);

// avoids concurrent write operations and creates target directory if necessary
exports.default = function createFile(filepath, contents, recursing) {
	let lock = LOCKS[filepath];
	if(lock) { // defer
		return lock.then(_ => create(filepath, contents));
	}

	// create directory if necessary
	if(!KNOWN[filepath]) {
		KNOWN[filepath] = true;
		// NB: `sync` avoids race condition for subsequent operations
		mkdirp.sync(path.dirname(filepath));
	}

	let prom = writeFile(filepath, contents);
	LOCKS[filepath] = prom;
	return prom.then(_ => {
		delete LOCKS[filepath];
	});
};

// simplistic imitation of Node 8's `util.promisify`
function promisify(fn) {
	return (...args) => new Promise((resolve, reject) => {
		fn(...args, (err, ...params) => {
			err ? reject(err) : resolve({ args: params });
		});
	});
}
