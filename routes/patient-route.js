const express = require('express');
const bcrypt = require('bcrypt');
const passport = require('passport');
const router = express.Router();

const PatientModel = require('../models/patient-model');
const DataModel = require('../models/data-model');

// GET all patients
router.get('/list', (req, res, next) => {
  PatientModel.find((err, patientList) => {
    if (err) {
      res.json(err);
      return;
    }
    res.json(patientList);
  });
});

// POST signup
router.post('/signup', (req, res, next) => {
  if(!req.body.firstName || !req.body.lastName||
     !req.body.email || !req.body.password) {
       res.status(400).json({message:'All fields are required'});
       return;
  }

  PatientModel.findOne(
    {email:req.body.email},
    (err, patientFromDb) => {
      if (err) {
        res.status(500).json({message:'Server error'});
        return;
      }

      if (patientFromDb) {
        res.status(400).json({message:'Email is already in use'});
        return;
      }

      const salt = bcrypt.genSaltSync(10);
      const hashedPassword = bcrypt.hashSync(req.body.password, salt);

      const newPatient = new PatientModel({
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email:req.body.email,
        password:hashedPassword
      });

      newPatient.save((err) => {
        if (err) {
          res.status(500).json({message:'User server error'});
          return;
        }

        // automatically log in user after successful sign up
        // req.login() defined by passport
        req.login(newPatient, (err) => {
          if (err) {
            res.status(500).json({message:'login server error'});
            return;
          }
          console.log('😃 😃 😃 😃 😃 😃');
        });

        newPatient.password = undefined;
        // send users info to front end except password ^
        res.status(200).json(newPatient);
      });
    }
  );
});

// POST login
// passport.authenticate redirects (API should not)
router.post('/login', (req, res, next) => {
  const authenticateFunction =
    passport.authenticate('patient', (err, thePatient, strategyInfo) => {
      if(err) {
        res.status(500).json({message:'Unknown login error'});
        return;
      }

      // login failed
      if (!thePatient) {
        res.status(401).json(strategyInfo);
        return;
      }

      // login success
      req.login(thePatient, (err) => {
        if (err) {
          res.status(500).json({message:'Session save error'});
          return;
        }
        thePatient.password = undefined;

        // everything works
        res.status(200).json(thePatient);
      });
    });
    authenticateFunction(req, res, next);
});


// POST logout
router.post('/logout', (req, res, next) => {
  //req.logout defined by passport
  req.logout();
  res.status(200).json({message:'Logout successful'});
});

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



// POST update patient
router.post('/update/:myId', (req, res, next) => {
  // console.log(req.params.myId);
  PatientModel.findByIdAndUpdate(req.params.myId,
    {
      email:req.body.email
    },
    (err, patientFromDb) => {
      if(err) {
        res.status(500).json({message:'server error'});
        return;
      }
      res.status(200).json({message:'patient updated'});
      return;
    }
  );
});




// POST delete patient
router.post('/:myId', (req, res, next) => {
  // console.log(req.params.myId);
  PatientModel.findByIdAndRemove(req.params.myId,
    (err, patientEntry) => {
        if (err) {
          next(err);
          console.log(patientEntry);
          return;
        }
        if (!patientEntry) {
          res.status(400).json({message:'patient does not exist'});
          return;
        }
        res.status(200).json({message:patientEntry.firstName + ' deleted'});
        return;
  });
});

module.exports = router;
