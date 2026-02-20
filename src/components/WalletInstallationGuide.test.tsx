import { render, screen } from '@testing-library/react';
import { WalletInstallationGuide } from './WalletInstallationGuide';

describe('WalletInstallationGuide', () => {
  it('renders installation heading', () => {
    render(<WalletInstallationGuide />);
    expect(screen.getByText(/Install Freighter Wallet/i)).toBeInTheDocument();
  });

  it('shows installation steps', () => {
    render(<WalletInstallationGuide />);
    expect(screen.getByText(/Download Extension/i)).toBeInTheDocument();
    expect(screen.getByText(/Create or Import Wallet/i)).toBeInTheDocument();
  });
});
