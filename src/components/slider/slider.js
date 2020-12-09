import './style.css';
import classnames from 'classnames';
import { useEffect, useRef, useState } from 'react';

const Slider = (props) => {
  const {
    images,
    imageNum,
  } = props;

  const imageRefs = useRef([]);
  const sliderRef = useRef(null);

  const prevScreenX = useRef(null);
  const prevTouchScreenX = useRef(null);
  const blankImgRef = useRef(null)

  const [galleryImages, setGalleryImages] = useState([]);

  const reverse = useRef(false);

  const handleOnDragStart = (event) => {
    event.dataTransfer.setDragImage(blankImgRef.current, 0, 0);
  }

  const handleOnDrag = (event) => {
    processScroll(event.screenX, prevScreenX);
  }

  const handleOnTouchMove = (event) => {
    const { touches } = event;

    const touch = touches && touches[0];

    processScroll(touch.screenX, prevTouchScreenX);
  }

  const handleOnDragEnd = (event) => {
    prevScreenX.current = null;
  }

  const handleOnTouchEnd = (event) => {
    prevTouchScreenX.current = null;
  }

  const processScroll = (screenX, prevScreenXRef) => {
    if (sliderRef.current.scrollLeft >= imageRefs.current[galleryImages.length - 2].offsetLeft && !reverse.current) {
      sliderRef.current.scrollLeft = imageRefs.current[1].offsetLeft;
      reverse.current = false;
    }

    if (sliderRef.current.scrollLeft >= imageRefs.current[galleryImages.length - 1].offsetLeft && reverse.current) {
      sliderRef.current.scrollLeft = imageRefs.current[2].offsetLeft;
      reverse.current = false;
    }

    if (sliderRef.current.scrollLeft <= imageRefs.current[1].offsetLeft) {
      sliderRef.current.scrollLeft = imageRefs.current[galleryImages.length - 2].offsetLeft;
      reverse.current = true;
    }

    if (prevScreenXRef.current && screenX > 0) {
      const difference = prevScreenXRef.current - screenX;

      sliderRef.current.scrollLeft += difference;
    }

    prevScreenXRef.current = screenX;
  }

  useEffect(() => {
    const image = new Image(0,0);
    image.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
    blankImgRef.current = image;

    console.log(imageRefs.current);

    // The 3 is to account for the cloned images for smoother behavior.
    if (imageRefs.current.length > 0) {
      sliderRef.current.scrollLeft = imageRefs.current[1].offsetLeft;
    }
  }, [galleryImages]);


  useEffect(() => {
    let imagesWithClones = images;

    if (images.length > 1) {
      imagesWithClones = [
        images[images.length - 1],
        ...images,
        images[0],
        images[1]
      ]
    }

    setGalleryImages(imagesWithClones);
  }, [images]);

  return (
    <div className="slider" ref={sliderRef}>
      {
        galleryImages.map((image, index) => {
          const classes = classnames({
            '-active': imageNum === index,
          });
          return (
            <img
              className={classes}
              onDrag={handleOnDrag}
              onDragEnd={handleOnDragEnd}
              onDragStart={handleOnDragStart}
              onTouchMove={handleOnTouchMove}
              onTouchEnd={handleOnTouchEnd}
              key={index}src={image.url}
              alt={image.caption}
              ref={(node) => {
                console.log('Before this');
                imageRefs.current[index] = node;
              }}
            />
          );
        })
      }
    </div>
  )
}

export default Slider;