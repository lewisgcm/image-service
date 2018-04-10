import { PathLike } from "fs";

export interface Uploader<T> {
	Upload( filePath: PathLike ): Promise<T>
}