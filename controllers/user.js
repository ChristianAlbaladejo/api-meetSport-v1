'use strict'

var bcrypt = require('bcrypt-nodejs');
var mongoosePaginate = require('mongoose-pagination');
var fs = require('fs');
var path = require('path');

var User = require('../models/user');
var Follow = require('../models/follows');
var jwt = require('../services/jwt');


function home(req, res) {
    res.status(200).send({
        message: 'Primera prueba'
    });
}


function pruebas(req, res) {
    res.status(200).send({
        message: 'Segunda prueba'
    });
}

// register
function saveUser(req, res) {
    var params = req.body;
    var user = new User();

    if (params.name && params.surname && params.nick && params.email && params.password) {

        user.name = params.name;
        user.surname = params.surname;
        user.nick = params.nick;
        user.email = params.email;
        user.role = 'ROLE_USER';
        user.image = null;

        // Duplicates users
        User.find({
            $or: [
                { email: user.email.toLowerCase() },
                { nick: user.nick.toLowerCase() }
            ]
        }).exec((err, users) => {
            if (err) return res.status(500).send({ message: 'Error in the user request' });

            if (users && users.length >= 1) {
                return res.status(200).send({ message: 'This user exist' })
            } else {
                // Hashing the password
                bcrypt.hash(params.password, null, null, (err, hash) => {
                    user.password = hash;
                    user.save((err, userStored) => {
                        if (err) return res.status(500).send({ message: 'Error saving the user' });

                        if (userStored) {
                            res.status(200).send({ user: userStored })
                        } else {
                            res.status(404).send({ message: 'User cant by register' });
                        }
                    });
                });
            }
        });
    } else {
        res.status(200).send({
            massage: 'Please seend all the data'
        })
    }
}

//login
function loginUser(req, res) {
    var params = req.body;

    var email = params.email;
    var password = params.password;

    User.findOne({ email: email }, (err, user) => {
        if (err) return res.status(500).send({ message: 'Error in the request' });

        if (user) {
            bcrypt.compare(password, user.password, (err, check) => {
                if (check) {
                    //send user data
                    if (params.gettoken) {
                        //send token
                        //generated token
                        return res.status(200).send({
                            token: jwt.createToken(user)
                        });
                    } else {
                        //send user data
                        user.password = undefined;
                        return res.status(200).send({ user });
                    }
                } else {
                    return res.status(404).send({ message: 'The user cant register' });
                }
            })
        } else {
            return res.status(404).send({ message: 'The user cant be identificated' });
        }
    });
}

// get user data 

function getUser(req, res) {
    var userId = req.params.id;
    
    User.findById(userId, (err, user) => {
        if (err) return res.status(500).send({ message: 'Error in the request' });

        if (!user) return res.status(404).send({ message: 'The user does not exist' });
        
        followThisUser(req.user.sub, userId).then((value) => {
            user.password = undefined;
            return res.status(200).send({
                user,
                following: value.following,
                followed: value.followed
            });
        });
    });
}

async function followThisUser(identity_user_id, user_id) {
    var following = await Follow.findOne({ "user": identity_user_id, "followed": user_id }).exec().then((follow) => {
        return follow;
    }).catch((err) => {
        return handleError(err);
    });

    var followed = await Follow.findOne({ "user": user_id, "followed": identity_user_id }).exec().then((follow) => {
        return follow;
    }).catch((err) => {
        return handleError(err);
    });

    return {
        following: following,
        followed: followed
    }
}

// return  list pagination user
function getUsers(req, res) {
    var identify_user_id = req.user.sub;

    var page = 1;
    if (req.params.page) {
        page = req.params.page;
    }

    var itemsPerPage = 5;

    User.find().sort('_id').paginate(page, itemsPerPage, (err, users, total) => {
        if (err) return res.status(500).send({ message: 'Error in the request' });

        if (!users) return res.status(404).send({ mesaage: 'No aviable users' });

        followUserIds(identify_user_id).then((value)=>{

            return res.status(200).send({
                users,
                users_following: value.following,
                users_followmy: value.followed,
                total,
                pages: Math.ceil(total / itemsPerPage)
            });
        })
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

function getCounters(req, res) {
    var userId = req.user.sub
    if (req.params.id) {
        getCountFollow(req.params.id).then((value)=>{
            return res.status(200).send(value)
        });
    }else{

    }

    getCountFollow(userId).then((value)=>{
        return res.status(200).send(200);
    });
}

async function getCountFollow(user_id) {
    var following = await Follow.count({ "user": user_id }).exec().then((count) => {
        return count;
    }).catch((err) => {
        return handleError(err);
    });

    var followed = await Follow.count({ "followed": user_id }).exec().then((count) => {
        return count;
    }).catch((err) => {
        return handleError(err);
    });

    return {
        following: following,
        followed: followed
    }
}

// Edit a user
function updateUser(req, res) {
    var userId = req.params.id;
    var update = req.body;

    //delete password property
    delete update.password;

    if (userId != req.user.sub) {
        return res.status(500).send({ message: 'You dont have permissions' });
    }

    User.findByIdAndUpdate(userId, update, { new: true }, (err, userUpdated) => {
        if (err) return res.status(500).send({ message: 'Error in the request' });

        if (!userUpdated) return res.status(404().send({ message: 'The user could not be modified' }));

        return res.status(200).send({ user: userUpdated });
    });
}

//Upload image fot a user

function uploadImage(req, res) {
    var userId = req.params.id;
    if (req.files) {
        var file_path = req.files.image.path;
        var file_split = file_path.split('\/');
        console.log(file_split);
        var file_name = file_split[2];
        console.log(file_name);
        var ext_split = file_name.split('\.');
        console.log(ext_split);
        var file_ext = ext_split[1];

        if (userId != req.user.sub) {
            return removeFilesOfUploads(res, file_path, 'You dont have permissions');
        }

        if (file_ext == 'png' || file_ext == 'jpg' || file_ext == 'jpeg' || file_ext == 'gif') {
            // Upload the image
            User.findByIdAndUpdate(userId, { image: file_name }, { new: true }, (err, userUpdated) => {
                if (err) return res.status(500).send({ message: 'Error in the request' });

                if (!userUpdated) return res.status(404().send({ message: 'The user could not be modified' }));

                return res.status(200).send({ user: userUpdated });
            })
        } else {
            return removeFilesOfUploads(res, file_path, 'Invalid extension');
        }
    } else {
        return res.status(200).send({ message: 'No images have been uploaded' });
    }
}

function removeFilesOfUploads(res, file_path, message) {
    fs.unlink(file_path, (err) => {
        return res.status(200).send({ message: message })
    })
}

function getImageFile(req, res) {
    var image_file = req.params.imageFile;
    var path_file = './uploads/users/' + image_file;
    fs.exists(path_file, (exists) => {
        if (exists) {
            res.sendFile(path.resolve(path_file));
        } else {
            res.status(200).send({ message: 'There is no image...' })
        }
    });
}

module.exports = {
    home,
    pruebas,
    saveUser,
    loginUser,
    getUser,
    getUsers,
    getCounters,
    updateUser,
    uploadImage,
    getImageFile,

}
