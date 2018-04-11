import { expect, use, assert } from 'chai';
import { fileSync } from 'tmp';
import { S3, AWSError, Request } from "aws-sdk";
import * as TypeMoq from "typemoq";

use(require('chai-as-promised'));
import 'mocha';

import { AWSUploader } from "./awsUploader";

describe('AWS uploader', () => {

	it('non existent file should be rejected.', () => {
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

	it('failure to upload should cause rejection.', () => {
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
		const mock: TypeMoq.IMock<S3> = TypeMoq.Mock.ofType(S3);
		mock
			.setup(x => x.putObject( TypeMoq.It.isAny(), TypeMoq.It.isAny() ))
			.returns( 
				( params:any, callback:any ) : any => {
					callback( true, {} );
					tempFile.removeCallback();
				} 
			);
		uploader.setS3(mock.object);
		return assert.isRejected(uploader.Upload(tempFile.name), /could not upload file/, "failure to upload should cause rejection.");
	});

	it('upload is fulfilled.', () => {
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
		const mock: TypeMoq.IMock<S3> = TypeMoq.Mock.ofType(S3);
		mock
			.setup(x => x.putObject( TypeMoq.It.isAny(), TypeMoq.It.isAny() ))
			.returns( 
				( params:any, callback:any ) : any => {
					callback( false, {} );
					tempFile.removeCallback();
				} 
			);
		uploader.setS3(mock.object);
		return assert.isFulfilled(uploader.Upload(tempFile.name), "upload is fulfilled.");
	});

});