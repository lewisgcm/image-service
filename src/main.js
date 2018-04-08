const express = require('express');
const multer  = require('multer');
const sharp = require('sharp');
const uuidv4 = require('uuid/v4');
const AWS = require('aws-sdk');
const fileSystem = require('fs');
const stream = require('stream');

// Load all of our environment variables or create suitable defaults for testing
const AWS_BUCKET = process.env.AWS_BUCKET  || "test";
const AWS_KEY = process.env.AWS_KEY || "dummy";
const AWS_SECRET = process.env.AWS_SECRET || "dummy123";
const AWS_ENDPOINT = process.env.AWS_ENDPOINT || "http://127.0.0.1:9000";
const AWS_PATH_STYLE = (process.env.AWS_PATH_STYLE === undefined) ? true : process.env.AWS_PATH_STYLE;
const PORT = process.env.PORT || 8080;
const UPLOAD_DIR = process.env.UPLOAD_DIR || '/tmp/uploads/';

// Configure the AWS S3 SDK and Multer for uploads, also create our express app
const upload = multer({ dest: UPLOAD_DIR })
const s3 = new AWS.S3({
    accessKeyId: AWS_KEY ,
    secretAccessKey: AWS_SECRET,
    endpoint: AWS_ENDPOINT,
    s3ForcePathStyle: AWS_PATH_STYLE
});
const app = express()

// 
app.post(
    '/',
    upload.single('image'),
    function (req, res, next) {
        var filePath = req.file.path;
        var fileId = uuidv4();
        var contentType = req.file.mimetype;

        res.set('Content-Type', 'application/json');

        var width = (req.body['resize.width'] === undefined) ? undefined : parseInt(req.body['resize.width']);
        var height = (req.body['resize.height'] === undefined) ? undefined : parseInt(req.body['resize.height']);

        sharp(filePath)
            .resize(width, height)
            .toFile( `${filePath}.transformed.jpg`, function(transformError) {

                // Delete the original file as it is no longer required
                fileSystem
                    .unlink(
                        filePath,
                        (fileDeleteError) => {
                            if( fileDeleteError ) {
                                console.error(`failed to cleanup image: ${filePath}.`);
                            }
                        }
                    );
                
                if( transformError ) {
                    console.error(`could not transform image: ${transformError}`);
                    res.send({
                        "status" : "FAILED",
                        "reason" : "failed to transform image."
                    });
                } else {
                    var transformedFileStream = fileSystem.createReadStream(`${filePath}.transformed.jpg`);
                    transformedFileStream.on(
                        'error',
                        function (error) {
                            console.error(`could not create transformed image file stream: ${error}`);
                            res.send({
                                "status" : "FAILED",
                                "reason" : "failed to create transformed file stream."
                            });
                        }
                    );
                    transformedFileStream.on(
                        'open',
                        function () {
                            s3
                                .putObject(
                                    {
                                        Bucket: AWS_BUCKET,
                                        Key: fileId,
                                        Body: transformedFileStream,
                                        ContentType: contentType
                                    },
                                    function (uploadError) {
                                        // Delete the transformed file as it is no longer required
                                        fileSystem
                                            .unlink(
                                                `${filePath}.transformed.jpg`,
                                                (fileDeleteError) => {
                                                    if( fileDeleteError ) {
                                                        console.error(`failed to cleanup transformed image: ${fileDeleteError}`);
                                                    }
                                                }
                                            );
                                        if(uploadError) {
                                            console.error(`could not upload file: ${uploadError}`);
                                            res.send({
                                                "status" : "FAILED",
                                                "reason" : "failed to upload stream."
                                            });
                                        } else {
                                            console.log(`successfully uploaded image with id: ${fileId}.`);
                                            res.send({
                                                "status" : "SUCCESS",
                                                "id" : fileId
                                            });
                                        }
                                    }
                                );
                        }
                    );
                }
            });
    }
)

app.get(
    '/:fileId',
    function (req, res, next) {
        s3
            .getObject(
                {
                    Bucket: AWS_BUCKET,
                    Key: req.params.fileId
                }
            )
            .on('httpHeaders', function (statusCode, headers) {
                res.set('Content-Length', headers['content-length']);
                res.set('Content-Type', headers['content-type']);
                this.response.httpResponse.createUnbufferedStream()
                    .pipe(res);
            })
            .send();
    }
)

app.listen(
    PORT,
    () => console.info( `listening on port ${PORT}.` )
)