/**
 * Handles the email-related GraphQL operations (see amplify/data/resource.ts).
 * Public ones (sign-up, confirm, preference links) are called with the site's API key;
 * member ones use the caller's sign-in; admin ones also check the "admin" group here.
 */
import { awsDeps } from './aws';
import * as core from './core';

const deps = awsDeps();

type Event = {
  arguments?: Record<string, unknown>;
  identity?: core.Identity | null;
  info?: { fieldName?: string };
  fieldName?: string;
};

export async function route(d: core.Deps, event: Event): Promise<core.Result> {
  const args = event.arguments ?? {};
  const identity = event.identity ?? null;
  switch (event.info?.fieldName ?? event.fieldName) {
    case 'subscribeToEmails': return core.subscribe(d, args);
    case 'confirmEmailSubscription': return core.confirmSubscription(d, args);
    case 'getEmailPreferences': return core.getPreferencesByToken(d, args);
    case 'updateEmailPreferences': return core.updatePreferencesByToken(d, args);
    case 'unsubscribeEmail': return core.unsubscribe(d, args);
    case 'getMyEmailPreferences': return core.getMyPreferences(d, identity);
    case 'updateMyEmailPreferences': return core.updateMyPreferences(d, identity, args);
    case 'emailScamAlert': return core.queueAlertEmail(d, identity, args);
    case 'sendEmailAnnouncement': return core.queueAnnouncement(d, identity, args);
    case 'getSubscriberStats': return core.subscriberStats(d, identity);
    default: return { ok: false, error: 'Unknown request.' };
  }
}

export const handler = async (event: Event) => {
  try {
    return await route(deps, event);
  } catch (err) {
    console.error(JSON.stringify({ message: 'mailer-api error', field: event.info?.fieldName, error: String((err as Error)?.name ?? err) }));
    return { ok: false, error: 'Something went wrong on our end. Please try again in a few minutes.', code: 'SERVER' };
  }
};
