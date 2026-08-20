import React from 'react';
import { render } from '@testing-library/react-native';
import App from '../../App';

describe('App Root Component Tests', () => {
  it('should render App root layout and header', () => {
    const { getByTestId } = render(<App />);
    expect(getByTestId('app-root')).toBeTruthy();
    expect(getByTestId('header-container')).toBeTruthy();
  });
});
