const Member = require('../../../models/member/Member');

module.exports = (req, res) => {
  Member.findMemberByIdAndIncOrderByOne(req.body.id, err => {
    if (err) {
      res.write(JSON.stringify({ success: false, error: err }));
      return res.end();
    }

    res.write(JSON.stringify({ success: true }));
    return res.end();
  });
};