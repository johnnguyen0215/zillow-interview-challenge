import NavigateBefore from '@material-ui/icons/NavigateBefore';
import NavigateNext from '@material-ui/icons/NavigateNext';
import { Fab } from '@material-ui/core';
import classnames from 'classnames';
import './style.css';
import { useState, useEffect, useRef, useCallback, useLayoutEffect } from 'react';
import ClampLines from 'react-clamp-lines';

const PhotoGallery = (props) => {
  const { images } = props;
  const [imageNum, setImageNum] = useState(1);
  const [buttonsDisabled, _setButtonsDisabled] = useState(false);
  const buttonsDisabledRef = useRef(buttonsDisabled);

  const prevInnerWidth = useRef(null);

  const mouseDownElement = useRef(null);
  const prevImageNum = useRef(imageNum);

  const imageRefs = useRef([]);
  const sliderRef = useRef(null);

  const prevPageX = useRef(null);
  const prevTouchClientX = useRef(null);
  const blankImgRef = useRef(null)

  const reverse = useRef(false);

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
    } else if (imageNum === galleryLength - 2) {
      setImageNum(2);
    } else if (imageNum === galleryLength - 1) {
      setImageNum(3);
    }  else {
      setImageNum(imageNum + 1);
    }
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

  const handleOnTouchMove = (event) => {
    const { touches } = event;
    const touch = touches && touches[0];
    processScroll(touch.pageX, prevTouchClientX);
  }

  const handleOnResize = useCallback((event) => {
    const currentInnerWidth = event.target.innerWidth;

    if (prevInnerWidth.current) {
      if ((prevInnerWidth.current > 1200 &&  currentInnerWidth <= 1200) || (prevInnerWidth.current < 1200 &&  currentInnerWidth >= 1200)) {
        sliderRef.current.scrollLeft = imageRefs.current[imageNum].offsetLeft;
        prevInnerWidth.current = currentInnerWidth;
      } else if ((prevInnerWidth.current > 992 && currentInnerWidth <= 992) || (prevInnerWidth.current < 992 && currentInnerWidth >= 992)) {
        sliderRef.current.scrollLeft = imageRefs.current[imageNum].offsetLeft;
        prevInnerWidth.current = currentInnerWidth;
      } else if ((prevInnerWidth.current > 768 && currentInnerWidth <= 768) || (prevInnerWidth.current < 768 && currentInnerWidth >= 768)) {
        sliderRef.current.scrollLeft = imageRefs.current[imageNum].offsetLeft;
        prevInnerWidth.current = currentInnerWidth;
      } else if ((prevInnerWidth.current > 480 && currentInnerWidth <= 480) || (prevInnerWidth.current < 480 && currentInnerWidth >= 480)) {
        sliderRef.current.scrollLeft = imageRefs.current[imageNum].offsetLeft;
        prevInnerWidth.current = currentInnerWidth;
      }
    }

    prevInnerWidth.current = currentInnerWidth;
  }, [imageNum]);

  const scrollToSlide = (slideElement) => {
    sliderRef.current.scrollTo({
      top: 0,
      left: slideElement.offsetLeft,
      behavior: 'smooth'
    })
  }

  const handleOnTouchEnd = (event) => {
    scrollToClosestImage();
    prevTouchClientX.current = null;
  }

  const scrollToClosestImage = (instant) => {
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

    scrollToSlide(closestImage)

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
        scrollToSlide(imageRefs.current[scrollToNum]);

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
    window.addEventListener('resize', handleOnResize);

    return () => {
      window.document.removeEventListener('mouseup', handleOnMouseUp);
      window.document.removeEventListener('mousemove', handleOnMouseMove);
      window.removeEventListener('resize', handleOnResize);
    }
  }, [handleOnMouseUp, handleOnMouseMove, handleOnResize]);

  return (
    <div className="photo-gallery">
      <Fab disabled={buttonsDisabled} onClick={handleNavigateBefore} className="fab-button -left">
        <NavigateBefore fontSize="large" />
      </Fab>
      <div className="slider" ref={sliderRef}>
        {
          galleryImages.current.map((image, index) => {
            const classes = classnames({
              'slide-container': true,
              '-active': imageNum === index,
            });
            return (
              <div
                className={classes}
                onMouseDown={handleOnMouseDown}
                onTouchMove={handleOnTouchMove}
                onTouchEnd={handleOnTouchEnd}
                ref={(node) => {
                  imageRefs.current[index] = node;
                }}
                key={index}
              >
                <div className="img-caption-container">
                  <ClampLines
                    text={image.caption}
                    id={`clamp-${index}`}
                    lines={2}
                    ellipsis="..."
                    moreText="Expand"
                    lessText="Collapse"
                    innerElement="p"
                  />
                </div>
                <div className="image-container">
                  <img
                    className="gallery-img"
                    draggable="false"
                    src={image.url}
                    alt="dog"
                    loading="lazy"
                  / >
                </div>
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