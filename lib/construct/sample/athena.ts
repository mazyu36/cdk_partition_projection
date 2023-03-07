import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { aws_athena as athena } from 'aws-cdk-lib';
import { aws_s3 as s3 } from 'aws-cdk-lib';

export interface AthenaProps {

}

export class Athena extends Construct {
  constructor(scope: Construct, id: string, props: AthenaProps) {
    super(scope, id);

    // Athena Result Bucket
    const athenaResultBucket = new s3.Bucket(scope, 'AthenaResultBucket', {
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true
    })

    // Athena WorkGroup
    new athena.CfnWorkGroup(scope, 'AthenaWorkGroupV3', {
      name: 'WorkGroupV3',
      workGroupConfiguration: {
        engineVersion: {
          selectedEngineVersion: 'Athena engine version 3',
        },
        resultConfiguration: {
          outputLocation: `s3://${athenaResultBucket.bucketName}/result`
        },
        bytesScannedCutoffPerQuery: 100000000
      },
      recursiveDeleteOption: true,
    });

  }
}