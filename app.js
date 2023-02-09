const createError = require('http-errors')
const express = require('express')
const path = require('path')
const logger = require('morgan')
const flash = require('connect-flash')
const cookieParser = require('cookie-parser')
const session = require('express-session')
const authService = require('./services/auth.service')
const bodyParser = require('body-parser')
const yargs = require('yargs')

const args = yargs
  .usage('Usage: npm run start -- [options]')
  .help('help')
  .alias('help', 'h')
  .alias('version', 'v')
  .example('npm run start -- --email string --password string')
  .option('email', {
    alias: 'e',
    describe: 'Email for authorization',
    demandOption: true,
    default: 'user@test.com',
  })
  .option('password', {
    alias: 'p',
    describe: 'Password for authorization',
    demandOption: true,
    default: 'user123',
  })
  .epilog('Express app').argv

const mainRouter = require('./routes/')

const app = express()

const email = args.email
const password = args.password

app.use(cookieParser())
app.use(
  session({
    resave: true, // ability to rewrite cookies
    saveUninitialized: true,
    secret: 'secret', // here we can set a generated hash for example
    cookie: {
      maxAge: 30000,
    },
  })
)
app.use(flash())

// view engine setup
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'pug')

process.env.NODE_ENV === 'development'
  ? app.use(logger('dev'))
  : app.use(logger('short'))

app.use(express.json())
app.use(express.urlencoded({ extended: false }))

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))

app.use(express.static(path.join(__dirname, 'public')))

app.use('/', mainRouter)

// catch 404 and forward to error handler
app.use((req, __, next) => {
  next(createError(404, req.url))
})

// error handler
app.use((err, req, res, next) => {
  // set locals, only providing error in development
  res.locals.message = err.message
  res.locals.error = err.status === 404 || req.app.get('env') === 'development' ? err : {}

  // render the error page
  res.status(err.status || 500)
  res.render('error')
})

app.listen(3000, () => {
  // сделать через args, как в первой домашке; логин и пароль через переменные окружения при запуске
  authService.registration({
    email,
    password,
  })
})
