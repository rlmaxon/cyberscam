import { defineBackend } from '@aws-amplify/backend';
import { Duration, Stack } from 'aws-cdk-lib';
import { Effect, PolicyStatement } from 'aws-cdk-lib/aws-iam';
import { FunctionUrlAuthType, StartingPosition, FilterCriteria, FilterRule } from 'aws-cdk-lib/aws-lambda';
import { DynamoEventSource } from 'aws-cdk-lib/aws-lambda-event-sources';
import { auth } from './auth/resource';
import { data } from './data/resource';
import { mailerApi, mailerWorker, mailerOneClick } from './functions/mailer/resource';

const backend = defineBackend({
  auth,
  data,
  mailerApi,
  mailerWorker,
  mailerOneClick,
});

// ---------- Email (Phase 5) ----------
// Settings come from Amplify environment variables when set (see docs/phase5-aws-setup.md).
const SITE_URL = process.env.SITE_URL ?? 'https://www.seniorcybersecurityedu.com';
const MAIL_DOMAIN = process.env.MAIL_DOMAIN ?? 'seniorcybersecurityedu.com';
const MAIL_FROM = process.env.MAIL_FROM ?? `Senior Cyber Secure <noreply@${MAIL_DOMAIN}>`;

const tables = backend.data.resources.tables;
const userPool = backend.auth.resources.userPool;
const api = backend.mailerApi.resources.lambda;
const worker = backend.mailerWorker.resources.lambda;
const oneClick = backend.mailerOneClick.resources.lambda;

// The one-click unsubscribe address email apps POST to. Public by design: it only accepts
// the secret token from an email, and the worst it can do is turn emails off.
const oneClickUrl = oneClick.addFunctionUrl({ authType: FunctionUrlAuthType.NONE });

const shared: Record<string, string> = {
  SUBSCRIBER_TABLE: tables.Subscriber.tableName,
  SCAM_ALERT_TABLE: tables.ScamAlert.tableName,
  FAMILY_SHARE_TABLE: tables.FamilyShare.tableName,
  USER_POOL_ID: userPool.userPoolId,
  SITE_URL,
  MAIL_FROM,
  MAIL_REPLY_TO: process.env.MAIL_REPLY_TO ?? '',
  MAILING_ADDRESS: process.env.MAILING_ADDRESS ?? '',
  SES_CONFIGURATION_SET: process.env.SES_CONFIGURATION_SET ?? '',
};
for (const [key, value] of Object.entries(shared)) {
  backend.mailerApi.addEnvironment(key, value);
  backend.mailerWorker.addEnvironment(key, value);
  backend.mailerOneClick.addEnvironment(key, value);
}
backend.mailerApi.addEnvironment('WORKER_FUNCTION_NAME', worker.functionName);
backend.mailerApi.addEnvironment('ONE_CLICK_URL', oneClickUrl.url);
backend.mailerWorker.addEnvironment('ONE_CLICK_URL', oneClickUrl.url);
backend.mailerWorker.addEnvironment('CHEER_TABLE', tables.Cheer.tableName);

// Data access: only what each function needs.
tables.Subscriber.grantReadWriteData(api);
tables.Subscriber.grantReadWriteData(worker);
tables.Subscriber.grantReadWriteData(oneClick);
tables.ScamAlert.grantReadWriteData(api);
tables.ScamAlert.grantReadWriteData(worker);
tables.FamilyShare.grantReadData(worker);
worker.grantInvoke(api);

// Look up a member's email address (by their ID) to send them their own emails.
const readMembers = new PolicyStatement({
  effect: Effect.ALLOW,
  actions: ['cognito-idp:AdminGetUser'],
  resources: [userPool.userPoolArn],
});
api.addToRolePolicy(readMembers);
worker.addToRolePolicy(readMembers);

// Send email through SES. (In the SES sandbox, recipients are identities too, so this
// covers identities in the account rather than only the domain.)
const stack = Stack.of(api);
const sendEmail = new PolicyStatement({
  effect: Effect.ALLOW,
  actions: ['ses:SendEmail'],
  resources: [`arn:aws:ses:${stack.region}:${stack.account}:identity/*`, `arn:aws:ses:${stack.region}:${stack.account}:configuration-set/*`],
});
api.addToRolePolicy(sendEmail);
worker.addToRolePolicy(sendEmail);

// Cheers and badge news: the worker watches two tables and emails the right people.
// Only new cheers and changed shares are passed along; retries are off so a hiccup can't
// send the same email twice.
worker.addEventSource(new DynamoEventSource(tables.Cheer, {
  startingPosition: StartingPosition.LATEST,
  batchSize: 10,
  retryAttempts: 0,
  maxRecordAge: Duration.hours(1),
  filters: [FilterCriteria.filter({ eventName: FilterRule.isEqual('INSERT') })],
}));
worker.addEventSource(new DynamoEventSource(tables.FamilyShare, {
  startingPosition: StartingPosition.LATEST,
  batchSize: 10,
  retryAttempts: 0,
  maxRecordAge: Duration.hours(1),
  filters: [FilterCriteria.filter({ eventName: FilterRule.isEqual('MODIFY') })],
}));

backend.addOutput({
  custom: { emailAlerts: true },
});
