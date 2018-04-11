import { PathLike } from "fs";
import * as Sharp from "sharp";

import { Config } from "../config/config";

const SupportedOperations = [
	"resize",
	"crop",
	"embed",
	"max",
	"min",
	"ignoreAspectRatio",
	"withoutEnlargement",
	"rotate",
	"extract",
	"flip",
	"flop",
	"sharpen",
	"median",
	"blur",
	"extend",
	"flatten",
	"trim",
	"gamma",
	"negate",
	"normalise",
	"normalize",
	"convolve",
	"threshold",
	"linear",
	"background",
	"greyscale",
	"grayscale",
	"toColourspace",
	"toColorspace",
	"jpeg",
	"png",
	"webp",
	"tiff",
	"raw"
];

export class ImageProcessor {
	Process(
		filePath: PathLike,
		options: any
	) : Promise<PathLike>
	{
		return new Promise(
			(resolve, reject) => {
				var builder = Sharp
					.default(filePath.toString())

				try {
					var pipeline: [ { [key: string]: any } ] = JSON
						.parse(options.pipeline);

					for( var stage in pipeline ) {
						for( var operation in pipeline[stage] ) {
							if( SupportedOperations.indexOf(operation) != -1 ) {
								console.info( `[%s] INFO: executing operation %s with arguments: `, new Date(), operation, pipeline[stage][operation], "." );
								(<any>(builder))[operation].apply( builder, pipeline[stage][operation] )
							} else {
								return reject(`unsupported operation: ${operation}`);
							}
						}
					}
				} catch(e) {
					return reject(`could not parse the supplied options: ${e}`);
				}

				builder
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