import type { ValidatedEventAPIGatewayProxyEvent } from '@libs/api-gateway';
import { formatJSONResponse, formatErrorResponse } from '@libs/api-gateway';
import { middyfy } from '@libs/lambda';

import { DynamoDB } from 'aws-sdk';

import { Product } from '../../types/api-types';
import { Stock } from '../../types/api-types';

import schema from './schema';

const dynamoDb = new DynamoDB.DocumentClient();

export const getProductById: ValidatedEventAPIGatewayProxyEvent<typeof schema> = async (event) => {
  console.log('getProductById called with event - ', event);
  const { id } = event.pathParameters;

  let productsResponse;
  let stocksResponse;

  try {
    productsResponse = await dynamoDb
        .get({
          TableName: process.env.PRODUCT_TABLE,
          Key: { id },
        })
        .promise();
    stocksResponse = await dynamoDb
        .get({
          TableName: process.env.STOCK_TABLE,
          Key: { product_id: id },
        })
        .promise();
  } catch (error) {
    console.log(new Date().toISOString(), error.message);
    return formatErrorResponse(500, 'Internal Server Error.');
  }

  if (productsResponse && stocksResponse) {
    const product = productsResponse.Item as Product;
    const stock = stocksResponse.Item as Stock;

    return formatJSONResponse({
      body: { ...product, count: stock.count },
    });
  }

  return formatErrorResponse(404, `Product with id - '${id}' not found`);
};

export const main = middyfy(getProductById);
