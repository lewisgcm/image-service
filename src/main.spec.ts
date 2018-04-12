import { Server } from "http";
import { expect, use, assert } from 'chai';
import { fileSync, SynchrounousResult } from 'tmp';
import { unlinkSync, readFileSync, writeFileSync } from 'fs';
import * as SuperTest from "supertest";
import * as TypeMoq from "typemoq";

use(require('chai-as-promised'));
use(require('chai-fs'));
import 'mocha';

describe('Integration test.', () => {

	var server: Server;
	var defaultConfig: string = `port: 8090
uploadDirectory: /tmp/upload
upload:
  saveDirectory: ${__dirname}`;
	var confFile: SynchrounousResult;

	// Load in a specified confiuration when loading up the server dependency
	var loadServer = (config: String) => {
		confFile = fileSync({ dir : __dirname });
		writeFileSync( confFile.name, config );
		process.env["CONFIG_FILE"] = confFile.name;
		server = require('./main');
	}

	// Make sure we delete the old config file and clear the require cache for the next test
	afterEach(function () {
		confFile.removeCallback();
		server.close();
		delete require.cache[require.resolve('./main')];
	});

	it('health can be retrieved.', (done) => {
		loadServer( defaultConfig );
		SuperTest
			.default(server)
			.get('/health')
			.expect(200, done);
	});
	
	it('no pipeline is posted.', (done) => {
		loadServer( defaultConfig );
		var tempFile = fileSync({ dir : __dirname });
		SuperTest
			.default(server)
			.post("/")
			.attach("image", tempFile.name)
			.expect(
				500,
				done
			);
	});
	
	it('invalid file is posted.', (done) => {
		loadServer( defaultConfig );
		var tempFile = fileSync({ dir : __dirname });
		SuperTest
			.default(server)
			.post("/")
			.field("pipeline", JSON.stringify([ { jpeg: {} } ]))
			.attach("image", tempFile.name)
			.expect(
				500,
				done
			);
	});
	
	it('valid file cannot be uploaded.', (done) => {
		loadServer( `port: 8090
uploadDirectory: /tmp/upload
upload:
  saveDirectory: ${__dirname}/^/?/*` );
		var tempFile = fileSync({ dir : __dirname });
		writeFileSync( tempFile.name, readFileSync(`${__dirname}/../test.jpg`) )
		SuperTest
			.default(server)
			.post("/")
			.field("pipeline", JSON.stringify([ { jpeg: {} } ]))
			.attach("image", tempFile.name)
			.end(
				(error, response) => {
					assert.equal(response.status, 500);
					assert.match(response.body.error, /no such file or directory/);
					done();
				}
			);
	});

	it('valid file can be uploaded.', (done) => {
		loadServer( defaultConfig );
		var tempFile = fileSync({ dir : __dirname });
		writeFileSync( tempFile.name, readFileSync(`${__dirname}/../test.jpg`) )
		SuperTest
			.default(server)
			.post("/")
			.field("pipeline", JSON.stringify([ { jpeg: {} } ]))
			.attach("image", tempFile.name)
			.end(
				(error, response) => {
					assert.equal(response.status, 200);
					assert.match(response.body.filePath, new RegExp(__dirname) );
					unlinkSync(response.body.filePath);
					done();
				}
			);
	});
	
});