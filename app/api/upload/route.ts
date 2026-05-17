import { NextRequest, NextResponse } from 'next/server'
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'

const s3 = new S3Client({
  endpoint: process.env.MINIO_ENDPOINT || 'http://minio:9000',
  region: 'us-east-1',
  credentials: {
    accessKeyId: process.env.MINIO_ACCESS_KEY || 'minioadmin',
    secretAccessKey: process.env.MINIO_SECRET_KEY || 'minioadmin123',
  },
  forcePathStyle: true,
})

const BUCKET = 'listings'
const PUBLIC_URL = process.env.MINIO_PUBLIC_URL || 'https://airbb.serghini.me/storage'

export async function POST(req: NextRequest) {
  const formData = await req.formData()
  const file = formData.get('file') as File | null
  if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 })

  const buffer = Buffer.from(await file.arrayBuffer())
  const ext = file.name.split('.').pop() || 'jpg'
  const key = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

  await s3.send(new PutObjectCommand({
    Bucket: BUCKET,
    Key: key,
    Body: buffer,
    ContentType: file.type || 'image/jpeg',
  }))

  return NextResponse.json({ url: `${PUBLIC_URL}/${BUCKET}/${key}` })
}
