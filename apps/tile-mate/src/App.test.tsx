import { render } from '@solidjs/testing-library';
import { expect, test } from 'vitest';
import App from './App';

test('renders learn solid link', () => {
  const { getByText } = render(() => <App />);
  const linkElement = getByText(/learn solid/i);
  expect(linkElement).toBeInTheDocument();
});

test('renders welcome message', () => {
  const { getByText } = render(() => <App />);
  const welcomeElement = getByText(/welcome to tile mate/i);
  expect(welcomeElement).toBeInTheDocument();
});

test('counter functionality works', async () => {
  const { getByText, getByRole } = render(() => <App />);
  const button = getByRole('button');
  const countText = getByText(/count is 0/i);
  
  expect(countText).toBeInTheDocument();
  
  // Click the button
  button.click();
  
  // Check if count increased
  expect(getByText(/count is 1/i)).toBeInTheDocument();
});
