const Bull = require('bull');
const { generateThumbnail } = require('image-thumbnail');
const fs = require('fs/promises');
const path = require('path');
const dbClient = require('./utils/db');

const fileQueue = new Bull('fileQueue');

fileQueue.process(async (job) => {
  const { fileId, userId } = job.data;

  if (!fileId) throw new Error('Missing fileId');
  if (!userId) throw new Error('Missing userId');

  const file = await dbClient
    .collection('files')
    .findOne({ _id: fileId, userId });
  if (!file) throw new Error('File not found');

  const filePath = path.resolve(`/tmp/files_manager/${file._id}`);
  const sizes = [500, 250, 100];

  try {
    for (const size of sizes) {
      const options = { width: size };
      const thumbnail = await generateThumbnail(filePath, options);
      const thumbnailPath = `${filePath}_${size}`;
      await fs.writeFile(thumbnailPath, thumbnail);
    }
    console.log(`Thumbnails generated for file: ${fileId}`);
  } catch (error) {
    console.error(`Error generating thumbnails for file: ${fileId}`, error);
  }
});
