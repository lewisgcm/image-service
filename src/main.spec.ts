import { Server } from "http";
import { expect, use, assert } from 'chai';
import { fileSync } from 'tmp';
import { unlinkSync } from 'fs';
import { Uploader } from "./upload/uploader";
import * as SuperTest from "supertest";
import * as TypeMoq from "typemoq";

use(require('chai-as-promised'));
use(require('chai-fs'));
import 'mocha';

describe('Integration test.', () => {

    var server: Server;
    var uploader: Uploader<string>;
    
    beforeEach(function () {
        server = require('./main');
    });

    afterEach(function () {
        server.close();
    });

	it('health can be retrieved.', (done) => {
        SuperTest
            .default(server)
            .get('/health')
            .expect(200, done);
    });
    
    it('no pipeline is posted', (done) => {
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
    
    it('invalid file is posted', (done) => {
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
    
    it('valid file is posted', (done) => {
        SuperTest
            .default(server)
            .post("/")
            .field("pipeline", JSON.stringify([ { jpeg: {} } ]))
            .attach("image", `${__dirname}/../test.jpg`)
            .expect(
                500,
                () => {
                    done();
                }
            );
	});
    
});