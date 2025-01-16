const Queue = require('bull');
const imageThumbnail = require('image-thumbnail');
const path = require('path');
const fs = require('fs');
const db = require('./db');

const fileQueue = new Queue('fileQueue');

fileQueue.process(async (job) => {
  const { userId, fileId, localPath } = job.data;

  if (!fileId) throw new Error('Missing fileId');
  if (!userId) throw new Error('Missing userId');

  const file = await (
    await db.filesCollection()
  ).findOne({ _id: fileId, userId });
  if (!file) throw new Error('File not found');

  const sizes = [500, 250, 100];
  for (const size of sizes) {
    const thumbnail = await imageThumbnail(localPath, { width: size });
    const thumbnailPath = `${localPath}_${size}`;
    fs.writeFileSync(thumbnailPath, thumbnail);
  }
});

module.exports = { fileQueue };
