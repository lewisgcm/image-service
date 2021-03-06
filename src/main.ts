import * as Express from "express";
import * as Multer from "multer";
import * as FileSystem from "fs";

import { ConfigLoader } from "./config/configLoader";
import { ImageProcessor } from "./image/imageProcessor";

const config = ConfigLoader.LoadSync( process.env["CONFIG_FILE"] || "./config.yaml" );
const uploader = ConfigLoader.GetUploader(config);
const upload = Multer.default({ dest: config.uploadDirectory });
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
						() => {
							uploader
								.Upload(
									transformedFile
								).then(
									(result) => {
										FileSystem.unlink(
											transformedFile,
											() => {
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
											() => {
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
						() => {
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