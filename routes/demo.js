const router = express.Router();

router.get('/demo', (req, res, next) => {
  res.render('../routes/demo');
});


module.exports = router;
