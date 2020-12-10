import NavigateBefore from '@material-ui/icons/NavigateBefore';
import NavigateNext from '@material-ui/icons/NavigateNext';
import classnames from 'classnames';
import './style.css';
import { useState, useEffect, useRef } from 'react';
import { debounce } from 'debounce';

const PhotoGallery = (props) => {
  const { images } = props;

  const imageNum = useRef(1);

  const handleNavigateBefore = () => {
    const debounced = debounce((clear) => {
      if (imageNum.current === 1) {
        sliderRef.current.scrollLeft = imageRefs.current[galleryImages.length - 2].offsetLeft;
        imageNum.current = galleryImages.length - 3;

        imageRefs.current[imageNum.current].scrollIntoView({
          behavior: 'smooth'
        });

        imageNum.current = galleryImages.length - 3;
      } else {
        imageNum.current = imageNum.current - 1;
        imageRefs.current[imageNum.current].scrollIntoView({
          behavior: 'smooth'
        })
      }

      console.log(clear);
    }, 1000, true);

    debounced();

    debounced.flush();
  }

  const handleNavigateNext = () => {
    const debounced = debounce(() => {
      if (imageNum.current === galleryImages.length - 2) {
        sliderRef.current.scrollLeft = imageRefs.current[0].offsetLeft;
        imageNum.current = 1;

        imageRefs.current[imageNum.current].scrollIntoView({
          behavior: 'smooth'
        });
      } else {
        imageNum.current = imageNum.current + 1;
        imageRefs.current[imageNum.current].scrollIntoView({
          behavior: 'smooth'
        });
      }
    }, 1000, true);

    debounced();

    debounced.flush();
  }

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

  const handleOnDragEnd = () => {
    scrollToClosestImage();
    prevScreenX.current = null;
  }

  const handleOnTouchEnd = () => {
    scrollToClosestImage();
    prevTouchScreenX.current = null;
  }

  const scrollToClosestImage = () => {
    const scrollLeft = sliderRef.current.scrollLeft;

    const leftImageIndex = imageRefs?.current?.findIndex((imageRef) => {
      return scrollLeft > imageRef.offsetLeft && scrollLeft < imageRef.offsetLeft + imageRef.offsetWidth;
    });

    const rightImageIndex = leftImageIndex + 1;

    const leftImage = imageRefs.current[leftImageIndex];

    const rightImage = imageRefs.current[rightImageIndex];

    const leftDisplayedWidth = (leftImage.offsetLeft + leftImage.offsetWidth) - scrollLeft;

    const rightDisplayedWidth = (rightImage.offsetWidth - (rightImage.offsetLeft - scrollLeft));

    let closestImage = null;

    if (leftDisplayedWidth < rightDisplayedWidth) {
      closestImage = rightImage;
      imageNum.current = rightImageIndex;
    } else {
      closestImage = leftImage;
      imageNum.current = leftImageIndex;
    }

    closestImage.scrollIntoView({
      behavior: 'smooth'
    })
  }

  /** Edge Cases
   *
   * If the scroll is < 0 we jump to image number 5
   *    If at image number 5 and we get close to image number 4, simply use scroll into view and it should scroll left.
   *    If at image number 5 and we get close to image number 6, this means we have jumped to image number 2, simply use scroll into view and it should scroll right.
   *
   * If the scroll is > offset of image number 5, we will have jumped back to number 1, simply scroll into image number 1's view
   * If the scroll is > offset of image number 5, we will have jumped back to number 1, but if we decide to go back
   */

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


  return (
    <div className="photo-gallery">
      <button className="nav-button" onClick={handleNavigateBefore}>
        <NavigateBefore style={{ color: 'white' }} fontSize="large" />
      </button>
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
      <button className="nav-button" onClick={handleNavigateNext}>
        <NavigateNext style={{ color: 'white' }} fontSize="large" />
      </button>
    </div>
  )
}

export default PhotoGallery;