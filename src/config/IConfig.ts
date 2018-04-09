export interface IConfig {
	port: number
	uploadDirectory: string
	aws : {
		bucket: string,
		secret: string,
		key: string,
		endpoint: string,
		pathStyle: boolean
	}
}