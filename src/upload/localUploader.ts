import * as FileSystem from "fs";
import UUID from 'uuid/v4';

import { Config } from "../config/config";
import { Uploader } from "./uploader";
import { LocalUploadResult } from "./localUploadResult";

export class LocalUploader implements Uploader<LocalUploadResult> {

	private saveDir: string
	
	constructor( config: Config ) {
		this.saveDir = config.local.saveDirectory;
	}

	Upload( filePath: FileSystem.PathLike ): Promise<LocalUploadResult> {
		return new Promise(
			(resolve, reject) => {
				var fileId = UUID();
				FileSystem
					.copyFile(
						filePath,
						`${this.saveDir}/${fileId}`,
						(error) => {
							if( error ) {
								return reject(`could not move the file: ${error}`);
							} else {
								return resolve({
									filePath: `${this.saveDir}/${fileId}`
								});
							}
						}
					);
			}
		)
	}
}