const passport = require('passport');
const bcrypt = require('bcrypt');
const LocalStrategy = require('passport-local').Strategy;

const PatientModel = require('../models/patient-model.js');
const DoctorModel = require('../models/doctor-model.js');

// save the users ID in the bowl (called when user logs in)
passport.serializeUser((userFromDb, next) => {
  // null in 1st arg mean no error
  next(null, userFromDb._id);
});

// retrieve the users info from the db with the id
// we got from the bowl (session)
passport.deserializeUser((idFromBowl, done) => {
   PatientModel.findById(idFromBowl, (err, userFromDb) => {
     // error handling
     if(err) {
       done(err);
       return;
     }
     // if user exists in PatientModel
     if(userFromDb){
       done(null, userFromDb);
       return;
     }
     // otherwise check DoctorModel
      DoctorModel.findById(idFromBowl, (err, userFromDb) => {
        // error handling
        if(err) {
          done(err);
          return;
        }
        done(null, userFromDb);
        return;
    });
  });
});

// email and password login Strategy
passport.use('patient', new LocalStrategy(
  {
    usernameField:'email',  // sent through AJAX from Angular
    passwordField:'password' // sent through AJAX from Angular
  },
  (email, password, next) => {
    PatientModel.findOne(
      {email:email},
      (err, patientFromDb) => {
        if (err) {
          next(err);
          return;
        }

        if (patientFromDb === null) {
          next(null, false, {message:'Incorrect email'});
          return;
        }

        if(bcrypt.compareSync(password, patientFromDb.password) === false) {
          next(null, false, {message:'Incorrect password'});
          return;
        }
        // if no errors, returns patient and logs in
        next(null, patientFromDb);
      }
    );
  }
)
);

// DOCTOR email and password login Strategy
passport.use('doctor', new LocalStrategy(
  {
    usernameField:'email',  // sent through AJAX from Angular
    passwordField:'password' // sent through AJAX from Angular
    },
  (email, password, next) => {
    DoctorModel.findOne(
      {email:email},
      (err, doctorFromDb) => {
        if (err) {
          next(err);
          return;
        }

        if (doctorFromDb === null) {
          next(null, false, {message:'Incorrect email'});
          return;
        }

        if(bcrypt.compareSync(password, doctorFromDb.password) === false) {
          next(null, false, {message:'Incorrect password'});
          return;
        }
        // if no errors, returns patient and logs in
        next(null, doctorFromDb);
      }
    );
  }
)
);
