import NavigateBefore from '@material-ui/icons/NavigateBefore';
import NavigateNext from '@material-ui/icons/NavigateNext';
import { Fab } from '@material-ui/core';
import classnames from 'classnames';
import './style.css';
import { useState, useEffect, useRef, useCallback, useLayoutEffect } from 'react';

const PhotoGallery = (props) => {
  const { images } = props;
  const [imageNum, setImageNum] = useState(1);
  const [buttonsDisabled, _setButtonsDisabled] = useState(false);
  const buttonsDisabledRef = useRef(buttonsDisabled);

  const mouseDownElement = useRef(null);
  const prevImageNum = useRef(imageNum);

  const imageRefs = useRef([]);
  const sliderRef = useRef(null);

  const prevPageX = useRef(null);
  const prevTouchClientX = useRef(null);
  const blankImgRef = useRef(null)

  const galleryImages = useRef([
    images[images.length - 1],
    ...images,
    images[0],
    images[1]
  ]);

  const setButtonsDisabled = (disabledValue) => {
    buttonsDisabledRef.current = disabledValue;
    _setButtonsDisabled(disabledValue);
  }

  const processScroll = useCallback((pageX, prevPageXRef) => {
    if (sliderRef.current.scrollLeft >= imageRefs.current[galleryImages.current.length - 2].offsetLeft && !reverse.current) {
      sliderRef.current.scrollLeft = imageRefs.current[1].offsetLeft;
      reverse.current = false;
    }

    if (sliderRef.current.scrollLeft >= imageRefs.current[galleryImages.current.length - 1].offsetLeft && reverse.current) {
      sliderRef.current.scrollLeft = imageRefs.current[2].offsetLeft;
      reverse.current = false;
    }

    if (sliderRef.current.scrollLeft <= imageRefs.current[1].offsetLeft) {
      sliderRef.current.scrollLeft = imageRefs.current[galleryImages.current.length - 2].offsetLeft;
      reverse.current = true;
    }

    if (prevPageXRef.current) {
      const difference = prevPageXRef.current - pageX;
      sliderRef.current.scrollLeft += difference;
    }

    prevPageXRef.current = pageX;
  }, [galleryImages]);


  const handleNavigateBefore = () => {
    setButtonsDisabled(true);

    if (imageNum === 1) {
      setImageNum(galleryImages.current.length - 3);
    } else {
      setImageNum(imageNum - 1);
    }
  }

  const isGalleryImage = (element) => {
    return element?.classList?.contains('gallery-img');
  }

  const handleNavigateNext = () => {
    setButtonsDisabled(true);

    const galleryLength = galleryImages.current.length;

    if (imageNum === galleryLength - 3) {
      setImageNum(1);
    } else if (imageNum === galleryLength - 1) {
      setImageNum(3);
    } else if (imageNum === galleryLength - 2) {
      setImageNum(2);
    } else {
      setImageNum(imageNum + 1);
    }
  }

  const reverse = useRef(false);

  const handleImageDrag = (event) => {
    event.dataTransfer.setDragImage(blankImgRef.current, 0, 0);
  }

  const handleOnMouseDown = (event) => {
    if (!buttonsDisabledRef.current) {
      mouseDownElement.current = event.target;
    }
  }

  const handleOnMouseMove = useCallback((event) => {
    if (isGalleryImage(mouseDownElement.current) && !buttonsDisabledRef.current) {
      processScroll(event.pageX, prevPageX);
    }
  }, [mouseDownElement, processScroll, buttonsDisabledRef]);

  const handleOnMouseUp = useCallback(() => {
    if (isGalleryImage(mouseDownElement.current) && !buttonsDisabledRef.current) {
      scrollToClosestImage();
      mouseDownElement.current = null;
      prevPageX.current = null;
    }

  }, [mouseDownElement, buttonsDisabledRef]);

  // const handleOnDrag = (event) => {
  //   console.log(event);
  //   processScroll(event.pageX, prevClientX);
  // }

  const handleOnTouchMove = (event) => {
    const { touches } = event;
    const touch = touches && touches[0];
    processScroll(touch.pageX, prevTouchClientX);
  }

  // const handleOnDragEnd = () => {
  //   scrollToClosestImage();
  //   prevClientX.current = null;
  // }

  const handleOnTouchEnd = (event) => {
    scrollToClosestImage();
    prevTouchClientX.current = null;
  }

  const scrollToClosestImage = () => {
    const scrollLeft = sliderRef.current.scrollLeft;

    const leftImageIndex = imageRefs?.current?.findIndex((imageRef) => {
      return scrollLeft >= imageRef.offsetLeft && scrollLeft < imageRef.offsetLeft + imageRef.offsetWidth;
    });

    const rightImageIndex = leftImageIndex + 1;

    const leftImage = imageRefs.current[leftImageIndex];
    const rightImage = imageRefs.current[rightImageIndex];

    const leftDisplayedWidth = (leftImage.offsetLeft + leftImage.offsetWidth) - scrollLeft;
    const rightDisplayedWidth = (rightImage.offsetWidth - (rightImage.offsetLeft - scrollLeft));

    let closestImageIndex = null;
    let closestImage = null;

    if (leftDisplayedWidth < rightDisplayedWidth) {
      closestImage = rightImage;
      closestImageIndex = rightImageIndex;
    } else {
      closestImage = leftImage;
      closestImageIndex = leftImageIndex;
    }

    closestImage.scrollIntoView({
      behavior: 'smooth'
    });

    prevImageNum.current = closestImageIndex;
    setImageNum(closestImageIndex);
  }

  useLayoutEffect(() => {
    const image = new Image(0,0);
    image.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
    blankImgRef.current = image;

    if (imageRefs.current.length > 0) {
      sliderRef.current.scrollLeft = imageRefs.current[1].offsetLeft;
    }
  }, []);

  useEffect(() => {
    const prevNum = prevImageNum.current;
    const galleryLength = galleryImages.current?.length;
    const slider = sliderRef.current;
    const imgRefs = imageRefs.current;

    if (
      galleryLength > 0 &&
      prevNum !== imageNum
    ) {
      let scrollToNum = null;

      if (prevNum === galleryLength - 2 && imageNum === 2) {
        slider.scrollLeft = imgRefs[1].offsetLeft;
        scrollToNum = imageNum;
      } else if (prevNum === galleryLength - 1 && imageNum === 3) {
        slider.scrollLeft = imgRefs[2].offsetLeft;
        scrollToNum = imageNum;
      } else if (prevNum === 0 && imageNum === galleryLength - 4) {
        slider.scrollLeft = imgRefs[4].offsetLeft;
        scrollToNum = imageNum;
      }  else if (imageNum > prevNum) {
        if ((prevNum === 1) && imageNum === (galleryLength - 3)) {
          slider.scrollLeft = imgRefs[galleryLength - 2].offsetLeft;
          scrollToNum = galleryLength - 3;
        } else {
          scrollToNum = imageNum;
        }
      } else if (imageNum < prevNum) {
        if ((prevNum === galleryLength -3) && imageNum === 1) {
          slider.scrollLeft = imgRefs[0].offsetLeft;
          scrollToNum = 1;
        } else {
          scrollToNum = imageNum;
        }
      }

      if (scrollToNum) {
        imageRefs.current[scrollToNum].scrollIntoView({
          behavior: 'smooth'
        })

        prevImageNum.current = scrollToNum;

        setTimeout(() => {
          setButtonsDisabled(false);
        }, 1000)
      }
    }
  }, [imageNum, galleryImages, prevImageNum])

  useEffect(() => {
    window.document.addEventListener('mouseup', handleOnMouseUp)
    window.document.addEventListener('mousemove', handleOnMouseMove);

    return () => {
      window.removeEventListener('mouseup', handleOnMouseUp);
      window.removeEventListener('mousemove', handleOnMouseMove);
    }
  }, [handleOnMouseUp, handleOnMouseMove]);

  return (
    <div className="photo-gallery">
      <Fab disabled={buttonsDisabled} onClick={handleNavigateBefore} className="fab-button -left">
        <NavigateBefore fontSize="large" />
      </Fab>
      <div className="slider" ref={sliderRef}>
        {
          galleryImages.current.map((image, index) => {
            const classes = classnames({
              'image-container': true,
              '-active': imageNum === index,
            });
            return (
              <div
                className={classes}
                onMouseDown={handleOnMouseDown}
                onTouchMove={handleOnTouchMove}
                onTouchEnd={handleOnTouchEnd}
                onDrag={handleImageDrag}
                ref={(node) => {
                  imageRefs.current[index] = node;
                }}
                key={index}
              >
                <img
                  className="gallery-img"
                  draggable="false"
                  src={image.url}
                  alt={image.caption}
                >
                </img>
                <div className="img-caption">{image.caption}</div>
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