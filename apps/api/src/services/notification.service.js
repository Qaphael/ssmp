/**
 * Notification service — persists to DB, delivers via web push, email, and Android push.
 * Falls back to console.log when delivery channels are not configured.
 */

const { pool } = require('../config/db');
const socketService = require('./socket.service');
const { env } = require('../config/env');

let webpush = null;
let nodemailer = null;
let admin = null;

try { webpush = require('web-push'); } catch { /* not installed */ }
try { nodemailer = require('nodemailer'); } catch { /* not installed */ }
try { admin = require('firebase-admin'); } catch { /* not installed */ }

let transporter = null;
let fcmInitialized = false;

function getTransporter() {
  if (transporter) return transporter;
  if (!nodemailer || !env.smtpHost) return null;
  transporter = nodemailer.createTransport({
    host: env.smtpHost,
    port: env.smtpPort,
    secure: env.smtpPort === 465,
    auth: env.smtpUser ? { user: env.smtpUser, pass: env.smtpPass } : undefined,
  });
  return transporter;
}

function initFcm() {
  if (fcmInitialized || !admin) return;
  if (!env.fcmProjectId) return;
  try {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: env.fcmProjectId,
        privateKey: env.fcmPrivateKey?.replace(/\\n/g, '\n'),
        clientEmail: env.fcmClientEmail,
      }),
    });
    fcmInitialized = true;
  } catch (err) {
    console.error('[NOTIFICATION] FCM init failed:', err.message);
  }
}

function initVapid() {
  if (!webpush || !env.vapidPublicKey || !env.vapidPrivateKey) return false;
  webpush.setVapidDetails(env.vapidEmail, env.vapidPublicKey, env.vapidPrivateKey);
  return true;
}

const vapidReady = initVapid();

class NotificationService {
  async log(type, title, message, data = {}) {
    console.log(`[NOTIFICATION] (${type}) ${title}: ${message}`, data);
  }

  async _persist(userId, type, title, message, data) {
    try {
      const result = await pool.query(
        `INSERT INTO notifications (user_id, type, title, message, data)
         VALUES ($1, $2, $3, $4, $5) RETURNING *`,
        [userId, type, title, message, data ? JSON.stringify(data) : null]
      );
      return result.rows[0];
    } catch (err) {
      console.error('[NOTIFICATION] Failed to persist:', err.message);
      return null;
    }
  }

  async _persistBulk(entries) {
    if (entries.length === 0) return [];
    try {
      const values = [];
      const params = [];
      let paramIndex = 1;
      for (const e of entries) {
        values.push(`($${paramIndex++}, $${paramIndex++}, $${paramIndex++}, $${paramIndex++}, $${paramIndex++})`);
        params.push(e.userId, e.type, e.title, e.message, e.data ? JSON.stringify(e.data) : null);
      }
      const result = await pool.query(
        `INSERT INTO notifications (user_id, type, title, message, data)
         VALUES ${values.join(', ')} RETURNING *`,
        params
      );
      return result.rows;
    } catch (err) {
      console.error('[NOTIFICATION] Failed to persist bulk:', err.message);
      return [];
    }
  }

