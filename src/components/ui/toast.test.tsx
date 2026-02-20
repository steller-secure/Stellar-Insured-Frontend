import { render, screen } from '@testing-library/react';
import { ToastProvider, useToast } from '@/components/ui/toast';

const TestComponent = () => {
  const { showToast } = useToast();
  
  return (
    <div>
      <button onClick={() => showToast('Success message', 'success')}>Show Success</button>
      <button onClick={() => showToast('Error message', 'error')}>Show Error</button>
      <button onClick={() => showToast('Info message', 'info')}>Show Info</button>
    </div>
  );
};

describe('Toast', () => {
  it('renders toast provider', () => {
    render(
      <ToastProvider>
        <div>Content</div>
      </ToastProvider>
    );

    expect(screen.getByText('Content')).toBeInTheDocument();
  });

  it('provides toast context', () => {
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    );

    expect(screen.getByText('Show Success')).toBeInTheDocument();
    expect(screen.getByText('Show Error')).toBeInTheDocument();
    expect(screen.getByText('Show Info')).toBeInTheDocument();
  });
});
