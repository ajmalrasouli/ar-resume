const { TableClient } = require("@azure/data-tables");

// Get connection string from environment variables
const connectionString = process.env.CUSTOM_STORAGE_CONNECTION || process.env.AzureWebJobsStorage;

if (!connectionString) {
    console.error('Error: Missing Azure Storage connection string. Please set CUSTOM_STORAGE_CONNECTION or AzureWebJobsStorage environment variable.');
    throw new Error('Azure Storage connection string is not configured');
}

const RATE_LIMIT = 5;
const WINDOW_MS = 60 * 1000;

const tableClient = TableClient.fromConnectionString(
  connectionString,
  "rateLimits"
);

async function initializeTable() {
  try {
    await tableClient.createTable();
  } catch (error) {
    if (error.statusCode !== 409) throw error; // 409 = TableExists
  }
}
initializeTable().catch(console.error);

module.exports = async function rateLimitMiddleware(context) {
  const ip = context.req.headers['x-forwarded-for'] || context.req.ip || 'unknown';
  const now = Date.now();

  try {
    let entity;
    try {
      entity = await tableClient.getEntity("ip", ip);
    } catch (error) {
      if (error.statusCode !== 404) throw error;
    }

    if (entity && (now - entity.timestamp < WINDOW_MS)) {
      if (entity.count >= RATE_LIMIT) {
        context.res = {
          status: 429,
          headers: {
            'Retry-After': Math.ceil((WINDOW_MS - (now - entity.timestamp)) / 1000),
            'X-RateLimit-Limit': RATE_LIMIT,
            'X-RateLimit-Remaining': 0,
            'X-RateLimit-Reset': new Date(now + WINDOW_MS).toISOString()
          },
          body: {
            error: 'Too many requests',
            message: `Rate limit exceeded. Try again in ${Math.ceil((WINDOW_MS - (now - entity.timestamp)) / 1000)} seconds.`
          }
        };
        return;
      }
    }

    await tableClient.upsertEntity({
      partitionKey: "ip",
      rowKey: ip,
      count: entity ? entity.count + 1 : 1,
      timestamp: now
    });

    const remaining = Math.max(0, RATE_LIMIT - ((entity?.count || 0) + 1));
    context.res = context.res || {};
    context.res.headers = {
      ...(context.res.headers || {}),
      'X-RateLimit-Limit': RATE_LIMIT,
      'X-RateLimit-Remaining': remaining,
      'X-RateLimit-Reset': new Date(now + WINDOW_MS).toISOString()
    };

  } catch (error) {
    context.log.error('Rate limit error:', error);
    // Fail open - allow requests if rate limiting fails
  }
};