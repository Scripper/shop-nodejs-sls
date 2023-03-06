import AWS from 'aws-sdk';
import PRODUCT_LIST from './products.json' assert { type: 'json' };

AWS.config.update({ region: 'eu-west-1' });

async function initData(dynamoDb) {
    for (const product of PRODUCT_LIST) {

        try {
            await dynamoDb.put({
                Item: {
                    id: product.id,
                    title: product.title,
                    description: product.description,
                    price: product.price,
                },
                TableName: 'products'
            }).promise();

            await dynamoDb.put({
                Item: {
                    product_id: product.id,
                    count: product.count
                },
                TableName: 'stocks'
            }).promise();
        } catch (err) {
            console.log(err);
        }
    }
}

initData(new AWS.DynamoDB.DocumentClient());