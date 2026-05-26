export const NewsletterPaginationSchema = {
  type: 'object',
  properties: {
    page: { type: 'number', example: 1 },
    limit: { type: 'number', example: 10 },
    totalCount: { type: 'number', example: 100 },
    totalPages: { type: 'number', example: 10 },
    hasNext: { type: 'boolean', example: true },
    hasPrev: { type: 'boolean', example: false },
  },
};

export const NewsletterStatsSchema = {
  type: 'object',
  properties: {
    totalSubscribers: { type: 'number', example: 100 },
  },
};

export const NewsletterSubscriptionSchema = {
  type: 'object',
  properties: {
    id: { type: 'string', example: 'clx1234567890' },
    email: { type: 'string', example: 'john@example.com' },
    createdAt: { type: 'string', example: '2024-01-01T00:00:00.000Z' },
    updatedAt: { type: 'string', example: '2024-01-01T00:00:00.000Z' },
  },
};

export const NewsletterListResponseSchema = {
  type: 'object',
  properties: {
    statusCode: { type: 'number', example: 200 },
    success: { type: 'boolean', example: true },
    message: {
      type: 'string',
      example: 'Newsletter subscriptions fetched successfully',
    },
    count: { type: 'number', example: 10 },
    data: {
      type: 'object',
      properties: {
        pagination: NewsletterPaginationSchema,
        stats: NewsletterStatsSchema,
        subscriptions: {
          type: 'array',
          items: NewsletterSubscriptionSchema,
        },
      },
    },
  },
};

export const NewsletterSingleResponseSchema = {
  type: 'object',
  properties: {
    statusCode: { type: 'number', example: 200 },
    success: { type: 'boolean', example: true },
    message: {
      type: 'string',
      example: 'Newsletter subscription fetched successfully',
    },
    count: { type: 'number', example: 1 },
    data: NewsletterSubscriptionSchema,
  },
};

export const NewsletterCreateResponseSchema = {
  type: 'object',
  properties: {
    statusCode: { type: 'number', example: 201 },
    success: { type: 'boolean', example: true },
    message: {
      type: 'string',
      example: 'Successfully subscribed to newsletter',
    },
    count: { type: 'number', example: 1 },
    data: NewsletterSubscriptionSchema,
  },
};
