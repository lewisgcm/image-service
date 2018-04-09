import { IResult } from "./result";
import * as FileSystem from "fs";

export interface IUploader {
	Upload( filePath: FileSystem.PathLike ): Promise<IResult>
}