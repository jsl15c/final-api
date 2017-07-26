const express = require('express');
const bcrypt = require('bcrypt');
const passport = require('passport');
const router = express.Router();

const PatientModel = require('../models/patient-model');
const DataModel = require('../models/data-model');

router.post('/patient-data/:myId', (req, res, next) => {
  // if (!req.user) {
  //   res.status(400).json({message:'You need to be logged in to view/edit data'});
  //   return;
  // }
    PatientModel.findById(req.params.myId, (err, userData) => {
      if (err) {
        next(err);
        return;
      }
      const newData = new DataModel ({
          sleep: {
            duration:req.body.duration,
            disruptions:req.body.disruptions,
            quality:(req.body.duration/req.body.disruptions)
          },
          diet:req.body.diet,
          treatment:req.body.treatment
      });

      newData.save((err) => {
        if (err) {
          res.status(500).json({message:'data save error'});
          return;
        }
        console.log(newData);
        userData.data.push(newData);
        console.log('🛑 🛑 🛑 🛑 🛑 🛑 🛑 ');
        console.log(userData.data);
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
