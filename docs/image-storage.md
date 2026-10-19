# Image storage

Managed images use Cloudinary. The backend reads CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET from backend/.env. This file is ignored by Git; the secret is never sent to the frontend.

Image controls support:
- Image URL: paste a publicly accessible HTTP/HTTPS image URL and click Upload URL. The image is copied into Cloudinary before the record can be saved.
- From device: choose a JPG, PNG, WebP or GIF from the device file picker. Upload starts automatically. Maximum file size: 5 MB.

The returned HTTPS URL is stored with the product, category, brand or content record. Image preview, removal and upload error feedback are included. Saving waits while an upload or unapplied URL is pending.

Product images can be set while creating or editing a product. Existing images load from that product's image records.

Existing image migration, from the backend directory:

    npm run media:migrate:cloudinary
    npm run media:migrate:cloudinary -- --apply

The first command lists pending database images. The second copies managed images and the three editorial photos to Cloudinary, updates database/source references, and records the editorial mapping in frontend/public/images/home/cloudinary.json. Existing files remain available as originals. Existing Cloudinary URLs are skipped.

Signed uploads follow the [Cloudinary Upload API](https://cloudinary.com/documentation/image_upload_api_reference). No unsigned preset is required.
