const bcrypt = require('bcrypt')
const moment = require('moment')
const { Agent, User, Message } = require('./express/database')
const { app } = require('./express/auth')
const { seed, sample, adjectives, animals } = require('./express/seed')
const { http } = require('./express/sockets')

app.get('/chat.js', (req, res) => {
  res.sendFile(__dirname + '/chat/chat.js')
  const number = Math.floor(Math.random() * 1000)
  req.session.handle = req.session.handle || [sample(adjectives), sample(animals), number].join('-')

  User.findOne({ where: { handle: req.session.handle }}).then(user => {
    if (user) {
      user.increment(['sessions'], { by: 1 })
    } else {
      const color = `hsl(${Math.floor(Math.random() * 360)}, 100%, 80%)`
      User.create({ handle: req.session.handle, color, closed: false, sessions: 1 })
    }
  }).catch(err => console.log('**ERROR**', err))
})

app.get('/chatStyles', (req, res) => {
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
  seed()
  res.send('seeding')
})

http.listen(3000)
