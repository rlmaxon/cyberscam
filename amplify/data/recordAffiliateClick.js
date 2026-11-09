import { util } from '@aws-appsync/utils';

/**
 * Counts one click on a Security Toolbox product link: adds 1 to that day's row for the
 * product and page (AffiliateClickDaily). Runs in AppSync itself (no Lambda).
 * Only the product id and page name are stored; nothing about the person who clicked.
 * Both must be short lowercase slugs, like "norton-360" and "toolbox" or "lesson-email".
 */
export function request(ctx) {
  const product = ctx.args.product;
  const page = ctx.args.page;
  if (!util.matches('^[a-z0-9-]{1,40}$', product) || !util.matches('^[a-z0-9-]{1,40}$', page)) {
    util.error('Invalid product or page.', 'BadRequest');
  }
  const day = util.time.nowFormatted('yyyy-MM-dd', 'America/New_York');
  const now = util.time.nowISO8601();
  return {
    operation: 'UpdateItem',
    key: util.dynamodb.toMapValues({ id: `${day}#${product}#${page}` }),
    update: {
      expression:
        'ADD #clicks :one SET #day = :day, #product = :product, #page = :page, #typename = :typename, #updatedAt = :now, #createdAt = if_not_exists(#createdAt, :now)',
      expressionNames: {
        '#clicks': 'clicks',
        '#day': 'day',
        '#product': 'product',
        '#page': 'page',
        '#typename': '__typename',
        '#updatedAt': 'updatedAt',
        '#createdAt': 'createdAt',
      },
      expressionValues: util.dynamodb.toMapValues({
        ':one': 1,
        ':day': day,
        ':product': product,
        ':page': page,
        ':typename': 'AffiliateClickDaily',
        ':now': now,
      }),
    },
  };
}

export function response(ctx) {
  if (ctx.error) {
    util.error(ctx.error.message, ctx.error.type);
  }
  return true;
}
