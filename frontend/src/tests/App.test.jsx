import { render, screen } from '@testing-library/react';
import React from 'react';
import App from '../App';

describe('Frontend App Rendering Test', () => {
  it('renders landing page headline', () => {
    render(<App />);
    expect(screen.getByText(/Detect Bugs & Security Flaws/i)).toBeInTheDocument();
  });
});
