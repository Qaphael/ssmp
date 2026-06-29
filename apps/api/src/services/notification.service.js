/**
 * Notification service — console logging + Socket.IO broadcast.
 * Real push delivery (email/SMS) comes later.
 */

const socketService = require('./socket.service');

class NotificationService {
  log(type, title, message, data = {}) {
    console.log(`[NOTIFICATION] (${type}) ${title}: ${message}`, data);
  }

  fixturePublished(fixture, match) {
    const payload = { fixtureId: fixture.id, matchId: match.id, competitionId: fixture.competitionId };
    this.log('fixture_published', 'Fixture Published', `Match published for matchday ${fixture.matchday}`, payload);
    socketService.broadcastToAll('notification', {
      type: 'fixture_published',
      title: 'Fixture Published',
      message: `Match published for matchday ${fixture.matchday}`,
      ...payload,
    });
  }

  fixtureChanged(fixture, changes) {
    const payload = { fixtureId: fixture.id, changes };
    this.log('fixture_changed', 'Fixture Changed', `Fixture updated: ${Object.keys(changes).join(', ')}`, payload);
    socketService.broadcastToMatch(fixture.id, 'notification', {
      type: 'fixture_changed',
      title: 'Fixture Changed',
      message: `Fixture updated: ${Object.keys(changes).join(', ')}`,
      ...payload,
    });
  }

  officialAssigned(fixture, officialId) {
    const payload = { fixtureId: fixture.id, officialId };
    this.log('official_assigned', 'Official Assigned', `Official ${officialId} assigned to fixture`, payload);
    socketService.broadcastToMatch(fixture.id, 'notification', {
      type: 'official_assigned',
      title: 'Official Assigned',
      message: `Official assigned to fixture`,
      ...payload,
    });
    socketService.broadcastToAll('notification', {
      type: 'official_assigned',
      title: 'Official Assigned',
      message: `Official assigned to fixture`,
      ...payload,
    });
  }

  matchPostponed(match, reason, newScheduledAt) {
    const payload = { matchId: match.id, reason, newScheduledAt };
    this.log('match_postponed', 'Match Postponed', `Match postponed: ${reason}`, payload);
    socketService.broadcastToMatch(match.id, 'notification', {
      type: 'match_postponed',
      title: 'Match Postponed',
      message: `Match has been postponed: ${reason}`,
      ...payload,
    });
    socketService.broadcastToAll('notification', {
      type: 'match_postponed',
      title: 'Match Postponed',
      message: `Match has been postponed: ${reason}`,
      ...payload,
    });
  }

  matchCancelled(match, reason) {
    const payload = { matchId: match.id, reason };
    this.log('match_cancelled', 'Match Cancelled', `Match cancelled: ${reason || 'No reason provided'}`, payload);
    socketService.broadcastToMatch(match.id, 'notification', {
      type: 'match_cancelled',
      title: 'Match Cancelled',
      message: `Match has been cancelled: ${reason || 'No reason provided'}`,
      ...payload,
    });
    socketService.broadcastToAll('notification', {
      type: 'match_cancelled',
      title: 'Match Cancelled',
      message: `Match has been cancelled: ${reason || 'No reason provided'}`,
      ...payload,
    });
  }

  matchWalkover(match, walkoverTeamId, reason) {
    const payload = { matchId: match.id, walkoverTeamId, reason };
    this.log('match_walkover', 'Walkover Declared', `Walkover: ${reason}`, payload);
    socketService.broadcastToMatch(match.id, 'notification', {
      type: 'match_walkover',
      title: 'Walkover Declared',
      message: `Walkover has been declared: ${reason}`,
      ...payload,
    });
    socketService.broadcastToAll('notification', {
      type: 'match_walkover',
      title: 'Walkover Declared',
      message: `Walkover has been declared: ${reason}`,
      ...payload,
    });
  }

  matchAbandoned(match, reason) {
    const payload = { matchId: match.id, reason };
    this.log('match_abandoned', 'Match Abandoned', `Match abandoned: ${reason || 'No reason provided'}`, payload);
    socketService.broadcastToMatch(match.id, 'notification', {
      type: 'match_abandoned',
      title: 'Match Abandoned',
      message: `Match has been abandoned: ${reason || 'No reason provided'}`,
      ...payload,
    });
    socketService.broadcastToAll('notification', {
      type: 'match_abandoned',
      title: 'Match Abandoned',
      message: `Match has been abandoned: ${reason || 'No reason provided'}`,
      ...payload,
    });
  }
}

module.exports = new NotificationService();
