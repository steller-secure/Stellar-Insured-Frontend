import { render, screen } from '@testing-library/react';
import SignUpPage from '@/app/signup/page';
import { AuthProvider } from '@/components/auth-provider-enhanced';
import { ToastProvider } from '@/components/ui/toast';

const mockPush = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
  useSearchParams: () => new URLSearchParams(),
}));

describe('SignUp Integration Flow', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  it('renders signup page', () => {
    render(
      <AuthProvider>
        <ToastProvider>
          <SignUpPage />
        </ToastProvider>
      </AuthProvider>
    );

    expect(screen.getByRole('button', { name: /sign up/i })).toBeInTheDocument();
  });
});
