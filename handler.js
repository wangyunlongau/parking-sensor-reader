"use strict";
const fetch = require("node-fetch");

module.exports.read = function (event, context, callback) {
  fetch("https://data.melbourne.vic.gov.au/resource/vh2v-4nfs.json?$limit=1")
    .then((res) => res.json())
    .then((json) => console.log(json));
};
