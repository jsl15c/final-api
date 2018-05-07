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

  if (req.user.userType === 'patient') {
    PatientModel.findById(req.user._id)
      .populate('doctors')
        .exec((err, onePatient) => {
          if(err) {
            res.status(500).json({message:'Patient find failed'});
            return;
          }
          // onePatient.password = undefined;
          console.log(req.user.firstName + ' is logged in');
          res.status(200).json(onePatient);
        });
      }

  if (req.user.userType === 'doctor') {
    DoctorModel.findById(req.user._id)
      .populate('patients')
        .exec((err, oneDoctor) => {
          if(err) {
            res.status(500).json({message:'Doctor find failed'});
            return;
          }
          // oneDoctor.password = undefined;
          console.log(req.user.firstName + ' is logged in');
          res.status(200).json(oneDoctor);
        });
  }
  res.status(400).status({message:'please log in'});
});

// // GET currentuser
// router.get('/currentuser', (req, res, next) => {
//   // do not send pasword to front end
//   req.user.password = undefined;
//   // sends req.user info to front end
//   res.status(200).json(req.user);
// });


// POST logout
router.post('/logout', (req, res, next) => {
  console.log(req.user);
  //req.logout defined by passport
  req.logout();
  console.log(req.user);
  res.status(200).json({message:'Logout successful '});
});

// // GET populate user patient or doctor field with full object
// router.get('/populate', (req, res, next) => {
//   if (!req.user) {
//     res.status(400).json({message:'need to login'});
//     return;
//   }
//   if (req.user.userType === 'patient') {
//     PatientModel.findById(req.user._id)
//       .populate('doctors')
//         .exec((err, onePatient) => {
//           if(err) {
//             res.status(500).json({message:'Patient find failed'});
//             return;
//           }
//           res.status(200).json(onePatient);
//         });
//   }
//   if (req.user.userType === 'doctor') {
//     PatientModel.findById(req.user._id)
//       .populate('patients')
//         .exec((err, oneDoctor) => {
//           if(err) {
//             res.status(500).json({message:'Doctor find failed'});
//             return;
//           }
//           res.status(200).json(oneDoctor);
//         });
//   }
//   return;
// });



module.exports = router;
