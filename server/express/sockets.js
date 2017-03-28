const { app, sessionMiddleware } = require('./auth')
const { Agent, User, Message } = require('./database')
const http = require('http').Server(app)
const io = require('socket.io')(http)

let userRooms = []

io.use((socket, next) => {
  sessionMiddleware(socket.request, socket.request.res, next)
})

io.on('connection', (socket) => {
  const handle = socket.request.session.handle
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

module.exports = { http }
