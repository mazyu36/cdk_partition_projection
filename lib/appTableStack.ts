import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { ApplicationLogsTable } from './construct/ApplicationLogsTable';
import { NetworkLogsTable } from './construct/NetworkLogsTable';
import { Alb } from './construct/sample/alb';
import { Route53 } from './construct/sample/route53';
import { Vpc } from './construct/sample/vpc';
import { Waf } from './construct/sample/waf';

export class AppTableStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Create Sample Resources
    const vpc = new Vpc(this, 'VpcConstruct', {})
    const waf = new Waf(this, 'WafConstruct', {})
    const alb = new Alb(this, 'AlbConstruct', {
      myVpc: vpc.myVpc,
      webAcl: waf.webAcl
    })

    const route53 = new Route53(this, 'Route53Construct', {
      myVpc: vpc.myVpc
    })

    // Create Logs Tables
    new ApplicationLogsTable(this, 'ApplicationLogsTable', {
      albAccessLogsBucketName: alb.albLogsBucket.bucketName,
      wafTrafficLogsBucketName: waf.wafTrafficLogsBucket.bucketName,
      webAclName: waf.webAcl.name!
    })

    new NetworkLogsTable(this, 'NetworkLogsTable', {
      vpcFlowLogsBucketName: vpc.vpcFlowLogsBucket.bucketName,
      route53QueryLogsBucketName: route53.route53QueryLogsBucket.bucketName,
      vpcId: vpc.myVpc.vpcId
    })

  }
}
