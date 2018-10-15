let {names}=require('../../socket/gamedata/data.js');
const getsoketname = function (req, res) {
    let name = req.query.name;
    console.log(names, name);
    for (let key in names) {
        console.log(names[key], name);
        if (names[key] === name) {
            res.json({ err: true, errtype: 'has name' })
            return;
        }
    }
    res.send({ err: false, data: 'ok' });
}
module.exports = getsoketname;