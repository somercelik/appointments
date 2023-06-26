"use strict";

import { handler } from "../../app.js";
import { expect } from "chai";
import { getRandomAppointmentDateTime } from "../../util.js";
var event, context;

describe("Create appointment index", function () {
  this.timeout(10000);
  it("creates random appointment", async () => {
    let randomAppointment = getRandomAppointmentDateTime();
    let event = {
      body: JSON.stringify({
        patientFirstName: "Soner",
        patientLastName: "Çelik",
        startDateTime: randomAppointment.startDateTime,
        endDateTime: randomAppointment.endDateTime,
      }),
    };

    const result = await handler(event, context);
    expect(result.statusCode).to.equal(201);
    let response = JSON.parse(result.body);
    expect(response.status).to.equal(true);
  });

  it("fails to create because of overlapping", async () => {
    let randomAppointment = getRandomAppointmentDateTime();
    let event = {
      body: JSON.stringify({
        patientFirstName: "Soner",
        patientLastName: "Çelik",
        startDateTime: randomAppointment.startDateTime,
        endDateTime: randomAppointment.endDateTime,
      }),
    };

    const succRes = await handler(event, context);
    expect(succRes.statusCode).to.equal(201);

    const errRes = await handler(event, context);
    let response = JSON.parse(errRes.body);
    expect(errRes.statusCode).to.equal(400);
    expect(response.status).to.equal(false);
  });
});
