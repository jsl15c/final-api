const express = require('express');
const bcrypt = require('bcrypt');
const passport = require('passport');
const router = express.Router();

const PatientModel = require('../models/patient-model');
const DoctorModel = require('../models/doctor-model');
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
          console.log(err);
          console.log(newPatient);
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
        console.log(req.user.firstName);
        res.status(200).json(thePatient);
      });
    });
    authenticateFunction(req, res, next);
});


// route finds doctor with matching code (entered by patient on client)
// and adds patient to doctor
router.post('/add-patient-doctor', (req, res, next) => {
  DoctorModel.findOne({patientKey:req.body.patientKey},
    (err, doctorWithCode) => {
      if (err) {
        // next(err);
        res.status(500).json({message:'Find failed'});
        console.log('find failed');
        return;
      }
      if (!doctorWithCode) {
        console.log("------------" + doctorWithCode);
        res.status(400).json({message:'Invalid doctor code'});
        console.log('Invalid doctor code');
        return;
      }
      // console.log(req.user.doctors + ' ajdshfjaklsdfhlakshj');
      if (!req.user) {
        res.status(400).json({message:'log in to add doctor'});
        console.log('log in to add doctor');
        return;
      }

      doctorWithCode.patients.push(req.user);
      req.user.doctors.push(doctorWithCode._id);


      // req.user.doctors.push(d);
      // console.log('');
      // console.log(doctorWithCode._id);
      doctorWithCode.save((err) => {
        if (err) {
          res.status(500).json({message:'Save failed'});
          return;
        }
        DoctorModel.findOne({patientKey:req.body.doctorCode})
        .populate('patients')
        .exec((err, theDoctor) => {
          if (err) {
            res.status(500).json({message:'error'});
            return;
          }
          req.user.save((err) => {
            if (err) {
              res.status(500).json({message:'user Save failed'});
              return;
            }
            res.status(200).json(req.user);
            return;
          });
        });
      });
    });
  });


  router.post('/remove-doctor', (req, res, next) => {
    if (!req.user) {
      console.log(' you are not logged in');
      res.status(400).json({message:'login to edit account'});
      return;
    }
    PatientModel.findByIdAndUpdate(req.user._id,
      {
        doctors:[]
      },
      (err, patientFromDb) => {
        if(err) {
          res.status(500).json({message:'server error'});
          return;
        }
        res.status(200).json(patientFromDb);
        return;
      }
    );
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
router.post('/delete/:myId', (req, res, next) => {
  // console.log(req.params.myId);
  PatientModel.findByIdAndRemove(req.params.myId,
    (err, patientEntry) => {
        if (err) {
          // next(err);
          res.status(500).json({message:'Find'});
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



// // route finds doctor with matching code (entered by patient on client)
// // and adds patient to doctor
// router.get('/add-patient-to-doctor/:myId', (req, res, next) => {
//   DoctorModel.findOne({patientKey:req.params.myId})
//   .populate('patients') // retrieve all info of user
//   .exec((err, theDoctor) => {
//
//   if (err) {
//     res.status(500).json({message:'error'});
//     return;
//   }
//   res.status(200).json(theDoctor);
// });
// });



module.exports = router;
