import React, { useEffect, useState } from 'react';
import { Routes, Route, useNavigate, useLocation, HashRouter } from 'react-router-dom';
import './App.css';
import { ImageViewerWithRouter } from './components/MapViewer';
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
      {window.innerWidth <= 768 &&
        <div className='pixelify-sans flex flex-col items-center'>
          <div className='max-w-96 flex justify-center items-center mx-8 mb-16'>
            <img src='map256x256.png' className='h-20 w-20'></img>
            <h1 className='jacquard-12-regular text-4xl'>D&D Travel Calculator</h1>
          </div>
          <div className='mx-8'>
            <p className='text-xl'>
              Sorry! Touch screen devices are not supported. Try again on a desktop computer or laptop.
            </p>
          </div>
        </div>
      }
      {
        /* Don't even both trying to support mobile */
        window.innerWidth > 768 &&
        <>
          <div className='flex items-center gap-8 mb-20'>
            <img src='map256x256.png' className='h-36 w-36'></img>
            <h1 className='jacquard-12-regular text-8xl'>D&D Travel Calculator</h1>
          </div>
          <div className="pixelify-sans">
            <div className="flex flex-col items-center gap-3">
              <label
                htmlFor="imageInput"
                className="px-4 py-2 bg-orange-500 text-white cursor-pointer hover:bg-orange-600 font-semibold text-2xl"
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
              <p>Example map image: <a
                href='https://www.dndbeyond.com/resources/1782-map-of-faerun'
                className='text-blue-500 hover:text-blue-400'
              >
                Faerûn
              </a>
              </p>
              {selectedImage && (
                <div className="bg-gray-700 bg-opacity-30 text-white text-center py-2 px-2 z-50 max-w-72 max-h-100 flex flex-col gap-3">
                  <img
                    className=''
                    src={URL.createObjectURL(selectedImage)}
                    alt="Uploaded map"
                  />
                  <button
                    onClick={handleSubmit}
                    className="px-4 py-2 bg-gray-500 text-white hover:bg-gray-600 text-xl"
                  >
                    Create Map From Image
                  </button>
                </div>
              )}
              {stateExists &&
                <button
                  onClick={() => navigate('/viewer')}
                  className="px-4 py-2 bg-gray-500 text-white hover:bg-gray-600 text-xl"
                >
                  Continue Previous Map
                </button>
              }
            </div>
          </div>
        </>
      }
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

// TODO wtf man
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