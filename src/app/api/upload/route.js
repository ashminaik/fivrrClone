import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

function isCloudinaryConfigured() {
    const name = process.env.CLOUDINARY_CLOUD_NAME || '';
    const key = process.env.CLOUDINARY_API_KEY || '';
    const secret = process.env.CLOUDINARY_API_SECRET || '';
    // Detect placeholder values
    if (!name || !key || !secret) return false;
    if (name.includes('your-') || key.includes('your-') || secret.includes('your-')) return false;
    return true;
}

const useCloudinary = isCloudinaryConfigured();

export async function POST(request) {
    try {
        const formData = await request.formData();
        const file = formData.get('file');

        if (!file) {
            return NextResponse.json({ error: 'No file provided' }, { status: 400 });
        }

        // Validate file type
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        if (!allowedTypes.includes(file.type)) {
            return NextResponse.json({ error: 'Only JPG, PNG, GIF, WEBP images are allowed' }, { status: 400 });
        }

        // Validate file size (5MB max)
        const maxSize = 5 * 1024 * 1024;
        if (file.size > maxSize) {
            return NextResponse.json({ error: 'File size must be under 5MB' }, { status: 400 });
        }

        if (useCloudinary) {
            // Upload to Cloudinary
            const { v2: cloudinary } = await import('cloudinary');
            cloudinary.config({
                cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
                api_key: process.env.CLOUDINARY_API_KEY,
                api_secret: process.env.CLOUDINARY_API_SECRET,
            });

            const bytes = await file.arrayBuffer();
            const buffer = Buffer.from(bytes);
            const base64 = `data:${file.type};base64,${buffer.toString('base64')}`;

            const result = await cloudinary.uploader.upload(base64, {
                folder: 'fivrr/gigs',
                resource_type: 'image',
            });

            return NextResponse.json({ secure_url: result.secure_url, public_id: result.public_id });
        } else {
            // Save to local storage (public/uploads/)
            const bytes = await file.arrayBuffer();
            const buffer = Buffer.from(bytes);

            const ext = path.extname(file.name) || '.jpg';
            const filename = `${uuidv4()}${ext}`;
            const uploadDir = path.join(process.cwd(), 'public', 'uploads');

            await mkdir(uploadDir, { recursive: true });
            await writeFile(path.join(uploadDir, filename), buffer);

            const secure_url = `/uploads/${filename}`;
            return NextResponse.json({ secure_url, public_id: filename });
        }
    } catch (error) {
        console.error('Upload API error:', error);
        return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
    }
}
