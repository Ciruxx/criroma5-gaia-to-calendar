const AWS = require('aws-sdk');

const dynamoDb = new AWS.DynamoDB.DocumentClient({
    convertEmptyValues: true
});

async function get(params) {
    return await dynamoDb.get(params).promise();
}

async function put(params) {
    return await dynamoDb.put(params).promise();
}

async function update(params) {
    const res = await dynamoDb.update(params).promise();
    return res.Items;
}

module.exports = {
    dynamoDb,
    get,
    put,
    update
}
