const { TableClient } = require("@azure/data-tables");
//const connectionString = process.env.AzureWebJobsStorage;
const connectionString = process.env.CUSTOM_STORAGE_CONNECTION;

// Rate limit configuration
const RATE_LIMIT = 5; // 5 requests
const WINDOW_MINUTES = 1; // per 1 minute

// Initialize Table Storage client
const tableClient = TableClient.fromConnectionString(
  connectionString,
  "rateLimits"
);

async function initializeTable() {
  try {
    await tableClient.createTable();
  } catch (error) {
    if (error.statusCode !== 409) throw error;
  }
}
initializeTable();

  /**
   * Middleware to rate limit requests based on IP address.
   * @param {Object} context - The Azure Functions context object
   * @param {Object} context.req - The incoming HTTP request
   * @param {Object} context.res - The outgoing HTTP response
   * @param {Object} context.log - The logger object
   *
   * The rate limit is set to 5 requests per 1 minute window.
   * The rate limit is stored in an Azure Table Storage.
   * The rate limit headers are set on the response object.
   * If the rate limit is exceeded, a 429 response is returned.
   */
module.exports = async function rateLimitMiddleware(context) {
  const ip = context.req.headers['x-forwarded-for'] || context.req.ip || 'unknown';
  const now = Date.now();
  
  try {
    // Get existing record
    let entity;
    try {
      entity = await tableClient.getEntity("ip", ip);
    } catch (error) {
      if (error.statusCode !== 404) throw error;
    }

    // Check rate limit
    if (entity && (now - entity.timestamp < 60 * 1000)) {
      if (entity.count >= RATE_LIMIT) {
        context.res = {
          status: 429,
          headers: {
            'Retry-After': 60,
            'X-RateLimit-Limit': RATE_LIMIT,
            'X-RateLimit-Remaining': 0,
            'X-RateLimit-Reset': new Date(now + 60 * 1000).toISOString()
          },
          body: { error: 'Too many requests' }
        };
        context.done();
        return;
      }
    }

    // Update count
    await tableClient.upsertEntity({
      partitionKey: "ip",
      rowKey: ip,
      count: entity ? entity.count + 1 : 1,
      timestamp: now
    });

    // Add rate limit headers
    context.res = context.res || {};
    context.res.headers = {
      ...(context.res.headers || {}),
      'X-RateLimit-Limit': RATE_LIMIT,
      'X-RateLimit-Remaining': Math.max(0, RATE_LIMIT - (entity?.count || 0) - 1),
      'X-RateLimit-Reset': new Date(now + 60 * 1000).toISOString()
    };

  } catch (error) {
    context.log.error('Rate limit error:', error);
    throw error;
  }
};