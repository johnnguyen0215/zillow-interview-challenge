import './style.css';
import classnames from 'classnames';
import { useEffect, useRef } from 'react';

const Slider = (props) => {
  const {
    images,
    imageNum,
  } = props;

  const imageRefs = useRef([]);

  const sliderRef = useRef(null);
  const prevScreenX = useRef(null);
  const blankImgRef = useRef(null)

  const handleOnDragStart = (event) => {
    event.dataTransfer.setDragImage(blankImgRef.current, 0, 0);
  }

  const handleOnDrag = (event) => {
    processScroll(event.screenX, event.clientY);
  }

  const handleOnDragEnd = (event) => {
    const screenX = event.screenX;
  }

  const processScroll = (screenX) => {
    if (prevScreenX.current && screenX > 0) {
      const difference = prevScreenX.current - screenX;
      sliderRef.current.scrollLeft += difference;
    }

    prevScreenX.current = screenX;
  }

  const checkNeighbors = () => {
    let leftNeighbor = null;
    let rightNeighbor = null;

    if (imageNum === 0) {
    }
  }

  const snapToRight = () => {
  }

  useEffect(() => {
    const image = new Image(0,0);
    image.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
    blankImgRef.current = image;
  }, []);

  useEffect(() => {
    console.log('This effect fired');
    const newActiveImage = imageRefs.current[imageNum];

    if (newActiveImage) {
      newActiveImage.scrollIntoView({
        behavior: 'smooth'
      })
    }
  }, [imageNum]);


  return (
    <div className="slider" ref={sliderRef}>
      {
        images.map((image, index) => {
          const classes = classnames({
            '-active': imageNum === index,
          });
          return (
            <img
              className={classes}
              onDrag={handleOnDrag}
              onDragEnd={handleOnDragEnd}
              onDragStart={handleOnDragStart}
              key={index}src={image.url} alt={image.caption}
              ref={(node) => {
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