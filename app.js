// const createError = require('http-errors');
const express = require('express');
// var http = require('http');
const passport = require('passport')
const path = require('path');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const formidable = require('express-formidable');
const morgan = require('morgan');
const cors = require('cors');
const passportJWT = passport.authenticate('jwt', { session: false });
const { authorize } = require('./helper/authorize');
const dotenv = require('dotenv');
dotenv.config();

const CNST = require('./config/constant');
// const { createBucket } = require('./helper/s3upload')
const userRoute = require('./routes/users');
const postRoute = require('./routes/post');
const productRoute = require('./routes/product');
const categoryRoute = require('./routes/category');
const cartRoute = require('./routes/cart');
const orderRoute = require('./routes/order');
const quizRoute = require('./routes/quiz');
const uploadRoute = require('./routes/uploads');
const notification = require('./routes/notification');

const app = express();
// app.use(formidable());
//Create bucket
// createBucket();

app.use(cors());
app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

//Models
const models = require('./models');

//Sync Database
models.sequelize.sync().then(function () {
  console.log("Nice! Database look nice")
}).catch(error => {
  console.log(error, "Something went wrong with the database Update!")
})
app.use(passport.initialize());
// require('./routes')(app);

//Serve Images
app.get('/image/:name', function (req, res, next) {
  var options = {
    root: path.join(__dirname, 'flags'),
    dotfiles: 'deny',
    headers: {
      'x-timestamp': Date.now(),
      'x-sent': true
    }
  }

  var fileName = req.params.name
  res.sendFile(fileName, options, function (err) {
    if (err) {
      next(err)
    } else {
      console.log('Sent:', fileName)
    }
  })
})

//User routes
app.use('/v1', userRoute);
app.use('/v1/user', passportJWT, userRoute);
app.use('/v1/post', passportJWT, postRoute);
app.use('/v1/product', productRoute);
app.use('/v1/category', categoryRoute);
app.use('/v1/cart', passportJWT, cartRoute);
app.use('/v1/order', passportJWT, orderRoute);
app.use('/v1/uploads',passportJWT,uploadRoute);
app.use('/v1/quiz', passportJWT, quizRoute)
app.use('/v1/notification', passportJWT, notification)


//Admin routes
app.use('/v1/admin/quiz', passportJWT, authorize([2]), quizRoute)

app.get('*', (req, res) => {
  res.status(500).send({ message: 'Invalid API route' })
})

app.use(function (err, req, res, next) {
  if (err.code === 'permission_denied' || err.code === 'permissions_not_found') {
    res.status(403).send('Forbidden');
  }

  return res.status(400).json({ message: err.message });
});

var port = process.env.PORT || '8989';
app.set('port', port);

const server = app.listen(port, function () {
  console.log('Server listening on port ' + port);
});
module.exports = app;
