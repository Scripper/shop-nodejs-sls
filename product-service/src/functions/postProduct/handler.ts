import { formatErrorResponse, formatJSONResponse, ValidatedEventAPIGatewayProxyEvent } from '@libs/api-gateway';
import { middyfy } from '@libs/lambda';
import { DynamoDB } from 'aws-sdk';
import { v4 as uuidv4 } from 'uuid';

import { ProductPostBody } from '../../types/api-types';
import schema from './schema';

const dynamoDb = new DynamoDB.DocumentClient();

const postProduct: ValidatedEventAPIGatewayProxyEvent<typeof schema> = async (event) => {
    console.log('lambda postProduct called with event - ', event);
    const { body } = event;

    try {
        let newProduct: ProductPostBody;
            if (typeof body === 'string') {
                newProduct = JSON.parse(body as string);
            } else {
                newProduct = body;
            }

        const productItem = {
            id: uuidv4(),
            title: newProduct.title,
            description: newProduct.description,
            price: newProduct.price,
            created_at: new Date().toISOString(),
        };
        const stockItem = {
            product_id: productItem.id,
            count: newProduct.count,
            created_at: productItem.created_at,
        };

        await dynamoDb
            .transactWrite({
                TransactItems: [
                    {
                        Put: {
                            TableName: process.env.PRODUCT_TABLE,
                            Item: {
                                id: uuidv4(),
                                title: newProduct.title,
                                description: newProduct.description,
                                price: newProduct.price,
                                created_at: new Date().toISOString(),
                            },
                        },
                    },
                    {
                        Put: {
                            TableName: process.env.STOCK_TABLE,
                            Item: stockItem,
                        },
                    },
                ],
            })
            .promise();

        console.log('Success transaction for putting Product and Stock');

        return formatJSONResponse({
            result: { ...productItem, count: stockItem.count },
        });
    } catch (e) {
        console.log('Error to put items', e.message);
        return formatErrorResponse(500, 'Internal Server Error.');
    }
};

export const main = middyfy(postProduct);