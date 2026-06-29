const standingsService = require('./standings.service');

async function getByCompetition(req, res, next) {
  try {
    const standings = await standingsService.getByCompetition(req.params.competitionId);
    res.json(standings);
  } catch (err) {
    next(err);
  }
}

module.exports = { getByCompetition };
