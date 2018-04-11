export interface AWSConfig {
	bucket: string,
	secret: string,
	key: string,
	endpoint: string,
	pathStyle: boolean
}

export interface LocalConfig {
	saveDirectory: string
}

export interface Config {
	port: number
	uploadDirectory: string
	upload: AWSConfig | LocalConfig
}