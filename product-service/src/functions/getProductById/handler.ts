import type { ValidatedEventAPIGatewayProxyEvent } from '@libs/api-gateway';
import { formatJSONResponse, formatErrorResponse } from '@libs/api-gateway';
import { middyfy } from '@libs/lambda';

import schema from './schema';

import PRODUCT_LIST from "src/mocks/products.json";

export const getProductById: ValidatedEventAPIGatewayProxyEvent<typeof schema> = async (event) => {
  const { id } = event.pathParameters;
  const item = PRODUCT_LIST.find((i) => i.id === id);
  if(item) {
    return formatJSONResponse({
      body: item,
    });
  }
  return formatErrorResponse(404, `Product with id - '${id}' not found`);
};

export const main = middyfy(getProductById);
