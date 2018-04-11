import { expect, use, assert } from 'chai';
import { fileSync } from 'tmp';
import { unlinkSync } from 'fs';
import * as TypeMoq from "typemoq";

use(require('chai-as-promised'));
import 'mocha';

import { LocalUploader } from "./localUploader";
import { LocalUploadResult } from "./localUploadResult";

describe('Local uploader', () => {

	it('non existent file should be rejected.', () => {
		var uploader = new LocalUploader({
			saveDirectory: __dirname
		});
		return assert.isRejected(uploader.Upload("bad-file"), /no such file or directory/, "non existent file should be rejected.");
	});
	
	it('a file can be copied.', () => {
		var uploader = new LocalUploader({
			saveDirectory: __dirname
		});
		var tempFile = fileSync({ dir : __dirname });
		uploader.Upload(tempFile.name).then(
			(file: LocalUploadResult) => {
				assert.isNotNull(file.filePath)
				tempFile.removeCallback();
				unlinkSync(file.filePath);
			}
		)
    });
    
});