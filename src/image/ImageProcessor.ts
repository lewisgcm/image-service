import { PathLike } from "fs";
import * as Sharp from "sharp";

import { Config } from "../config/config";
import { ImageProcessingOptions } from "./imageProcessingOptions";

export class ImageProcessor {
	Process(
		filePath: PathLike,
		options: ImageProcessingOptions
	) : Promise<PathLike>
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