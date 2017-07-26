const mongoose = require('mongoose');
const dataSchema = new mongoose.Schema(
{
  sleep:
    {
      duration:{type:Number},
      quality:{type:Number},
      disruptions:{type:Number}
    },
  diet: {type: String},
  treatment: {type: String}
},
{
  timestamps:true
}
);

const DataModel = mongoose.model('Data', dataSchema);

module.exports = DataModel;
