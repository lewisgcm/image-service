import { S3, AWSError } from "aws-sdk";
import * as FileSystem from "fs";
import UUID from 'uuid/v4';

import { Config, AWSConfig } from "../config/config";
import { Uploader } from "./uploader";
import { AWSUploadResult } from "./awsUploadResult";

export class AWSUploader implements Uploader<AWSUploadResult> {

	private s3: S3;
	private bucket: string;
	
	constructor( config: AWSConfig ) {
		this.s3 = new S3({
			accessKeyId: config.key,
			secretAccessKey: config.secret,
			endpoint: config.endpoint,
			s3ForcePathStyle: config.pathStyle
		});
		this.bucket = config.bucket;
	}

	setS3(s3: S3) {
		this.s3 = s3;
	}

	Upload( filePath: FileSystem.PathLike ): Promise<AWSUploadResult> {
		return new Promise(
			(resolve, reject) => {
				var fileStream = FileSystem
					.createReadStream( filePath );

				var fileId = UUID();

				fileStream.on(
					'error',
					(error: Error) => {
						return reject(`could not create file stream for path ${filePath}: ${error}`);
					}
				);

				fileStream.on(
					'open',
					() => {
						this.s3
							.putObject(
								{
									Bucket: this.bucket,
									Key: fileId,
									Body: fileStream
								},
								( awsError: AWSError, response: S3.PutObjectOutput ) => {
									if( awsError ) {
										return reject(`could not upload file: ${awsError}`);
									} else {
										return resolve({
											fileId: fileId
										});
									}
								}
							);
					}
				);
			}
		)
	}
}