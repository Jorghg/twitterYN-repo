/**
 * Created by gramstad on 31/10/2016.
 */
var AWS = require("aws-sdk");

AWS.config.update({
    region: "us-west-2",
    endpoint: "https://dynamodb.us-west-2.amazonaws.com"
});

var dynamodb = new AWS.DynamoDB();

// var params = {
//     TableName : "TrumpStats",
//     KeySchema: [
//         { AttributeName: "ID", KeyType: "HASH"}  //Partition key
//     ],
//     AttributeDefinitions: [
//         { AttributeName: "ID", AttributeType: "N" }
//     ],
//     ProvisionedThroughput: {
//         ReadCapacityUnits: 10,
//         WriteCapacityUnits: 10
//     }
// };
//
// dynamodb.createTable(params, function(err, data) {
//     if (err) {
//         console.error("Unable to create table. Error JSON:", JSON.stringify(err, null, 2));
//     } else {
//         console.log("Created table. Table description JSON:", JSON.stringify(data, null, 2));
//     }
// });

var docClient = new AWS.DynamoDB.DocumentClient();

var table = "TrumpStats";

var paramsPut = {
    TableName:table,
    Item: {
        "ID": 1,
        "posTrump": 0,
        "posClinton": 0,
        "posObama": 0,
        "countTrump": 0,
        "countClinton": 0,
        "countObama": 0
    }
};

docClient.put(paramsPut, function(err, data) {
    if (err) {
        console.log("Unable to add to DB: Error JSON", JSON.stringify(err, null, 2));
    }  else  {
        console.log("Items added to DB: ", JSON.stringify(data, null, 2));
    }
});