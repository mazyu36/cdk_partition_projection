import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { aws_s3 as s3 } from 'aws-cdk-lib';
import { aws_cloudtrail as trail } from 'aws-cdk-lib';

export interface CloudTrailProps {

}

export class CloudTrail extends Construct {
  public readonly cloudTrailLogsBucket: s3.Bucket

  constructor(scope: Construct, id: string, props: CloudTrailProps) {
    super(scope, id);

    // Bucket for CloudTrail
    const cloudTrailBucket = new s3.Bucket(scope, 'CloudTrailBucket', {
      accessControl: s3.BucketAccessControl.PRIVATE,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      versioned: true,
      serverAccessLogsPrefix: 'cloudtraillogs',
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
      enforceSSL: true,
    });
    this.cloudTrailLogsBucket = cloudTrailBucket


    // CloudTrail
    new trail.Trail(scope, 'CloudTrail', {
      bucket: cloudTrailBucket,
      enableFileValidation: true,
      includeGlobalServiceEvents: true,
      sendToCloudWatchLogs: true,
    });
  }

}
