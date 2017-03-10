const app = require('express')()
const Sequelize = require('sequelize')
const session = require('express-session')
const http = require('http').Server(app);
const io = require('socket.io')(http);

const sequelize = new Sequelize('sqlite://database.db/')

const Message = sequelize.define('message', {
  text: { type: Sequelize.STRING },
  sender: { type: Sequelize.STRING }
})

const User = sequelize.define('user', {
  name: { type: Sequelize.STRING },
  email: { type: Sequelize.STRING },
  handle: { type: Sequelize.STRING }
})

Message.sync().then(() => {
  return Message.create({ text: 'Welcome to Everydev!', sender: 'company' })
})

User.sync()

sessionMiddleware = session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false,
    maxAge: 12 * 30 * 24 * 60 * 60 * 1000,
    domain: 'localhost'
  }
})

app.use(sessionMiddleware)

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "localhost:3000")
  res.header("Access-Control-Allow-Credentials", 'true');
  next()
})

const colors = ['red', 'orange', 'yellow', 'green', 'blue', 'indigo', 'violet']
const animals = ['cat', 'dog', 'fish', 'whale', 'dolphin', 'penguin', 'sloth']

app.get('/chat.js', (req, res) => {
  res.sendFile(__dirname + '/chat.js')
  sample = (array) => array[Math.floor(Math.random() * array.length)]
  let number = Math.floor(Math.random() * 1000)
  req.session.user = req.session.user || [sample(colors), sample(animals), number].join('-')
  User.findAll({ where: { handle: req.session.user }}).then(users => {
    if (!users[0]) {
      User.create({ handle: req.session.user })
      console.log(req.session.user)
    } else {
      // console.log('old user', req.session.user)
    }
  })
})

app.get('/styles.css', (req, res) => {
  res.sendFile(__dirname + '/styles.css')
})

app.get('/x.png', (req, res) => {
  res.sendFile(__dirname + '/x.png')
})

app.get('/messages', (req, res) => {
  Message.findAll().then(messages => res.send(messages))
})

io.use((socket, next) => {
  sessionMiddleware(socket.request, socket.request.res, next)
})

io.on('connection', (socket) => {
  socket.on('customerMessage', (text) => {
    console.log(socket.request.session.user)
    Message.create({ text, sender: 'customer' }).then(message => {
      io.emit('messageCreated', message)
    })
  })
})

http.listen(3000, '127.0.0.1')
