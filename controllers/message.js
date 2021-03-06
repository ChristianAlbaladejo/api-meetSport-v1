'use strict'

var moment = require('moment');
var mongoosePaginate = require('mongoose-pagination');

var User = require('../models/user');
var Follow = require('../models/follows');
var Message = require('../models/message');

function saveMessage(req, res) {
    var params = req.body;

    if (!params.text || !params.receiver) return res.status(200).send({ message: 'Send the necessary data' });

    var message = new Message();
    message.emitter = req.user.sub;
    message.receiver = params.receiver;
    message.text = params.text;
    message.created_at = moment().utc().format('YYYY-MM-DD HH:mm:ss');;
    message.viewed = false;

    message.save((err, messageStored) => {
        if (err) return res.status(500).send({ message: 'Error in the request' });
        if (!messageStored) return res.status(500).send({ message: 'Error in sending the message' });

        res.status(200).send({ message: messageStored });
    })
}

function getRecivedMessages(req, res) {
    var userId = req.user.sub;

    var page = 1;
    if (req.params.page) {
        page = req.params.page;
    }

    var itemsPerPage = 4;

    Message.find({ receiver: userId }).sort('-created_at').populate('emitter', 'name surname _id nick image email').paginate(page, itemsPerPage, (err, messages, total) => {
        if (err) return res.status(500).send({ message: 'Error in the request' });
        if (!messages) return res.status(404).send({ message: 'you have no messages' });

        return res.status(200).send({
            total: total,
            pages: Math.ceil(total / itemsPerPage),
            messages
        })
    })
}

function getEmmitMessages(req, res) {
    var userId = req.user.sub;

    var page = 1;
    if (req.params.page) {
        page = req.params.page;
    }

    var itemsPerPage = 4;

    Message.find({ emitter: userId }).sort('-created_at').populate('emitter receiver', 'name surname _id nick image email').paginate(page, itemsPerPage, (err, messages, total) => {
        if (err) return res.status(500).send({ message: 'Error in the request' });
        if (!messages) return res.status(404).send({ message: 'you have no messages' });

        return res.status(200).send({
            total: total,
            pages: Math.ceil(total / itemsPerPage),
            messages
        })
    })
}

function getUnviewedMessages(req, res) {
    var userId = req.user.sub;

    Message.count({ receiver: userId, viewed: 'false' }).exec((err, count) => {
        if (err) return res.status(500).send({ message: 'Error in the request' });
        return res.status(200).send({
            'unviewed': count
        })
    })
}

function setViewedMessages(req, res) {
    var userId = req.user.sub;

    Message.update({ receiver: userId, viewed: 'false' }, { viewed: 'true' }, { multi: 'true' }, (err, messageUpdated) => {
        if (err) return res.status(500).send({ message: 'Error in the request' });
        return res.status(200).send({
            messages: messageUpdated
        })
    });
}

module.exports = {
    saveMessage,
    getRecivedMessages,
    getEmmitMessages,
    getUnviewedMessages,
    setViewedMessages

}