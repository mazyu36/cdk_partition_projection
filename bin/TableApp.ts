#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { AppTableStack } from '../lib/appTableStack';
import { SecurityTableStack } from '../lib/securityTableStack';

const app = new cdk.App();


new AppTableStack(app, 'AppTableStack', {
  env: {
    region: 'ap-northeast-1'
  }
})
new SecurityTableStack(app, 'SecurityTableStack', {})



