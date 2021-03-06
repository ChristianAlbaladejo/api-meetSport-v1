'use strict'

//var path = require('path');
//var fs = requere('fs');
var mongoosePaginate = require('mongoose-pagination');

var User = require('../models/user');
var Follow = require('../models/follows');

function saveFollow(req, res) {
    var params = req.body;

    var follow = new Follow();
    follow.user = req.user.sub;
    follow.followed = params.followed;

    follow.save((err, followStored) => {
        if (err) return res.status(500).send({ message: 'Error in follow' });

        if (!followStored) return res.status(404)({ message: 'Follow has not been saved' })

        return res.status(200).send({ follow: followStored });
    });
}

function deleteFollow(req, res) {
    var userId = req.user.sub;
    var followId = req.params.id;

    Follow.find({ 'user': userId, 'followed': followId }).remove(err => {
        if (err) return res.status(500).send({ message: 'Error in unfollow' });
        return res.status(200).send({ message: 'Follow is deleted' })
    });
}

function getFollowingUsers(req, res) {
    var userId = req.user.sub;

    if (req.params.id && req.params.page) {
        userId = req.params.id;
    }
    var page = 1;

    if (req.params.page) {
        page = req.params.page;
    } else {
        page = req.params.id;
    }

    var itemsPerPage = 4;

    Follow.find({ user: userId }).populate({ path: 'followed' }).paginate(page, itemsPerPage, (err, follows, total) => {
        if (err) return res.status(500).send({ message: 'Error in unfollow' });

        if (!follows) return res.status(404).send({ message: 'You are not following any user' })
        followUserIds(req.user.sub).then((value) => {
            return res.status(200).send({
                total: total,
                page: Math.ceil(total / itemsPerPage),
                follows,
                users_following: value.following,
                users_followmy: value.followed,
            })
        });
    });
}

function getFollowedUsers(req, res) {
    var userId = req.user.sub;

    if (req.params.id && req.params.page) {
        userId = req.params.id;
    }
    var page = 1;

    if (req.params.page) {
        page = req.params.page;
    } else {
        page = req.params.id;
    }

    var itemsPerPage = 4;

    Follow.find({ followed: userId }).populate('user').paginate(page, itemsPerPage, (err, follows, total) => {
        if (err) return res.status(500).send({ message: 'Error in unfollow' });

        if (!follows) return res.status(404).send({ message: 'You are not followed any user' })
        followUserIds(req.user.sub).then((value) => {
            return res.status(200).send({
                total: total,
                page: Math.ceil(total / itemsPerPage),
                follows,
                users_following: value.following,
                users_followmy: value.followed,
            })
        });
    });
}

async function followUserIds(user_id) {
    var following = await Follow.find({ "user": user_id }).select({ '_id': 0, '_v': 0, 'user': 0 }).exec().then((follow) => {
        return follow;
    }).catch((err) => {
        return handleError(err);
    });

    var followed = await Follow.find({ "followed": user_id }).select({ '_id': 0, '_v': 0, 'follower': 0 }).exec().then((follow) => {
        return follow;
    }).catch((err) => {
        return handleError(err);
    });

    //following ids
    var following_clean = [];

    following.forEach((follow) => {
        following_clean.push(follow.followed);
    });

    //followed ids
    var followed_clean = [];

    followed.forEach((follow) => {
        followed_clean.push(follow.followed);
    });
    return {
        following: following_clean,
        followed: followed_clean
    }
}

//Return users list
function getMyfollows(req, res) {
    var userId = req.user.sub;

    var find = Follow.find({ user: userId });
    
    if (req.params.followed) {
        find = Follow.find({ followed: userId });
    }

    find.populate('user followed').exec((err, follows) => {
        if(err) return res.status(500).send({message: 'Error in the server'});

        if (!follows) return res.status(404).send({ message: 'You do not follow any user'});

        return res.status(200).send({follows});
    })
}


module.exports = {
    saveFollow,
    deleteFollow,
    getFollowingUsers,
    getFollowedUsers,
    getMyfollows
}