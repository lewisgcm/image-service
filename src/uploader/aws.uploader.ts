import { IConfig } from "../config/config";
import { IUploader } from "./uploader";
import { IResult } from "./result";
import { S3, AWSError } from "aws-sdk";
import * as FileSystem from "fs";
import UUID from 'uuid/v4';

export class AWSUploader implements IUploader {

	private s3: S3;
	private bucket: string;
	
	constructor( config: IConfig ) {
		this.s3 = new S3({
			accessKeyId: config.aws.key,
			secretAccessKey: config.aws.secret,
			endpoint: config.aws.endpoint,
			s3ForcePathStyle: config.aws.pathStyle
		});
		this.bucket = config.aws.bucket;
	}

	Upload( filePath: FileSystem.PathLike ): Promise<IResult> {
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