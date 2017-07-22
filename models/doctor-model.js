const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const doctorSchema = new Schema (
{
  firstName: {
    type: String,
    required:true
  },
  lastName: {
    type: String,
    required:true
  },
  email: {
    type: String,
    required:true
  },
  password: {
    type: String,
    required:true
  },
  phoneNumber:{
    type:String
  },
  patients:[{
    type:Schema.Types.ObjectId,
    // "ref" is the string name of a model that the ID refers to
    ref:'Patient'
    // you NEED "ref" to use populate()
  }]
},
{
  timestamps:true
}
);

const DoctorModel = mongoose.model('Doctor', doctorSchema);

module.exports = DoctorModel;
