import NavigateBefore from '@material-ui/icons/NavigateBefore';
import NavigateNext from '@material-ui/icons/NavigateNext';
import { Fab } from '@material-ui/core';
import classnames from 'classnames';
import './style.css';
import { useState, useEffect, useRef } from 'react';
import { usePrevious } from '../../customHooks/usePrevious';

const PhotoGallery = (props) => {
  const { images } = props;
  const [imageNum, setImageNum] = useState(1);
  const [buttonsDisabled, setButtonsDisabled] = useState(false);
  const prevImageNum = useRef(imageNum);

  const imageRefs = useRef([]);
  const sliderRef = useRef(null);

  const prevScreenX = useRef(null);
  const prevTouchScreenX = useRef(null);
  const blankImgRef = useRef(null)

  const [galleryImages, setGalleryImages] = useState([]);

  const handleNavigateBefore = () => {
    setButtonsDisabled(true);

    if (imageNum === 1) {
      setImageNum(galleryImages.length - 3);
    } else {
      setImageNum(imageNum - 1);
    }
  }

  const handleNavigateNext = () => {
    setButtonsDisabled(true);

    if (imageNum === (galleryImages.length - 3)) {
      setImageNum(1);
    } else {
      setImageNum(imageNum + 1);
    }
  }

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

  const handleOnDragEnd = () => {
    // scrollToClosestImage();
    // prevScreenX.current = null;
  }

  const handleOnTouchEnd = (event) => {
    console.log(event);
    scrollToClosestImage();
    prevTouchScreenX.current = null;
  }

  const scrollToClosestImage = () => {
    const scrollLeft = sliderRef.current.scrollLeft;

    console.log('scroll left: ', scrollLeft);
    const leftImageIndex = imageRefs?.current?.findIndex((imageRef) => {
      return scrollLeft > imageRef.offsetLeft && scrollLeft < imageRef.offsetLeft + imageRef.offsetWidth;
    });

    const rightImageIndex = leftImageIndex + 1;

    console.log('left: ', leftImageIndex);
    console.log('right: ', rightImageIndex);
    const leftImage = imageRefs.current[leftImageIndex];
    const rightImage = imageRefs.current[rightImageIndex];


    const leftDisplayedWidth = (leftImage.offsetLeft + leftImage.offsetWidth) - scrollLeft;
    const rightDisplayedWidth = (rightImage.offsetWidth - (rightImage.offsetLeft - scrollLeft));

    let closestImageIndex = null;
    let closestImage = null;

    if (leftDisplayedWidth < rightDisplayedWidth) {
      closestImage = leftImage;
      closestImageIndex = rightImageIndex;
    } else {
      closestImage = rightImage;
      closestImageIndex = leftImageIndex;
    }

    // switch(closestImageIndex) {
    //   case 0:
    //   case 5:
    //   case 6:

    // }

    // closestImage.scrollIntoView({
    //   behavior: 'smooth'
    // });

    // prevImageNum.current = closestImageIndex;
    // setImageNum(closestImageIndex);
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

  useEffect(() => {
    if (
      galleryImages.length > 0 &&
      ![0, galleryImages.length - 1, galleryImages.length - 2].includes(imageNum)
    ) {
      let scrollToNum = null;

      if (imageNum > prevImageNum.current) {
        if ((prevImageNum.current === 1) && imageNum === (galleryImages.length - 3)) {
          sliderRef.current.scrollLeft = imageRefs.current[galleryImages.length - 2].offsetLeft;
          scrollToNum = galleryImages.length - 3;
        } else {
          scrollToNum = imageNum;
        }
      } else if (imageNum < prevImageNum.current) {
        if ((prevImageNum.current === galleryImages.length -3) && imageNum === 1) {
          sliderRef.current.scrollLeft = imageRefs.current[0].offsetLeft;
          scrollToNum = 1;
        } else {
          scrollToNum = imageNum;
        }
      }

      if (scrollToNum) {
        imageRefs.current[scrollToNum].scrollIntoView({
          behavior: 'smooth'
        })

        setTimeout(() => {
          setButtonsDisabled(false);
        }, 1000)
      }

      prevImageNum.current = scrollToNum;
    }

  }, [imageNum, galleryImages, prevImageNum])


  return (
    <div className="photo-gallery">
      <Fab disabled={buttonsDisabled} onClick={handleNavigateBefore} className="fab-button -left">
        <NavigateBefore fontSize="large" />
      </Fab>
      <div className="slider" ref={sliderRef}>
        {
          galleryImages.map((image, index) => {
            const classes = classnames({
              'image-container': true,
              '-active': imageNum === index,
            });
            return (
              <div
                className={classes}
                onDrag={handleOnDrag}
                onDragEnd={handleOnDragEnd}
                onDragStart={handleOnDragStart}
                onTouchMove={handleOnTouchMove}
                onTouchEnd={handleOnTouchEnd}
                ref={(node) => {
                  imageRefs.current[index] = node;
                }}
                key={index}
              >
                <img
                  src={image.url}
                  alt={image.caption}

                />
              </div>
            );
          })
        }
      </div>
      <Fab disabled={buttonsDisabled} onClick={handleNavigateNext} className="fab-button -right">
        <NavigateNext fontSize="large" />
      </Fab>
    </div>
  )
}

export default PhotoGallery;