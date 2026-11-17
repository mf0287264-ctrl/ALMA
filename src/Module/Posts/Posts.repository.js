import { ObjectId } from 'mongodb';
import { db } from '../../DB/db.connection.js';

class PostsRepository {
  get collection() {
    return db.collection('posts');
  }

  async create(data) {
    const postDoc = {
      ...data,
      created_at: new Date(),
      updated_at: new Date()
    };
    const result = await this.collection.insertOne(postDoc);
    return await this.findById(result.insertedId);
  }

  async findById(id) {
    if (!id) return null;
    const queryId = typeof id === 'string' ? new ObjectId(id) : id;
    return await this.collection.findOne({ _id: queryId });
  }

  async findAll(filter = {}, options = {}) {
    const { page = 1, limit = 20, sort = { created_at: -1 } } = options;
    const skip = (page - 1) * limit;

    const [posts, total] = await Promise.all([
      this.collection.find(filter).sort(sort).skip(skip).limit(limit).toArray(),
      this.collection.countDocuments(filter)
    ]);

    return { posts, total, page, limit };
  }

  async update(id, data) {
    if (!id) return null;
    const queryId = typeof id === 'string' ? new ObjectId(id) : id;
    await this.collection.updateOne(
      { _id: queryId },
      { $set: { ...data, updated_at: new Date() } }
    );
    return await this.findById(id);
  }

  async delete(id) {
    if (!id) return null;
    const queryId = typeof id === 'string' ? new ObjectId(id) : id;
    return await this.collection.deleteOne({ _id: queryId });
  }

  async addLike(postId, likeData) {
    const pId = typeof postId === 'string' ? new ObjectId(postId) : postId;
    await this.collection.updateOne(
      { _id: pId },
      {
        $push: { likes: likeData },
        $inc: { likes_count: 1 },
        $set: { updated_at: new Date() }
      }
    );
    return await this.findById(pId);
  }

  async removeLike(postId, userId) {
    const pId = typeof postId === 'string' ? new ObjectId(postId) : postId;
    const uId = typeof userId === 'string' ? new ObjectId(userId) : userId;
    await this.collection.updateOne(
      { _id: pId },
      {
        $pull: { likes: { user_id: uId } },
        $inc: { likes_count: -1 },
        $set: { updated_at: new Date() }
      }
    );
    // Ensure likes_count never drops below 0
    await this.collection.updateOne(
      { _id: pId, likes_count: { $lt: 0 } },
      { $set: { likes_count: 0 } }
    );
    return await this.findById(pId);
  }

  async addBookmark(postId, bookmarkData) {
    const pId = typeof postId === 'string' ? new ObjectId(postId) : postId;
    await this.collection.updateOne(
      { _id: pId },
      {
        $push: { bookmarks: bookmarkData },
        $inc: { bookmarks_count: 1 },
        $set: { updated_at: new Date() }
      }
    );
    return await this.findById(pId);
  }

  async removeBookmark(postId, userId) {
    const pId = typeof postId === 'string' ? new ObjectId(postId) : postId;
    const uId = typeof userId === 'string' ? new ObjectId(userId) : userId;
    await this.collection.updateOne(
      { _id: pId },
      {
        $pull: { bookmarks: { user_id: uId } },
        $inc: { bookmarks_count: -1 },
        $set: { updated_at: new Date() }
      }
    );
    await this.collection.updateOne(
      { _id: pId, bookmarks_count: { $lt: 0 } },
      { $set: { bookmarks_count: 0 } }
    );
    return await this.findById(pId);
  }

  async incrementShareCount(postId) {
    const pId = typeof postId === 'string' ? new ObjectId(postId) : postId;
    await this.collection.updateOne(
      { _id: pId },
      {
        $inc: { shares_count: 1 },
        $set: { updated_at: new Date() }
      }
    );
  }
}

export default new PostsRepository();
