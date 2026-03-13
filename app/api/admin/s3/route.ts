import { S3Client, PutObjectCommand, ListObjectsV2Command } from "@aws-sdk/client-s3";
import { NextResponse } from "next/server";

function getS3Client(req: Request) {
  const region = req.headers.get("x-aws-region");
  const accessKeyId = req.headers.get("x-aws-access-key");
  const secretAccessKey = req.headers.get("x-aws-secret-key");

  if (!region || !accessKeyId || !secretAccessKey) {
    throw new Error("Missing AWS credentials in headers");
  }

  return new S3Client({
    region,
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
  });
}

export async function POST(req: Request) {
  try {
    const s3 = getS3Client(req);
    const bucket = req.headers.get("x-aws-bucket");
    if (!bucket) throw new Error("Missing AWS bucket in headers");

    const body = await req.json();
    const { base64, filename } = body;
    
    // Determine content type based on filename extension
    let contentType = "image/png";
    if (filename.endsWith('.mp3')) contentType = "audio/mpeg";
    else if (filename.endsWith('.wav')) contentType = "audio/wav";
    else if (filename.endsWith('.jpg') || filename.endsWith('.jpeg')) contentType = "image/jpeg";

    // Convert base64 to buffer
    const base64Data = base64.replace(/^data:(image|audio)\/\w+;base64,/, "");
    const buffer = Buffer.from(base64Data, "base64");

    const command = new PutObjectCommand({
      Bucket: bucket,
      Key: filename,
      Body: buffer,
      ContentType: contentType,
      // ACL: "public-read", // Optional, depending on bucket policy
    });

    await s3.send(command);

    const url = `https://${bucket}.s3.${req.headers.get("x-aws-region")}.amazonaws.com/${filename}`;
    return NextResponse.json({ url, success: true });
  } catch (error: any) {
    console.error("S3 Upload Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const s3 = getS3Client(req);
    const bucket = req.headers.get("x-aws-bucket");
    if (!bucket) throw new Error("Missing AWS bucket in headers");

    const command = new ListObjectsV2Command({
      Bucket: bucket,
    });

    const response = await s3.send(command);
    const files = response.Contents?.map(item => ({
      key: item.Key,
      url: `https://${bucket}.s3.${req.headers.get("x-aws-region")}.amazonaws.com/${item.Key}`,
      lastModified: item.LastModified,
    })) || [];

    return NextResponse.json({ files });
  } catch (error: any) {
    console.error("S3 List Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
