import React from 'react';
import { render } from '@testing-library/react-native';
import App from '../../App';

describe('App Root UI Test', () => {
  it('renders correctly', () => {
    const { getByTestId } = render(<App />);
    expect(getByTestId('app-root')).toBeTruthy();
  });
});
