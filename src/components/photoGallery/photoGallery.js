import NavigateBefore from '@material-ui/icons/NavigateBefore';
import NavigateNext from '@material-ui/icons/NavigateNext';
import Slider from '../slider/slider';
import './style.css';
import { useState } from 'react';

const PhotoGallery = (props) => {
  const { images } = props;

  const [imageNum, setImageNum] = useState(1);

  const handleNavigateBefore = () => {
    if (imageNum === 0) {
      setImageNum(images.length - 1);
    } else {
      setImageNum(imageNum - 1);
    }
  }

  const handleNavigateNext = () => {
    if (imageNum.current === images?.length - 1) {
      setImageNum(0);
    } else {
      setImageNum(imageNum + 1);
    }
  }


  return (
    <div className="photo-gallery">
      <button className="nav-button" onClick={handleNavigateBefore}>
        <NavigateBefore style={{ color: 'white' }} fontSize="large" />
      </button>
      <Slider images={images} imageNum={imageNum} />
      <button className="nav-button" onClick={handleNavigateNext}>
        <NavigateNext style={{ color: 'white' }} fontSize="large" />
      </button>
    </div>
  )
}

export default PhotoGallery;