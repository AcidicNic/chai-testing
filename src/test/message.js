require('dotenv').config()
const app = require('../server.js')
const mongoose = require('mongoose')
const chai = require('chai')
const chaiHttp = require('chai-http')
const assert = chai.assert

const User = require('../models/user.js')
const Message = require('../models/message.js')

chai.config.includeStack = true

const expect = chai.expect
const should = chai.should()
chai.use(chaiHttp)

/**
 * root level hooks
 */
after( (done) => {
  // required because https://github.com/Automattic/mongoose/issues/1251#issuecomment-65793092
  mongoose.models = {}
  mongoose.modelSchemas = {}
  mongoose.connection.close()
  done()
})

const SAMPLE_USER_ID = 'ffffffffffff'
const SAMPLE_MSG_ID =  'rrrrrrrrrrrr'

describe('Message API endpoints', () => {
    beforeEach( (done) => {
        const sampleUser = new User({
            username: 'aUser',
            password: 'aPassword',
            _id: SAMPLE_USER_ID
        })
        const sampleMessage = new Message({
            title: 'aMessage',
            body: 'super cool message',
            author: SAMPLE_USER_ID,
            _id: SAMPLE_MSG_ID
        })
        Promise.all([sampleUser.save(), sampleMessage.save()])
        .then( () => {
            done()
        })
    })

    afterEach( (done) => {
        const deletingMsgs = Message.deleteMany({})
        const deletingUsers = User.deleteMany({})

        Promise.all([deletingMsgs, deletingUsers])
            .then( () => {
                done()
            })
        })

    it('should load all messages', (done) => {
        chai.request(app)
        .get('/messages')
        .end( (err, res) => {
            if (err) {
                done(err)
            }
            expect(res).to.have.status(200)
            expect(res.body.messages).to.be.an("array")
            done()
        })
    })

    it('should get one specific message', (done) => {
        chai.request(app)
        .get(`/messages/${SAMPLE_MSG_ID}`)
        .end( (err, res) => {
            if (err) {
                done(err)
            }
            // expect(res).to.have.status(200)
            expect(res.body.message).to.be.an('object')
            expect(res.body.message.title).to.equal('aMessage')
            expect(res.body.message.body).to.equal('super cool message')
            done()
        })
    })

    it('should post a new message', (done) => {
        chai.request(app)
        .post('/messages')
        .send({
            title: 'new message',
            body: 'interesting stuff',
            author: SAMPLE_USER_ID
        })
        .end( (err, res) => {
            if (err) {
                done(err)
            }
            expect(res).to.have.status(200)
            expect(res.body).to.be.an('object')
            expect(res.body).to.have.property('title', 'new message')
            expect(res.body).to.have.property('body', 'interesting stuff')

            // check that message is actually inserted into database
            Message.findOne({title: 'new message'}).then(msg => {
                expect(msg).to.be.an('object')
                done()
            })
        })
    })

    it('should update a message', (done) => {
        chai.request(app)
        .put(`/messages/${SAMPLE_MSG_ID}`)
        .send({title: 'different title'})
        .end( (err, res) => {
            if (err) {
                done(err)
            }
            expect(res.body).to.be.an('object')
            expect(res.body).to.have.property('title', 'different title')

            // check that message is actually inserted into database
            Message.findOne({title: 'different title'}).then(msg => {
                expect(msg).to.be.an('object')
                done()
            })
        })
    })

    it('should delete a message', (done) => {
        chai.request(app)
        .delete(`/messages/${SAMPLE_MSG_ID}`)
        .end( (err, res) => {
            if (err) {
                done(err)
            }
            expect(res.body.message).to.equal('Your message has been deleted!')

            // check that message is actually deleted from database
            Message.findOne({_id: SAMPLE_MSG_ID}).then(msg => {
                expect(msg).to.equal(null)
                done()
            })
        })
    })
})
