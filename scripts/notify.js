// scripts/notify.js
// Runs on a GitHub Actions schedule (~every 5 minutes). Checks Firestore for anything new
// (post, diary/mood entry, memory box item, chat message) since the last run, and sends a
// real push notification to every OTHER registered device via Firebase Cloud Messaging.
// Free: uses only Firestore + FCM, both free on the Spark plan — no Blaze/billing needed.

const admin = require('firebase-admin');

function main() {
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (!raw) {
    console.error('Missing FIREBASE_SERVICE_ACCOUNT secret.');
    process.exit(1);
  }
  const serviceAccount = JSON.parse(raw);

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });

  const db = admin.firestore();
  const messaging = admin.messaging();

  const ACTIVITY_COLLECTION = 'nyoyaDiaryActivity';
  const TOKENS_COLLECTION = 'nyoyaDiaryTokens';
  const META_DOC = db.collection('nyoyaDiaryMeta').doc('notifyState');

  function titleFor(activity) {
    switch (activity.type) {
      case 'post': return `${activity.author} shared something ✨`;
      case 'diary': return `${activity.author} logged a mood${activity.mood ? ': ' + activity.mood : ''}`;
      case 'memory': return `${activity.author} added a new memory 🎁`;
      case 'chat': return `${activity.author} sent a message 💬`;
      default: return `${activity.author} did something new`;
    }
  }
  function bodyFor(activity) {
    return activity.text || activity.title || 'Open the app to see it 💛';
  }

  return (async () => {
    const metaSnap = await META_DOC.get();

    if (!metaSnap.exists) {
      // First run ever: just set a baseline, don't spam everyone with old history.
      const allSnap = await db.collection(ACTIVITY_COLLECTION).orderBy('ts', 'desc').limit(1).get();
      const baseline = allSnap.empty ? Date.now() : allSnap.docs[0].data().ts;
      await META_DOC.set({ lastCheckTs: baseline });
      console.log('First run — baseline set to', new Date(baseline).toISOString(), '. No notifications sent.');
      return;
    }

    const lastCheck = metaSnap.data().lastCheckTs || 0;

    const activitySnap = await db.collection(ACTIVITY_COLLECTION)
      .where('ts', '>', lastCheck)
      .orderBy('ts', 'asc')
      .get();

    if (activitySnap.empty) {
      console.log('No new activity since', new Date(lastCheck).toISOString());
      return;
    }

    const tokensSnap = await db.collection(TOKENS_COLLECTION).get();
    const tokens = [];
    tokensSnap.forEach(doc => tokens.push({ id: doc.id, ...doc.data() }));

    let maxTs = lastCheck;

    for (const doc of activitySnap.docs) {
      const activity = doc.data();
      if (activity.ts > maxTs) maxTs = activity.ts;

      // Don't notify the person who did the thing — only their partner.
      const targets = tokens.filter(t => t.author !== activity.author);
      const targetTokens = targets.map(t => t.token);
      if (!targetTokens.length) continue;

      const message = {
        notification: {
          title: titleFor(activity),
          body: bodyFor(activity)
        },
        tokens: targetTokens
      };

      try {
        const res = await messaging.sendEachForMulticast(message);
        console.log(`Activity ${doc.id} (${activity.type}): sent ${res.successCount}, failed ${res.failureCount}`);

        // Clean up tokens that are no longer valid (app uninstalled, permission revoked, etc).
        res.responses.forEach((r, i) => {
          if (!r.success && r.error && r.error.code === 'messaging/registration-token-not-registered') {
            const badTokenDoc = targets[i];
            if (badTokenDoc) db.collection(TOKENS_COLLECTION).doc(badTokenDoc.id).delete().catch(() => {});
          }
        });
      } catch (e) {
        console.error(`Failed to send for activity ${doc.id}:`, e.message);
      }
    }

    await META_DOC.set({ lastCheckTs: maxTs });
    console.log('Updated lastCheckTs to', new Date(maxTs).toISOString());
  })();
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
