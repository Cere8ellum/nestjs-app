import { v4 as uuidv4 } from 'uuid';

export class FileLoaderHelper {
  private _publicPath: string;

  constructor(path) {
    this._publicPath = './public' + path;
  }

  get path() {
    return this._publicPath;
  }
  public customFileName(req, file, cb) {
    const originalName = file.originalname.split('.');
    const fileExtension = originalName[originalName.length - 1];
    cb(null, `${uuidv4()}.${fileExtension}`);
  }
}
