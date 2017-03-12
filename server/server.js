const app = require('express')()
const Sequelize = require('sequelize')
const session = require('express-session')
const http = require('http').Server(app)
const io = require('socket.io')(http)

const sequelize = new Sequelize('sqlite://database.db/')

const Message = sequelize.define('message', {
  text: { type: Sequelize.STRING },
  sender: { type: Sequelize.STRING }
})

const User = sequelize.define('user', {
  name: { type: Sequelize.STRING },
  email: { type: Sequelize.STRING },
  handle: { type: Sequelize.STRING },
  color: { type: Sequelize.STRING },
  closed: { type: Sequelize.BOOLEAN }
})

let userRooms = []

User.hasMany(Message)
Message.sync()
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
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Credentials', 'true')
  next()
})

const adjectives = ['slow', 'fast', 'small', 'big', 'young', 'baby', 'happy', 'excited', 'sleepy', 'drowsy']
const animals = ['cat', 'dog', 'fish', 'whale', 'dolphin', 'penguin', 'sloth', 'mouse', 'elephant', 'otter']

app.get('/chat.js', (req, res) => {
  res.sendFile(__dirname + '/chat/chat.js')
  sample = (array) => array[Math.floor(Math.random() * array.length)]
  let number = Math.floor(Math.random() * 1000)
  req.session.user = req.session.user || [sample(adjectives), sample(animals), number].join('-')

  User.findAll({ where: { handle: req.session.user }}).then(users => {
    if (!users[0]) {
      const color = `hsl(${Math.floor(Math.random() * 360)}, 100%, 80%)`
      User.create({ handle: req.session.user, color, closed: false })
    }
  })
})

app.get('/styles.css', (req, res) => {
  res.sendFile(__dirname + '/chat/styles.css')
})

app.get('/x.png', (req, res) => {
  res.sendFile(__dirname + '/chat/x.png')
})

app.get('/users', (req, res) => {
  User.findAll({
    include: [Message],
    order: [ [Message, 'createdAt', 'DESC' ]]
  }).then(users => {
    res.send(users)
  })
})

app.get('/messages', (req, res) => {
  Message.findAll().then(messages => {
    res.send(messages)
  })
})

app.get('/users/:handle', (req, res) => {
  User.findAll({ where: {handle: req.params.handle }}).then(users => {
    let user = users[0]
    user.getMessages().then(messages => {
      res.send({
        user,
        messages
      })
    })
  })
})

io.use((socket, next) => {
  sessionMiddleware(socket.request, socket.request.res, next)
})

io.on('connection', (socket) => {
  User.findAll({
    where: {
      handle: socket.request.session.user
    },
    include: [Message],
    order: [[Message, 'createdAt', 'ASC']]
  }).then(users => {
    if (users[0]) {
      socket.emit('messageHistory', users[0].messages)
      socket.emit('messageCreated', { text: 'Welcome to the website!', sender: 'company' })
      socket.join(users[0].handle)
      userRooms.push(users[0].handle)
    }
  })

  socket.on('customerMessage', (text) => {
    Message.create({ text, sender: 'customer' }).then(message => {
      User.findAll({ where: { handle: socket.request.session.user } }).then(users => {
        users[0].addMessage(message).then(() => {
          message.save() // TODO - userID still not beind set on message so dashboard doesn't know to live update
          message.reload()
          console.log(message.toJSON())
          users[0].hasMessage(message).then(function(result) {
            console.log('RESULT', result)
          })
          io.sockets.in(users[0].handle).emit('messageCreated', message)
        })
      })
    })
  })

  socket.on('agentMessage', (agentMessage) => {
    Message.create({ text: agentMessage.text, sender: 'company' }).then(message => {
      User.findById(agentMessage.customerID).then(user => {
        user.addMessage(message).then(() => {
          message.save()
          message.reload()
          console.log('************************', message.toJSON)
          user.hasMessage(message).then(function(result) {
            console.log('RESULT', result)
          })
          io.sockets.in(user.handle).emit('messageCreated', message)
        })
      })
    })
  })

  socket.on('joinRooms', () => {
    userRooms.forEach(room => socket.join(room))
  })

  socket.on('toggleConversation', (data) => {
    User.findById(data.customerID).then(user => {
      user.update({ closed: !user.closed })
    })
  })
})

http.listen(3000, '127.0.0.1')
