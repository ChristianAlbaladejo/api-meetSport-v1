'use strict'

var path = require('path');
var fs = require('fs');
var moment = require('moment');
var mongoosePagination = require('mongoose-pagination');

var Publication = require('../models/publication');
var User = require('../models/user');
var Follow = require('../models/follows');

function savePublication(req, res) {
    var params = req.body;
    var publication = new Publication();

    if (!params.text) return res.status(200).send({ message: 'You must send a text!' });

    var publication = new Publication();
    publication.text = params.text;
    publication.file = params.file;
    publication.user = req.user.sub;
    publication.date = params.date;
    publication.created_at = moment().utc().format('YYYY-MM-DD HH:mm:ss');
    publication.location = params.location;

    publication.save((err, publicationStored) => {
        if (err) return res.status(500).send({ message: 'Error saving the publication' });

        if (!publicationStored) return res.status(404).send({ message: 'The publication has not been saved' });

        return res.status(200).send({ publication: publicationStored });
    })
}

function getPublications(req, res) {
    var page = 1;
    if (req.params.page) {
        page = req.params.page;
    }

    var itemsPerPage = 4;

    Follow.find({ user: req.user.sub }).populate('followed').exec((err, follows) => {
        if (err) return res.status(500).send({ message: 'Error when returning the follow up' });

        var follows_clean = [];

        follows.forEach((follow) => {
            follows_clean.push(follow.followed);
        })
        follows_clean.push(req.user.sub);

        Publication.find({ user: { "$in": follows_clean } }).sort('-created_at').populate('user').paginate(page, itemsPerPage, (err, publications, total) => {
            if (err) return res.status(500)({ message: 'Error when returning the follow up' });

            if (!publications) return res.status(404).send({ message: 'No publications' });

            return res.status(200).send({
                total_items: total,
                pages: Math.ceil(total / itemsPerPage),
                page: page,
                items_per_page: itemsPerPage,
                publications
            })
        });
    });
}

function getPublicationsUser(req, res) {
    var page = 1;
    if (req.params.page) {
        page = req.params.page;
    }
    var user = req.user.sub;
    if (req.params.sub) {
        user_id = req.params.user;
    }
    var itemsPerPage = 4;

        Publication.find({ user: user }).sort('-created_at').populate('user').paginate(page, itemsPerPage, (err, publications, total) => {
            if (err) return res.status(500)({ message: 'Error when returning the follow up' });

            if (!publications) return res.status(404).send({ message: 'No publications' });

            return res.status(200).send({
                total_items: total,
                pages: Math.ceil(total / itemsPerPage),
                page: page,
                items_per_page: itemsPerPage,
                publications
            })
        });
}


function getPublication(req, res) {
    var publicationId = req.params.id;

    Publication.findById(publicationId, (err, publication) => {
        if (err) return res.status(500).send({ message: 'Error when returning the follow up' })
        if (!publication) return res.status(404).send({ message: 'There is no publication' });

        return res.status(200).send({ publication })
    })
}

function deletePublication(req, res) {
    var publicationId = req.params.id;

    Publication.find({ user: req.user.sub, '_id': publicationId }).deleteOne((err, publicationRemoved) => {
        if (err) return res.status(500).send({ message: 'Error when deleting publications' })
        if (!publicationRemoved) return res.status(404).send({ message: 'The publication could not be deleted' });

        return res.status(200).send({
            publication: publicationRemoved,
            message: 'Publication successfully removed'
        });
    })
}
function uploadFile(req, res) {
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

        if (file_ext == 'GPX' || file_ext == 'GDB' || file_ext == 'KML ' || file_ext == 'KMZ' || file_ext == 'LOC' || file_ext == 'TRK ' || file_ext == 'WPT ' || file_ext == 'RTE' || file_ext == 'PLT ' || file_ext == 'WPT ' || file_ext == 'PNT ') {
            // Upload the image
            Publication.findByIdAndUpdate(userId, { image: file_name }, { new: true }, (err, userUpdated) => {
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

/* function uploadFile(req, res) {
    var publicationId = req.params.id;
    if (req.files) {
        var file_path = req.files.image.path;
        var file_split = file_path.split('\/');
        console.log(file_split);
        var file_name = file_split[2];
        console.log(file_name);
        var ext_split = file_name.split('\.');
        console.log(ext_split);
        var file_ext = ext_split[1];

        if (file_ext == 'GPX' || file_ext == 'GDB' || file_ext == 'KML ' || file_ext == 'KMZ' || file_ext == 'LOC' || file_ext == 'TRK ' || file_ext == 'WPT ' || file_ext == 'RTE' || file_ext == 'PLT ' || file_ext == 'WPT ' || file_ext == 'PNT ') {
            // Upload the image
            Publication.find({ 'user': req.user.sub, '_id': publicationId }).exec((err, publication) => {
                if (publication) {
                    Publication.findByIdAndUpdate(publicationId, { image: file_name }, { new: true }, (err, publicationUpdated) => {
                        if (err) return res.status(500).send({ message: 'Error in the request' });

                        if (!publicationUpdated) return res.status(404().send({ message: 'The user could not be modified' }));

                        return res.status(200).send({ user: publicationUpdated });
                    });
                } else {
                    return removeFilesOfUploads(res, file_path, 'You are not permitted to update this photo')
                }
            });
        } else {
            return removeFilesOfUploads(res, file_path, 'Invalid extension');
        }
    } else {
        return res.status(200).send({ message: 'No images have been uploaded' });
    }
} */

function removeFilesOfUploads(res, file_path, message) {
    fs.unlink(file_path, (err) => {
        return res.status(200).send({ message: message })
    })
}

function getFileFile(req, res) {
    var image_file = req.params.imageFile;
    var path_file = './uploads/publications/' + image_file;
    fs.exists(path_file, (exists) => {
        if (exists) {
            res.sendFile(path.resolve(path_file));
        } else {
            res.status(200).send({ message: 'There is no image...' })
        }
    });
}

function like(req, res) {
    var publicationId = req.params.id;
    console.log(req.user.sub, publicationId)
    /* Publication.find({ '_id': publicationId }).updateOne((err) => {
        if (err) return res.status(500).send({ message: 'Error' })
        

        return res.status(200).send({
            text: req.user.sub
        });
    }) */
    Publication.findOne({ like: { $in: [req.user.sub] }, _id: publicationId }, function name(err, result) {
        if (err) return res.status(500).send({ message: 'Error in the request' });
        if (!result) {
            Publication.updateOne({ _id: publicationId }, { $push: { like: req.user.sub } }, (err) => {
                if (err) return res.status(500).send({ message: 'Error in the request' });
                return res.status(200).send({
                    messages: req.user.sub
                })
            });
        } else {
            Publication.updateOne({ _id: publicationId }, { $pull: { like: req.user.sub } }, (err) => {
                if (err) return res.status(500).send({ message: 'Error in the request' });
                return res.status(200).send({
                    messages: "deleted"
                })
            });
        }
    });
}

module.exports = {
    savePublication,
    getPublications,
    getPublication,
    getPublicationsUser,
    deletePublication,
    uploadFile,
    getFileFile,
    like


}