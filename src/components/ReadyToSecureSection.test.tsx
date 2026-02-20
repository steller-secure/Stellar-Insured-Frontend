import { render, screen } from '@testing-library/react';
import ReadyToSecureSection from './ReadyToSecureSection';

describe('ReadyToSecureSection', () => {
  it('renders heading', () => {
    render(<ReadyToSecureSection />);
    expect(screen.getByText(/Ready to Secure Your Digital Assets/i)).toBeInTheDocument();
  });

  it('renders get started button', () => {
    render(<ReadyToSecureSection />);
    expect(screen.getByRole('button', { name: /get started/i })).toBeInTheDocument();
  });

  it('renders schedule demo button', () => {
    render(<ReadyToSecureSection />);
    expect(screen.getByRole('button', { name: /schedule a demo/i })).toBeInTheDocument();
  });
});
