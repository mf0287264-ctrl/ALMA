import { db } from "../DB/db.connection.js";

/** Atomic shared counters survive restarts and cannot be bypassed by switching application instances. */
export class MongoRateLimitStore {
  constructor(prefix) {
    this.prefix = prefix;
    this.windowMs = 60000;
  }
  init(options) {
    this.windowMs = options.windowMs;
  }
  async increment(key) {
    const now = new Date(),
      reset = new Date(Date.now() + this.windowMs);
    const record = await db.collection("rate_limits").findOneAndUpdate(
      { _id: this.prefix + key },
      [
        {
          $set: {
            totalHits: {
              $cond: [
                { $gt: ["$resetTime", now] },
                { $add: [{ $ifNull: ["$totalHits", 0] }, 1] },
                1,
              ],
            },
            resetTime: {
              $cond: [{ $gt: ["$resetTime", now] }, "$resetTime", reset],
            },
          },
        },
      ],
      { upsert: true, returnDocument: "after" },
    );
    return { totalHits: record.totalHits, resetTime: record.resetTime };
  }
  async decrement(key) {
    await db
      .collection("rate_limits")
      .updateOne(
        { _id: this.prefix + key, totalHits: { $gt: 0 } },
        { $inc: { totalHits: -1 } },
      );
  }
  async resetKey(key) {
    await db.collection("rate_limits").deleteOne({ _id: this.prefix + key });
  }
}
