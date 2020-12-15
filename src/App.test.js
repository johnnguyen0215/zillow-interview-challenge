import { render, screen, waitFor } from '@testing-library/react';
import { act, } from 'react-dom/test-utils';
import App from './App';
import data from '../public/data.json';

describe('App', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test('should NOT display photogallery if no data is passed', async () => {
    await act(async () => {
      jest.spyOn(global, 'fetch').mockResolvedValue({
        json: jest.fn().mockResolvedValue([])
      });

      render(<App />);
      const photoGallery = screen.queryByLabelText('Photo Gallery');
      expect(photoGallery).not.toBeInTheDocument();
    });
  });

  test('should render a single image', async () => {
    jest.spyOn(global, 'fetch').mockResolvedValue({
      json: jest.fn().mockResolvedValue([data[0]])
    });

    render(<App />);

    await waitFor(() => {
      expect(screen.getByLabelText('Photo Gallery')).toBeInTheDocument();
    });

    const images = screen.queryAllByAltText('slide');
    expect(images.length).toBe(1);
  });

  test('should render a length of images plus 3 clones', async () => {
    jest.spyOn(global, 'fetch').mockResolvedValue({
      json: jest.fn().mockResolvedValue([...data])
    });

    render(<App />);

    await waitFor(() => {
      expect(screen.getByLabelText('Photo Gallery')).toBeInTheDocument();
    });

    const images = screen.queryAllByAltText('slide');
    expect(images.length).toBe(data.length + 3);
  });
});
