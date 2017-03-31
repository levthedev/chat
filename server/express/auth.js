const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const flash = require('connect-flash');
const session = require('express-session')
const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy
const { Agent } = require('./database')

const production = process.env.NODE_ENV === 'production'
// const production = false
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
app.use(express.static('dashboard/dist'));
app.use(express.static('chat'));
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
      console.log('Incorrect username.')
      return done(null, false, { message: 'Incorrect username.' })
    }
    if (!agent.validPassword(password)) {
      console.log('Incorrect password.')
      return done(null, false, { message: 'Incorrect password.' })
    }
    return done(null, agent)
  }).catch(err => { console.log('ERROR', err); done(err) } )
}))

passport.serializeUser((agent, done) => {
  done(null, agent.id)
})

passport.deserializeUser((id, done) => {
  Agent.findById(id).then(agent => {
    done(null, agent)
  })
})

app.post('/login',
  passport.authenticate('local', { successRedirect: `/dashboard`, failureRedirect: '/login.html', failureFlash: true })
  // passport.authenticate('local', { successRedirect: `http://localhost:8080`, failureRedirect: '/login.html', failureFlash: true })
)

app.post('/register', (req, res) => {
  const email = req.body.email
  const password = req.body.password
  const url = req.body.url
  Agent.create({ email, password, url })
  res.redirect('/login.html')
})

app.get('/logout', (req, res) => {
  console.log(req.session)
  req.logout()
  res.redirect('/login.html')
})

module.exports = { app, sessionMiddleware }
