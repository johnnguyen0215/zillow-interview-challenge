/**
 * Handle cases
 *
 * moving from one to the next with button click
 * moving from one to previous with button click
 *
 * moving from one to next with drag
 * moving from one to previous with drag
 *
 * All the above cases with 1 image
 *
 * All the above cases with 2 images
 *
 * All the above cases with 2+ images
 */

import { fireEvent, render, screen, within } from '@testing-library/react';
import PhotoGallery from './photoGallery';
import dataJson from '../../data.json';

window.HTMLElement.prototype.scrollTo = jest.fn()

describe('PhotoGallery', () => {
  let images = null;

  describe('Single image', () => {
    beforeEach(() => {
      images = [
        dataJson[0],
      ]
    });

    test('should display correct src for single element', () => {
      render(<PhotoGallery images={images} />);
      const activeElement = screen.getByLabelText('Slide active').querySelector('img');
      expect(activeElement).toHaveAttribute('src', dataJson[0].url);
    });

    test('should not display navigation buttons', () => {
      render(<PhotoGallery images={images} />);
      const leftNavButton = screen.queryByLabelText('Previous image');
      const rightNavButton = screen.queryByLabelText('Next image');

      expect(leftNavButton).not.toBeInTheDocument();
      expect(rightNavButton).not.toBeInTheDocument();
    });
  });

  describe('Two images', () => {
    beforeEach(() => {
      images = [
        dataJson[dataJson.length - 1],
        ...dataJson,
        dataJson[0],
        dataJson[1]
      ];
    });


    test('should display navigation buttons', () => {
      render(<PhotoGallery images={images} />);
      const leftNavButton = screen.queryByLabelText('Previous image');
      const rightNavButton = screen.queryByLabelText('Next image');

      expect(leftNavButton).toBeInTheDocument();
      expect(rightNavButton).toBeInTheDocument();
    });

    test('should navigate to the correct next element on right nav click', () => {
      render(<PhotoGallery images={images} />);

      const rightNavButton = screen.queryByLabelText('Next image');
      fireEvent.click(rightNavButton);

      const activeElement = screen.getByLabelText('Slide active').querySelector('img');

      expect(activeElement).toHaveAttribute('src', dataJson[1].url);
    });

    test('should navigate to the correct next element on left nav click', () => {
      render(<PhotoGallery images={images} />);

      const leftNavButton = screen.queryByLabelText('Previous image');
      fireEvent.click(leftNavButton);

      const activeElement = screen.getByLabelText('Slide active').querySelector('img');

      expect(activeElement).toHaveAttribute('src', dataJson[dataJson.length - 1].url);
    });
  })
})