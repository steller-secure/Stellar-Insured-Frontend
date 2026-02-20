import { render, screen } from '@testing-library/react';
import HeroSection from '@/components/HeroSection';

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

describe('HeroSection', () => {
  it('renders hero section', () => {
    const { container } = render(<HeroSection />);
    expect(container.firstChild).toBeInTheDocument();
  });

  it('displays call-to-action buttons', () => {
    render(<HeroSection />);
    
    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBeGreaterThan(0);
  });
});
