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
  data:[DataModel.schema],
  doctors:[{
    type:Schema.Types.ObjectId,
    // "ref" is the string name of a model that the ID refers to
    ref:'Doctor'
    // you NEED "ref" to use populate()
  }]
},

{
  timestamps:true
}
);

const PatientModel = mongoose.model('Patient', patientSchema);

module.exports = PatientModel;
