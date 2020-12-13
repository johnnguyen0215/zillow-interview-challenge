import NavigateBefore from '@material-ui/icons/NavigateBefore';
import NavigateNext from '@material-ui/icons/NavigateNext';
import { Fab } from '@material-ui/core';
import classnames from 'classnames';
import './style.css';
import { useState, useEffect, useRef, useCallback, useLayoutEffect } from 'react';
import ClampLines from 'react-clamp-lines';

const PhotoGallery = (props) => {
  const { images = [] } = props;
  const [imageNum, setImageNum] = useState(1);

  const [buttonsDisabled, _setButtonsDisabled] = useState(false);
  const buttonsDisabledRef = useRef(buttonsDisabled);

  const [slideDirection, setSlideDirection] = useState('');

  const [cloneIndex, setCloneIndex] = useState(null);

  const prevInnerWidth = useRef(null);

  const mouseDownElement = useRef(null);

  const slideRefs = useRef([]);
  const sliderRef = useRef(null);

  const prevPageX = useRef(null);
  const prevTouchClientX = useRef(null);
  const prevImageNum = useRef(imageNum);

  const reverse = useRef(false);

  const clampRefs = useRef([]);

  const [galleryImages, setGalleryImages] = useState([]);

  const [clampsClosed, setClampsClosed] = useState(false);

  const setButtonsDisabled = (disabledValue) => {
    buttonsDisabledRef.current = disabledValue;
    _setButtonsDisabled(disabledValue);
  }

  const pauseEvent = (event) => {
    if (event.stopPropagation) {
      event.stopPropagation();
    }

    if(event.preventDefault) {
      event.preventDefault();
    }

    event.cancelBubble = true;
    event.returnValue = false;

    return false;
  }

  const processScroll = useCallback((pageX, prevPageXRef) => {
    const scrollLeft = sliderRef.current.scrollLeft;
    const slides = slideRefs.current;
    const galleryLength = galleryImages.length;

    if (scrollLeft >= slides[galleryLength - 2].offsetLeft && !reverse.current) {
      sliderRef.current.scrollLeft = slides[1].offsetLeft;
      reverse.current = false;
    }

    if (scrollLeft >= slides[galleryLength - 1].offsetLeft && reverse.current) {
      sliderRef.current.scrollLeft = slides[2].offsetLeft;
      reverse.current = false;
    }

    if (scrollLeft <= slides[1].offsetLeft) {
      sliderRef.current.scrollLeft = slides[galleryLength - 2].offsetLeft;
      reverse.current = true;
    }

    if (prevPageXRef.current) {
      const difference = prevPageXRef.current - pageX;
      sliderRef.current.scrollLeft += difference;
    }

    prevPageXRef.current = pageX;
  }, [galleryImages]);

  const getOriginalIndex = useCallback((cloneIndex) => {
    if (cloneIndex === 0) {
      return galleryImages.length - 3;
    } else if (cloneIndex === galleryImages.length - 2) {
      return 1;
    } else if (cloneIndex === galleryImages.length - 1) {
      return 2;
    }

    return -1;
  }, [galleryImages]);

  const isCloneIndex = useCallback((index) => {
    return getOriginalIndex(index) !== -1;
  }, [getOriginalIndex]);

  const resetClonePosition = useCallback((cloneIndex) => {
    if (isCloneIndex(cloneIndex)) {
      let originalIndex = getOriginalIndex(cloneIndex);
      sliderRef.current.scrollLeft = slideRefs.current[originalIndex].offsetLeft;
    }

    setCloneIndex(null);
  }, [setCloneIndex, getOriginalIndex, isCloneIndex]);


  const scrollToClosestImage = useCallback(() => {
    const scrollLeft = sliderRef.current.scrollLeft;

    const leftImageIndex = slideRefs.current?.findIndex((imageRef) => {
      return scrollLeft >= imageRef.offsetLeft && scrollLeft < imageRef.offsetLeft + imageRef.offsetWidth;
    });

    const rightImageIndex = leftImageIndex + 1;

    const leftImage = slideRefs.current[leftImageIndex];
    const rightImage = slideRefs.current[rightImageIndex];

    if (leftImage && rightImage) {
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

      scrollToSlide(closestImage);

      const originalIndex = getOriginalIndex(closestImageIndex);

      setSlideDirection('');

      if (isCloneIndex(closestImageIndex)) {
        setCloneIndex(closestImageIndex);
        setImageNum(originalIndex);
      } else {
        setImageNum(closestImageIndex);
        setCloneIndex(null);
      }
    }
  }, [setCloneIndex, getOriginalIndex, isCloneIndex]);


  const isGalleryImage = (element) => {
    return element?.classList?.contains('gallery-img');
  }

  const handleNavigateBefore = () => {
    setButtonsDisabled(true);
    setSlideDirection('before');

    if (imageNum === 1) {
      setImageNum(galleryImages.length - 3);
    } else {
      setImageNum(imageNum - 1);
    }
  }

  const closeAllClamps = () => {
    clampRefs.current.forEach((clamp) => {
      clamp.watch = false;
      clamp.clickHandler({
        preventDefault: () => {},
        stopPropagation: () => {},
      });
    })
  }

  const handleNavigateNext = () => {
    setButtonsDisabled(true);
    setSlideDirection('next');

    closeAllClamps();

    if (imageNum === (galleryImages.length - 3)) {
      setImageNum(1);
    } else {
      setImageNum(imageNum + 1);
    }
  }

  const handleOnMouseDown = (event) => {
    pauseEvent(event);

    if (!buttonsDisabledRef.current) {
      mouseDownElement.current = event.target;
    }
  }

  const handleOnMouseMove = useCallback((event) => {
    if (isGalleryImage(mouseDownElement.current) && !buttonsDisabledRef.current) {
      if (!clampsClosed) {
        closeAllClamps();

        setClampsClosed(true);
      }

      processScroll(event.pageX, prevPageX);
    }
  }, [mouseDownElement, processScroll, buttonsDisabledRef, setClampsClosed, clampsClosed]);

  const handleOnMouseUp = useCallback(() => {
    if (isGalleryImage(mouseDownElement.current) && !buttonsDisabledRef.current) {
      scrollToClosestImage();
      setClampsClosed(false);
      mouseDownElement.current = null;
      prevPageX.current = null;
    }

  }, [mouseDownElement, buttonsDisabledRef, scrollToClosestImage]);

  const handleOnTouchMove = (event) => {
    const { touches } = event;
    const touch = touches && touches[0];

    if (!clampsClosed) {
      closeAllClamps();
      setClampsClosed(true);
    }

    processScroll(touch.pageX, prevTouchClientX);
  }

  const handleOnResize = useCallback((event) => {
    const currentInnerWidth = event.target.innerWidth;

    const setScrollPosition = () => {
      sliderRef.current.scrollLeft = slideRefs.current[imageNum].offsetLeft;
      prevInnerWidth.current = currentInnerWidth;
    }

    if (prevInnerWidth.current) {
      if (
        (prevInnerWidth.current > 1200 &&  currentInnerWidth <= 1200) ||
        (prevInnerWidth.current < 1200 &&  currentInnerWidth >= 1200)
      ) {
        setScrollPosition();
      } else if (
        (prevInnerWidth.current > 992 && currentInnerWidth <= 992) ||
        (prevInnerWidth.current < 992 && currentInnerWidth >= 992)
      ) {
        setScrollPosition();
      } else if (
        (prevInnerWidth.current > 768 && currentInnerWidth <= 768) ||
        (prevInnerWidth.current < 768 && currentInnerWidth >= 768)
      ) {
        setScrollPosition();
      } else if (
        (prevInnerWidth.current > 480 && currentInnerWidth <= 480) ||
        (prevInnerWidth.current < 480 && currentInnerWidth >= 480)
      ) {
        setScrollPosition();
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

  const handleOnTouchEnd = () => {
    scrollToClosestImage();
    setClampsClosed(false);
    prevTouchClientX.current = null;
  }

  useEffect(() => {
    if (images.length === 1) {
      setGalleryImages([images[0]]);
    } else {
      setGalleryImages(
        [
          images[images.length - 1],
          ...images,
          images[0],
          images[1],
        ]
      );
    }
  }, [images]);

  useLayoutEffect(() => {
    if (slideRefs.current.length > 1) {
      // Scroll to the first image, its index is 1 due to the clones.
      sliderRef.current.scrollLeft = slideRefs.current[1].offsetLeft;
    }
  }, [galleryImages])


  useEffect(() => {
    const galleryLength = galleryImages?.length;
    const slider = sliderRef.current;
    const imgRefs = slideRefs.current;

    if (galleryLength > 0) {
      let scrollToNum = null;

      if (slideDirection === 'before') {
        if (cloneIndex !== null) {
          resetClonePosition(cloneIndex);
        }

        if (imageNum === galleryLength - 3) {
          slider.scrollLeft = imgRefs[galleryLength - 2].offsetLeft;
        }

        scrollToNum = imageNum;
      } else if (slideDirection === 'next') {
        if (cloneIndex !== null) {
          resetClonePosition(cloneIndex);
        }

        if (imageNum === 1) {
          slider.scrollLeft = imgRefs[0].offsetLeft;
        }

        scrollToNum = imageNum;
      }

      if (scrollToNum) {
        scrollToSlide(slideRefs.current[scrollToNum]);

        prevImageNum.current = scrollToNum;

        setTimeout(() => {
          setButtonsDisabled(false);
        }, 1000)
      }
    }
  }, [imageNum, galleryImages, slideDirection, cloneIndex, resetClonePosition])

  useEffect(() => {
    if (images.length > 1) {
      window.document.addEventListener('mouseup', handleOnMouseUp)
      window.document.addEventListener('mousemove', handleOnMouseMove);
      window.addEventListener('resize', handleOnResize);
    }

    return () => {
      if (images.length > 1) {
        window.document.removeEventListener('mouseup', handleOnMouseUp);
        window.document.removeEventListener('mousemove', handleOnMouseMove);
        window.removeEventListener('resize', handleOnResize);
      }
    }
  }, [handleOnMouseUp, handleOnMouseMove, handleOnResize, images]);

  return (
    <div className="photo-gallery">
      {
        images.length > 1 &&
        <Fab disabled={buttonsDisabled} onClick={handleNavigateBefore} className="fab-button -left">
          <NavigateBefore fontSize="large" />
        </Fab>
      }
      <div className="slider" ref={sliderRef}>
        {
          galleryImages.map((image, index) => {
            const classes = classnames({
              'slide-container': true,
              '-active': imageNum === index,
            });
            return (
              <div
                className={classes}
                onMouseDown={images.length > 1 ? handleOnMouseDown : undefined}
                onTouchMove={images.length > 1 ? handleOnTouchMove : undefined}
                onTouchEnd={images.length > 1 ? handleOnTouchEnd : undefined}
                ref={node => slideRefs.current[index] = node}
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
                    ref={node => clampRefs.current[index] = node}
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
      {
        images.length > 1 &&
        <Fab disabled={buttonsDisabled} onClick={handleNavigateNext} className="fab-button -right">
            <NavigateNext fontSize="large" />
        </Fab>
      }
    </div>
  )
}

export default PhotoGallery;