import './App.css';
import PhotoGallery from './components/photoGallery/photoGallery';
import data from './data.json';
import smoothscroll from 'smoothscroll-polyfill';

smoothscroll.polyfill();

function App() {
  return (
    <div className="App">
      <h1 className="heading">Slider App</h1>
      <PhotoGallery images={data} />
    </div>
  );
}

export default App;
