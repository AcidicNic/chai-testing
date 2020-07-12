const express = require('express')
const router = express.Router();

const User = require('../models/user')
const Message = require('../models/message')

/** Route to get all messages. */
router.get('/', (req, res) => {
    // Get all Message objects
    Message.find({}).then( messages => {
        // Return the Message objects as a JSON list
        return res.json({messages})
    });

})

/** Route to get one message by id. */
router.get('/:messageId', (req, res) => {
    // Get the Message object with the given id
    Message.findOne({_id: req.params.messageId})
    .then( message => {
        // Return the matching Message object as JSON
        return res.json({message})
    }).catch(err => {
        throw err.message
    })
})

/** Route to add a new message. */
router.post('/', (req, res) => {
    let message = new Message(req.body)
    message.save()
    .then(message => {
        return User.findById(message.author)
    })
    .then(user => {
        user.messages.unshift(message)
        return user.save()
    })
    .then(() => {
        return res.send(message)
    }).catch(err => {
        throw err.message
    })
})

/** Route to update an existing message. */
router.put('/:messageId', (req, res) => {
    Message.findByIdAndUpdate(req.params.messageId, req.body).then( () => {
        return Message.findOne({ _id: req.params.messageId })
    }).then((message) => {
        return res.json(message)
    }).catch((err) => {
        throw err.message
    })
})

/** Route to delete a message. */
router.delete('/:messageId', (req, res) => {
    Message.findByIdAndDelete(req.params.messageId).then( result => {
        if (result === null) {
            return res.json({message: 'User does not exist.'})
        }
        return res.json({
            'message': 'Your message has been deleted!',
            '_id': req.params.userId
        })
    })
    .catch((err) => {
        throw err.message
    })
})

module.exports = router
