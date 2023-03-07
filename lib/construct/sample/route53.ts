import { Construct } from 'constructs';
import { aws_route53resolver as route53resolver } from 'aws-cdk-lib';
import { aws_s3 as s3 } from 'aws-cdk-lib';
import * as cdk from 'aws-cdk-lib';
import { aws_ec2 as ec2 } from 'aws-cdk-lib';
import { aws_iam as iam } from 'aws-cdk-lib';


export interface Route53Props {
  myVpc: ec2.Vpc
}

export class Route53 extends Construct {

  public readonly route53QueryLogsBucket: s3.Bucket

  constructor(scope: Construct, id: string, props: Route53Props) {
    super(scope, id);

    // Route53
    const route53QueryLogsBucket = new s3.Bucket(scope, 'Route53QueryLogsBucket', {
      accessControl: s3.BucketAccessControl.PRIVATE,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      versioned: true,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
      enforceSSL: true,
    });
    this.route53QueryLogsBucket = route53QueryLogsBucket


    const route53ResolverRole = new iam.Role(scope, 'Route53ResolverRole', {
      assumedBy: new iam.ServicePrincipal('route53resolver.amazonaws.com'),
    })

    route53ResolverRole.addToPrincipalPolicy(new iam.PolicyStatement({
      actions: [
        "logs:CreateLogDelivery",
        "logs:GetLogDelivery",
        "logs:UpdateLogDelivery",
        "logs:DeleteLogDelivery",
        "logs:ListLogDeliveries",
        "logs:DescribeResourcePolicies",
        "logs:DescribeLogGroups",
        "s3:GetBucketPolicy"
      ],
      resources: ['*']
    }))


    const cfnResolverQueryLoggingConfig = new route53resolver.CfnResolverQueryLoggingConfig(scope, 'CfnResolverQueryLoggingConfig', {
      destinationArn: route53QueryLogsBucket.bucketArn,
      name: 'query-logs-config',
    });


    const cfnResolverQueryLoggingConfigAssociation = new route53resolver.CfnResolverQueryLoggingConfigAssociation(scope, 'CfnResolverQueryLoggingConfigAssociation', {
      resolverQueryLogConfigId: cfnResolverQueryLoggingConfig.attrId,
      resourceId: props.myVpc.vpcId,
    });

    cfnResolverQueryLoggingConfig.addDependency(route53ResolverRole.node.defaultChild as iam.CfnRole)
    cfnResolverQueryLoggingConfigAssociation.addDependency(cfnResolverQueryLoggingConfig)
  }
}