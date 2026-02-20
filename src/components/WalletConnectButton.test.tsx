import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { WalletConnectButton } from '@/components/WalletConnectButton';
import * as freighterApi from '@stellar/freighter-api';

jest.mock('@stellar/freighter-api');

describe('WalletConnectButton', () => {
  const mockOnConnect = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('shows checking state initially', () => {
    (freighterApi.isConnected as jest.Mock).mockReturnValue(new Promise(() => {}));
    
    render(<WalletConnectButton onConnect={mockOnConnect} />);
    
    expect(screen.getByText(/Checking Wallet/i)).toBeInTheDocument();
  });

  it('shows install message when wallet not installed', async () => {
    (freighterApi.isConnected as jest.Mock).mockResolvedValue({ error: 'Not found' });
    
    render(<WalletConnectButton onConnect={mockOnConnect} />);
    
    await waitFor(() => {
      expect(screen.getByText(/Install Freighter Wallet/i)).toBeInTheDocument();
    });
  });

  it('shows connect button when wallet installed', async () => {
    (freighterApi.isConnected as jest.Mock).mockResolvedValue({ isConnected: false });
    
    render(<WalletConnectButton onConnect={mockOnConnect}>Connect</WalletConnectButton>);
    
    await waitFor(() => {
      expect(screen.getByText('Connect')).toBeInTheDocument();
    });
  });

  it('shows connected state when wallet connected', async () => {
    (freighterApi.isConnected as jest.Mock).mockResolvedValue({ isConnected: true });
    
    render(<WalletConnectButton onConnect={mockOnConnect} />);
    
    await waitFor(() => {
      expect(screen.getByText(/Wallet Connected/i)).toBeInTheDocument();
    });
  });

  it('calls onConnect when button clicked', async () => {
    const user = userEvent.setup();
    (freighterApi.isConnected as jest.Mock).mockResolvedValue({ isConnected: false });
    
    render(<WalletConnectButton onConnect={mockOnConnect}>Connect</WalletConnectButton>);
    
    await waitFor(() => {
      expect(screen.getByText('Connect')).toBeInTheDocument();
    });
    
    await user.click(screen.getByText('Connect'));
    
    expect(mockOnConnect).toHaveBeenCalled();
  });

  it('disables button when disabled prop is true', async () => {
    (freighterApi.isConnected as jest.Mock).mockResolvedValue({ isConnected: false });
    
    render(<WalletConnectButton onConnect={mockOnConnect} disabled />);
    
    await waitFor(() => {
      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
    });
  });

  it('shows loading state during connection', async () => {
    const user = userEvent.setup();
    (freighterApi.isConnected as jest.Mock).mockResolvedValue({ isConnected: false });
    mockOnConnect.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));
    
    render(<WalletConnectButton onConnect={mockOnConnect}>Connect</WalletConnectButton>);
    
    await waitFor(() => {
      expect(screen.getByText('Connect')).toBeInTheDocument();
    });
    
    await user.click(screen.getByText('Connect'));
    
    expect(screen.getByText(/Connecting Wallet/i)).toBeInTheDocument();
  });
});
