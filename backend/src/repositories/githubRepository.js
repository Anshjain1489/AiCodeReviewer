const { db, admin } = require('../config/database');
const crypto = require('crypto');

function formatConnection(doc) {
  if (!doc.exists) return null;
  const data = doc.data();
  return {
    id: doc.id,
    ...data,
    createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : data.createdAt,
    updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : data.updatedAt,
  };
}

class GitHubRepositoryRepo {
  async findConnectionByUserId(userId) {
    const snap = await db.collection('githubConnections').where('userId', '==', userId).limit(1).get();
    if (snap.empty) return null;

    const connection = formatConnection(snap.docs[0]);

    // Fetch associated repositories
    const reposSnap = await db.collection('githubRepositories').where('connectionId', '==', connection.id).get();
    const repositories = reposSnap.docs.map((r) => ({
      id: r.id,
      ...r.data(),
      createdAt: r.data().createdAt?.toDate ? r.data().createdAt.toDate() : r.data().createdAt,
      updatedAt: r.data().updatedAt?.toDate ? r.data().updatedAt.toDate() : r.data().updatedAt,
    }));

    return {
      ...connection,
      repositories,
    };
  }

  async upsertConnection({ userId, githubUserId, username, encryptedAccessToken, scopes }) {
    const existingSnap = await db.collection('githubConnections').where('userId', '==', userId).limit(1).get();
    const now = admin.firestore.Timestamp.now();

    if (!existingSnap.empty) {
      const connDoc = existingSnap.docs[0];
      const connRef = db.collection('githubConnections').doc(connDoc.id);

      await connRef.update({
        githubUserId,
        username,
        encryptedAccessToken,
        scopes,
        updatedAt: now,
      });

      const updated = await connRef.get();
      return formatConnection(updated);
    }

    const connId = crypto.randomUUID();
    const connData = {
      userId,
      githubUserId,
      username,
      encryptedAccessToken,
      scopes,
      createdAt: now,
      updatedAt: now,
    };

    await db.collection('githubConnections').doc(connId).set(connData);

    return {
      id: connId,
      ...connData,
      createdAt: now.toDate(),
      updatedAt: now.toDate(),
    };
  }

  async saveRepositories(connectionId, repos) {
    for (const r of repos) {
      const existingSnap = await db
        .collection('githubRepositories')
        .where('connectionId', '==', connectionId)
        .where('githubRepoId', '==', String(r.id))
        .limit(1)
        .get();

      const now = admin.firestore.Timestamp.now();

      if (!existingSnap.empty) {
        const repoDoc = existingSnap.docs[0];
        await db
          .collection('githubRepositories')
          .doc(repoDoc.id)
          .update({
            owner: r.owner.login,
            name: r.name,
            fullName: r.full_name,
            defaultBranch: r.default_branch,
            private: r.private,
            htmlUrl: r.html_url,
            updatedAt: now,
          });
      } else {
        const repoId = crypto.randomUUID();
        await db
          .collection('githubRepositories')
          .doc(repoId)
          .set({
            connectionId,
            githubRepoId: String(r.id),
            owner: r.owner.login,
            name: r.name,
            fullName: r.full_name,
            defaultBranch: r.default_branch || 'main',
            private: !!r.private,
            htmlUrl: r.html_url,
            createdAt: now,
            updatedAt: now,
          });
      }
    }
  }

  async findRepositoryById(id) {
    const doc = await db.collection('githubRepositories').doc(id).get();
    if (!doc.exists) return null;

    const repository = {
      id: doc.id,
      ...doc.data(),
    };

    // Fetch parent connection & pull requests
    const [connDoc, prsSnap] = await Promise.all([
      db.collection('githubConnections').doc(repository.connectionId).get(),
      db.collection('pullRequests').where('repositoryId', '==', id).get(),
    ]);

    const connection = connDoc.exists ? formatConnection(connDoc) : null;
    const pullRequests = prsSnap.docs.map((p) => ({
      id: p.id,
      ...p.data(),
    }));

    return {
      ...repository,
      connection,
      pullRequests,
    };
  }
}

module.exports = new GitHubRepositoryRepo();
