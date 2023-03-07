import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { aws_ec2 as ec2 } from 'aws-cdk-lib';
import { aws_s3 as s3 } from 'aws-cdk-lib';
import { aws_kms as kms } from 'aws-cdk-lib';
import { aws_iam as iam } from 'aws-cdk-lib';

export interface VpcProps {

}

export class Vpc extends Construct {
  public readonly myVpc: ec2.Vpc;
  public readonly vpcFlowLogsBucket: s3.Bucket

  constructor(scope: Construct, id: string, props: VpcProps) {
    super(scope, id);

    const myVpc = new ec2.Vpc(scope, 'Vpc', {
      ipAddresses: ec2.IpAddresses.cidr('10.0.0.0/16'),
      maxAzs: 2,
      natGateways: 0,
      flowLogs: {},
      subnetConfiguration: [
        {
          cidrMask: 24,
          name: 'Public',
          subnetType: ec2.SubnetType.PUBLIC,
        },
        {
          cidrMask: 22,
          name: 'Private',
          subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS,
        },
        {
          cidrMask: 22,
          name: 'Protected',
          subnetType: ec2.SubnetType.PRIVATE_ISOLATED,
        },
      ],
    });

    //  --------------------------------------------------------------
    //  Bucket for VPC Flow log

    // CMK
    const flowLogKey = new kms.Key(scope, 'Key', {
      enableKeyRotation: true,
      description: 'for VPC Flow log',
      alias: `${id}-for-flowlog`,
      removalPolicy: cdk.RemovalPolicy.DESTROY
    });
    flowLogKey.addToResourcePolicy(
      new iam.PolicyStatement({
        actions: ['kms:Encrypt*', 'kms:Decrypt*', 'kms:ReEncrypt*', 'kms:GenerateDataKey*', 'kms:Describe*'],
        principals: [new iam.ServicePrincipal('delivery.logs.amazonaws.com')],
        resources: ['*'],
      }),
    );

    // Bucket
    const flowLogBucket = new s3.Bucket(scope, 'FlowLogBucket', {
      accessControl: s3.BucketAccessControl.PRIVATE,
      encryptionKey: flowLogKey,
      encryption: s3.BucketEncryption.KMS,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
      enforceSSL: true,
    });
    this.vpcFlowLogsBucket = flowLogBucket

    myVpc.addFlowLog('FlowLogs', {
      destination: ec2.FlowLogDestination.toS3(flowLogBucket),
      trafficType: ec2.FlowLogTrafficType.ALL,
    });
    this.myVpc = myVpc;


  }
}