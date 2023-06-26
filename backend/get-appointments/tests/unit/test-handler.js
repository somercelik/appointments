"use strict";

import { handler as getHandler } from "../../app.js";
import { handler as postHandler } from "../../../create-appointment/app.js";
import { expect } from "chai";
import { getRandomAppointmentDateTime } from "../../util.js";
var event, context;

describe("Get appointments index", function () {
  this.timeout(10000);
  it("fetches all appointments", async () => {
    let event = {
      queryStringParameters: {
        appointmentDate: "3442-11-28",
      },
    };
    const result = await getHandler(event, context);
    expect(result.statusCode).to.equal(200);
    let response = JSON.parse(result.body);
    expect(response.status).to.equal(true);
    console.debug("Response", response);
  });

  it("fails to fetch appointments due to insufficient parameters (appointmentDate)", async () => {
    const result = await getHandler(event, context);
    expect(result.statusCode).to.equal(400);
    let response = JSON.parse(result.body);
    expect(response.status).to.equal(false);
  });

  it("creates an appointment and fetches it", async () => {
    let randomAppointment = getRandomAppointmentDateTime();
    let event = {
      body: JSON.stringify({
        patientFirstName: "Soner",
        patientLastName: "Çelik",
        startDateTime: randomAppointment.startDateTime,
        endDateTime: randomAppointment.endDateTime,
      }),
    };

    const succRes = await postHandler(event, context);
    expect(succRes.statusCode).to.equal(201);

    event = {
      queryStringParameters: {
        appointmentDate: randomAppointment.startDateTime?.split("T")[0],
      },
    };
    const result = await getHandler(event, context);
    expect(result.statusCode).to.equal(200);
    let response = JSON.parse(result.body);
    expect(response.status).to.equal(true);
    expect(response.details?.length).greaterThan(0);
    console.debug("Response", response);
  });
});
