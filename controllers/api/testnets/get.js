const Guide = require('../../../models/guide/Guide');

module.exports = (req, res) => {
  req.query.is_deleted = false;

  Guide.findGuideCountByFilters(req.query, (err, count) => {
    if (err) return res.json({
      success: false,
      error: err
    });

    Guide.findGuidesByFilters(req.query, (err, data) => {
      if (err) return res.json({
        success: false,
        error: err
      });

      return res.json({
        success: true,
        testnets: data.guides,
        count,
        limit: data.limit,
        page: data.page,
        search: data.search
      });
    });
  });
}