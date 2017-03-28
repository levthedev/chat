const Sequelize = require('sequelize')
const sequelize = new Sequelize('sqlite://database.db/', { logging: false })

const Agent = sequelize.define('agent',
{
  email: {
    type: Sequelize.STRING,
    allowNull: false,
    unique: true
  },
  password: { type: Sequelize.STRING },
},
{
  hooks: {
    beforeCreate: function(agent, options, next) {
      bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(agent.password, salt, (err, hash) => {
          agent.password = hash
          next(null, agent)
        });
      });
    }
  },
  instanceMethods: {
    validPassword: function(password) {
      return bcrypt.compareSync(password, this.password)
    }
  }
})

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

Agent.hasMany(User)
User.hasMany(Message)
Message.sync()
User.sync()
Agent.sync()

module.exports = { Agent, User, Message }
