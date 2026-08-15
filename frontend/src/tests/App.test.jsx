import { render, screen } from '@testing-library/react';
import React from 'react';
import App from '../App';

describe('Frontend App Rendering Test', () => {
  it('renders landing page headline', async () => {
    render(<App />);
    const headline = await screen.findByText(/Ship Better Code With/i);
    expect(headline).toBeInTheDocument();
  });
});
