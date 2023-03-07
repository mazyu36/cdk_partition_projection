import { Construct } from 'constructs';
import { aws_glue as glue } from 'aws-cdk-lib';

import * as cdk from 'aws-cdk-lib';

export interface SecurityLogsTableProps {
  cloudTrailLogsBucketName: string
  configLogsBucketName: string

}

export class SecurityLogsTable extends Construct {
  constructor(scope: Construct, id: string, props: SecurityLogsTableProps) {
    super(scope, id);

    // Glue Database
    const securityLogsDatabase = new glue.CfnDatabase(scope, 'SecurityLogsDatabase', {
      catalogId: cdk.Stack.of(scope).account,
      databaseInput: {
        name: 'security_logs_database',
      },
    });

    // Glue Table (CloudTrail Logs) with Partition Projection
    const cloudTailLogsTable = new glue.CfnTable(scope, "CloudTrailLogsTable", {
      databaseName: 'security_logs_database',
      catalogId: cdk.Stack.of(scope).account,
      tableInput: {
        name: 'cloudtrail_logs_tables',
        tableType: "EXTERNAL_TABLE",
        parameters: {
          "projection.enabled": "true",
          "projection.region.type": "enum",
          "projection.region.values": "us-east-1,us-east-2,us-west-1,us-west-2,af-south-1,ap-east-1,ap-south-1,ap-northeast-2,ap-southeast-1,ap-southeast-2,ap-northeast-1,ca-central-1,eu-central-1,eu-west-1,eu-west-2,eu-south-1,eu-west-3,eu-north-1,me-south-1,sa-east-1",
          "projection.date.type": "date",
          "projection.date.range": "NOW-1YEARS,NOW+9HOUR",
          "projection.date.format": "yyyy/MM/dd",
          "projection.date.interval": "1",
          "projection.date.interval.unit": "DAYS",
          "storage.location.template": `s3://${props.cloudTrailLogsBucketName}/AWSLogs/${cdk.Stack.of(scope).account}/` + "CloudTrail/${region}/${date}",
          "classification": "cloudtrail",
          "compressionType": "gzip",
          "typeOfData": "file",
        },
        storageDescriptor: {
          columns: [
            {
              "name": "eventVersion",
              "type": "string"
            },
            {
              "name": "useridentity",
              "type": "struct<type:string,principalId:string,arn:string,accountId:string,invokedBy:string,accessKeyId:string,userName:string,sessionContext:struct<attributes:struct<mfaAuthenticated:string,creationDate:string>,sessionIssuer:struct<type:string,principalId:string,arn:string,accountId:string,userName:string>>>"
            },
            {
              "name": "eventTime",
              "type": "string"
            },
            {
              "name": "eventSource",
              "type": "string"
            },
            {
              "name": "eventName",
              "type": "string"
            },
            {
              "name": "awsRegion",
              "type": "string"
            },
            {
              "name": "sourceIpAddress",
              "type": "string"
            },
            {
              "name": "userAgent",
              "type": "string"
            },
            {
              "name": "errorCode",
              "type": "string"
            },
            {
              "name": "errorMessage",
              "type": "string"
            },
            {
              "name": "requestParameters",
              "type": "string"
            },
            {
              "name": "responseElements",
              "type": "string"
            },
            {
              "name": "additionalEventData",
              "type": "string"
            },
            {
              "name": "requestId",
              "type": "string"
            },
            {
              "name": "eventId",
              "type": "string"
            },
            {
              "name": "resources",
              "type": "array<struct<arn:string,accountId:string,type:string>>"
            },
            {
              "name": "eventType",
              "type": "string"
            },
            {
              "name": "apiVersion",
              "type": "string"
            },
            {
              "name": "readOnly",
              "type": "string"
            },
            {
              "name": "recipientAccountId",
              "type": "string"
            },
            {
              "name": "serviceEventDetails",
              "type": "string"
            },
            {
              "name": "sharedEventID",
              "type": "string"
            },
            {
              "name": "vpcEndpointId",
              "type": "string"
            },

          ],
          inputFormat: "com.amazon.emr.cloudtrail.CloudTrailInputFormat",
          outputFormat: "org.apache.hadoop.hive.ql.io.HiveIgnoreKeyTextOutputFormat",
          serdeInfo: {
            serializationLibrary: "com.amazon.emr.hive.serde.CloudTrailSerde",
            parameters: {
              'serialization.format': '1'
            }
          },
          location: `s3://${props.cloudTrailLogsBucketName}/AWSLogs/${cdk.Stack.of(scope).account}/CloudTrail/`,
        },
        partitionKeys: [
          {
            "name": "region",
            "type": "string"
          },
          {
            "name": "date",
            "type": "string"
          },
        ]
      }
    })

    // Glue Table (Config Logs) with Partition Projection
    const configLogsTable = new glue.CfnTable(scope, "ConfigLogsTable", {
      databaseName: 'security_logs_database',
      catalogId: cdk.Stack.of(scope).account,
      tableInput: {
        name: 'config_logs',
        tableType: "EXTERNAL_TABLE",
        parameters: {
          "projection.enabled": "true",
          "projection.region.type": "enum",
          "projection.region.values": "us-east-1,us-east-2,us-west-1,us-west-2,af-south-1,ap-east-1,ap-south-1,ap-northeast-2,ap-southeast-1,ap-southeast-2,ap-northeast-1,ca-central-1,eu-central-1,eu-west-1,eu-west-2,eu-south-1,eu-west-3,eu-north-1,me-south-1,sa-east-1",
          "projection.date.type": "date",
          "projection.date.range": "NOW-1YEARS,NOW+9HOUR",
          "projection.date.format": "yyyy/M/d",
          "projection.date.interval": "1",
          "projection.date.interval.unit": "DAYS",
          "projection.type.type": "enum",
          "projection.type.values": "ConfigHistory,ConfigSnapshot",
          "storage.location.template": `s3://${props.configLogsBucketName}/AWSLogs/${cdk.Stack.of(scope).account}/Config/` + "${region}/${date}/${type}"
        },
        storageDescriptor: {
          columns: [
            {
              "name": "fileversion",
              "type": "string"
            },
            {
              "name": "configsnapshotid",
              "type": "string"
            },
            {
              "name": "configurationitems",
              "type": "array<struct<configurationItemVersion:string,configurationItemCaptureTime:string,configurationStateId:bigint,awsAccountId:string,configurationItemStatus:string,resourceType:string,resourceId:string,resourceName:string,ARN:string,awsRegion:string,availabilityZone:string,configurationStateMd5Hash:string,resourceCreationTime:string>>"
            }
          ],
          inputFormat: "org.apache.hadoop.mapred.TextInputFormat",
          outputFormat: "org.apache.hadoop.hive.ql.io.HiveIgnoreKeyTextOutputFormat",
          serdeInfo: {
            serializationLibrary: "org.apache.hive.hcatalog.data.JsonSerDe",
            parameters: {
              'serialization.format': '1'
            }
          },
          location: `s3://${props.configLogsBucketName}/AWSLogs/${cdk.Stack.of(scope).account}/Config/`,
        },
        partitionKeys: [
          {
            "name": "region",
            "type": "string"
          },
          {
            "name": "date",
            "type": "string"
          },
          {
            "name": "type",
            "type": "string"
          },
        ]
      }
    })

    cloudTailLogsTable.addDependency(securityLogsDatabase)
    configLogsTable.addDependency(securityLogsDatabase)


  }
}