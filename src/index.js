"use strict";

let createFile = require("./file_creator");
let path = require("path");
let crypto = require("crypto");

exports.createFile = createFile;

exports.generateFingerprint = (filepath, contents) => {
	let ext = "." + filepath.split(".").pop(); // XXX: brittle; assumes regular file extension
	let name = path.basename(filepath, ext);
	let hash = generateHash(contents);
	return path.join(path.dirname(filepath), `${name}-${hash}${ext}`);
};

exports.uriJoin = (...segments) => {
	let last = segments.pop();
	segments.map(segment => segment.replace(/\/$/, "")); // strip trailing slash
	return segments.concat(last).join("/");
};

function generateHash(str) {
	let hash = crypto.createHash("md5");
	hash.update(str);
	return hash.digest("hex");
}
