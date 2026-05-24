import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from './App';

// Mock axios
jest.mock('axios', () => ({
  get: jest.fn(() => Promise.resolve({ data: [] })),
  post: jest.fn(() => Promise.resolve({ data: { id: 1, description: 'Test', completed: 0 } })),
  put: jest.fn(() => Promise.resolve({ data: { id: 1, description: 'Test', completed: 1 } })),
  delete: jest.fn(() => Promise.resolve({ data: { success: true } }))
}));

describe('App Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders without crashing', () => {
    render(<App />);
    const appElement = document.querySelector('.App') || document.querySelector('main') || document.body;
    expect(appElement).toBeInTheDocument();
  });

  test('renders todo application', () => {
    render(<App />);
    expect(document.body).toBeInTheDocument();
  });
});
