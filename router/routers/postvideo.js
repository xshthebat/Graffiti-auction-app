let fs = require('fs');
const postvideo = function (req, res) {
    console.log(req.files.video);
    if (req.files.video) {
        fs.rename(req.files.video.path, req.files.video.path + '.webm', () => {
            console.log('path', req.files.video.path);
            res.json({ err: false, src: req.files.video.path + '.webm' });
        })
    }
}
module.exports = postvideo;