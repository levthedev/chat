const { app, sessionMiddleware } = require('./auth')
const { Agent, User, Message } = require('./database')
const http = require('http').Server(app)
const io = require('socket.io')(http)

io.use((socket, next) => {
  sessionMiddleware(socket.request, socket.request.res, next)
})

io.on('connection', (socket) => {
  console.log('CONNECTION made. Session: ', socket.request.session)
  const handle = socket.request.session.handle
  const isAgent = socket.request.session.passport
  let currentUser = false

  if (isAgent) {
    const url = socket.request.headers.host
    const id = socket.request.session.passport.user

    Agent.findById(id, { include: [{ model: User }] }).then((agent) => {
      console.log('CONNECTION FROM AGENT: ', agent.email)
      agent.users.map(user => {
        socket.join(user.handle)
      })
    })
  }

  if (handle) {
    User.findOne({ where: { handle } }).then(user => {
      console.log('FOUND USER: ', user.handle)
      currentUser = user
      currentUser.update({ online: true })
      socket.join(currentUser.handle)
      if (currentUser.sessions == 1) {
        currentUser.increment(['sessions'], { by: 1 })
        const text = 'Welcome to HumbleChat! Please let us know if you have any questions.'
        Message.create({ text, sender: 'company' }).then(message => {
          currentUser.addMessage(message).then(() => {
            message.reload().then(() => { socket.emit('messageCreated', message) })
          })
        })
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

module.exports = { http }
