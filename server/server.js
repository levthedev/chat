const app = require('express')()
const Sequelize = require('sequelize')
const http = require('http').Server(app);
const io = require('socket.io')(http);

const sequelize = new Sequelize('sqlite://database.db/')

const Message = sequelize.define('message', {
  text: { type: Sequelize.STRING },
  sender: { type: Sequelize.STRING }
})

Message.sync({force: true}).then(function () {
  return Message.create({ text: 'Welcome to Everydev!', sender: 'company' })
})

app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*")
  next()
})

app.get('/chat.js', function (req, res) {
  res.sendFile(__dirname + '/chat.js')
})

app.get('/styles.css', function (req, res) {
  res.sendFile(__dirname + '/styles.css')
})

app.get('/x.png', function (req, res) {
  res.sendFile(__dirname + '/x.png')
})

app.get('/messages', function (req, res) {
  Message.findAll().then(messages => res.send(messages))
})

io.on('connection', function (socket) {
  socket.on('customerMessage', function (text) {
    Message.create({ text, sender: 'customer' }).then(message => {
      io.emit('messageCreated', message)
    })
  })
})

http.listen(3000, '127.0.0.1')
