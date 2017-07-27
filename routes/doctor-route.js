const express = require('express');
const passport = require('passport');
const bcrypt = require('bcrypt');
const router = express.Router();
const randomkey = require('randomkey');

const PatientModel = require('../models/patient-model');
const DoctorModel = require('../models/doctor-model');

// GET all doctors
router.get('/list', (req, res, next) => {
  DoctorModel.find((err, doctorList) => {
    if (err) {
      res.status(500).json({message:'id doesnt exist'});
      return;
    }
    res.status(200).json(doctorList);
  });
});

// POST signup
router.post('/signup', (req, res, next) => {
  if(!req.body.firstName || !req.body.lastName||
     !req.body.email || !req.body.password) {
       res.status(400).json({message:'All fields are required'});
       return;
  }

  DoctorModel.findOne(
    {email:req.body.email},
    (err, doctorFromDb) => {
      if (err) {
        res.status(500).json({message:'Server error'});
        return;
      }

      if (doctorFromDb) {
        res.status(400).json({message:'Email is already in use'});
        return;
      }

      const salt = bcrypt.genSaltSync(10);
      const hashedPassword = bcrypt.hashSync(req.body.password, salt);

      const patientKeyGen = randomkey(6);

      const newDoctor = new DoctorModel({
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email:req.body.email,
        password:hashedPassword,
        patientKey:patientKeyGen
      });

      newDoctor.save((err) => {
        if (err) {
          res.status(500).json({message:'User server error'});
          return;
        }

        // automatically log in user after successful sign up
        // req.login() defined by passport
        req.login(newDoctor, (err) => {
          if (err) {
            res.status(500).json({message:'login server error'});
            return;
          }
          console.log('😃 😃 😃 😃 😃 😃');
        });

        newDoctor.password = undefined;
        // send users info to front end except password ^
        res.status(200).json(newDoctor);
      });
    }
  );
});

// POST login
// passport.authenticate redirects (API should not)
router.post('/login', (req, res, next) => {
  const authenticateFunction =
    passport.authenticate('doctor', (err, theDoctor, strategyInfo) => {
      if(err) {
        res.status(500).json({message:'Unknown login error'});
        return;
      }

      // login failed
      if (!theDoctor) {
        console.log('🛑');
        res.status(401).json(strategyInfo);
        return;
      }

      // login success
      req.login(theDoctor, (err) => {
        if (err) {
          console.log('🛑');
          console.log('🛑');
          res.status(500).json({message:'Session save error'});
          return;
        }
        console.log('🛑');
        console.log('🛑');
        console.log('🛑');
        theDoctor.password = undefined;

        // everything works
        res.status(200).json(theDoctor);
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

// // GET checklogin
// router.get('/checklogin', (req, res, next) => {
//   if (!req.user) {
//     res.status(401).json({message:'You are not logged in'});
//     return;
//   }
//   // do not send pasword to front end
//   req.user.password = undefined;
//   // sends req.user info to front end
//   res.status(200).json(req.user);
// });

// POST delete doctor
router.post('/:myId', (req, res, next) => {
  // console.log(req.params.myId);
  DoctorModel.findByIdAndRemove(req.params.myId,
    (err, doctorEntry) => {
        if (err) {
          next(err);
          console.log(doctorEntry);
          return;
        }
        if (!doctorEntry) {
          res.status(400).json({message:'doctor does not exist'});
          return;
        }
        res.status(200).json({message:doctorEntry.firstName + ' deleted'});
        return;
  });
});



module.exports = router;
