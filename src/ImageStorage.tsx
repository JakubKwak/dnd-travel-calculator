import { openDB } from "idb";

export async function openImageDB() {
    return openDB('ImageDB', 1, {
        upgrade(db) {
            if (!db.objectStoreNames.contains('images')) {
                db.createObjectStore('images'); // Ensure 'images' store exists
            }
        },
    });
}

export async function saveImageToIndexedDB(file: File) {
    const db = await openImageDB();
    await db.put('images', file, 'uploadedImage');
}

export async function getImageFromIndexedDB() {
    const db = await openImageDB();
    return await db.get('images', 'uploadedImage');
}