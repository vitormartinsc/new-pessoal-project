const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');

const s3 = new S3Client({
  region: process.env.S3_REGION,
  credentials: {
    accessKeyId: process.env.IAM_KEY,
    secretAccessKey: process.env.IAM_SECRET_KEY,
  },
});

async function uploadFotoToS3(fileBuffer, fileName, mimeType) {
  const params = {
    Bucket: process.env.S3_BUCKET,
    Key: fileName,
    Body: fileBuffer,
    ContentType: mimeType,
    // ACL: 'public-read', // Removido pois o bucket não permite ACLs
  };
  await s3.send(new PutObjectCommand(params));
  // Monta a URL pública
  const url = `https://${process.env.S3_BUCKET}.s3.${process.env.S3_REGION}.amazonaws.com/${fileName}`;
  return { Location: url };
}

module.exports = { uploadFotoToS3 };
