const app = require('express')()
const Sequelize = require('sequelize')
const moment = require('moment')
const session = require('express-session')
const http = require('http').Server(app)
const io = require('socket.io')(http)

const sequelize = new Sequelize('sqlite://database.db/', { logging: false })

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
  closedDate: { type: Sequelize.DATE },
  sessions: { type: Sequelize.INTEGER },
  online: { type: Sequelize.BOOLEAN },
  lastMessageDate: { type: Sequelize.DATE }
})

let userRooms = []

User.hasMany(Message)
Message.sync({force: true})
User.sync({force: true})

const production = process.env.NODE_ENV === 'production'
const domain = production ? '174.138.71.184' : 'localhost'

sessionMiddleware = session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false,
    maxAge: 12 * 30 * 24 * 60 * 60 * 1000,
    domain
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
  res.sendFile(__dirname + '/chat/styles.css')
})

app.get('/x.png', (req, res) => {
  res.sendFile(__dirname + '/chat/x.png')
})

app.get('/users', (req, res) => {
  User.findAll({
    include: [{ model: Message, required: true }],
    order: [['lastMessageDate', 'DESC'], [Message, 'createdAt', 'ASC']]
  }).then(users => {
    let activeUsers = users.filter(user => user.messages.some(msg => msg.sender === 'customer'))
    res.send(activeUsers)
  })
})

app.get('/allUsers', (req, res) => {
  User.findAll({
    include: [{ model: Message }],
    order: [['lastMessageDate', 'DESC'], [Message, 'createdAt', 'ASC']]
  }).then(users => {
    res.send({ users })
  })
})

app.get('/seed', (req, res) => {
  const welcomeMessage = Message.create({ text: 'Welcome to HumbleChat! Please let us know if you have any questions.', sender: 'company' }).then(wcMessage => {
    new Array(240).fill('').forEach(() => {
      const color = `hsl(${Math.floor(Math.random() * 360)}, 100%, 80%)`
      const number = Math.floor(Math.random() * 1000)
      sample = (array) => array[Math.floor(Math.random() * array.length)]
      const handle = [sample(adjectives), sample(animals), number].join('-')
      const sessions = Math.floor(Math.random() * 25)
      User.create({ handle, color, sessions, closed: false, createdAt: randomDate() }, { raw: true }).then((user) => {
        user.addMessage(wcMessage)
        if (random() && random() && random()) {
          const messages = new Array(Math.floor(Math.random() * 15)).fill('')
          messages.forEach((m) => {
            Message.create(randomMessage(), { raw: true }).then(message => {
              user.addMessage(message)
            })
          })
        }
        const closed = random()
        const online = random()
        user.update({
          closed: closed,
          online: online,
          closedDate: (closed && randomDate()),
          lastMessageDate: randomDate()
        })
      })
    })
    res.send('hello, world')
  })
})

const random = () => [true, false][Math.round(Math.random())]

function randomDate() {
  const today = new Date
  const offset = new Date(1000 * 60 * 60 * 24 * Math.floor((Math.random() * 120)))
  const createdAt = today - offset
  return moment(createdAt)
}

function randomMessage() {
  sample = (array) => array[Math.floor(Math.random() * array.length)]
  const customerWords = ['Hey,', 'hi,', 'Hi!', 'yooo', 'I have a question.', 'how much does your product cost?', 'are you online?']
  const agentWords = ['Happy to help!', 'Glad I could be of assistance', 'How can I help you?', 'Great!', 'Hm, good question', 'Yes, definitely!', '$5 a month :)', 'Emoji! 😊', 'Wow!']
  let sender = 'company'
  let text = sample(agentWords)
  if (Math.random() > 0.5) {
    sender = 'customer'
    text = sample(customerWords)
  }
  return { text, sender, createdAt: randomDate() }
}

io.use((socket, next) => {
  sessionMiddleware(socket.request, socket.request.res, next)
})

io.on('connection', (socket) => {
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
      user.update({ closed: !user.closed, closedDate: moment()})
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

http.listen(3000)
