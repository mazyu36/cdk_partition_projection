import { Construct } from 'constructs';
import * as cdk from 'aws-cdk-lib';
import { aws_glue as glue } from 'aws-cdk-lib';

export interface ApplicationLogsTableProps {
  albAccessLogsBucketName: string
  wafTrafficLogsBucketName: string
  webAclName: string

}

export class ApplicationLogsTable extends Construct {
  constructor(scope: Construct, id: string, props: ApplicationLogsTableProps) {
    super(scope, id);


    // Glue データベースを作成
    const applicationLogsDatabase = new glue.CfnDatabase(scope, 'ApplicationLogsDatabase', {
      catalogId: cdk.Stack.of(scope).account,
      databaseInput: {
        name: 'application_logs_database',
      },
    });


    // Glue Table (ALB Access Logs) with Partition Projection
    const albAccessLogsTable = new glue.CfnTable(scope, "AlbAccessLogsTables", {
      databaseName: 'application_logs_database',
      catalogId: cdk.Stack.of(scope).account,
      tableInput: {
        name: 'alb_access_logs_table',
        tableType: "EXTERNAL_TABLE",
        parameters: {
          "projection.enabled": true,
          "projection.date.type": "date",
          "projection.date.range": "NOW-1YEARS, NOW+9HOUR",
          "projection.date.format": "yyyy/MM/dd",
          "projection.date.interval": "1",
          "projection.date.interval.unit": "DAYS",
          "serialization.encoding": "utf-8",
          "storage.location.template": `s3://${props.albAccessLogsBucketName}/AWSLogs/${cdk.Stack.of(scope).account}/elasticloadbalancing/${cdk.Stack.of(this).region}/` + "${date}/",
        },
        storageDescriptor: {
          columns: [
            {
              "name": "type",
              "type": "string"
            },
            {
              "name": "time",
              "type": "string"
            },
            {
              "name": "elb",
              "type": "string"
            },
            {
              "name": "client_ip",
              "type": "string"
            },
            {
              "name": "client_port",
              "type": "int"
            },
            {
              "name": "target_ip",
              "type": "string"
            },
            {
              "name": "target_port",
              "type": "int"
            },
            {
              "name": "request_processing_time",
              "type": "double"
            },
            {
              "name": "target_processing_time",
              "type": "double"
            },
            {
              "name": "response_processing_time",
              "type": "double"
            },
            {
              "name": "elb_status_code",
              "type": "int"
            },
            {
              "name": "target_status_code",
              "type": "string"
            },
            {
              "name": "received_bytes",
              "type": "bigint"
            },
            {
              "name": "sent_bytes",
              "type": "bigint"
            },
            {
              "name": "request_verb",
              "type": "string"
            },
            {
              "name": "request_url",
              "type": "string"
            },
            {
              "name": "request_proto",
              "type": "string"
            },
            {
              "name": "user_agent",
              "type": "string"
            },
            {
              "name": "ssl_cipher",
              "type": "string"
            },
            {
              "name": "ssl_protocol",
              "type": "string"
            },

            {
              "name": "target_group_arn",
              "type": "string"
            },
            {
              "name": "trace_id",
              "type": "string"
            },
            {
              "name": "domain_name",
              "type": "string"
            },

            {
              "name": "chosen_cert_arn",
              "type": "string"
            },
            {
              "name": "matched_rule_priority",
              "type": "string"
            },
            {
              "name": "request_creation_time",
              "type": "string"
            },
            {
              "name": "actions_executed",
              "type": "string"
            },
            {
              "name": "redirect_url",
              "type": "string"
            },
            {
              "name": "lambda_error_reason",
              "type": "string"
            },
            {
              "name": "target_port_list",
              "type": "string"
            },
            {
              "name": "target_status_code_list",
              "type": "string"
            },
            {
              "name": "classification",
              "type": "string"
            },
            {
              "name": "classification_reason",
              "type": "string"
            },
          ],
          inputFormat: "org.apache.hadoop.mapred.TextInputFormat",
          outputFormat: "org.apache.hadoop.hive.ql.io.HiveIgnoreKeyTextOutputFormat",
          serdeInfo: {
            serializationLibrary: "org.apache.hadoop.hive.serde2.RegexSerDe",
            parameters: {
              'serialization.format': '1',
              'input.regex': '([^ ]*) ([^ ]*) ([^ ]*) ([^ ]*):([0-9]*) ([^ ]*)[:-]([0-9]*) ([-.0-9]*) ([-.0-9]*) ([-.0-9]*) (|[-0-9]*) (-|[-0-9]*) ([-0-9]*) ([-0-9]*) \"([^ ]*) (.*) (- |[^ ]*)\" \"([^\"]*)\" ([A-Z0-9-_]+) ([A-Za-z0-9.-]*) ([^ ]*) \"([^\"]*)\" \"([^\"]*)\" \"([^\"]*)\" ([-.0-9]*) ([^ ]*) \"([^\"]*)\" \"([^\"]*)\" \"([^ ]*)\" \"([^\s]+?)\" \"([^\s]+)\" \"([^ ]*)\" \"([^ ]*)\"'
            }
          },
          location: `s3://${props.albAccessLogsBucketName}/AWSLogs/${cdk.Stack.of(scope).account}/elasticloadbalancing/${cdk.Stack.of(this).region}`,
        },
        partitionKeys: [
          {
            "name": "date",
            "type": "string"
          },
        ]
      }
    })





    // Glue Table (WAF Traffic Logs) with Partition Projection
    const wafTrafficLogsTable = new glue.CfnTable(scope, "WafTrafficLogsTable", {
      databaseName: 'application_logs_database',
      catalogId: cdk.Stack.of(scope).account,
      tableInput: {
        name: 'waf_traffic_logs_tables',
        tableType: "EXTERNAL_TABLE",
        parameters: {
          "projection.enabled": true,
          "projection.date.type": "date",
          "projection.date.range": "NOW-1YEARS, NOW+9HOUR",
          "projection.date.format": "yyyy/MM/dd",
          "projection.date.interval": "1",
          "projection.date.interval.unit": "DAYS",
          "storage.location.template": `s3://${props.wafTrafficLogsBucketName}/AWSLogs/${cdk.Stack.of(scope).account}/WAFLogs/${cdk.Stack.of(this).region}/${props.webAclName}/` + "${date}",
        },
        storageDescriptor: {
          columns: [
            {
              "name": "timestamp",
              "type": "bigint"
            },
            {
              "name": "formatversion",
              "type": "int"
            },
            {
              "name": "webaclid",
              "type": "string"
            },
            {
              "name": "terminatingruleid",
              "type": "string"
            },
            {
              "name": "terminatingruletype",
              "type": "string"
            },
            {
              "name": "action",
              "type": "string"
            },
            {
              "name": "terminatingrulematchdetails",
              "type": "array<struct<conditiontype:string,location:string,matcheddata:array<string>>>"
            },
            {
              "name": "httpsourcename",
              "type": "string"
            },
            {
              "name": "httpsourceid",
              "type": "string"
            },
            {
              "name": "rulegrouplist",
              "type": "array<struct<rulegroupid:string,terminatingrule:struct<ruleid:string,action:string,rulematchdetails:string>,nonterminatingmatchingrules:array<struct<ruleid:string,action:string,rulematchdetails:array<struct<conditiontype:string,location:string,matcheddata:array<string>>>>>,excludedrules:array<struct<ruleid:string,exclusiontype:string>>>>"
            },
            {
              "name": "ratebasedrulelist",
              "type": "array<struct<ratebasedruleid:string,limitkey:string,maxrateallowed:int>>"
            },
            {
              "name": "nonterminatingmatchingrules",
              "type": "array<struct<ruleid:string,action:string>>"
            },
            {
              "name": "requestheadersinserted",
              "type": "string"
            },
            {
              "name": "responsecodesent",
              "type": "string"
            },
            {
              "name": "httprequest",
              "type": "struct<clientip:string,country:string,headers:array<struct<name:string,value:string>>,uri:string,args:string,httpversion:string,httpmethod:string,requestid:string>"
            },
            {
              "name": "labels",
              "type": "array<struct<name:string>>"
            },
            {
              "name": "captcharesponse",
              "type": "struct<responsecode:string,solvetimestamp:string,failureReason:string>"
            }
          ],
          inputFormat: "org.apache.hadoop.mapred.TextInputFormat",
          outputFormat: "org.apache.hadoop.hive.ql.io.HiveIgnoreKeyTextOutputFormat",
          serdeInfo: {
            serializationLibrary: "org.openx.data.jsonserde.JsonSerDe",
            parameters: {
              'serialization.format': '1'
            }
          },
          location: `s3://${props.wafTrafficLogsBucketName}/AWSLogs/${cdk.Stack.of(scope).account}/WAFLogs/${cdk.Stack.of(this).region}/${props.webAclName}`,
        },
        partitionKeys: [
          {
            "name": "date",
            "type": "string"
          },
        ]
      }
    })

    albAccessLogsTable.addDependency(applicationLogsDatabase)
    wafTrafficLogsTable.addDependency(applicationLogsDatabase)
  }
}