import { MongoClient } from 'mongodb';

const url = 'mongodb+srv://vitalikprac:3p3UUTz6ITVSDGZW@cluster0.w4m7vdr.mongodb.net/test';
const client = new MongoClient(url);
const dbName = 'eco';
const db = client.db(dbName);

export async function startDb() {
  await client.connect();
  return db;
}

export const dbApi = {
  getMarkers: async () => {
    return db.collection('markers').find().toArray();
  },
  getMarkersWithParameters: async () => {
    const markers = await db.collection('markers').aggregate([
      {
        $lookup: {
          from: 'parameters',
          localField: 'parameters',
          foreignField: '_id',
          as: 'parameters',
        },
      },
    ]);
    return markers.toArray();
  },
  getParameters: (parameters) => {
    return db
      .collection('parameters')
      .find({
        _id: {
          $in: parameters,
        },
      })
      .toArray();
  },
  getMarkerById: async (id) => {
    const marker = await db.collection('markers').findOne({
      _id: parseInt(id),
    });

    const types = await db.collection('types').find({}).toArray();
    const identification = await db.collection('identification').find({}).toArray();
    const params = await db
      .collection('parameters')
      .find({
        _id: {
          $in: marker.parameters,
        },
      })
      .toArray();
    params.forEach((param) => {
      if (param.type !== undefined) {
        param.type = types.find((type) => type._id === param.type);
      }
    });

    marker.parameters = params;
    marker.identification = identification.find((item) => item._id === marker.identification_id);
    return marker;
  },
};
