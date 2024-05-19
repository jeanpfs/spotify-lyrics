import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

import { LyricRecord, LyricsResponse, Config } from './type';

admin.initializeApp();
const db = admin.firestore();

const COLLECTION = 'lyrics-v3';
// firebase functions:config:set spotify-lyrics.manager-ids=xxx,xxx
const MANAGERS = ((functions.config() as Config)?.['spotify-lyrics']?.['manager-ids'] || '').split(
  ',',
);

const corsHandler = (req: functions.https.Request, res: functions.Response) => {
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') {
    res.status(200).send();
    return true;
  } else {
    return false;
  }
};

const isValidRequest = (params: LyricRecord) => {
  return params?.user && params.name && params.artists && params.platform;
};

export const getLyric = functions.https.onRequest(
  async (req, res: functions.Response<LyricsResponse<any>>) => {
    if (corsHandler(req, res)) return;
    const params: LyricRecord = req.body;
    if (!isValidRequest(params)) {
      res.status(400).send({ message: 'Params error' });
      return;
    }
    const lyricsRef = db.collection(COLLECTION);
    const query = lyricsRef
      .orderBy('reviewed', 'desc')
      .where('name', '==', params.name)
      .where('artists', '==', params.artists)
      .where('platform', '==', params.platform);
    let snapshot = await query.where('user', '==', params.user).get();
    let doc = snapshot.docs[0];
    let data = doc?.data() as LyricRecord | undefined;
    if (snapshot.empty || (!data?.lyric && !data?.neteaseID)) {
      snapshot = await query.get();
      doc = snapshot.docs[0];
      data = doc?.data() as LyricRecord | undefined;
    }
    res.send({ data, message: 'OK' });
  },
);

export const setLyric = functions.https.onRequest(
  async (req, res: functions.Response<LyricsResponse<any>>) => {
    if (corsHandler(req, res)) return;
    const params: LyricRecord = req.body;
    if (!isValidRequest(params)) {
      return;
    }
    const lyricsRef = db.collection(COLLECTION);
    const query = lyricsRef
      .where('name', '==', params.name)
      .where('artists', '==', params.artists)
      .where('platform', '==', params.platform)
      .where('user', '==', params.user);
    const reviewed = MANAGERS.includes(params.user);
    const snapshot = await query.get();
    if (snapshot.empty) {
      if (params.neteaseID || params.lyric) {
        await lyricsRef.add(
          Object.assign({ neteaseID: 0, lyric: '' } as LyricRecord, params, {
            reviewed,
            createdTime: Date.now(),
          } as LyricRecord),
        );
      }
    } else {
      const doc = snapshot.docs[0];
      const data = Object.assign(doc.data(), params);
      if (data.neteaseID || data.lyric) {
        await doc.ref.update(
          Object.assign({ neteaseID: 0, lyric: '' } as LyricRecord, params, {
            reviewed,
            updatedTime: Date.now(),
          } as LyricRecord),
        );
      } else {
        await doc.ref.delete();
      }
    }
    res.send({ message: 'OK' });
  },
);
