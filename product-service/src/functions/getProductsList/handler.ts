import { formatErrorResponse, formatJSONResponse } from '@libs/api-gateway';
import { middyfy } from '@libs/lambda';
import { DynamoDB } from 'aws-sdk';

import { Product, ProductWithStock } from '../../types/api-types';
import { Stock } from '../../types/api-types';

const dynamoDb = new DynamoDB.DocumentClient();

import type { ValidatedEventAPIGatewayProxyEvent } from '@libs/api-gateway';
const getProductsList: ValidatedEventAPIGatewayProxyEvent<unknown> = async (event) => {
  console.log('getProductsList called with event - ', event);
  let productsResponse, stocksResponse;
  try {
    productsResponse = await dynamoDb
        .scan({
          TableName: process.env.PRODUCT_TABLE,
        })
        .promise();
    stocksResponse = await dynamoDb
        .scan({
          TableName: process.env.STOCK_TABLE,
        })
        .promise();
  } catch (error) {
    console.log(new Date().toISOString(), error.message);
    return formatErrorResponse(500, 'Internal Server Error.');
  }
  if (productsResponse && stocksResponse) {
    const products = productsResponse.Items as Product[];
    const stocks = stocksResponse.Items as Stock[];
    // merge responses
    const result: ProductWithStock[] = products.map((p: Product) => ({
      ...p,
      count: stocks.find((s) => s.product_id === p.id)?.count,
    }));
    return formatJSONResponse({
      result: result,
    });
  } else {
    return formatErrorResponse(404, 'Products not found.');
  }
};

export const main = middyfy(getProductsList);