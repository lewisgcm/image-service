import * as Express from "express";
import { ConfigLoader } from "./config/ConfigLoader";
import { AWSUploader } from "./uploader/aws.uploader";
import { ImageProcessor } from "./processing/ImageProcessor";

const config = ConfigLoader
	.LoadSync( process.env["CONFIG_FILE"] || "./config.yaml" );

const uploader = new AWSUploader(config);
const imageProcessor = new ImageProcessor();
const app = Express.default();

app.post(
	"/",
	upload.single('image'),
	(request, response, next) => {
		imageProcessor
			.Process(
				(<any>request).file.filePath,
				{
					Resize: {
						Width: 200
					}
				}
			).then(
				(transformedFile) => {
					uploader
						.Upload(
							transformedFile
						).then(
							() => {
								
							}
						)
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

app.listen(
    config.port,
    () => console.info( `[%s] INFO: listening on port ${config.port}.`, new Date() )
);