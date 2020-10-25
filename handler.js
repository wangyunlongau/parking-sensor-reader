"use strict";
const fetch = require("node-fetch");

const { Client } = require("@elastic/elasticsearch");

module.exports.read = function (event, context, callback) {
  fetch("https://data.melbourne.vic.gov.au/resource/vh2v-4nfs.json?$limit=3500")
    .then((res) => res.json())
    .then((json) => bulk_index(json).catch(console.error));
};

async function bulk_index(data) {
  const client = new Client({
    node:
      "https://search-parking-sensor-4wdmbtitqlcfznsj6vsagmzire.ap-southeast-2.es.amazonaws.com",
  });

  function transform(sensor) {
    return {
      bayId: sensor.bay_id,
      unoccupied: sensor.status == "Unoccupied" ? true : false,
      location: {
        lat: parseFloat(sensor.lat),
        lon: parseFloat(sensor.lon),
      },
    };
  }

  const docs = data.map(transform);

  const body = docs.flatMap((doc) => [{ index: { _id: doc.bayId } }, doc]);

  const { body: bulkResponse } = await client.bulk({
    index: "parking-sensor",
    body,
  });

  if (bulkResponse.errors == false) {
    console.log("Indexing was successful");
  } else
    console.log(
      "One or more of the operations in the bulk request did not complete successfully"
    );
}
