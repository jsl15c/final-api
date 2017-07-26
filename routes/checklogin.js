const express = require('express');
const router  = express.Router();
const passport = require('passport');

const PatientModel = require('../models/patient-model');
const DoctorModel = require('../models/doctor-model');


// GET checklogin
router.get('/checklogin', (req, res, next) => {
  if (!req.user) {
    res.status(401).json({message:'You are not logged in'});
    return;
  }
  // do not send pasword to front end
  req.user.password = undefined;
  // sends req.user info to front end
  res.status(200).json(req.user);
});

// GET currentuser
router.get('/currentuser', (req, res, next) => {
  // do not send pasword to front end
  req.user.password = undefined;
  // sends req.user info to front end
  res.status(200).json(req.user);
});


// POST logout
router.post('/logout', (req, res, next) => {
  console.log(req.user);
  //req.logout defined by passport
  req.logout();
  console.log(req.user);
  res.status(200).json({message:'Logout successful '});
});



module.exports = router;
