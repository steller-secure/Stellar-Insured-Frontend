import { render, screen } from '@testing-library/react';
import VoteProgressBar from './VoteProgressBar';
import { ThumbsUp } from 'lucide-react';

describe('VoteProgressBar', () => {
  it('renders progress bar with percentage', () => {
    render(
      <VoteProgressBar
        percentage="60"
        votes={60}
        color="text-green-500"
        bgColor="bg-green-500"
        label="For"
        icon={<ThumbsUp />}
      />
    );
    expect(screen.getByText('60%')).toBeInTheDocument();
    expect(screen.getByText('For')).toBeInTheDocument();
  });

  it('displays vote count', () => {
    render(
      <VoteProgressBar
        percentage="30"
        votes={30}
        color="text-red-500"
        bgColor="bg-red-500"
        label="Against"
        icon={<ThumbsUp />}
      />
    );
    expect(screen.getByText('30 votes')).toBeInTheDocument();
  });
});
