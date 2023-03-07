import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { aws_config as config } from 'aws-cdk-lib';
import { aws_iam as iam } from 'aws-cdk-lib';
import { aws_s3 as s3 } from 'aws-cdk-lib';

export interface ConfigProps {

}

export class Config extends Construct {
  public readonly configLogsBucket: s3.Bucket

  constructor(scope: Construct, id: string, props: ConfigProps) {
    super(scope, id);


    const role = new iam.Role(scope, 'ConfigRole', {
      assumedBy: new iam.ServicePrincipal('config.amazonaws.com'),
      managedPolicies: [iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AWS_ConfigRole')],
    });

    new config.CfnConfigurationRecorder(scope, 'ConfigRecorder', {
      roleArn: role.roleArn,
      recordingGroup: {
        allSupported: true,
        includeGlobalResourceTypes: true,
      },
    });

    const bucket = new s3.Bucket(scope, 'ConfigBucket', {
      accessControl: s3.BucketAccessControl.PRIVATE,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      versioned: true,
      removalPolicy: cdk.RemovalPolicy.RETAIN,
      encryption: s3.BucketEncryption.S3_MANAGED,
      enforceSSL: true,
    });

    // Attaches the AWSConfigBucketPermissionsCheck policy statement.
    bucket.addToResourcePolicy(
      new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        principals: [role],
        resources: [bucket.bucketArn],
        actions: ['s3:GetBucketAcl'],
      }),
    );

    // Attaches the AWSConfigBucketDelivery policy statement.
    bucket.addToResourcePolicy(
      new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        principals: [role],
        resources: [bucket.arnForObjects(`AWSLogs/${cdk.Stack.of(scope).account}/Config/*`)],
        actions: ['s3:PutObject'],
        conditions: {
          StringEquals: {
            's3:x-amz-acl': 'bucket-owner-full-control',
          },
        },
      }),
    );


    new config.CfnDeliveryChannel(scope, 'ConfigDeliveryChannel', {
      s3BucketName: bucket.bucketName,
      configSnapshotDeliveryProperties: {
        deliveryFrequency: 'TwentyFour_Hours'
      }
    });

    this.configLogsBucket = bucket

  }
}
