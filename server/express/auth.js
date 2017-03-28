const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const flash = require('connect-flash');
const session = require('express-session')
const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy;

const production = process.env.NODE_ENV === 'production'
const domain = production ? '174.138.71.184' : 'localhost'

const sessionMiddleware = session({
  secret: 'neb: "Iyono"',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false,
    maxAge: 12 * 30 * 24 * 60 * 60 * 1000,
    domain
  }
})

app.use(express.static('marketing'));
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(sessionMiddleware)
app.use(passport.initialize())
app.use(passport.session())
app.use(flash())

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Credentials', 'true')
  next()
})

passport.use(new LocalStrategy({ usernameField: 'email' }, function(email, password, done) {
  Agent.findOne({ where: { email: email } }).then((agent) => {
    if (!agent) {
      return done(null, false, { message: 'Incorrect username.' })
    }
    if (!agent.validPassword(password)) {
      return done(null, false, { message: 'Incorrect password.' })
    }
    return done(null, agent)
  }).catch(err => done(err))
}))

passport.serializeUser((agent, done) => {
  done(null, agent.id)
})

passport.deserializeUser((id, done) => {
  Agent.findById(id).then(agent => {
    done(null, agent)
  })
})

app.get('/login', (req, res) => {
  res.sendFile(__dirname + '/marketing/login.html')
})

app.post('/login',
  passport.authenticate('local', { successRedirect: `http://${domain}:8080`, failureRedirect: '/login', failureFlash: true })
)

app.get('/register', (req, res) => {
  res.sendFile(__dirname + '/marketing/register.html')
})

app.post('/register', (req, res) => {
  const email = req.body.email
  const password = req.body.password
  Agent.create({ email, password })
  res.redirect('login')
})

app.get('/logout', (req, res) => {
  req.logout()
  res.redirect('/login')
})

module.exports = { app, sessionMiddleware }
