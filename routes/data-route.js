const express = require('express');
const bcrypt = require('bcrypt');
const passport = require('passport');
const router = express.Router();

const PatientModel = require('../models/patient-model');
const DataModel = require('../models/data-model');

router.post('/patient-data/new', (req, res, next) => {
  // if (!req.user) {
  //   res.status(400).json({message:'You need to be logged in to view/edit data'});
  //   return;
  // }
    PatientModel.findById(req.user._id,
      (err, userData) => {
      if (err) {
        console.log('🔥🔥 🔥 🔥 🔥 🔥 🔥 🔥 🔥 🔥 🔥 🔥 🔥');
        res.status(500).json({message:'server failed'});
        return;
      }
      // console.log(req.params.myId);
      const newData = new DataModel ({
        sleep: {
          duration:req.body.duration,
          disruptions:req.body.disruptions,
          quality:(req.body.duration/req.body.disruptions),
        },
            diet:req.body.diet
      });

      newData.save((err) => {
        if (err) {
          console.log('🔥🔥 🔥 🔥 🔥 🔥 🔥 🔥 🔥 🔥 🔥 🔥 🔥');
          console.log(newData.sleep);
          res.status(500).json({message:'data save error'});
          return;
        }
        // sleep.markModified('data');
        console.log('🔥🔥 🔥 🔥 🔥 🔥 🔥 🔥 🔥 🔥 🔥 🔥 🔥');
        userData.data.push(newData);
        console.log('🐟 🐟 🐟 🐟 🐟 🐟 🐟 🐟 🐟 🐟 🐟 🐟 🐟');
        console.log(userData);
      userData.save((err) => {
        if(err) {
          res.status(500).json({message:'user data save error'});
          return;
        }
        res.status(200).json({message:'new data saved'});
        return;
      });
      });
    });
});

module.exports = router;
