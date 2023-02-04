const Member = require('../../../models/member/Member');

module.exports = (req, res) => {
  Member.createMember(req.body, (err, id) => {
    if (err) {
      res.write(JSON.stringify({ success: false, error: err }));
      return res.end();
    }

    res.write(JSON.stringify({ success: true, id }));
    return res.end();
  });
};