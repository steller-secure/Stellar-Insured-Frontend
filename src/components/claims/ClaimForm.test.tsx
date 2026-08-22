import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ClaimForm } from '@/components/claims/ClaimForm';
import { LoadingProvider } from '@/contexts/LoadingContext';
import { useDataFetchList } from '@/hooks/useDataFetch';

jest.mock('@/hooks/useDataFetch', () => ({
  useDataFetchList: jest.fn(),
}));

const mockUseDataFetchList = useDataFetchList as unknown as jest.Mock;

const policies = [
  {
    id: 'p1',
    name: 'Comprehensive Health Plan',
    type: 'Health',
    status: 'active',
    coverageLimit: 50000,
    coverageLimitFormatted: '$50,000',
    policyNumber: 'HEL-9928-XJ',
    premium: 120,
  },
  {
    id: 'p2',
    name: 'Standard Auto Insurance',
    type: 'Auto',
    status: 'active',
    coverageLimit: 25000,
    coverageLimitFormatted: '$25,000',
    policyNumber: 'AUT-5521-MK',
    premium: 80,
  },
];

beforeEach(() => {
  mockUseDataFetchList.mockReturnValue({
    items: policies,
    loading: false,
    error: null,
    isEmpty: false,
    refetch: jest.fn(),
  });
});

afterEach(() => {
  jest.clearAllMocks();
});

const renderForm = () =>
  render(
    <LoadingProvider>
      <ClaimForm />
    </LoadingProvider>
  );

describe('ClaimForm', () => {
  it('renders form fields', async () => {
    renderForm();

    expect(await screen.findByText(/Select Policy/i)).toBeInTheDocument();
    expect(screen.getByText(/Claim Amount/i)).toBeInTheDocument();
    expect(screen.getByText(/Incident Description/i)).toBeInTheDocument();
    expect(screen.getByText(/Supporting Evidence/i)).toBeInTheDocument();
  });

  it('shows submit button', async () => {
    renderForm();

    expect(await screen.findByRole('button', { name: /submit claim/i })).toBeInTheDocument();
  });

  it('shows cancel button', async () => {
    renderForm();

    expect(await screen.findByRole('button', { name: /cancel/i })).toBeInTheDocument();
  });

  it('disables the submit button until the form is valid', async () => {
    const user = userEvent.setup();
    renderForm();

    const submit = screen.getByRole('button', { name: /submit claim/i });
    expect(submit).toBeDisabled();

    await user.selectOptions(screen.getByLabelText(/Select Policy/i), 'p1');
    await user.type(screen.getByLabelText(/Claim Amount/i), '1000');
    await user.type(
      screen.getByLabelText(/Incident Description/i),
      'This is a sufficiently long description for a claim.'
    );
    fireEvent.change(screen.getByLabelText('Select file for Supporting Evidence'), {
      target: {
        files: [new File(['proof'], 'proof.pdf', { type: 'application/pdf' })],
      },
    });

    await waitFor(() => expect(submit).not.toBeDisabled());
  });

  it('shows validation messages matching the schema', async () => {
    const user = userEvent.setup();
    renderForm();

    const policySelect = await screen.findByLabelText(/Select Policy/i);
    await user.selectOptions(policySelect, 'p1');
    fireEvent.change(policySelect, { target: { value: '' } });
    fireEvent.blur(policySelect);
    expect(await screen.findByText('Please select a policy')).toBeInTheDocument();

    const amount = screen.getByLabelText(/Claim Amount/i);
    fireEvent.change(amount, { target: { value: '0' } });
    fireEvent.blur(amount);
    expect(await screen.findByText('Claim amount must be greater than 0')).toBeInTheDocument();

    const description = screen.getByLabelText(/Incident Description/i);
    fireEvent.change(description, { target: { value: 'too short' } });
    fireEvent.blur(description);
    expect(
      await screen.findByText('Description must be at least 20 characters')
    ).toBeInTheDocument();
  });

  it('rejects evidence files that exceed the 10MB limit', async () => {
    renderForm();

    await screen.findByLabelText(/Select Policy/i);

    const bigFile = new File([new ArrayBuffer(11 * 1024 * 1024)], 'big.pdf', {
      type: 'application/pdf',
    });
    fireEvent.change(screen.getByLabelText('Select file for Supporting Evidence'), {
      target: { files: [bigFile] },
    });

    expect(await screen.findByText('Evidence file must be 10MB or smaller')).toBeInTheDocument();
  });

  it('enforces the selected policy coverage limit', async () => {
    const user = userEvent.setup();
    renderForm();

    await user.selectOptions(await screen.findByLabelText(/Select Policy/i), 'p1');

    const amount = screen.getByLabelText(/Claim Amount/i);
    fireEvent.change(amount, { target: { value: '75000' } });
    fireEvent.blur(amount);

    expect(
      await screen.findByText('Amount cannot exceed the policy limit of $50,000')
    ).toBeInTheDocument();
  });

  it('shows the success screen after a valid submission', async () => {
    const user = userEvent.setup();
    renderForm();

    await user.selectOptions(await screen.findByLabelText(/Select Policy/i), 'p1');
    await user.type(screen.getByLabelText(/Claim Amount/i), '1000');
    await user.type(
      screen.getByLabelText(/Incident Description/i),
      'This is a sufficiently long description for a claim.'
    );
    fireEvent.change(screen.getByLabelText('Select file for Supporting Evidence'), {
      target: {
        files: [new File(['proof'], 'proof.pdf', { type: 'application/pdf' })],
      },
    });

    await user.click(screen.getByRole('button', { name: /submit claim/i }));

    expect(
      await screen.findByText('Claim Submitted Successfully!', {}, { timeout: 5000 })
    ).toBeInTheDocument();
    expect(screen.getByText(/Comprehensive Health Plan/)).toBeInTheDocument();
  });

  it('shows a policy loading error state', async () => {
    mockUseDataFetchList.mockReturnValue({
      items: [],
      loading: false,
      error: new Error('Failed to load policies'),
      isEmpty: true,
      refetch: jest.fn(),
    });

    renderForm();

    expect(
      await screen.findByText('Failed to load policies. Please try again.')
    ).toBeInTheDocument();
  });
});