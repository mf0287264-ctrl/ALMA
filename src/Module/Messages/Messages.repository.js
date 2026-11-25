import { ObjectId } from 'mongodb';
import { db } from '../../DB/db.connection.js';

class MessagesRepository {
  get collection() {
    return db.collection('student_messages');
  }

  get studentsCollection() {
    return db.collection('students');
  }

  get teachersCollection() {
    return db.collection('teachers');
  }

  async create(data) {
    const sId = typeof data.sender_id === 'string' ? new ObjectId(data.sender_id) : data.sender_id;
    const rId = typeof data.receiver_id === 'string' ? new ObjectId(data.receiver_id) : data.receiver_id;

    const doc = {
      sender_id: sId,
      receiver_id: rId,
      message: data.message,
      read: false,
      read_at: null,
      created_at: new Date(),
      updated_at: new Date()
    };

    const result = await this.collection.insertOne(doc);
    return { ...doc, _id: result.insertedId };
  }

  async getConversation(userAId, userBId) {
    const a = typeof userAId === 'string' ? new ObjectId(userAId) : userAId;
    const b = typeof userBId === 'string' ? new ObjectId(userBId) : userBId;

    return await this.collection
      .find({
        $or: [
          { sender_id: a, receiver_id: b },
          { sender_id: b, receiver_id: a }
        ]
      })
      .sort({ created_at: 1 })
      .toArray();
  }

  async markAsRead(currentUserId, partnerId) {
    const me = typeof currentUserId === 'string' ? new ObjectId(currentUserId) : currentUserId;
    const partner = typeof partnerId === 'string' ? new ObjectId(partnerId) : partnerId;

    await this.collection.updateMany(
      { sender_id: partner, receiver_id: me, read: false },
      { $set: { read: true, read_at: new Date() } }
    );
  }

  async getThreads(studentId) {
    const me = typeof studentId === 'string' ? new ObjectId(studentId) : studentId;

    // Get all messages where student is sender or receiver
    const messages = await this.collection
      .find({
        $or: [{ sender_id: me }, { receiver_id: me }]
      })
      .sort({ created_at: -1 })
      .toArray();

    const partnerMap = new Map();

    for (const msg of messages) {
      const isSender = msg.sender_id.toString() === me.toString();
      const partnerIdStr = isSender ? msg.receiver_id.toString() : msg.sender_id.toString();

      if (!partnerMap.has(partnerIdStr)) {
        partnerMap.set(partnerIdStr, {
          partner_id: partnerIdStr,
          last_message: {
            _id: msg._id,
            text: msg.message,
            created_at: msg.created_at,
            is_mine: isSender,
            read: msg.read
          },
          unread_count: !isSender && !msg.read ? 1 : 0
        });
      } else {
        if (!isSender && !msg.read) {
          const entry = partnerMap.get(partnerIdStr);
          entry.unread_count += 1;
        }
      }
    }

    const partnerIds = Array.from(partnerMap.keys()).map((id) => new ObjectId(id));
    if (partnerIds.length === 0) return [];

    const partners = await this.studentsCollection
      .find(
        { _id: { $in: partnerIds } },
        {
          projection: {
            first_name: 1,
            last_name: 1,
            student_code: 1,
            email: 1,
            profile_image: 1,
            profileImage: 1,
            grade_level: 1
          }
        }
      )
      .toArray();

    const partnerInfoMap = new Map();
    partners.forEach((p) => {
      p.profile_image = p.profile_image || p.profileImage || null;
      partnerInfoMap.set(p._id.toString(), p);
    });

    // Check missing partners in teachers collection if any
    const missingIds = partnerIds.filter((id) => !partnerInfoMap.has(id.toString()));
    if (missingIds.length > 0) {
      const teachers = await this.teachersCollection
        .find(
          { _id: { $in: missingIds } },
          {
            projection: {
              first_name: 1,
              last_name: 1,
              teacher_code: 1,
              email: 1,
              profile_image: 1,
              profileImage: 1,
              specialization: 1
            }
          }
        )
        .toArray();
      teachers.forEach((t) => {
        t.student_code = t.teacher_code || 'TEACHER';
        t.profile_image = t.profile_image || t.profileImage || null;
        partnerInfoMap.set(t._id.toString(), t);
      });
    }

    const threads = [];
    for (const [pIdStr, threadData] of partnerMap.entries()) {
      const partnerInfo = partnerInfoMap.get(pIdStr);
      if (partnerInfo) {
        threads.push({
          partner: partnerInfo,
          last_message: threadData.last_message,
          unread_count: threadData.unread_count
        });
      }
    }

    return threads;
  }

  async findStudentByIdentifier(identifier) {
    if (!identifier) return null;
    const clean = identifier.toString().trim();

    // Check if valid ObjectId
    if (ObjectId.isValid(clean) && clean.length === 24) {
      const byId = await this.studentsCollection.findOne(
        { _id: new ObjectId(clean) },
        { projection: { password_hash: 0 } }
      );
      if (byId) return byId;
    }

    // Try student_code (e.g. STU-1102)
    const byCode = await this.studentsCollection.findOne(
      { student_code: { $regex: new RegExp(`^${clean}$`, 'i') } },
      { projection: { password_hash: 0 } }
    );
    if (byCode) return byCode;

    // Try email or first_name in students
    const studentDoc = await this.studentsCollection.findOne(
      {
        $or: [
          { email: clean.toLowerCase() },
          { first_name: { $regex: new RegExp(`^${clean}$`, 'i') } }
        ]
      },
      { projection: { password_hash: 0 } }
    );
    if (studentDoc) return studentDoc;

    // Fallback: Check teachers collection (by ID, teacher_code, email, or first_name)
    if (ObjectId.isValid(clean) && clean.length === 24) {
      const teacherById = await this.teachersCollection.findOne(
        { _id: new ObjectId(clean) },
        { projection: { password_hash: 0 } }
      );
      if (teacherById) {
        return {
          ...teacherById,
          student_code: teacherById.teacher_code || "TEACHER"
        };
      }
    }

    const teacherByCode = await this.teachersCollection.findOne(
      {
        $or: [
          { teacher_code: { $regex: new RegExp(`^${clean}$`, 'i') } },
          { email: clean.toLowerCase() },
          { first_name: { $regex: new RegExp(`^${clean}$`, 'i') } }
        ]
      },
      { projection: { password_hash: 0 } }
    );
    if (teacherByCode) {
      return {
        ...teacherByCode,
        student_code: teacherByCode.teacher_code || "TEACHER"
      };
    }

    return null;
  }
}

export default new MessagesRepository();
