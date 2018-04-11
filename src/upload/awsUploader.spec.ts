import { expect, use, assert } from 'chai';
import { fileSync } from 'tmp';
import { S3, AWSError } from "aws-sdk";
use(require('chai-as-promised'));
import 'mocha';

import { AWSUploader } from "./awsUploader";

class MockS3 extends S3 {
	putObject( params: S3.PutObjectRequest, callback?: (error: AWSError, response: S3.PutObjectOutput) => void ) {
		callback( true, {} );
		tempFile.removeCallback();
	}
}

describe('AWS Uploadder', () => {

	it('non-existant file should be rejected.', () => {
		var uploader = new AWSUploader({
			port: 80,
			uploadDirectory: "/tmp/",
			aws : {
				endpoint: "",
				key: "",
				secret: "",
				pathStyle: true,
				bucket: ""
			}
		});
		return assert.isRejected(uploader.Upload("bad-file"), /could not create file stream for path/, "non-existant file should be rejected.");
	});

	it('failure to upload should cause rejection', () => {
		var uploader = new AWSUploader({
			port: 80,
			uploadDirectory: "/tmp/",
			aws : {
				endpoint: "",
				key: "",
				secret: "",
				pathStyle: true,
				bucket: ""
			}
		});
		var tempFile = fileSync({ dir : __dirname });
		(<any>uploader).s3.putObject = function( params: any, callback: (error: any, response: any) => void ) {
			callback( true, {} );
			tempFile.removeCallback();
		}
		return assert.isRejected(uploader.Upload(tempFile.name), /could not upload file/, "failure to upload should cause rejection.");
	});

	it('upload is fulfilled', () => {
		var uploader = new AWSUploader({
			port: 80,
			uploadDirectory: "/tmp/",
			aws : {
				endpoint: "",
				key: "",
				secret: "",
				pathStyle: true,
				bucket: ""
			}
		});
		var tempFile = fileSync({ dir : __dirname });
		(<any>uploader).s3.putObject = function( params: any, callback: (error: any, response: any) => void ) {
			callback( false, {} );
			tempFile.removeCallback();
		}
		return assert.isFulfilled(uploader.Upload(tempFile.name), "upload is fulfilled.");
	});

});