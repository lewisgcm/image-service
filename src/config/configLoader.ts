import * as FileSystem from 'fs';
import * as YAML from 'js-yaml';
import { Config, LocalConfig, AWSConfig } from './config';
import { Uploader } from './../upload/uploader';
import { AWSUploader } from './../upload/awsUploader';
import { LocalUploader } from './../upload/localUploader';

export class ConfigLoader {
	static LoadSync(filename: String): Config {

		var config: Config = <Config>YAML
			.safeLoad(
				FileSystem.readFileSync(<any>filename, 'utf8')
			);

		ConfigLoader
			._resolve_environment_variables(
				config
			);

		return config;
	}

	static GetUploader(config: Config): Uploader<any> {
		if( (<LocalConfig>config.upload).saveDirectory  !== undefined ) {
			return new LocalUploader((<LocalConfig>config.upload));
		} else {
			return new AWSUploader((<AWSConfig>config.upload));
		}
	}

	private static _resolve_environment_variables(config: any) {
		for( var property in config ) {
			if (config.hasOwnProperty(property)) {
				if(typeof config[property] === "object") {
					ConfigLoader._resolve_environment_variables( config[property] )
				} else {
					config[property] = ConfigLoader._resolve_environment_variable(config[property]);
				}
			}
		}
	}

	private static _resolve_environment_variable(string: string)
	{
		var find = /\$\{([a-zA-Z0-9_]+)\}/;
		var match = find.exec(string);
		return (match !== null && match.length == 2) ? process.env[match[1]] : string;
	}
}