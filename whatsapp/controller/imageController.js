const AWS = require('aws-sdk');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
require('dotenv').config();


exports.downloadImage = async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await req.user.reload();
        const stringifiedExpense = JSON.stringify(expenses);

        const filename = `Expense${userId}/${new Date().toISOString()}.txt`;
        const fileURL = await uploadTOS3(stringifiedExpense, filename);

        // console.log(fileURL);
        // console.log(Object.keys(req.user.__proto__));

        if (typeof req.user.createFilelink !== 'function') {
            throw new Error('createFilelink method is not available on req.user');
        }

        const uploadFileUrl = await req.user.createImage({ fileURL: fileURL });
        res.status(200).json({ fileURL, pastDownloads, success: true });

    } catch (err) {
        console.log(err);
        res.status(500).json({ fileURL: '', success: false });
    }
};


async function uploadTOS3(data, filename) {
    const BUCKET_NAME = process.env.BUCKET_NAME;
    const IAM_USER_KEY = process.env.IAM_USER_KEY;
    const IAM_USER_SECRET = process.env.IAM_USER_SECRET;
    const REGION = process.env.REGION;

    const s3Client = new S3Client({
        region: REGION,
        credentials: {
            accessKeyId: IAM_USER_KEY,
            secretAccessKey: IAM_USER_SECRET,
        },
    });

    const params = {
        Bucket: BUCKET_NAME,
        Key: filename,
        Body: data,
        ACL: 'public-read',
    };

    try {
        const command = new PutObjectCommand(params);
        const response = await s3Client.send(command);
        console.log(response);
        const fileURL = `https://${BUCKET_NAME}.s3.amazonaws.com/${filename}`;
        return fileURL;
    } catch (err) {
        console.log('Error uploading to S3:', err);
        throw err;
    }
}
