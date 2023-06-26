export function getRandomAppointmentDateTime() {
  let startDate = new Date(
    new Date(0, 0, 1).getTime() +
      Math.random() *
        (new Date(4000, 11, 30).getTime() - new Date(0, 0, 1).getTime())
  );
  let endDate = new Date(startDate);
  endDate.setHours(endDate.getHours() + 3);
  return {
    startDateTime: startDate.toISOString(),
    endDateTime: endDate.toISOString(),
  };
}

export function errorResponse(errorMessage, statusCode, awsRequestId) {
  return {
    statusCode: statusCode,
    body: JSON.stringify({
      status: false,
      message: errorMessage,
      details: { requestId: awsRequestId },
    }),
    headers: {
      "Access-Control-Allow-Origin": "*",
    },
  };
}

export function formatDynamoDbResult(dbRes) {
  if (!dbRes) {
    throw new Error("Object cannot be formatted: ", dbRes);
  }
  if (Array.isArray(dbRes)) {
    let formattedRes = dbRes.map((item) => formatOneDynamoDbItem(item));
    return formattedRes;
  } else {
    return formatOneDynamoDbItem(dbRes);
  }
}

function formatOneDynamoDbItem(item) {
  const formattedItem = {};
  for (const key in item) {
    formattedItem[key] = item[key].S;
  }
  return formattedItem;
}

function number2Pad(num) {
  return num.toString().padStart(2, "0");
}
