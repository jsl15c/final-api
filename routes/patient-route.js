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
          newPatient.password = undefined;
          // send users info to front end except password ^
          res.status(200).json(newPatient);
        });
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
        console.log(doctorWithCode);
        res.status(400).json({message:'Invalid doctor code'});
        console.log('Invalid doctor code: ' + doctorWithCode.patientKey);
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

  router.post('/patient-data/new', (req, res, next) => {
    const newData = new DataModel ({
      sleep: {
        duration: req.body.duration,
        quality: req.body.quality,
        disruptions: req.body.disruptions
      },
      diet:req.body.diet,
      treatment:req.body.treatment
    });

    newData.save((err) => {
      if (err) {
        console.log(err);
        return;
      }
      res.status(200).json(newData);
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

const fetch = require('node-fetch');
const btoa = require('btoa');

const CLIENT_ID = 'ohnuts2-e7635ef65cd15a71c55c1d7779335a1b4646620026628838937';
const CLIENT_SECRET = 'EAUC1PDoT6EcGnEsKvHBxjRY4N00xFWfxARC17Aq';

// async function getBearer() {
//   let data = await fetch('https://api.kroger.com/v1/connect/oauth2/token?grant_type=client_credentials&scope=profile.compact', {
//     "method": "POST",
//     "headers": {
//       "Content-Type": "application/x-www-form-urlencoded",
//       "Authorization": `Basic ${btoa(`${CLIENT_ID}:${CLIENT_SECRET}`)}`
//     }
//   })
//   let json = await data;
//   console.log(json);
//   return json.access_token;
// }

router.get('/get-items', async (req, res, next) => {
  let tokenReq = await fetch('https://api.kroger.com/v1/connect/oauth2/token?grant_type=client_credentials&scope=product.compact', {
    "method": "POST",
    "headers": {
      "Content-Type": "application/x-www-form-urlencoded",
      "Authorization": `Basic ${btoa(`${CLIENT_ID}:${CLIENT_SECRET}`)}`
    }
  })
  let json = await tokenReq.json();

  let data = await fetch('https://api.kroger.com/v1/products?filter.brand=Chobani', {
    "method": "GET",
    "headers": {
      "Accept": "application/json",
      "Authorization": ('Bearer ' + json.access_token)
    }
  })

  let foodJson = await data.json();
  console.log(foodJson);
  res.status(200).json(foodJson)
  
})


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
