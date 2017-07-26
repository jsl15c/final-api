const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const DataModel = require('../models/data-model.js');

const patientSchema = new Schema (
{
  firstName: {
    type: String
  },
  lastName: {
    type: String
  },
  email: {
    type: String
  },
  password: {type:String},
  // picture:{},
  phoneNumber:{type:String},
  // data:[DataModel.schema]
  userType:{
    type:String,
    default:'patient'
  },
  data:[DataModel.schema]
},

{
  timestamps:true
}
);

const PatientModel = mongoose.model('Patient', patientSchema);

module.exports = PatientModel;
