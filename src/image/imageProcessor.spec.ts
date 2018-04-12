import { expect, use, assert } from 'chai';
import { fileSync } from 'tmp';
import { unlinkSync } from 'fs';
import * as TypeMoq from "typemoq";

use(require('chai-as-promised'));
use(require('chai-fs'));

import 'mocha';

import { ImageProcessor } from "./imageProcessor";

describe('Image processor', () => {

	it('invalid options should be rejected.', () => {
		var imageProcessor = new ImageProcessor();
		return assert.isRejected(
            imageProcessor.Process("file", undefined),
            /could not parse the supplied options/
        );
    });

    it('unsupported pipeline stage should be rejected.', () => {
		var imageProcessor = new ImageProcessor();
		return assert.isRejected(
            imageProcessor.Process(
                "file",
                { pipeline : JSON.stringify([ { blarg : [] }]) }
            ),
            /unsupported operation: blarg/
        );
    });

    it('bad transformation is rejected.', () => {
        var imageProcessor = new ImageProcessor();
		return assert.isRejected(
            imageProcessor.Process(
                "no-file",
                { pipeline : JSON.stringify([{ jpeg : { quality: -1 } }]) }
            ),
            /failed to process the image/
        );
    });

    it('a file can be transformed.', () => {
        var imageProcessor = new ImageProcessor();
		return assert.isFulfilled(
            imageProcessor.Process(
                `${__dirname}/../../test.jpg`,
                { pipeline : JSON.stringify([{ jpeg : { quality: 100 } }]) }
            )
        ).then(
            () => {
                (<any>assert).pathExists(`${__dirname}/../../test.jpg.transformed.jpg`);
                unlinkSync(`${__dirname}/../../test.jpg.transformed.jpg`);
            }
        );
    });
    
});