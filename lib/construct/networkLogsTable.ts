import { Construct } from 'constructs';
import { aws_glue as glue } from 'aws-cdk-lib';
import * as cdk from 'aws-cdk-lib';


export interface NetworkLogsTableProps {
  vpcFlowLogsBucketName: string
  route53QueryLogsBucketName: string,
  vpcId: string
}

export class NetworkLogsTable extends Construct {
  constructor(scope: Construct, id: string, props: NetworkLogsTableProps) {
    super(scope, id);

    // Glue Database
    const networkLogsDatabase = new glue.CfnDatabase(scope, 'NetworkLogsDatabase', {
      catalogId: cdk.Stack.of(scope).account,
      databaseInput: {
        name: 'network_logs_database',
      },
    });

    // Glue Table (Vpc Flow Logs) with Partition Projection
    const vpcFlowLogsTable = new glue.CfnTable(scope, "VpcFlowLogsTable", {
      databaseName: 'network_logs_database',
      catalogId: cdk.Stack.of(scope).account,
      tableInput: {
        name: 'vpc_flow_logs_tables',
        tableType: "EXTERNAL_TABLE",
        parameters: {
          "skip.header.line.count": "1",
          "projection.enabled": true,
          "projection.date.type": "date",
          "projection.date.range": "NOW-1YEARS, NOW+9HOUR",
          "projection.date.format": "yyyy/MM/dd",
          "projection.date.interval": "1",
          "projection.date.interval.unit": "DAYS",
          "storage.location.template": `s3://${props.vpcFlowLogsBucketName}/AWSLogs/${cdk.Stack.of(scope).account}/vpcflowlogs/${cdk.Stack.of(this).region}/` + "${date}",
        },
        storageDescriptor: {
          columns: [
            {
              "name": "version",
              "type": "int"
            },
            {
              "name": "account",
              "type": "string"
            },
            {
              "name": "interfaceid",
              "type": "string"
            },
            {
              "name": "sourceaddress",
              "type": "string"
            },
            {
              "name": "destinationaddress",
              "type": "string"
            },
            {
              "name": "sourceport",
              "type": "int"
            },
            {
              "name": "destinationport",
              "type": "int"
            },
            {
              "name": "protocol",
              "type": "int"
            },
            {
              "name": "numpackets",
              "type": "int"
            },
            {
              "name": "numbytes",
              "type": "bigint"
            },
            {
              "name": "starttime",
              "type": "int"
            },
            {
              "name": "endtime",
              "type": "int"
            },
            {
              "name": "action",
              "type": "string"
            },
            {
              "name": "logstatus",
              "type": "string"
            },
            {
              "name": "vpcid",
              "type": "string"
            },
            {
              "name": "subnetid",
              "type": "string"
            },
            {
              "name": "instanceid",
              "type": "string"
            },
            {
              "name": "tcpflags",
              "type": "int"
            },
            {
              "name": "type",
              "type": "string"
            },
            {
              "name": "pktsrcaddr",
              "type": "string"
            },
            {
              "name": "pktdstaddr",
              "type": "string"
            },
            {
              "name": "aws_region",
              "type": "string"
            },
            {
              "name": "azid",
              "type": "string"
            },
            {
              "name": "sublocationtype",
              "type": "string"
            },
            {
              "name": "sublocationid",
              "type": "string"
            },
            {
              "name": "pktsrcawsservice",
              "type": "string"
            },
            {
              "name": "pktdstawsservice",
              "type": "string"
            },
            {
              "name": "flowdirection",
              "type": "string"
            },
            {
              "name": "trafficpath",
              "type": "string"
            }
          ],
          inputFormat: "org.apache.hadoop.mapred.TextInputFormat",
          outputFormat: "org.apache.hadoop.hive.ql.io.HiveIgnoreKeyTextOutputFormat",
          serdeInfo: {
            serializationLibrary: "org.apache.hadoop.hive.serde2.lazy.LazySimpleSerDe",
            parameters: {
              'serialization.format': ' ',
              'field.delim': ' ',
            }
          },
          location: `s3://${props.vpcFlowLogsBucketName}/AWSLogs/${cdk.Stack.of(scope).account}/vpcflowlogs/${cdk.Stack.of(this).region}`,
        },
        partitionKeys: [
          {
            "name": "date",
            "type": "string"
          },
        ]
      }
    })


    // Glue Table (Route53 Query Logs) with Partition Projection
    const route53QueryLogsTable = new glue.CfnTable(scope, "Route53QueryLogsTable", {
      databaseName: 'network_logs_database',
      catalogId: cdk.Stack.of(scope).account,
      tableInput: {
        name: 'route53_query_logs_tables',
        tableType: "EXTERNAL_TABLE",
        parameters: {
          "skip.header.line.count": "1",
          "projection.enabled": true,
          "projection.date.type": "date",
          "projection.date.range": "NOW-1YEARS, NOW+9HOUR",
          "projection.date.format": "yyyy/MM/dd",
          "projection.date.interval": "1",
          "projection.date.interval.unit": "DAYS",
          "storage.location.template": `s3://${props.route53QueryLogsBucketName}/AWSLogs/${cdk.Stack.of(scope).account}/vpcdnsquerylogs/${props.vpcId}/` + "${date}",
        },
        storageDescriptor: {
          columns: [
            {
              "name": "version",
              "type": "string"
            },
            {
              "name": "account_id",
              "type": "string"
            },
            {
              "name": "region",
              "type": "string"
            },
            {
              "name": "vpc_id",
              "type": "string"
            },
            {
              "name": "query_timestamp",
              "type": "string"
            },
            {
              "name": "query_name",
              "type": "string"
            },
            {
              "name": "query_type",
              "type": "string"
            },
            {
              "name": "query_class",
              "type": "string"
            },
            {
              "name": "rcode",
              "type": "string"
            },
            {
              "name": "answers",
              "type": "array<struct<Rdata:string,Type:string,Class:string>>"
            },
            {
              "name": "srcaddr",
              "type": "string"
            },
            {
              "name": "srcport",
              "type": "int"
            },
            {
              "name": "transport",
              "type": "string"
            },
            {
              "name": "srcids",
              "type": "struct<instance:string,resolver_endpoint:string>"
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
          location: `s3://${props.route53QueryLogsBucketName}/AWSLogs/${cdk.Stack.of(scope).account}/vpcdnsquerylogs/${props.vpcId}`,
        },
        partitionKeys: [
          {
            "name": "date",
            "type": "string"
          },
        ]
      }
    })

    vpcFlowLogsTable.addDependency(networkLogsDatabase)
    route53QueryLogsTable.addDependency(networkLogsDatabase)
  }
}
