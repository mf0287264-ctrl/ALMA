import { MongoClient } from 'mongodb';

async function clean() {
  const client = new MongoClient('mongodb://localhost:27017');
  await client.connect();
  const db = client.db('ALMA');

  const deleted = await db.collection('achievements').deleteMany({});
  console.log('Deleted mock achievements count:', deleted.deletedCount);

  const updatedStudents = await db.collection('students').updateMany(
    {},
    {
      $set: {
        achievements: [],
        completed_courses: [],
        completed_lessons: []
      }
    }
  );
  console.log('Reset students achievements count:', updatedStudents.modifiedCount);

  await client.close();
}

clean().catch(console.error);
