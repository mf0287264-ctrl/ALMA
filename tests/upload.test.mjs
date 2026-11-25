import { describe, it, before, after } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { multerUpload, verifyFileSignature } from '../src/Middleware/multer.middleware.js';
import { BadRequestException } from '../src/Common/Utils/Errors/exceptions.error.js';

// Minimal 1x1 PNG binary buffer (valid magic bytes: 89 50 4E 47 0D 0A 1A 0A)
const validPngBuffer = Buffer.from(
  '89504e470d0a1a0a0000000d49484452000000010000000108060000001f15c4890000000a49444154789c63000100000500010d0a2d840000000049454e44ae426082',
  'hex'
);

// Minimal JPEG binary buffer (valid magic bytes: FF D8 FF)
const validJpgBuffer = Buffer.from([
  0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46, 0x00, 0x01, 0x01, 0x01, 0x00, 0x48,
  0x00, 0x48, 0x00, 0x00, 0xff, 0xd9
]);

// Spoofed file (text pretending to be PNG)
const fakePngBuffer = Buffer.from('This is plain text with malicious code disguised as PNG!');

describe('Multer & file-type signature upload test', () => {
  const testDir = path.join(process.cwd(), 'uploads', 'test_uploads');

  before(() => {
    if (!fs.existsSync(testDir)) {
      fs.mkdirSync(testDir, { recursive: true });
    }
  });

  after(() => {
    if (fs.existsSync(testDir)) {
      fs.rmSync(testDir, { recursive: true, force: true });
    }
  });

  it('correctly initializes multerUpload with default desiredPath and folderName', () => {
    const uploader = multerUpload({ desiredPath: 'test_uploads', folderName: 'uploads' });
    assert.strictEqual(typeof uploader.single, 'function');
    assert.strictEqual(typeof uploader.array, 'function');
  });

  it('rejects spoofed file where content does not match image signature', async () => {
    const fakeFilePath = path.join(testDir, 'fake.png');
    fs.writeFileSync(fakeFilePath, fakePngBuffer);

    const fakeFile = {
      path: fakeFilePath,
      originalname: 'fake.png',
      mimetype: 'image/png',
      size: fakePngBuffer.length
    };

    await assert.rejects(
      async () => {
        await verifyFileSignature(fakeFile);
      },
      (err) => {
        assert.ok(err instanceof BadRequestException);
        assert.strictEqual(err.code, 'INVALID_FILE_SIGNATURE');
        return true;
      }
    );

    // Spoofed file must be unlinked from disk
    assert.strictEqual(fs.existsSync(fakeFilePath), false, 'Spoofed file should be deleted from disk immediately');
  });

  it('accepts genuine PNG file and preserves it on disk with detected signature', async () => {
    const validFilePath = path.join(testDir, 'valid.png');
    fs.writeFileSync(validFilePath, validPngBuffer);

    const validFile = {
      path: validFilePath,
      originalname: 'valid.png',
      mimetype: 'image/png',
      size: validPngBuffer.length
    };

    const signature = await verifyFileSignature(validFile);
    assert.ok(signature, 'Signature should be detected');
    assert.strictEqual(signature.ext, 'png');
    assert.strictEqual(signature.mime, 'image/png');
    assert.strictEqual(validFile.detectedSignature.ext, 'png');
    assert.strictEqual(fs.existsSync(validFilePath), true, 'Valid image must stay on disk');
  });

  it('accepts genuine JPG file and preserves it on disk with detected signature', async () => {
    const validJpgPath = path.join(testDir, 'valid.jpg');
    fs.writeFileSync(validJpgPath, validJpgBuffer);

    const validFile = {
      path: validJpgPath,
      originalname: 'valid.jpg',
      mimetype: 'image/jpeg',
      size: validJpgBuffer.length
    };

    const signature = await verifyFileSignature(validFile);
    assert.ok(signature, 'Signature should be detected');
    assert.strictEqual(signature.ext, 'jpg');
    assert.strictEqual(signature.mime, 'image/jpeg');
    assert.strictEqual(fs.existsSync(validJpgPath), true, 'Valid JPG must stay on disk');
  });

  it('rejects invalid or missing first/last name with BadRequestException', async () => {
    const { updateUserNameHandler } = await import('../src/Module/Users/Users.controller.js');

    const reqEmpty = { body: { first_name: '', last_name: 'Doe' }, authUser: { _id: '1', role: 'student' } };
    let errResult = null;
    await updateUserNameHandler(reqEmpty, {}, (err) => { errResult = err; });
    assert.ok(errResult instanceof BadRequestException);
    assert.strictEqual(errResult.code, 'INVALID_NAME_FIELDS');

    const reqShort = { body: { first_name: 'A', last_name: 'B' }, authUser: { _id: '1', role: 'student' } };
    errResult = null;
    await updateUserNameHandler(reqShort, {}, (err) => { errResult = err; });
    assert.ok(errResult instanceof BadRequestException);
    assert.strictEqual(errResult.code, 'NAME_TOO_SHORT');
  });
});
