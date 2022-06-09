import fs from "fs";
import path from "path";
import util from "util";
import fetch from "node-fetch";
import http from "http";
import https from "https";
import express from "express";
import * as Alexa from "ask-sdk-core";
import { ExpressAdapter } from "ask-sdk-express-adapter";

const LaunchRequestHandler: Alexa.RequestHandler = {
  canHandle(handlerInput: Alexa.HandlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === "LaunchRequest";
  },
  handle(handlerInput: Alexa.HandlerInput) {
    const speechText = "Idåsen Desk Skill gestartet.";
    return handlerInput.responseBuilder
      .speak(speechText)
      .reprompt(speechText)
      .withSimpleCard("Idåsen Desk", speechText)
      .getResponse();
  },
};

// const SetPositionInputHandler: Alexa.RequestHandler = {
//   canHandle: function (input: Alexa.HandlerInput) {
//     const request = input.requestEnvelope.request;
//     return (
//       request.type === "IntentRequest" &&
//       request.intent.name === "PositionIntent"
//     );
//   },
//   handle: function (input: Alexa.HandlerInput) {
//     const speechText = "Idåsen Desk wird in die gewünschte Position gebracht.";

//     return input.responseBuilder
//       .speak(speechText)
//       .withSimpleCard("Idåsen Desk", speechText)
//       .getResponse();
//   },
// };

const SitIntentInputHandler: Alexa.RequestHandler = {
  canHandle: function (input: Alexa.HandlerInput) {
    const request = input.requestEnvelope.request;
    return (
      request.type === "IntentRequest" && request.intent.name === "SitIntent"
    );
  },
  handle: function (input: Alexa.HandlerInput) {
    fetch("http://localhost:8888/sit", {
      method: "POST",
    })
      .then((x) => x.json())
      .then((x) =>
        console.log("Sitzposition gesetzt", util.inspect(x, { depth: null }))
      );

    const speechText = "Idåsen Desk wird in die Sitzposition gefahren.";
    return input.responseBuilder
      .speak(speechText)
      .withSimpleCard("Idåsen Desk", speechText)
      .getResponse();
  },
};

const StandIntentInputHandler: Alexa.RequestHandler = {
  canHandle: function (input: Alexa.HandlerInput) {
    const request = input.requestEnvelope.request;
    return (
      request.type === "IntentRequest" && request.intent.name === "StandIntent"
    );
  },
  handle: function (input: Alexa.HandlerInput) {
    fetch("http://localhost:8888/stand", {
      method: "POST",
    })
      .then((x) => x.json())
      .then((x) =>
        console.log("Stehposition gesetzt", util.inspect(x, { depth: null }))
      );

    const speechText = "Idåsen Desk wird in die Stehposition gefahren.";
    return input.responseBuilder
      .speak(speechText)
      .withSimpleCard("Idåsen Desk", speechText)
      .getResponse();
  },
};

const MeasureHeightIntentInputHandler: Alexa.RequestHandler = {
  canHandle: function (input: Alexa.HandlerInput) {
    const request = input.requestEnvelope.request;
    return (
      request.type === "IntentRequest" &&
      request.intent.name === "MeasureHeightIntent"
    );
  },
  handle: async function (input: Alexa.HandlerInput) {
    const response = await fetch("http://localhost:8888/height");
    const json: {
      ok?: number;
      error?: unknown;
    } = await response.json();

    if (json.ok) {
      const speechTextOk = "Idåsen Desk wird in die Stehposition gefahren.";
      const height = json.ok;
      return input.responseBuilder
        .speak(
          `Idåsen Desk Höhe beträgt ${height.toLocaleString("de", {
            maximumFractionDigits: 2,
          })}m.`
        )
        .withSimpleCard("Idåsen Desk", speechTextOk)
        .getResponse();
    } else {
      const speechTextError =
        "Ein Fehler beim Ermitteln der Höhe ist aufgetreten.";
      return input.responseBuilder
        .speak(speechTextError)
        .withSimpleCard("Idåsen Desk", speechTextError)
        .getResponse();
    }
  },
};

