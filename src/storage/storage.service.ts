import { BadRequestException, Injectable } from '@nestjs/common';
import * as AWS from 'aws-sdk';

@Injectable()
export class StorageService {
  AWS_S3_BUCKET = process.env.AWS_S3_BUCKET;
  s3 = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    endpoint: process.env.AWS_ENDPOINT_URL,
  });

  async s3_upload(file, name, mimetype) {
    const params = {
      Bucket: this.AWS_S3_BUCKET,
      Key: String(name),
      Body: file,
      ACL: 'public-read',
      ContentType: mimetype,
      ContentDisposition: 'inline',
      CreateBucketConfiguration: {
        LocationConstraint: 'nl-ams',
      },
    };

    try {
      return await this.s3.upload(params).promise();
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }
}
