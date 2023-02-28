import { handlerPath } from '@libs/handler-resolver';

export default {
  handler: `${handlerPath(__dirname)}/handler.main`,
  events: [
    {
      http: {
        method: 'get',
        path: '/products/{id}',
        responseData: {
          200: {
            description: 'Single product',
            bodyType: 'Product',
          },
          404: {
            description: 'Product not found',
            bodyType: 'Error'
          },
        }
      },
    },
  ],
};
