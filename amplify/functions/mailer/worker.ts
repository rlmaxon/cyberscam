/**
 * Does the slow work in the background:
 * - sends a scam alert or an announcement to everyone signed up for it (started by api.ts)
 * - emails a member when family send a cheer (Cheer table stream)
 * - emails family when a member earns a badge or the certificate (FamilyShare table stream)
 */
import { unmarshall } from '@aws-sdk/util-dynamodb';
import type { AttributeValue } from '@aws-sdk/client-dynamodb';
import { awsDeps } from './aws';
import * as core from './core';

const deps = awsDeps();

type StreamRecord = {
  eventName?: 'INSERT' | 'MODIFY' | 'REMOVE';
  eventSourceARN?: string;
  dynamodb?: { NewImage?: Record<string, AttributeValue>; OldImage?: Record<string, AttributeValue> };
};

const tableOf = (arn = '') => arn.split(':table/')[1]?.split('/')[0] ?? '';

export async function handleStream(d: core.Deps, records: StreamRecord[], tables: { cheer: string; share: string }) {
  for (const r of records) {
    const table = tableOf(r.eventSourceARN);
    const next = r.dynamodb?.NewImage ? unmarshall(r.dynamodb.NewImage) : null;
    const prev = r.dynamodb?.OldImage ? unmarshall(r.dynamodb.OldImage) : null;
    try {
      if (table === tables.cheer && r.eventName === 'INSERT' && next) {
        d.log('cheer', { result: await core.onCheerCreated(d, next) });
      } else if (table === tables.share && r.eventName === 'MODIFY' && next) {
        d.log('share updated', { emailed: await core.onShareUpdated(d, prev, next) });
      }
    } catch (err) {
      // One bad record shouldn't block the rest, and retrying could send duplicates.
      console.error(JSON.stringify({ message: 'stream record failed', table, error: String((err as Error)?.name ?? err) }));
    }
  }
}

export const handler = async (event: { Records?: StreamRecord[]; kind?: string; [k: string]: unknown }) => {
  if (Array.isArray(event.Records)) {
    await handleStream(deps, event.Records, {
      cheer: process.env.CHEER_TABLE ?? '',
      share: process.env.FAMILY_SHARE_TABLE ?? '',
    });
    return;
  }
  if (event.kind === 'alert' && typeof event.alertId === 'string') {
    await core.sendAlertToSubscribers(deps, event.alertId);
  } else if (event.kind === 'announcement') {
    await core.sendAnnouncementToSubscribers(deps, event as never);
  }
};
