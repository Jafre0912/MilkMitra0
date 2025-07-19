// models/index.js
const User = require("./userSchema");
const Cattle = require("./cattleSchema");
const MilkProduction = require("./milkProduction");
const Transaction = require("./Transaction");
const MPPMilkCollection = require("./MPPMilkCollection");
const NewsAlert = require("./NewsAlert");
const Message = require("./Message");

module.exports = {
  User,
  Cattle,
  MilkProduction,
  Transaction,
  MPPMilkCollection,
  NewsAlert,
  Message,
};
