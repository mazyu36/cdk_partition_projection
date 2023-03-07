import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { aws_wafv2 as wafv2 } from 'aws-cdk-lib';
import { aws_ec2 as ec2 } from 'aws-cdk-lib';
import { aws_elasticloadbalancingv2 as elbv2 } from 'aws-cdk-lib';
import { aws_s3 as s3 } from 'aws-cdk-lib';
import { aws_iam as iam } from 'aws-cdk-lib';
import { region_info as ri } from 'aws-cdk-lib';

export interface AlbProps {
  myVpc: ec2.Vpc;
  webAcl: wafv2.CfnWebACL;
}

export class Alb extends Construct {

  public readonly albLogsBucket: s3.Bucket

  constructor(scope: Construct, id: string, props: AlbProps) {
    super(scope, id);



    // --- Security Groups ---

    //Security Group of ALB for App
    const securityGroupForAlb = new ec2.SecurityGroup(scope, 'SgAlb', {
      vpc: props.myVpc,
      allowAllOutbound: true,
    });

    // ------------ Application LoadBalancer ---------------

    // ALB for App Server
    const lbForApp = new elbv2.ApplicationLoadBalancer(scope, 'Alb', {
      vpc: props.myVpc,
      internetFacing: true,
      securityGroup: securityGroupForAlb,
      vpcSubnets: props.myVpc.selectSubnets({
        subnetGroupName: 'Public',
      }),
    });

    const lbForAppListener = lbForApp.addListener('http', {
      port: 80,
      protocol: elbv2.ApplicationProtocol.HTTP,
      open: true,
    });

    lbForAppListener.addAction('Fixed', {
      action: elbv2.ListenerAction.fixedResponse(200, {
        contentType: 'text/plain',
        messageBody: 'OK'
      })
    })

    // Enabled WAF for ALB
    new wafv2.CfnWebACLAssociation(scope, 'WebAclAssociation', {
      resourceArn: lbForApp.loadBalancerArn,
      webAclArn: props.webAcl.attrArn,
    });

    // Enable ALB Access Logging
    //
    // This bucket can not be encrypted with KMS CMK
    // See: https://docs.aws.amazon.com/elasticloadbalancing/latest/application/load-balancer-access-logs.html#access-logging-bucket-permissions
    //
    const albLogBucket = new s3.Bucket(scope, 'alb-log-bucket', {
      accessControl: s3.BucketAccessControl.PRIVATE,
      encryption: s3.BucketEncryption.S3_MANAGED,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      removalPolicy: cdk.RemovalPolicy.RETAIN,
      enforceSSL: true,
    });

    lbForApp.setAttribute('access_logs.s3.enabled', 'true');
    lbForApp.setAttribute('access_logs.s3.bucket', albLogBucket.bucketName);

    // Permissions for Access Logging
    //    Why don't use bForApp.logAccessLogs(albLogBucket); ?
    //    Because logAccessLogs add wider permission to other account (PutObject*). S3 will become Noncompliant on Security Hub [S3.6]
    //    See: https://docs.aws.amazon.com/securityhub/latest/userguide/securityhub-standards-fsbp-controls.html#fsbp-s3-6
    //    See: https://docs.aws.amazon.com/elasticloadbalancing/latest/application/load-balancer-access-logs.html#access-logging-bucket-permissions
    albLogBucket.addToResourcePolicy(
      new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        actions: ['s3:PutObject'],
        // ALB access logging needs S3 put permission from ALB service account for the region
        principals: [new iam.AccountPrincipal(ri.RegionInfo.get(cdk.Stack.of(scope).region).elbv2Account)],
        resources: [albLogBucket.arnForObjects(`AWSLogs/${cdk.Stack.of(scope).account}/*`)],
      }),
    );
    albLogBucket.addToResourcePolicy(
      new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        actions: ['s3:PutObject'],
        principals: [new iam.ServicePrincipal('delivery.logs.amazonaws.com')],
        resources: [albLogBucket.arnForObjects(`AWSLogs/${cdk.Stack.of(scope).account}/*`)],
        conditions: {
          StringEquals: {
            's3:x-amz-acl': 'bucket-owner-full-control',
          },
        },
      }),
    );
    albLogBucket.addToResourcePolicy(
      new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        actions: ['s3:GetBucketAcl'],
        principals: [new iam.ServicePrincipal('delivery.logs.amazonaws.com')],
        resources: [albLogBucket.bucketArn],
      }),
    );

    this.albLogsBucket = albLogBucket
  }
}