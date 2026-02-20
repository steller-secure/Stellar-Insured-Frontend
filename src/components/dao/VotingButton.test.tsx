import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import VotingButton from './VotingButton';
import { ThumbsUp } from 'lucide-react';

describe('VotingButton', () => {
  it('renders button with label', () => {
    render(
      <VotingButton
        voteType="for"
        selected={false}
        icon={<ThumbsUp />}
        label="For"
        onClick={jest.fn()}
        activeColor="bg-green-500"
      />
    );
    expect(screen.getByText('For')).toBeInTheDocument();
  });

  it('calls onClick when clicked', async () => {
    const user = userEvent.setup();
    const mockClick = jest.fn();
    
    render(
      <VotingButton
        voteType="for"
        selected={false}
        icon={<ThumbsUp />}
        label="For"
        onClick={mockClick}
        activeColor="bg-green-500"
      />
    );
    
    await user.click(screen.getByText('For'));
    expect(mockClick).toHaveBeenCalled();
  });

  it('applies active styles when selected', () => {
    render(
      <VotingButton
        voteType="for"
        selected={true}
        icon={<ThumbsUp />}
        label="For"
        onClick={jest.fn()}
        activeColor="bg-green-500"
      />
    );
    const button = screen.getByText('For').closest('button');
    expect(button).toHaveClass('bg-green-500');
  });
});
