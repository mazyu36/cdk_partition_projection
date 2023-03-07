import { SecurityLogsTable } from './construct/securityLogsTable';
import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { CloudTrail } from './construct/sample/CloudTrail';
import { Config } from './construct/sample/Config';
import { Athena } from './construct/sample/athena';

export class SecurityTableStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Create Sample Resources
    const cloudTrail = new CloudTrail(this, 'CloudTrailConstruct', {})
    const config = new Config(this, 'ConfigConstruct', {})
    new Athena(this, 'Athena', {})

    // Create Logs Tables
    new SecurityLogsTable(this, 'SecurityLogsTables', {
      cloudTrailLogsBucketName: cloudTrail.cloudTrailLogsBucket.bucketName,
      configLogsBucketName: config.configLogsBucket.bucketName
    })
  }
}
