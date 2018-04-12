import { Server } from "http";
import { expect, use, assert } from 'chai';
import { fileSync } from 'tmp';
import { unlinkSync, writeFileSync } from 'fs';
import { AWSUploader } from '../upload/awsUploader';
import { LocalUploader } from '../upload/localUploader';
import { ConfigLoader } from "./configLoader";
import * as SuperTest from "supertest";
import * as TypeMoq from "typemoq";
import 'mocha';

use(require('chai-as-promised'));
use(require('chai-fs'));


describe('Configuration loading.', () => {

	it('environment variables can be resolved in configuration.', () => {
		process.env["TEST_CONFIG"] = "TEST_VALUE";
		const config = `port: 8090
uploadDirectory: \${TEST_CONFIG}
upload:
  saveDirectory: ./images/`;

  		var tempFile = fileSync({ dir : __dirname });
  		writeFileSync(tempFile.name, config);
		var loadedConfig = ConfigLoader.LoadSync(tempFile.name);
		assert.equal(loadedConfig.uploadDirectory, "TEST_VALUE");
		tempFile.removeCallback();
	});

	it('invalid environment variables cannot be resolved in configuration.', () => {
		const config = `port: 8090
uploadDirectory: \${TEST_CONFIGZ}
upload:
  saveDirectory: ./images/`;

  		var tempFile = fileSync({ dir : __dirname });
  		writeFileSync(tempFile.name, config);
		var loadedConfig = ConfigLoader.LoadSync(tempFile.name);
		assert.equal(loadedConfig.uploadDirectory, undefined);
		tempFile.removeCallback();
	});

	it('local uploader can be resolved based on configuration.', () => {
		var uploader = ConfigLoader
			.GetUploader({
				port: 8080,
				uploadDirectory: "",
				upload: {
					saveDirectory: "/"
				}
			});

		assert.deepEqual(uploader, new LocalUploader({ saveDirectory: "/" }));
	});

	it('aws uploader can be resolved based on configuration.', () => {
		const awsConfig = {
			endpoint: "",
			key: "",
			secret: "",
			pathStyle: true,
			bucket: ""
		};
		var uploader = ConfigLoader
			.GetUploader({
				port: 8080,
				uploadDirectory: "",
				upload: awsConfig
			});
		expect(uploader).to.include({ bucket: "" });
	});

});