  async _deliverWebPush(userIds, title, body, url, data) {
    if (!vapidReady || userIds.length === 0) return;
    try {
      const subs = await pool.query(
        `SELECT endpoint, p256dh, auth FROM push_subscriptions WHERE user_id = ANY($1)`,
        [userIds]
      );
      const payload = JSON.stringify({ title, body, url, data });
      for (const sub of subs.rows) {
        webpush.sendNotification(
          { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
          payload
        ).catch((err) => {
          if (err.statusCode === 410 || err.statusCode === 404) {
            pool.query(`DELETE FROM push_subscriptions WHERE endpoint = $1`, [sub.endpoint]);
          }
        });
      }
    } catch (err) {
      console.error('[NOTIFICATION] Web push error:', err.message);
    }
  }

  async _deliverEmail(userIds, subject, html) {
    const transport = getTransporter();
    if (!transport || userIds.length === 0) return;
    try {
      const result = await pool.query(
        `SELECT email FROM users WHERE id = ANY($1)`,
        [userIds]
      );
      for (const row of result.rows) {
        transport.sendMail({
          from: env.smtpFrom,
          to: row.email,
          subject,
          html,
        }).catch((err) => console.error('[NOTIFICATION] Email error:', err.message));
      }
    } catch (err) {
      console.error('[NOTIFICATION] Email lookup error:', err.message);
    }
  }

  async _deliverAndroidPush(userIds, title, body, data) {
    initFcm();
    if (!fcmInitialized || userIds.length === 0) return;
    try {
      const result = await pool.query(
        `SELECT token FROM device_tokens WHERE user_id = ANY($1) AND platform = 'android'`,
        [userIds]
      );
      if (result.rows.length === 0) return;
      const tokens = result.rows.map((r) => r.token);
      await admin.messaging().sendEachForMulticast({
        tokens,
        notification: { title, body },
        data: data ? Object.fromEntries(Object.entries(data).map(([k, v]) => [k, String(v)])) : undefined,
      });
    } catch (err) {
      console.error('[NOTIFICATION] FCM error:', err.message);
    }
  }

  async _getTeamCoachIds(teamId) {
    if (!teamId) return [];
    try {
      const result = await pool.query(
        `SELECT coach_id FROM teams WHERE id = $1 AND coach_id IS NOT NULL`,
        [teamId]
      );
      return result.rows.map((r) => r.coach_id);
    } catch { return []; }
  }

  async _getCompAdminIds() {
    try {
      const result = await pool.query(
        `SELECT id FROM users WHERE role IN ('system_admin', 'comp_admin')`
      );
      return result.rows.map((r) => r.id);
    } catch { return []; }
  }

  async _getRegistrarIds() {
    try {
      const result = await pool.query(
        `SELECT id FROM users WHERE role = 'registrar'`
      );
      return result.rows.map((r) => r.id);
    } catch { return []; }
  }

  async _getUserEmail(userId) {
    try {
      const result = await pool.query(`SELECT email FROM users WHERE id = $1`, [userId]);
      return result.rows[0]?.email || null;
    } catch { return null; }
  }

  // ─── Event methods ────────────────────────────────────────────────

  async fixturePublished(fixture, match) {
    const payload = { fixtureId: fixture.id, matchId: match.id, competitionId: fixture.competitionId };
    const title = 'Fixture Published';
    const message = `Match published for matchday ${fixture.matchday}`;
    const url = `/fixtures`;

    await this.log('fixture_published', title, message, payload);
    socketService.broadcastToAll('notification', { type: 'fixture_published', title, message, ...payload });

    const compAdminIds = await this._getCompAdminIds();
    const homeCoachIds = await this._getTeamCoachIds(fixture.homeTeamId);
    const awayCoachIds = await this._getTeamCoachIds(fixture.awayTeamId);
    const allUserIds = [...new Set([...compAdminIds, ...homeCoachIds, ...awayCoachIds])];

    const entries = allUserIds.map((uid) => ({ userId: uid, type: 'fixture_published', title, message, data: payload }));
    await this._persistBulk(entries);

    this._deliverWebPush(allUserIds, title, message, url, payload);
    this._deliverEmail(allUserIds, title, `<p>${message}</p>`);
    this._deliverAndroidPush(allUserIds, title, message, payload);
  }

  async fixtureChanged(fixture, changes) {
    const payload = { fixtureId: fixture.id, changes };
    const title = 'Fixture Changed';
    const message = `Fixture updated: ${Object.keys(changes).join(', ')}`;
    const url = `/fixtures`;

    await this.log('fixture_changed', title, message, payload);
    socketService.broadcastToMatch(fixture.id, 'notification', { type: 'fixture_changed', title, message, ...payload });

    const homeCoachIds = await this._getTeamCoachIds(fixture.homeTeamId);
    const awayCoachIds = await this._getTeamCoachIds(fixture.awayTeamId);
    const allUserIds = [...new Set([...homeCoachIds, ...awayCoachIds])];

    const entries = allUserIds.map((uid) => ({ userId: uid, type: 'fixture_changed', title, message, data: payload }));
    await this._persistBulk(entries);

    this._deliverWebPush(allUserIds, title, message, url, payload);
    this._deliverEmail(allUserIds, title, `<p>${message}</p>`);
    this._deliverAndroidPush(allUserIds, title, message, payload);
  }

  async officialAssigned(fixture, officialId) {
    const payload = { fixtureId: fixture.id, officialId };
    const title = 'Official Assigned';
    const message = `You have been assigned to a match`;
    const url = `/officials`;

    await this.log('official_assigned', title, 'Official assigned to fixture', payload);
    socketService.broadcastToAll('notification', { type: 'official_assigned', title, message: 'Official assigned to fixture', ...payload });

    // Notify the assigned official via their userId (official -> user mapping)
    // For now, broadcast to comp admins
    const compAdminIds = await this._getCompAdminIds();
    const entries = compAdminIds.map((uid) => ({ userId: uid, type: 'official_assigned', title, message: 'Official assigned to fixture', data: payload }));
    await this._persistBulk(entries);

    this._deliverWebPush(compAdminIds, title, 'Official assigned to fixture', url, payload);
    this._deliverEmail(compAdminIds, title, `<p>Official assigned to fixture</p>`);
  }

  async rosterApproved(teamId, competitionId) {
    const title = 'Roster Approved';
    const message = 'Your roster submission has been approved';
    const url = `/rosters`;
    const data = { teamId, competitionId };

    const coachIds = await this._getTeamCoachIds(teamId);
    if (coachIds.length === 0) return;

    const entries = coachIds.map((uid) => ({ userId: uid, type: 'roster_approved', title, message, data }));
    await this._persistBulk(entries);

    this._deliverWebPush(coachIds, title, message, url, data);
    this._deliverEmail(coachIds, title, `<p>${message}</p>`);
    this._deliverAndroidPush(coachIds, title, message, data);
  }

  async rosterRejected(teamId, competitionId, reason) {
    const title = 'Roster Rejected';
    const message = `Your roster submission was rejected${reason ? ': ' + reason : ''}`;
    const url = `/rosters`;
    const data = { teamId, competitionId, reason };

    const coachIds = await this._getTeamCoachIds(teamId);
    if (coachIds.length === 0) return;

    const entries = coachIds.map((uid) => ({ userId: uid, type: 'roster_rejected', title, message, data }));
    await this._persistBulk(entries);

    this._deliverWebPush(coachIds, title, message, url, data);
    this._deliverEmail(coachIds, title, `<p>${message}</p>`);
    this._deliverAndroidPush(coachIds, title, message, data);
  }

  async rosterNeedsRereview(teamId, competitionId) {
    const title = 'Roster Needs Re-Review';
    const message = 'A roster change was made to an approved team. The roster needs re-review.';
    const url = `/rosters`;
    const data = { teamId, competitionId };

    const registrarIds = await this._getRegistrarIds();
    if (registrarIds.length === 0) return;

    const entries = registrarIds.map((uid) => ({ userId: uid, type: 'roster_rereview', title, message, data }));
    await this._persistBulk(entries);

    this._deliverWebPush(registrarIds, title, message, url, data);
    this._deliverEmail(registrarIds, title, `<p>${message}</p>`);
    this._deliverAndroidPush(registrarIds, title, message, data);
  }

  async transferApproved(transfer) {
    const title = 'Transfer Approved';
    const message = `Player transfer has been approved`;
    const url = `/transfers`;
    const data = { transferId: transfer.id, playerId: transfer.player_id };

    const fromCoachIds = await this._getTeamCoachIds(transfer.from_team_id);
    const toCoachIds = await this._getTeamCoachIds(transfer.to_team_id);
    const allCoachIds = [...new Set([...fromCoachIds, ...toCoachIds])];

    const entries = allCoachIds.map((uid) => ({ userId: uid, type: 'transfer_approved', title, message, data }));
    await this._persistBulk(entries);

    this._deliverWebPush(allCoachIds, title, message, url, data);
    this._deliverEmail(allCoachIds, title, `<p>${message}</p>`);
    this._deliverAndroidPush(allCoachIds, title, message, data);
  }

  async transferRejected(transfer, reason) {
    const title = 'Transfer Rejected';
    const message = `Player transfer has been rejected${reason ? ': ' + reason : ''}`;
    const url = `/transfers`;
    const data = { transferId: transfer.id, playerId: transfer.player_id, reason };

    const coachIds = await this._getTeamCoachIds(transfer.from_team_id);

    const entries = coachIds.map((uid) => ({ userId: uid, type: 'transfer_rejected', title, message, data }));
    await this._persistBulk(entries);

    this._deliverWebPush(coachIds, title, message, url, data);
    this._deliverEmail(coachIds, title, `<p>${message}</p>`);
    this._deliverAndroidPush(coachIds, title, message, data);
  }

  async suspensionApplied(playerId, teamId, reason, matchesCount) {
    const title = 'Player Suspended';
    const message = `A player has been suspended for ${matchesCount} match(es): ${reason}`;
    const url = `/transfers`;
    const data = { playerId, teamId, reason, matchesCount };

    const coachIds = await this._getTeamCoachIds(teamId);

    const entries = coachIds.map((uid) => ({ userId: uid, type: 'suspension_applied', title, message, data }));
    await this._persistBulk(entries);

    this._deliverWebPush(coachIds, title, message, url, data);
    this._deliverEmail(coachIds, title, `<p>${message}</p>`);
    this._deliverAndroidPush(coachIds, title, message, data);
  }

  async matchPostponed(match, reason, newScheduledAt) {
    const payload = { matchId: match.id, reason, newScheduledAt };
    const title = 'Match Postponed';
    const message = `Match has been postponed: ${reason}`;
    const url = `/fixtures`;

    await this.log('match_postponed', title, message, payload);
    socketService.broadcastToMatch(match.id, 'notification', { type: 'match_postponed', title, message, ...payload });
    socketService.broadcastToAll('notification', { type: 'match_postponed', title, message, ...payload });

    const homeCoachIds = await this._getTeamCoachIds(match.home_team_id);
    const awayCoachIds = await this._getTeamCoachIds(match.away_team_id);
    const allUserIds = [...new Set([...homeCoachIds, ...awayCoachIds])];

    const entries = allUserIds.map((uid) => ({ userId: uid, type: 'match_postponed', title, message, data: payload }));
    await this._persistBulk(entries);

    this._deliverWebPush(allUserIds, title, message, url, payload);
    this._deliverEmail(allUserIds, title, `<p>${message}</p>`);
    this._deliverAndroidPush(allUserIds, title, message, payload);
  }

  async matchCancelled(match, reason) {
    const payload = { matchId: match.id, reason };
    const title = 'Match Cancelled';
    const message = `Match has been cancelled: ${reason || 'No reason provided'}`;
    const url = `/fixtures`;

    await this.log('match_cancelled', title, message, payload);
    socketService.broadcastToMatch(match.id, 'notification', { type: 'match_cancelled', title, message, ...payload });
    socketService.broadcastToAll('notification', { type: 'match_cancelled', title, message, ...payload });

    const homeCoachIds = await this._getTeamCoachIds(match.home_team_id);
    const awayCoachIds = await this._getTeamCoachIds(match.away_team_id);
    const allUserIds = [...new Set([...homeCoachIds, ...awayCoachIds])];

    const entries = allUserIds.map((uid) => ({ userId: uid, type: 'match_cancelled', title, message, data: payload }));
    await this._persistBulk(entries);

    this._deliverWebPush(allUserIds, title, message, url, payload);
    this._deliverEmail(allUserIds, title, `<p>${message}</p>`);
    this._deliverAndroidPush(allUserIds, title, message, payload);
  }

  async matchWalkover(match, walkoverTeamId, reason) {
    const payload = { matchId: match.id, walkoverTeamId, reason };
    const title = 'Walkover Declared';
    const message = `Walkover has been declared: ${reason}`;
    const url = `/fixtures`;

    await this.log('match_walkover', title, message, payload);
    socketService.broadcastToMatch(match.id, 'notification', { type: 'match_walkover', title, message, ...payload });
    socketService.broadcastToAll('notification', { type: 'match_walkover', title, message, ...payload });

    const homeCoachIds = await this._getTeamCoachIds(match.home_team_id);
    const awayCoachIds = await this._getTeamCoachIds(match.away_team_id);
    const allUserIds = [...new Set([...homeCoachIds, ...awayCoachIds])];

    const entries = allUserIds.map((uid) => ({ userId: uid, type: 'match_walkover', title, message, data: payload }));
    await this._persistBulk(entries);

    this._deliverWebPush(allUserIds, title, message, url, payload);
    this._deliverEmail(allUserIds, title, `<p>${message}</p>`);
    this._deliverAndroidPush(allUserIds, title, message, payload);
  }

  async matchAbandoned(match, reason) {
    const payload = { matchId: match.id, reason };
    const title = 'Match Abandoned';
    const message = `Match has been abandoned: ${reason || 'No reason provided'}`;
    const url = `/fixtures`;

    await this.log('match_abandoned', title, message, payload);
    socketService.broadcastToMatch(match.id, 'notification', { type: 'match_abandoned', title, message, ...payload });
    socketService.broadcastToAll('notification', { type: 'match_abandoned', title, message, ...payload });

    const homeCoachIds = await this._getTeamCoachIds(match.home_team_id);
    const awayCoachIds = await this._getTeamCoachIds(match.away_team_id);
    const allUserIds = [...new Set([...homeCoachIds, ...awayCoachIds])];

    const entries = allUserIds.map((uid) => ({ userId: uid, type: 'match_abandoned', title, message, data: payload }));
    await this._persistBulk(entries);

    this._deliverWebPush(allUserIds, title, message, url, payload);
    this._deliverEmail(allUserIds, title, `<p>${message}</p>`);
    this._deliverAndroidPush(allUserIds, title, message, payload);
  }
}

module.exports = new NotificationService();
