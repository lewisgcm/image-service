import * as Express from "express";
import * as Multer from "multer";
import * as FileSystem from "fs";

import { ConfigLoader } from "./config/configLoader";
import { AWSUploader } from "./upload/awsUploader";
import { LocalUploader } from "./upload/localUploader";
import { ImageProcessor } from "./image/imageProcessor";

const config = ConfigLoader
	.LoadSync( process.env["CONFIG_FILE"] || "./config.yaml" );

const upload = Multer.default({ dest: config.uploadDirectory });
const uploader = new LocalUploader(config);
const imageProcessor = new ImageProcessor();
const app = Express.default();

app.post(
	"/",
	upload.single('image'),
	(request, response, next) => {
		console.info( `[%s] INFO: received image request.`, new Date() );
		imageProcessor
			.Process(
				request.file.path,
				request.body
			).then(
				(transformedFile) => {
					FileSystem.unlink(
						request.file.path,
						(deleteError) => {
							if(deleteError) {
								console.error( `[%s] WARN: could not remove file %s.`, new Date(), deleteError );
							}
							uploader
								.Upload(
									transformedFile
								).then(
									(result) => {
										FileSystem.unlink(
											transformedFile,
											(deleteError) => {
												if(deleteError) {
													console.error( `[%s] WARN: could not remove file %s.`, new Date(), deleteError );
												}
												console.info( `[%s] INFO: image uploaded.`, new Date() );
												return response
													.send(result);
											}
										);
									}
								).catch(
									(error) => {
										FileSystem.unlink(
											transformedFile,
											(deleteError) => {
												if(deleteError) {
													console.error( `[%s] WARN: could not remove file %s.`, new Date(), deleteError );
												}
												console.error( `[%s] ERROR: %s.`, new Date(), error );
												response.status(500);
												return response.send({
													'error' : error
												});
											}
										);
									}
								);
						}
					);
				}
			).catch(
				(error) => {
					FileSystem.unlink(
						request.file.path,
						(deleteError) => {
							if(deleteError) {
								console.error( `[%s] WARN: could not remove file %s.`, new Date(), deleteError );
							}
							console.error( `[%s] ERROR: %s.`, new Date(), error );
							response.status(500);
							return response.send({
								'error' : error
							});
						}
					);
				}
			);
	}
);

app.get(
	"/health",
	(request, response, next) => {
		console.info( `[%s] INFO: getting service health.`, new Date() );
		response
			.send({
				'cpuUsage' : process.cpuUsage(),
				'memoryUsage' : process.memoryUsage()
			});
	}
);

module.exports = app.listen(
    config.port,
    () => console.info( `[%s] INFO: listening on port ${config.port}.`, new Date() )
);