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
}

module.exports = new NotificationService();