const HelpIntentHandler: Alexa.RequestHandler = {
  canHandle(handlerInput: Alexa.HandlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return (
      request.type === "IntentRequest" &&
      request.intent.name === "AMAZON.HelpIntent"
    );
  },
  handle(handlerInput: Alexa.HandlerInput) {
    const speechText =
      "Ich stelle dir deinen Idåsen Desk so ein, wie du ihn haben möchtest.";

    return handlerInput.responseBuilder
      .speak(speechText)
      .reprompt(speechText)
      .withSimpleCard("Idåsen Desk", speechText)
      .getResponse();
  },
};

const CancelAndStopIntentHandler: Alexa.RequestHandler = {
  canHandle(handlerInput: Alexa.HandlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return (
      request.type === "IntentRequest" &&
      (request.intent.name === "AMAZON.CancelIntent" ||
        request.intent.name === "AMAZON.StopIntent")
    );
  },
  handle(handlerInput: Alexa.HandlerInput) {
    const speechText = "Hejdå, Idåsen Desk wird gestoppt.";

    return handlerInput.responseBuilder
      .speak(speechText)
      .withSimpleCard("Idåsen Desk", speechText)
      .withShouldEndSession(true)
      .getResponse();
  },
};

const SessionEndedRequestHandler: Alexa.RequestHandler = {
  canHandle(handlerInput: Alexa.HandlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === "SessionEndedRequest";
  },
  handle(handlerInput: Alexa.HandlerInput) {
    console.log(
      `Sitzung wurde mit folgender Begründung beendet: ${
        (handlerInput.requestEnvelope.request as any).reason
      }`
    );

    return handlerInput.responseBuilder.getResponse();
  },
};

const ErrorHandler: Alexa.ErrorHandler = {
  canHandle() {
    return true;
  },
  handle(handlerInput: Alexa.HandlerInput, error: Error) {
    console.log(`Error handled: ${error.message}`);

    return handlerInput.responseBuilder
      .speak("Sorry, ich kann dich nicht verstehen. Bitte sag es mir erneut.")
      .reprompt(
        "Sorry, ich kann dich nicht verstehen. Bitte sag es mir erneut."
      )
      .getResponse();
  },
};

const skillBuilder = Alexa.SkillBuilders.custom();
const skill = skillBuilder
  .addRequestHandlers(
    LaunchRequestHandler,
    SitIntentInputHandler,
    StandIntentInputHandler,
    // SetPositionInputHandler,
    MeasureHeightIntentInputHandler,
    HelpIntentHandler,
    CancelAndStopIntentHandler,
    SessionEndedRequestHandler
  )
  .addErrorHandlers(ErrorHandler)
  .create();

const adapter = new ExpressAdapter(skill, true, true);

/* EXPRESS */

const app = express();

// Certificate
const privateKey = fs.readFileSync(
  path.join(__dirname, "./certs/privkey1.pem"),
  "utf8"
);
const certificate = fs.readFileSync(
  path.join(__dirname, "./certs/cert1.pem"),
  "utf8"
);
const ca = fs.readFileSync(path.join(__dirname, "./certs/chain1.pem"), "utf8");

const credentials = {
  key: privateKey,
  cert: certificate,
  ca: ca,
};

app.get("/", (req, res) => res.send("HELLO TO MY ALEXA SKILL"));
app.post("/", adapter.getRequestHandlers());

// app.use(express.static(__dirname, { dotfiles: "allow" }));

const httpServer = http.createServer(app);
const httpsServer = https.createServer(credentials, app);

httpServer.listen(3000, () => {
  console.log("Listening on port 3000");
});

httpsServer.listen(3001, () => {
  console.log("Listening on port 3001");
});
