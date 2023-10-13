import { Injectable } from '@nestjs/common';
import * as AWS from 'aws-sdk';

@Injectable()
export class StorageService {
  AWS_S3_BUCKET = process.env.AWS_S3_BUCKET;
  s3 = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    endpoint: process.env.AWS_ENDPOINT_URL,
  });

  async s3_upload(file, fileName): Promise<any> {
    const params = {
      Bucket: this.AWS_S3_BUCKET,
      Key: fileName,
      Body: file.buffer,
      ACL: 'public-read',
      ContentType: file.mimetype,
      ContentDisposition: 'inline',
      CreateBucketConfiguration: {
        LocationConstraint: 'nl-ams',
      },
    };

    const uploadedImageInfo = await this.s3.upload(params).promise();

    return { location: uploadedImageInfo.Location };
  }

  async s3_delete(location: URL) {
    console.log(location.pathname);
    const params = {
      Bucket: this.AWS_S3_BUCKET,
      Key: location.pathname.slice(-(location.pathname.length - 1)),
    };

    return this.s3.deleteObject(params).promise();
  }
}
