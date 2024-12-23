import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import './App.css';
import { ImageViewerWithRouter } from './MapViewer';
import { openDB } from 'idb';

async function openImageDB() {
  return openDB('ImageDB', 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains('images')) {
        db.createObjectStore('images'); // Ensure 'images' store exists
      }
    },
  });
}

async function saveImageToIndexedDB(file: File) {
  const db = await openImageDB();
  await db.put('images', file, 'uploadedImage');
}

async function getImageFromIndexedDB() {
  const db = await openImageDB();
  return await db.get('images', 'uploadedImage');
}

function App() {
  const [existing, setExisting] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const navigate = useNavigate();

  // Handle file selection
  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedImage(URL.createObjectURL(file)); // Preview the image
      await saveImageToIndexedDB(file); // Save to IndexedDB
    }
  };

  useEffect(() => {
    const fetchImage = async () => {
      try {
        const file = await getImageFromIndexedDB();
        if (file) {
          setSelectedImage(URL.createObjectURL(file));
        }
      } catch (error) {
        console.error('Error fetching image from IndexedDB:', error);
      }
    };
    fetchImage();
  }, []);

  const handleContinue = () => {
    if (selectedImage) {
      navigate('/viewer', { state: { imageUrl: selectedImage } });
    }
  };

  return (
    <>
      <h1>D&D Travel Mapper</h1>
      <div className="card">
        <div className="flex flex-col items-center gap-3">
          <label
            htmlFor="imageInput"
            className="px-4 py-2 bg-blue-500 text-white rounded cursor-pointer hover:bg-blue-600 font-semibold"
          >
            Upload Image
          </label>
          <input
            type="file"
            accept="image/*"
            className="hidden"
            id="imageInput"
            onChange={handleImageUpload}
          />
          {selectedImage && (
            <div className="mt-4 bg-gray-700 bg-opacity-30 text-white text-center py-2 px-6 rounded-lg shadow-lg z-50 max-w-72 max-h-100 flex flex-col gap-3">
              <img
                src={selectedImage}
                alt="Uploaded map"
              />
              <button
                onClick={handleContinue}
                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
              >
                Continue
              </button>
            </div>
          )}
          <button
            onClick={() => setExisting(true)}
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            Use Existing Config: {existing.toString()}
          </button>
        </div>
      </div>
    </>
  );
}

export function withRouter(Component: any) {
  return (props: any) => {
    const navigate = useNavigate();
    const location = useLocation();
    return <Component {...props} navigate={navigate} location={location} />;
  };
}

function Root() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/viewer" element={<ImageViewerWithRouter />} />
      </Routes>
    </BrowserRouter>
  );
}

export default Root;
