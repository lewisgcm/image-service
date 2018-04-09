import { IConfig } from "../config/IConfig";
import { IImageProcessingOptions } from "./IImageProcessingOptions";
import * as FileSystem from "fs";

import * as Sharp from "sharp";

export class ImageProcessor {
	Process(
		filePath: FileSystem.PathLike,
		options: IImageProcessingOptions
	) : Promise<FileSystem.PathLike>
	{
		return new Promise(
			(resolve, reject) => {
				var builder = Sharp
					.default(filePath.toString())

				if( options.Resize ) {
					builder = builder
						.resize(options.Resize.Width, options.Resize.Height);
				}

				builder
					.jpeg({
						quality: 100
					})
					.toFile(
						`${filePath}.transformed.jpg`,
						(error) => {
							if( error ) {
								return reject(`failed to process the image: ${filePath}: ${error}.`);
							} else {
								return resolve(`${filePath}.transformed.jpg`);
							}
						}
					);
			}
		);
	}

}