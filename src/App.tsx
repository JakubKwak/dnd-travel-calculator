import React, { useEffect, useState } from 'react';
import { Routes, Route, useNavigate, useLocation, HashRouter } from 'react-router-dom';
import './App.css';
import { ImageViewerWithRouter } from './MapViewer';
import { getImageFromIndexedDB, saveImageToIndexedDB } from './ImageStorage';


function App() {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [stateExists, setStateExists] = useState<boolean>(false);
  const navigate = useNavigate();

  // Handle file selection
  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedImage(file); // Preview the image
    }
  };

  const fetchImage = async () => {
    try {
      const file = await getImageFromIndexedDB();
      if (file) {
        setSelectedImage(file);
      }
    } catch (error) {
      console.error('Error fetching image from IndexedDB:', error);
    }
  };

  useEffect(() => {
    fetchImage();
    const savedState = localStorage.getItem('appState');
    if (savedState) {
      setStateExists(true);
    }
  }, []);

  const handleSubmit = async () => {
    if (selectedImage) {
      localStorage.clear(); // Clear the previous state
      await saveImageToIndexedDB(selectedImage); // Save to IndexedDB
      navigate('/viewer');
    }
  };

  return (
    <>
      <h1>D&D Travel Calculator</h1>
      <div className="card">
        <div className="flex flex-col items-center gap-3">
          <label
            htmlFor="imageInput"
            className="px-4 py-2 bg-blue-500 text-white rounded cursor-pointer hover:bg-blue-600 font-semibold"
          >
            Upload New Map Image
          </label>
          <input
            type="file"
            accept="image/*"
            className="hidden"
            id="imageInput"
            onChange={handleImageUpload}
          />
          {selectedImage && (
            <div className="bg-gray-700 bg-opacity-30 text-white text-center py-2 px-2 rounded z-50 max-w-72 max-h-100 flex flex-col gap-3">
              <img
              className='rounded'
                src={URL.createObjectURL(selectedImage)}
                alt="Uploaded map"
              />
              <button
                onClick={handleSubmit}
                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
              >
                Create Map From Image
              </button>
            </div>
          )}
          {stateExists &&
            <button
              onClick={() => navigate('/viewer')}
              className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
            >
              Continue Previous Map
            </button>
          }
          {window.innerWidth <= 768 && 
            <p>Warning: touch screen devices not supported.</p>
          }
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
    <HashRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/viewer/" element={<ImageViewerWithRouter />} />
      </Routes>
    </HashRouter>
  );
}

export default Root;
