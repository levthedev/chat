const moment = require('moment')
const { Agent, User, Message } = require('./express/database')
const { app } = require('./express/auth')
const { seed, sample, adjectives, animals } = require('./express/seed')
const { http } = require('./express/sockets2')

app.get('/dashboard', (req, res) => {
  res.sendFile(__dirname + '/dashboard/dist/index.html')
})

app.get('/chat', (req, res) => {
  res.sendFile(__dirname + '/chat/chat.js')
  const number = Math.floor(Math.random() * 1000)
  req.session.handle = req.session.handle || [sample(adjectives), sample(animals), number].join('-')

  const url = req.get('host')
  console.log('URL is ', url)
  Agent.findOne({
    where: { url },
    include: [{ model: User }]
  }).then((agent) => {
    console.log('Agent is ', agent)
    const user = agent.users.filter((u) => { u.handle === req.session.handle })[0]
    if (user) {
      user.increment(['sessions'], { by: 1 })
    } else {
      const color = `hsl(${Math.floor(Math.random() * 360)}, 100%, 80%)`
      User.create({ handle: req.session.handle, color, closed: false, sessions: 1 }).then((user) => {
        agent.addUser(user)
      })
    }
  })
})

function getUsers(res, options) {
  const required = options.all
  Agent.findById(options.id, {
    include: [{
      model: User,
      order: [['lastMessageDate', 'DESC'], [Message, 'createdAt', 'ASC']],
      include: [{
        model: Message, required
      }]
    }]
  }).then((agent) => {
    if (required) {
      res.send(agent.users)
    } else {
      let activeUsers = agent.users.filter(user => user.messages.some(msg => msg.sender === 'customer'))
      res.send(activeUsers)
    }
  })
}

app.get('/users', (req, res) => {
  const id = req.session.passport.user
  getUsers(res, { all: false, id })
})

app.get('/allUsers', (req, res) => {
  const id = req.session.passport.user
  getUsers(res, { all: true, id })
})

app.get('/seed', (req, res) => {
  seed()
  res.send('seeding')
})

http.listen(3000)
