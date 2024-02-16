// App.test.tsx
import React from 'react';
import {render} from '@testing-library/react-native';
import App from '../App';

describe('<App />', () => {
  it('renders correctly', () => {
    const {getByText} = render(<App />);
    // Perform your tests here. For example, you can check if navigation is rendered
    // expect(getByText('Your Navigation Text Here')).toBeDefined();
  });
});
