import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CreateProposalModal } from '@/components/CreateProposalModal';

describe('CreateProposalModal', () => {
  const onClose = jest.fn();
  const onCreated = jest.fn();

  beforeEach(() => {
    onClose.mockClear();
    onCreated.mockClear();
  });

  it('renders nothing when closed', () => {
    render(
      <CreateProposalModal isOpen={false} onClose={onClose} onCreated={onCreated} />,
    );
    expect(screen.queryByText('Create Proposal')).not.toBeInTheDocument();
  });

  it('shows validation errors after blur for invalid fields', async () => {
    const user = userEvent.setup();
    render(
      <CreateProposalModal isOpen onClose={onClose} onCreated={onCreated} />,
    );

    await user.type(screen.getByLabelText(/proposal title/i), 'bad');
    await user.tab();

    expect(
      screen.getByText('Proposal title must be at least 5 characters'),
    ).toBeInTheDocument();
  });

  it(
    'calls onCreated and onClose with valid input',
    async () => {
      const user = userEvent.setup();
      render(
        <CreateProposalModal isOpen onClose={onClose} onCreated={onCreated} />,
      );

    await user.type(
        screen.getByLabelText(/proposal title/i),
        'A valid proposal title',
      );
      await user.type(
        screen.getByLabelText(/description/i),
        'A valid description',
      );
      await user.click(screen.getByRole('button', { name: /submit/i }));

      await waitFor(() => expect(onCreated).toHaveBeenCalledTimes(1));
      expect(onClose).toHaveBeenCalledTimes(1);
      expect(onCreated).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'A valid proposal title',
          description: 'A valid description',
          type: 'UPGRADE',
          author: 'currentUser',
        }),
      );
    },
    15000,
  );
});
