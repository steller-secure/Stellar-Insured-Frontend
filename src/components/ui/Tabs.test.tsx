import { useState } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TabPanel, Tabs } from '@/components/ui/Tabs';

const items = [
  { value: 'overview', label: 'Overview' },
  { value: 'claims', label: 'Claims' },
  { value: 'archive', label: 'Archive', disabled: true },
];

function ControlledTabs() {
  const [value, setValue] = useState('overview');

  return (
    <>
      <Tabs
        items={items}
        value={value}
        onValueChange={setValue}
        label="Policy sections"
        idPrefix="policy"
      />
      <TabPanel value="overview" activeValue={value} idPrefix="policy">
        Overview panel
      </TabPanel>
      <TabPanel value="claims" activeValue={value} idPrefix="policy">
        Claims panel
      </TabPanel>
    </>
  );
}

describe('Tabs', () => {
  it('marks only the active tab as selected and keyboard reachable', () => {
    render(<ControlledTabs />);

    const overview = screen.getByRole('tab', { name: 'Overview' });
    const claims = screen.getByRole('tab', { name: 'Claims' });

    expect(overview).toHaveAttribute('aria-selected', 'true');
    expect(overview).toHaveAttribute('tabindex', '0');
    expect(claims).toHaveAttribute('aria-selected', 'false');
    expect(claims).toHaveAttribute('tabindex', '-1');
  });

  it('renders only the active panel and wires it to its tab', () => {
    render(<ControlledTabs />);

    expect(screen.getByText('Overview panel')).toBeInTheDocument();
    expect(screen.queryByText('Claims panel')).not.toBeInTheDocument();
    expect(screen.getByRole('tabpanel')).toHaveAttribute(
      'aria-labelledby',
      'policy-tab-overview',
    );
  });

  it('switches panels on click', async () => {
    const user = userEvent.setup();
    render(<ControlledTabs />);

    await user.click(screen.getByRole('tab', { name: 'Claims' }));

    expect(screen.getByText('Claims panel')).toBeInTheDocument();
    expect(screen.queryByText('Overview panel')).not.toBeInTheDocument();
  });

  it('moves between tabs with the arrow keys, skipping disabled ones', async () => {
    const user = userEvent.setup();
    render(<ControlledTabs />);

    screen.getByRole('tab', { name: 'Overview' }).focus();
    await user.keyboard('{ArrowRight}');
    expect(screen.getByRole('tab', { name: 'Claims' })).toHaveFocus();

    // Archive is disabled, so the next step wraps back to the first tab.
    await user.keyboard('{ArrowRight}');
    expect(screen.getByRole('tab', { name: 'Overview' })).toHaveFocus();
  });

  it('jumps to the ends with Home and End', async () => {
    const user = userEvent.setup();
    render(<ControlledTabs />);

    screen.getByRole('tab', { name: 'Overview' }).focus();
    await user.keyboard('{End}');
    expect(screen.getByRole('tab', { name: 'Claims' })).toHaveFocus();

    await user.keyboard('{Home}');
    expect(screen.getByRole('tab', { name: 'Overview' })).toHaveFocus();
  });

  it('omits the aria wiring when no id prefix is given', () => {
    render(
      <Tabs items={items} value="overview" onValueChange={jest.fn()} label="Sections" />,
    );

    expect(screen.getByRole('tab', { name: 'Overview' })).not.toHaveAttribute(
      'aria-controls',
    );
  });

  it('applies the variant and colour recipes', () => {
    render(
      <Tabs
        items={items}
        value="overview"
        onValueChange={jest.fn()}
        variant="soft"
        color="success"
        label="Sections"
      />,
    );

    expect(screen.getByRole('tab', { name: 'Overview' })).toHaveClass(
      'bg-success-soft',
      'text-success-on-soft',
    );
  });
});
