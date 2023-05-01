import { MongoClient, ObjectId } from 'mongodb';

const url = 'mongodb+srv://vitalikprac:3p3UUTz6ITVSDGZW@cluster0.w4m7vdr.mongodb.net/test';
const client = new MongoClient(url);
const dbName = 'eco';
const db = client.db(dbName);

export async function startDb() {
  await client.connect();
  return db;
}

const objectIdOrInt = (id) => {
  if (id.toString().length > 10) {
    return new ObjectId(id);
  } else {
    return parseInt(id);
  }
};

export const dbApi = {
  getSystems: async () => {
    return db.collection('systems').find().toArray();
  },
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
  getParameterById: async (id) => {
    return db.collection('parameters').findOne({
      _id: objectIdOrInt(id),
    });
  },
  createParameters: async (parameters) => {
    if (parameters.length === 0) {
      return {};
    }
    return (await db.collection('parameters').insertMany(parameters))?.insertedIds;
  },
  getIdentification: async (name) => {
    return db.collection('identification').findOne({
      name,
    });
  },
  createIdentification: async (name) => {
    const result = await db.collection('identification').insertOne({ name });
    return result?.insertedId;
  },
  getMarkerById: async (id) => {
    id = objectIdOrInt(id);
    const marker = await db.collection('markers').findOne({
      _id: id,
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
        param.type = types.find((type) => type._id.toString() === param.type.toString());
      }
    });

    marker.parameters = params;

    marker.identification = identification.find((item) => item._id.toString() === marker.identification_id.toString());
    return marker;
  },
  getMarkerByParameterId: async (id) => {
    id = objectIdOrInt(id);
    return db.collection('markers').findOne({
      parameters: id,
    });
  },
  getMarkersWithIdentificationId: async (id) => {
    id = objectIdOrInt(id);
    return db.collection('markers').find({ identification_id: id }).toArray();
  },
  deleteIdentification: async (id) => {
    return db.collection('identification').deleteOne({ _id: id });
  },
  deleteParameters: async (ids) => {
    ids = ids.map((id) => objectIdOrInt(id));
    return db.collection('parameters').deleteMany({
      _id: {
        $in: ids,
      },
    });
  },
  updateParameter: async (id, parameter) => {
    return db.collection('parameters').updateOne(
      {
        _id: objectIdOrInt(id),
      },
      {
        $set: parameter,
        $unset: {
          value: null,
        },
      },
    );
  },
  createMarker: async (marker) => {
    return db.collection('markers').insertOne(marker);
  },
  addParameterToMarker: async (markerId, parameterId) => {
    return db.collection('markers').updateOne(
      {
        _id: objectIdOrInt(markerId),
      },
      {
        $push: {
          parameters: objectIdOrInt(parameterId),
        },
      },
    );
  },
  deleteMarker: async (id) => {
    return db.collection('markers').deleteOne({ _id: id });
  },
  updateSystem: async (id, system) => {
    return db.collection('systems').updateOne(
      {
        _id: objectIdOrInt(id),
      },
      {
        $set: system,
      },
    );
  },
};
