import { PathLike } from "fs";
import { UploadResult } from "./uploadResult";

export interface Uploader {
	Upload( filePath: PathLike ): Promise<UploadResult>
}