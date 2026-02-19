'use client';

import { useState } from 'react';

export default function ImageUpload({ images = [], setImages }) {
    const [uploading, setUploading] = useState(false);

    const handleFileChange = async (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;

        setUploading(true);
        try {
            const uploadPromises = files.map(async (file) => {
                const formData = new FormData();
                formData.append('file', file);
                formData.append('upload_preset', 'fivrr_uploads'); // You'll set this in Cloudinary

                const res = await fetch('/api/upload', {
                    method: 'POST',
                    body: formData,
                });

                if (res.ok) {
                    const data = await res.json();
                    return data.secure_url;
                }
                throw new Error('Upload failed');
            });

            const urls = await Promise.all(uploadPromises);
            setImages((prev) => [...prev, ...urls]);
        } catch (err) {
            console.error('Upload error:', err);
            alert('Failed to upload images. Please try again.');
        } finally {
            setUploading(false);
        }
    };

    const removeImage = (index) => {
        setImages((prev) => prev.filter((_, i) => i !== index));
    };

    return (
        <div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '0.75rem' }}>
                {images.map((url, index) => (
                    <div key={index} style={{ position: 'relative', width: 120, height: 120, borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--color-border)' }}>
                        <img src={url} alt={`Upload ${index + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        <button
                            type="button"
                            onClick={() => removeImage(index)}
                            style={{
                                position: 'absolute',
                                top: '0.25rem',
                                right: '0.25rem',
                                background: 'rgba(0,0,0,0.7)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '50%',
                                width: '24px',
                                height: '24px',
                                cursor: 'pointer',
                                fontSize: '0.75rem',
                            }}
                        >
                            ×
                        </button>
                    </div>
                ))}
            </div>
            <label className="btn btn-secondary" style={{ cursor: 'pointer', display: 'inline-block' }}>
                {uploading ? 'Uploading...' : '+ Add Images'}
                <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleFileChange}
                    disabled={uploading}
                    style={{ display: 'none' }}
                />
            </label>
            <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginTop: '0.5rem' }}>
                Upload up to 5 images (JPG, PNG, max 5MB each)
            </p>
        </div>
    );
}
