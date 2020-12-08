import './App.css';
import PhotoGallery from './components/photoGallery/photoGallery';
import data from './data.json';

function App() {
  return (
    <div className="App">
      <PhotoGallery images={data} />
    </div>
  );
}

export default App;
