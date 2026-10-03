const { db, admin } = require('../config/database');
const crypto = require('crypto');

function formatProject(doc) {
  if (!doc.exists) return null;
  const data = doc.data();
  return {
    id: doc.id,
    ...data,
    createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : (data.createdAt ? new Date(data.createdAt) : new Date()),
    updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : (data.updatedAt ? new Date(data.updatedAt) : new Date()),
  };
}

class ProjectRepository {
  async findByUserId(userId) {
    const snapshot = await db
      .collection('projects')
      .where('userId', '==', userId)
      .get();

    const projects = [];

    for (const doc of snapshot.docs) {
      const proj = formatProject(doc);

      // Compute file and review counts in Firestore
      const [filesSnap, reviewsSnap] = await Promise.all([
        db.collection('projectFiles').where('projectId', '==', doc.id).count().get(),
        db.collection('reviews').where('projectId', '==', doc.id).count().get(),
      ]);

      proj._count = {
        files: filesSnap.data().count,
        reviews: reviewsSnap.data().count,
      };

      projects.push(proj);
    }

    // Sort descending by updatedAt
    projects.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

    return projects;
  }

  async findById(id) {
    const doc = await db.collection('projects').doc(id).get();
    if (!doc.exists) return null;

    const project = formatProject(doc);

    // Fetch related files & top 10 reviews
    const [filesSnap, reviewsSnap] = await Promise.all([
      db.collection('projectFiles').where('projectId', '==', id).get(),
      db.collection('reviews').where('projectId', '==', id).get(),
    ]);

    const files = filesSnap.docs.map((d) => ({
      id: d.id,
      ...d.data(),
      createdAt: d.data().createdAt?.toDate ? d.data().createdAt.toDate() : new Date(d.data().createdAt),
    }));

    let reviews = reviewsSnap.docs.map((d) => ({
      id: d.id,
      ...d.data(),
      createdAt: d.data().createdAt?.toDate ? d.data().createdAt.toDate() : new Date(d.data().createdAt),
      startedAt: d.data().startedAt?.toDate ? d.data().startedAt.toDate() : d.data().startedAt,
      completedAt: d.data().completedAt?.toDate ? d.data().completedAt.toDate() : d.data().completedAt,
    }));

    reviews.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    reviews = reviews.slice(0, 10);

    return {
      ...project,
      files,
      reviews,
    };
  }

  async create({ userId, name, description, language, repositoryUrl }) {
    const projectId = crypto.randomUUID();
    const now = admin.firestore.Timestamp.now();

    const projectData = {
      userId,
      name,
      description: description || null,
      language: language || 'javascript',
      repositoryUrl: repositoryUrl || null,
      createdAt: now,
      updatedAt: now,
    };

    await db.collection('projects').doc(projectId).set(projectData);

    return {
      id: projectId,
      userId,
      name,
      description: projectData.description,
      language: projectData.language,
      repositoryUrl: projectData.repositoryUrl,
      createdAt: now.toDate(),
      updatedAt: now.toDate(),
    };
  }

  async update(id, userId, data) {
    const projRef = db.collection('projects').doc(id);
    const updatePayload = {
      ...data,
      updatedAt: admin.firestore.Timestamp.now(),
    };
    await projRef.update(updatePayload);

    const updatedDoc = await projRef.get();
    return formatProject(updatedDoc);
  }

  async delete(id) {
    const projRef = db.collection('projects').doc(id);
    const doc = await projRef.get();
    if (!doc.exists) return null;
    const project = formatProject(doc);

    await projRef.delete();
    return project;
  }
}

module.exports = new ProjectRepository();
