export interface Config {
	port: number
	uploadDirectory: string
	aws : {
		bucket: string,
		secret: string,
		key: string,
		endpoint: string,
		pathStyle: boolean
	},
	local : {
		saveDirectory: string
	}
}