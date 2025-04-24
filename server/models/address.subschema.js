// models/subschemas/address.subschema.js
const { Schema } = require('mongoose');

const AddressSchema = new Schema({
  label: String,
  name: String,
  phone: String,
  addressLine1: String,
  addressLine2: String,
  city: String,
  state: String,
  pincode: String,
  country: String,
  isDefault: Boolean
}, { _id: false });

module.exports = AddressSchema;
