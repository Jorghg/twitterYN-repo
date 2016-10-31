/**
 * Created by ingrskar on 10/31/2016.
 */
var AWS = require("aws-sdk");

AWS.config.update({
    region: "us-west-2",
    endpoint: "/"
});

var dynamodb = new AWS.DynamoDB();

var table = "tweets";

var params = {
    TableName : table,
    KeySchema: [
        { AttributeName: "tweetID", KeyType: "HASH"}
    ],
    AttributeDefinitions: [
        { AttributeName: "tweetID", AttributeType: "N" }
    ],
    ProvisionedThroughput: {
        ReadCapacityUnits: 10,
        WriteCapacityUnits: 10
    }
};


dynamodb.createTable(params, function(err, data) {
    if (err) {
        console.error("Unable to create table. Error JSON:", JSON.stringify(err, null, 2));
    } else {
        console.log("Created table. Table description JSON:", JSON.stringify(data, null, 2));
    }
});




