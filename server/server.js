const app = require('express')()
const Sequelize = require('sequelize')
const session = require('express-session')
const http = require('http').Server(app)
const io = require('socket.io')(http)

const sequelize = new Sequelize('sqlite://database.db/', { logging: true })

const Message = sequelize.define('message', {
  text: { type: Sequelize.STRING },
  sender: { type: Sequelize.STRING }
})

const User = sequelize.define('user', {
  name: { type: Sequelize.STRING },
  email: { type: Sequelize.STRING },
  handle: { type: Sequelize.STRING },
  color: { type: Sequelize.STRING },
  closed: { type: Sequelize.BOOLEAN },
  sessions: { type: Sequelize.INTEGER },
  online: { type: Sequelize.BOOLEAN },
  lastMessageDate: { type: Sequelize.DATE }
})

let userRooms = []

User.hasMany(Message)
Message.sync({force: true})
User.sync({force: true})

sessionMiddleware = session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false,
    maxAge: 12 * 30 * 24 * 60 * 60 * 1000,
    // domain: 'localhost'
    domain: '174.138.71.184'
  }
})

app.use(sessionMiddleware)

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Credentials', 'true')
  next()
})

const adjectives = ['slow', 'fast', 'small', 'big', 'young', 'baby', 'happy', 'excited', 'sleepy', 'drowsy', 'clever', 'energetic', 'brave', 'little', 'quiet', 'jolly', 'eager', 'calm', 'curious', 'bouncy', 'graceful', 'rare', 'lucky']
const animals = ['cat', 'dog', 'fish', 'whale', 'dolphin', 'penguin', 'sloth', 'mouse', 'elephant', 'otter', 'panda', 'bear', 'seal', 'giraffe', 'gecko', 'duck', 'deer', 'hippo', 'hedgehog', 'octopus', 'owl', 'rabbit', 'fox']

app.get('/chat.js', (req, res) => {
  console.log('requesting chat')
  res.sendFile(__dirname + '/chat/chat.js')
  const number = Math.floor(Math.random() * 1000)
  sample = (array) => array[Math.floor(Math.random() * array.length)]
  req.session.user = req.session.user || [sample(adjectives), sample(animals), number].join('-')

  User.findOne({ where: { handle: req.session.user }}).then(user => {
    if (user) {
      user.increment(['sessions'], { by: 1 })
    } else {
      const color = `hsl(${Math.floor(Math.random() * 360)}, 100%, 80%)`
      User.create({ handle: req.session.user, color, closed: false, sessions: 1 })
    }
  })
})

app.get('/styles.css', (req, res) => {
  console.log('requesting styles')
  res.sendFile(__dirname + '/chat/styles.css')
})

app.get('/x.png', (req, res) => {
  console.log('requesting x')
  res.sendFile(__dirname + '/chat/x.png')
})

app.get('/users', (req, res) => {
  console.log('requesting users')
  User.findAll({
    include: [{ model: Message, required: true }],
    order: [['lastMessageDate', 'DESC'], [Message, 'createdAt', 'ASC']]
  }).then(users => {
    let activeUsers = users.filter(user => user.messages.some(msg => msg.sender === 'customer'))
    res.send(activeUsers)
  })
})

io.use((socket, next) => {
  sessionMiddleware(socket.request, socket.request.res, next)
})

io.on('connection', (socket) => {
  console.log('socket connection')
  const handle = socket.request.session.user
  let currentUser = false

  if (!currentUser) {
    User.findOne({
      where: {
        handle
      },
      include: [Message],
      order: [[Message, 'createdAt', 'ASC']]
    }).then(user => {
      if (user) {
        currentUser = user
        currentUser.update({ online: true })
        socket.join(currentUser.handle, () => {
          userRooms.push(currentUser.handle)
          if (currentUser.sessions == 1) {
            currentUser.increment(['sessions'], { by: 1 })
            Message.create({ text: 'Welcome to HumbleChat! Please let us know if you have any questions.', sender: 'company' }).then(message => {
              currentUser.addMessage(message).then(() => {
                message.reload().then(() => {
                  io.sockets.in(currentUser.handle).emit('messageCreated', message)
                })
              })
            })
          }
        })
        socket.emit('messageHistory', user.messages)
      }
    })
  }

  socket.on('customerMessage', (text) => {
    Message.create({ text, sender: 'customer' }).then(message => {
      currentUser.addMessage(message).then(() => {
        currentUser.update({ lastMessageDate: message.createdAt })
        message.reload().then(() => {
          io.sockets.in(currentUser.handle).emit('messageCreated', message)
        })
      })
    })
  })

  socket.on('agentMessage', (agentMessage) => {
    Message.create({ text: agentMessage.text, sender: 'company' }).then(message => {
      User.findById(agentMessage.customerID).then(user => {
        user.addMessage(message).then(() => {
          user.update({ lastMessageDate: message.createdAt })
          message.reload().then(() => {
            io.sockets.in(user.handle).emit('messageCreated', message)
          })
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

  socket.on('agentTyping', (data) => {
    User.findById(data.customerID).then(user => {
      io.sockets.in(user.handle).emit('agentTyping', data.typing)
    })
  })

  socket.on('userTyping', (typing) => {
    io.sockets.in(currentUser.handle).emit('userTyping', { typing, userId: currentUser.id })
  })

  socket.on('disconnecting', (reason) => {
    if (currentUser) {
      currentUser.update({ online: false })
    }
  })
})

http.listen(80, '127.0.0.1')
