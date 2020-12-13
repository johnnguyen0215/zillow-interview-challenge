import './App.css';
import PhotoGallery from './components/photoGallery/photoGallery';
import data from './data.json';
import smoothscroll from 'smoothscroll-polyfill';

smoothscroll.polyfill();

function App() {
  return (
    <div className="App">
      <PhotoGallery images={data} />
    </div>
  );
}

export default App;
