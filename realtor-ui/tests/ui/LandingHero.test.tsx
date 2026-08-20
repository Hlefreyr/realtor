import React from 'react';
import { Platform } from 'react-native';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import { MockedProvider } from '@apollo/client/testing';
import { TamaguiProvider } from 'tamagui';
import tamaguiConfig from '../../tamagui.config';
import { LandingHero, GET_HELLO } from '../../src/components/LandingHero';

const mockSuccess = [
  {
    request: {
      query: GET_HELLO,
    },
    result: {
      data: {
        __typename: 'Query',
        hello: 'Hello Realtor! Welcome to your full-stack real estate platform.',
      },
    },
  },
];

const mockError = [
  {
    request: {
      query: GET_HELLO,
    },
    error: new Error('Network connection failed'),
  },
];

const renderComponent = (mocks = mockSuccess, props = {}) => {
  return render(
    <MockedProvider mocks={mocks}>
      <TamaguiProvider config={tamaguiConfig} defaultTheme="light">
        <LandingHero {...props} />
      </TamaguiProvider>
    </MockedProvider>
  );
};

describe('LandingHero UI Component Tests', () => {
  it('should render hero title, subtitle, house image, and search input on Web', () => {
    const originalPlatform = Platform.OS;
    Platform.OS = 'web';

    const { getByTestId, getByText, getByPlaceholderText } = renderComponent();

    expect(getByTestId('hero-title')).toBeTruthy();
    expect(getByText('Realtor')).toBeTruthy();
    expect(getByTestId('hero-subtitle')).toBeTruthy();
    expect(getByTestId('house-art-image')).toBeTruthy();
    expect(getByPlaceholderText('Search by city, neighborhood, or address...')).toBeTruthy();
    expect(getByTestId('search-button')).toBeTruthy();

    Platform.OS = originalPlatform;
  });

  it('should render hero on native platform', () => {
    const originalPlatform = Platform.OS;
    Platform.OS = 'ios';

    const { getByTestId, getByText } = renderComponent();

    expect(getByTestId('hero-title')).toBeTruthy();
    expect(getByText('Realtor')).toBeTruthy();

    Platform.OS = originalPlatform;
  });

  it('should display loading state initially', () => {
    const { getByTestId } = renderComponent();
    expect(getByTestId('graphql-loading')).toBeTruthy();
  });

  it('should display backend greeting message when GraphQL query succeeds', async () => {
    const { getByTestId, getByText } = renderComponent(mockSuccess);

    await waitFor(() => {
      expect(getByTestId('graphql-success')).toBeTruthy();
      expect(
        getByText('Hello Realtor! Welcome to your full-stack real estate platform.')
      ).toBeTruthy();
    });
  });

  it('should display error message when GraphQL query fails and allow retry', async () => {
    const { getByTestId, getByText, getByTestId: getRetry } = renderComponent(mockError);

    await waitFor(() => {
      expect(getByTestId('graphql-error')).toBeTruthy();
    });

    const retryButton = getByTestId('graphql-retry-button');
    await act(async () => {
      fireEvent.press(retryButton);
    });
    expect(retryButton).toBeTruthy();
  });

  it('should handle search input and call onSearch callback', async () => {
    const mockOnSearch = jest.fn();
    const { getByPlaceholderText, getByTestId } = renderComponent(mockSuccess, {
      onSearch: mockOnSearch,
    });
    const input = getByPlaceholderText('Search by city, neighborhood, or address...');

    await act(async () => {
      fireEvent.changeText(input, 'Beverly Hills, CA');
    });
    expect(input.props.value).toBe('Beverly Hills, CA');

    const searchButton = getByTestId('search-button');
    await act(async () => {
      fireEvent.press(searchButton);
    });
    expect(mockOnSearch).toHaveBeenCalledWith('Beverly Hills, CA');
  });

  it('should handle search button press without onSearch callback', async () => {
    const { getByTestId } = renderComponent(mockSuccess);
    const searchButton = getByTestId('search-button');
    await act(async () => {
      fireEvent.press(searchButton);
    });
    expect(searchButton).toBeTruthy();
  });
});
