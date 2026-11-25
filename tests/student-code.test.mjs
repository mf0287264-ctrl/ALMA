import { describe, it, after } from 'node:test';
import assert from 'node:assert';
import crypto from 'node:crypto';
import {
  generateUniqueStudentCode,
  isStudentCodeInRedis,
  addStudentCodeToRedis,
  loadStudentCodesToRedis,
  disconnectRedis
} from '../src/Utils/redis.util.js';
import studentsService from '../src/Module/Students/Students.service.js';
import studentsRepository from '../src/Module/Students/Students.repository.js';
import { updateStudentSchema } from '../src/Validation/Student.validation.js';

describe('Student Code - 5 Digits Crypto & Redis Deduplication & Fixed on Update', () => {
  after(async () => {
    await disconnectRedis();
    setTimeout(() => process.exit(0), 10);
  });

  it('generates a 5-digit student code format (STU-XXXXX) using crypto', async () => {
    const mockDb = {
      collection: () => ({
        find: () => ({ toArray: async () => [] }),
        findOne: async () => null
      })
    };

    const code = await generateUniqueStudentCode(mockDb);
    assert.match(code, /^STU-\d{5}$/, 'Code must match STU- followed by exactly 5 digits');
  });

  it('rejects duplicate code that exists in Redis and picks an unused one', async () => {
    // Seed a known code in Redis
    const knownCode = 'STU-99999';
    await addStudentCodeToRedis(knownCode);

    const isTaken = await isStudentCodeInRedis(knownCode);
    assert.strictEqual(isTaken, true, 'Code in Redis must be marked as taken');

    const freshCode = 'STU-10001';
    // If not in Redis
    const freshTaken = await isStudentCodeInRedis('STU-88888');
    // Generate a unique code
    const generated = await generateUniqueStudentCode();
    assert.notStrictEqual(generated, knownCode, 'Generated code must not collide with existing code in Redis');
  });

  it('updateStudentSchema does not inject a default student_code or empty friends array on partial update', async () => {
    const partialUpdate = { first_name: 'Omar', last_name: 'Khaled' };
    const parsed = await updateStudentSchema.parseAsync(partialUpdate);

    assert.strictEqual(
      parsed.student_code,
      undefined,
      'updateStudentSchema must NOT generate or default a student_code when none is provided'
    );
    assert.strictEqual(
      parsed.friends,
      undefined,
      'updateStudentSchema must NOT inject friends: [] when updating name'
    );
    assert.strictEqual(
      parsed.followers,
      undefined,
      'updateStudentSchema must NOT inject followers: [] when updating name'
    );
    assert.strictEqual(
      parsed.following,
      undefined,
      'updateStudentSchema must NOT inject following: [] when updating name'
    );
  });

  it('studentsService.updateStudent preserves and locks existing student_code even if passed in payload', async () => {
    const fakeId = '660e8400ece94f29a0000001';
    let passedUpdateData = null;

    const originalUpdate = studentsRepository.update;
    studentsRepository.update = async (id, data) => {
      passedUpdateData = { ...data };
      return { _id: id, student_code: 'STU-55555', ...data };
    };

    try {
      // User tries to edit their name and accidentally/intentionally sends a new student_code
      await studentsService.updateStudent(fakeId, {
        first_name: 'UpdatedName',
        student_code: 'STU-99999',
        studentCode: 'STU-99999'
      });

      assert.strictEqual(
        passedUpdateData.student_code,
        undefined,
        'student_code must be deleted/stripped before database update to remain permanently fixed'
      );
      assert.strictEqual(
        passedUpdateData.studentCode,
        undefined,
        'studentCode must be deleted/stripped before database update'
      );
      assert.strictEqual(
        passedUpdateData.first_name,
        'UpdatedName',
        'Other updated fields like first_name must be updated properly'
      );
    } finally {
      studentsRepository.update = originalUpdate;
    }
  });
});
