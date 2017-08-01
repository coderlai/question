var formidable = require('formidable');
var fs = require('fs');
var express = require('express');
var router = express.Router();
var path = require("path");
router.post('/image/upload',function (req, res, next) {
    var url = "";
    // create an incoming form object
    var form = new formidable.IncomingForm();

    // specify that we want to allow the user to upload multiple files in a single request
    form.multiples = true;

    // store all uploads in the /uploads directory
    form.uploadDir = path.join(__dirname,'../', 'public','/uploads');

    // every time a file has been uploaded successfully,
    // rename it to it's orignal name
    form.on('file', function(field, file) {
        var fileName = new Date().getTime()+file.name;
        url = "/uploads/"+fileName;
        fs.rename(file.path, path.join(form.uploadDir, fileName));
    });

    // log any errors that occur
    form.on('error', function(err) {
        console.log('An error has occured: \n' + err);
    });

    // once all the files have been uploaded, send a response to the client
    form.on('end', function() {
        res.end(url);
    });

    // parse the incoming request containing the form data
    form.parse(req);
});
module.exports = router;
