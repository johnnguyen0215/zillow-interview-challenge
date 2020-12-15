import './App.css';
import PhotoGallery from './components/photoGallery/photoGallery';
import smoothscroll from 'smoothscroll-polyfill';
import { useEffect, useState } from 'react';

smoothscroll.polyfill();

function App() {
  const [images, setImages ] = useState([]);
  const [imageData, setImageData] = useState([]);

  const getData = async () => {
    let data = null

    try {
      data = await fetch('./data.json', {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
    } catch (err) {
      throw err;
    }

    return data.json();
  }

  useEffect(() => {
    const fetchData = async () => {
      const data = await getData();

      setImageData(data);
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (imageData.length === 1) {
      setImages([imageData[0]]);
    } else if (imageData.length > 1) {
      setImages(
        [
          imageData[imageData.length - 1],
          ...imageData,
          imageData[0],
          imageData[1],
        ]
      );
    }
  }, [imageData]);

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
