const moment = require('moment')
const { app } = require('./auth')
const { Agent, User, Message } = require('./database')

function seed() {
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
  })
}

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

sample = (array) => array[Math.floor(Math.random() * array.length)]

const adjectives = ['slow', 'fast', 'small', 'big', 'young', 'baby', 'happy', 'excited', 'sleepy', 'drowsy', 'clever', 'energetic', 'brave', 'little', 'quiet', 'jolly', 'eager', 'calm', 'curious', 'bouncy', 'graceful', 'rare', 'lucky']
const animals = ['cat', 'dog', 'fish', 'whale', 'dolphin', 'penguin', 'sloth', 'mouse', 'elephant', 'otter', 'panda', 'bear', 'seal', 'giraffe', 'gecko', 'duck', 'deer', 'hippo', 'hedgehog', 'octopus', 'owl', 'rabbit', 'fox']

module.exports = { seed, adjectives, animals, sample }
