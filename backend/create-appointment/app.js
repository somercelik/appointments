import {
  DynamoDBClient,
  ScanCommand,
  PutItemCommand,
} from "@aws-sdk/client-dynamodb";
import { randomBytes } from "crypto";
// TODO: AWS Lambda Layer should be implemented
import { errorResponse, formatDynamoDbResult } from "./util.js";

const DEFAULT_DOCTOR_ID = "0";
const TABLE_NAME = "Appointments";
const dynamoDBClient = new DynamoDBClient({});

export const handler = async (event, context) => {
  console.debug("İstek alındı, body: " + event?.body);
  if (!event?.body) {
    return errorResponse("Boş istek gönderilemez.", 400, context?.awsRequestId);
  }
  let { patientFirstName, patientLastName, startDateTime, endDateTime } =
    JSON.parse(event.body);
  let doctorId = DEFAULT_DOCTOR_ID;

  try {
    // Randevu uygunluk kontrolü
    const scanCommand = new ScanCommand({
      TableName: TABLE_NAME,
      FilterExpression:
        "DoctorId = :doctorId AND (StartDateTime < :endDateTime AND EndDateTime > :startDateTime)",
      ExpressionAttributeValues: {
        ":doctorId": { N: doctorId },
        ":startDateTime": { S: startDateTime },
        ":endDateTime": { S: endDateTime },
      },
    });
    const scanData = await dynamoDBClient.send(scanCommand);
    // Eğer aynı kişi için overlap eden başka randevu varsa
    if (scanData.Items.length > 0) {
      let errorMessage =
        "Bu tarih/saatte başka bir danışana ait randevu bulunuyor.";
      return errorResponse(errorMessage, 400, context?.awsRequestId);
    }
    const newAppointment = {
      Id: { S: toUrlString(randomBytes(16)) },
      DoctorId: { N: doctorId.toString() },
      PatientFirstName: { S: patientFirstName },
      PatientLastName: { S: patientLastName },
      StartDateTime: { S: startDateTime },
      EndDateTime: { S: endDateTime },
      CreationDate: { S: new Date().toISOString() },
      Status: { S: "Onaylandı" },
    };

    const putParams = {
      TableName: TABLE_NAME,
      Item: newAppointment,
    };

    const putCommand = new PutItemCommand(putParams);
    await dynamoDBClient.send(putCommand);

    return {
      statusCode: 201,
      body: JSON.stringify({
        status: true,
        message: "Randevu başarıyla oluşturuldu.",
        details: formatDynamoDbResult(newAppointment),
      }),
    };
  } catch (error) {
    let errorMessage = "Veritabanı bağlantı hatası: " + error.stack;
    return errorResponse(errorMessage, 500, context?.awsRequestId);
  }
};

function toUrlString(buffer) {
  return buffer
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "");
}
