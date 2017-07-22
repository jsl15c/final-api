const mongoose = require('mongoose');
const DataModel = require('./data-model.js');

const Schema = mongoose.Schema;

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
  data:[{
    type:Schema.Types.ObjectId,
    // "ref" is the string name of a model that the ID refers to
    ref:'Data'
    // you NEED "ref" to use populate()
  }]
},

{
  timestamps:true
}
);

const PatientModel = mongoose.model('Patient', patientSchema);

module.exports = PatientModel;
