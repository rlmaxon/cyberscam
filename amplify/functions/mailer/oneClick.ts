/**
 * The "Unsubscribe" button email apps show at the top of a message (RFC 8058).
 * The app POSTs here with no sign-in, so the link's token is all we have.
 * A GET (someone opening the link in a browser) goes to the preferences page instead, so
 * link scanners that open every link can't unsubscribe people by accident.
 */
import { awsDeps } from './aws';
import * as core from './core';

const deps = awsDeps();

type UrlEvent = {
  requestContext?: { http?: { method?: string } };
  queryStringParameters?: Record<string, string | undefined>;
};

export async function respond(d: core.Deps, event: UrlEvent) {
  const method = event.requestContext?.http?.method ?? 'GET';
  const token = event.queryStringParameters?.t ?? '';
  const scope = event.queryStringParameters?.s ?? 'all';
  if (method === 'POST') {
    const result = await core.unsubscribe(d, { token, scope });
    return {
      statusCode: result.ok ? 200 : 400,
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
      body: result.ok ? 'You have been unsubscribed.' : 'This link is not valid.',
    };
  }
  const to = `${d.env.siteUrl}/email-preferences?t=${encodeURIComponent(token)}&unsubscribe=${encodeURIComponent(scope)}`;
  return { statusCode: 302, headers: { Location: to }, body: '' };
}

export const handler = async (event: UrlEvent) => {
  try {
    return await respond(deps, event);
  } catch (err) {
    console.error(JSON.stringify({ message: 'one-click error', error: String((err as Error)?.name ?? err) }));
    return { statusCode: 500, headers: { 'Content-Type': 'text/plain' }, body: 'Please try again later.' };
  }
};
