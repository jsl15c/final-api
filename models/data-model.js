const mongoose = require('mongoose');
const dataSchema = new mongoose.Schema(
{
  sleep:
    {
      duration:{type:Number},
      quality:{type:Number, min:1, max:5},
      disruptions:Boolean
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
