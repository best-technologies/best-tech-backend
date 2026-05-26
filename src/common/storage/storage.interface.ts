export interface MulterImageFile {
  buffer: Buffer;
  mimetype: string;
  originalname?: string;
}

export interface StoredImage {
  /** S3 object key or Cloudinary public_id */
  key: string;
  /** Public HTTPS URL */
  url: string;
}

export interface IStorageImplementation {
  uploadImage(
    file: MulterImageFile,
    folder: string,
    filenameSuffix?: string,
  ): Promise<StoredImage>;
  deleteImage(key: string): Promise<void>;
}
