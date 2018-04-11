import * as FileSystem from "fs";
import UUID from 'uuid/v4';

import { LocalConfig } from "../config/config";
import { Uploader } from "./uploader";
import { LocalUploadResult } from "./localUploadResult";

export class LocalUploader implements Uploader<LocalUploadResult> {

	private saveDir: string
	
	constructor( config: LocalConfig ) {
		this.saveDir = config.saveDirectory;
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
								return reject(`could not copy the file: ${error}`);
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