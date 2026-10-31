/**
 * The real AWS calls behind `Deps` in core.ts. Table names, the user pool and the site
 * address come from environment variables set in amplify/backend.ts.
 */
import { randomBytes } from 'node:crypto';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, GetCommand, PutCommand, ScanCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb';
import { SESv2Client, SendEmailCommand } from '@aws-sdk/client-sesv2';
import { CognitoIdentityProviderClient, AdminGetUserCommand } from '@aws-sdk/client-cognito-identity-provider';
import { LambdaClient, InvokeCommand } from '@aws-sdk/client-lambda';
import type { Deps, ScamAlertRecord, Subscriber } from './core';

const env = (name: string, fallback = '') => process.env[name] ?? fallback;

const db = DynamoDBDocumentClient.from(new DynamoDBClient({}), { marshallOptions: { removeUndefinedValues: true } });
const ses = new SESv2Client({});
const cognito = new CognitoIdentityProviderClient({});
const lambda = new LambdaClient({});

async function scanAll<T>(TableName: string, extra: Record<string, unknown> = {}): Promise<T[]> {
  const items: T[] = [];
  let ExclusiveStartKey: Record<string, unknown> | undefined;
  do {
    const res = await db.send(new ScanCommand({ TableName, ExclusiveStartKey, ...extra }));
    items.push(...((res.Items ?? []) as T[]));
    ExclusiveStartKey = res.LastEvaluatedKey;
  } while (ExclusiveStartKey);
  return items;
}

export function awsDeps(): Deps {
  const subscriberTable = env('SUBSCRIBER_TABLE');
  const alertTable = env('SCAM_ALERT_TABLE');
  const shareTable = env('FAMILY_SHARE_TABLE');
  const userPoolId = env('USER_POOL_ID');
  const fromAddress = env('MAIL_FROM', 'Senior Cyber Secure <noreply@seniorcybersecurityedu.com>');
  const replyTo = env('MAIL_REPLY_TO');
  const configurationSet = env('SES_CONFIGURATION_SET');

  return {
    async getSubscriber(id) {
      const res = await db.send(new GetCommand({ TableName: subscriberTable, Key: { id } }));
      return (res.Item as Subscriber) ?? null;
    },
    async putSubscriber(rec) {
      await db.send(new PutCommand({ TableName: subscriberTable, Item: rec }));
    },
    scanSubscribers: () => scanAll<Subscriber>(subscriberTable),
    async getAlert(id) {
      const res = await db.send(new GetCommand({ TableName: alertTable, Key: { id } }));
      return (res.Item as ScamAlertRecord) ?? null;
    },
    async updateAlert(id, fields) {
      const entries = Object.entries({ ...fields, updatedAt: new Date().toISOString() });
      await db.send(new UpdateCommand({
        TableName: alertTable,
        Key: { id },
        ConditionExpression: 'attribute_exists(id)',
        UpdateExpression: `SET ${entries.map((_, i) => `#k${i} = :v${i}`).join(', ')}`,
        ExpressionAttributeNames: Object.fromEntries(entries.map(([k], i) => [`#k${i}`, k])),
        ExpressionAttributeValues: Object.fromEntries(entries.map(([, v], i) => [`:v${i}`, v])),
      }));
    },
    findSharesByOwner: (owner) =>
      scanAll<Record<string, unknown>>(shareTable, {
        FilterExpression: '#o = :o',
        ExpressionAttributeNames: { '#o': 'owner' },
        ExpressionAttributeValues: { ':o': owner },
      }),
    async getMemberEmail(sub) {
      try {
        const res = await cognito.send(new AdminGetUserCommand({ UserPoolId: userPoolId, Username: sub }));
        if (res.Enabled === false) return null;
        const attr = (name: string) => res.UserAttributes?.find((a) => a.Name === name)?.Value;
        const email = attr('email');
        return email ? { email, verified: attr('email_verified') === 'true' } : null;
      } catch (err) {
        if ((err as Error)?.name === 'UserNotFoundException') return null;
        throw err;
      }
    },
    async sendEmail(to, content, headers) {
      await ses.send(new SendEmailCommand({
        FromEmailAddress: fromAddress,
        Destination: { ToAddresses: [to] },
        ReplyToAddresses: replyTo ? [replyTo] : undefined,
        ConfigurationSetName: configurationSet || undefined,
        Content: {
          Simple: {
            Subject: { Data: content.subject, Charset: 'UTF-8' },
            Body: {
              Html: { Data: content.html, Charset: 'UTF-8' },
              Text: { Data: content.text, Charset: 'UTF-8' },
            },
            Headers: headers?.map((h) => ({ Name: h.name, Value: h.value })),
          },
        },
      }));
    },
    async invokeWorker(payload) {
      await lambda.send(new InvokeCommand({
        FunctionName: env('WORKER_FUNCTION_NAME'),
        InvocationType: 'Event',
        Payload: Buffer.from(JSON.stringify(payload)),
      }));
    },
    randomToken: () => randomBytes(24).toString('base64url'),
    now: () => new Date(),
    sleep: (ms) => new Promise((r) => setTimeout(r, ms)),
    // Never logs email addresses or tokens.
    log: (message, data) => console.log(JSON.stringify({ message, ...data })),
    env: {
      siteUrl: env('SITE_URL', 'https://www.seniorcybersecurityedu.com').replace(/\/$/, ''),
      oneClickUrl: env('ONE_CLICK_URL').replace(/\/$/, '') || undefined,
      mailingAddress: env('MAILING_ADDRESS') || undefined,
    },
  };
}
