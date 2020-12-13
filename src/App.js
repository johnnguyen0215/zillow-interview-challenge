import './App.css';
import PhotoGallery from './components/photoGallery/photoGallery';
import data from './data.json';
import smoothscroll from 'smoothscroll-polyfill';
import { useEffect, useState } from 'react';

smoothscroll.polyfill();

function App() {
  const [images, setImages ] = useState([]);

  useEffect(() => {
    if (data.length === 1) {
      setImages([data[0]]);
    } else {
      setImages(
        [
          data[data.length - 1],
          ...data,
          data[0],
          data[1],
        ]
      );
    }
  }, []);

  return (
    <div className="App">
      <h1 className="heading">Slider App</h1>
      {
        images.length > 0 &&
        <PhotoGallery images={images} />
      }
    </div>
  );
}

export default App;
