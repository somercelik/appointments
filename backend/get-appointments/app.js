import { DynamoDBClient, ScanCommand } from "@aws-sdk/client-dynamodb";
// TODO: AWS Lambda Layer should be implemented
import { errorResponse, formatDynamoDbResult } from "./util.js";
const tableName = "Appointments";
const dynamoDBClient = new DynamoDBClient({});

export async function handler(event, context) {
  let appointmentDate = event?.queryStringParameters?.appointmentDate;
  if (!appointmentDate) {
    return errorResponse(
      "Randevu tarihi belirtmek zorunludur.",
      400,
      event?.awsRequestId
    );
  }
  const scanCommand = new ScanCommand({
    TableName: tableName,
    FilterExpression: "begins_with(StartDateTime, :appointmentDate)",
    ExpressionAttributeValues: {
      ":appointmentDate": { S: appointmentDate },
    },
    ProjectionExpression: "StartDateTime, EndDateTime",
  });
  try {
    const scanData = await dynamoDBClient.send(scanCommand);
    let formattedJSON = formatDynamoDbResult(scanData.Items);
    return {
      statusCode: 200,
      body: JSON.stringify({
        status: true,
        message: null,
        details: formattedJSON,
      }),
    };
  } catch (err) {
    return errorResponse(
      "Veritabanı bağlantı hatası: " + err,
      500,
      context?.awsRequestId
    );
  }
}
