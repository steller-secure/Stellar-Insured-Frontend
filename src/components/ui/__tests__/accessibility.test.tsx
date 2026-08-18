/**
 * Accessibility tests for src/components/ui/ components
 * Uses jest-axe to automatically detect WCAG 2.1 AA violations.
 *
 * WCAG references:
 *   1.1.1  Non-text Content
 *   1.3.1  Info and Relationships
 *   2.1.1  Keyboard
 *   2.4.6  Headings and Labels
 *   3.3.1  Error Identification
 *   3.3.2  Labels or Instructions
 *   4.1.2  Name, Role, Value
 *   4.1.3  Status Messages
 */
import React from 'react';
import { render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';

// Extend Jest matchers with jest-axe's custom matcher
expect.extend(toHaveNoViolations);

// ── Component imports ──────────────────────────────────────────────────────────
import { Button } from '../Button';
import { Input } from '../Input';
import { Select } from '../Select';
import { Textarea } from '../Textarea';
import { Modal } from '../Modal';
import { Badge } from '../Badge';
import { Card } from '../Card';

// ── Button ─────────────────────────────────────────────────────────────────────

describe('Button – accessibility (jest-axe)', () => {
  it('has no violations when rendered with text', async () => {
    const { container } = render(<Button>Submit</Button>);
    expect(await axe(container)).toHaveNoViolations();
  });

  it('has no violations when disabled', async () => {
    const { container } = render(<Button disabled>Submit</Button>);
    expect(await axe(container)).toHaveNoViolations();
  });

  it('has no violations when loading', async () => {
    const { container } = render(<Button isLoading aria-label="Submitting, please wait">Submit</Button>);
    expect(await axe(container)).toHaveNoViolations();
  });

  it('has no violations for all variants', async () => {
    const { container } = render(
      <div>
        <Button variant="primary">Primary</Button>
        <Button variant="secondary">Secondary</Button>
        <Button variant="outline">Outline</Button>
        <Button variant="danger">Danger</Button>
      </div>
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});

// ── Input ──────────────────────────────────────────────────────────────────────

describe('Input – accessibility (jest-axe)', () => {
  it('has no violations with a label', async () => {
    const { container } = render(
      <Input id="test-input" label="Email address" />
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  it('has no violations when required', async () => {
    const { container } = render(
      <Input id="test-input" label="Email address" required />
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  it('has no violations in error state', async () => {
    const { container } = render(
      <Input
        id="test-input"
        label="Email address"
        state="error"
        error="Please enter a valid email address"
      />
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  it('has no violations in success state', async () => {
    const { container } = render(
      <Input
        id="test-input"
        label="Email address"
        state="success"
        value="user@example.com"
        readOnly
      />
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  it('has no violations with helper text', async () => {
    const { container } = render(
      <Input
        id="test-input"
        label="Password"
        type="password"
        helperText="At least 8 characters, including a number"
      />
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});

// ── Select ─────────────────────────────────────────────────────────────────────

describe('Select – accessibility (jest-axe)', () => {
  const options = [
    { value: 'health', label: 'Health Insurance' },
    { value: 'vehicle', label: 'Vehicle Insurance' },
  ];

  it('has no violations with a label and options', async () => {
    const { container } = render(
      <Select id="policy-type" label="Policy Type" options={options} />
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  it('has no violations with placeholder', async () => {
    const { container } = render(
      <Select
        id="policy-type"
        label="Policy Type"
        options={options}
        placeholder="Select a policy..."
      />
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  it('has no violations in error state', async () => {
    const { container } = render(
      <Select
        id="policy-type"
        label="Policy Type"
        options={options}
        state="error"
        error="Please select a policy type"
      />
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  it('has no violations when required', async () => {
    const { container } = render(
      <Select
        id="policy-type"
        label="Policy Type"
        options={options}
        required
      />
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});

// ── Textarea ───────────────────────────────────────────────────────────────────

describe('Textarea – accessibility (jest-axe)', () => {
  it('has no violations with a label', async () => {
    const { container } = render(
      <Textarea id="description" label="Incident Description" />
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  it('has no violations when required', async () => {
    const { container } = render(
      <Textarea id="description" label="Incident Description" required />
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  it('has no violations in error state', async () => {
    const { container } = render(
      <Textarea
        id="description"
        label="Incident Description"
        state="error"
        error="Description must be at least 20 characters"
      />
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  it('has no violations with helper text', async () => {
    const { container } = render(
      <Textarea
        id="description"
        label="Incident Description"
        helperText="Minimum 20 characters"
      />
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});

// ── Modal ──────────────────────────────────────────────────────────────────────

describe('Modal – accessibility (jest-axe)', () => {
  it('has no violations when open with title', async () => {
    const { container } = render(
      <Modal isOpen={true} onClose={jest.fn()} title="Confirm Action">
        <p>Are you sure you want to proceed?</p>
        <Button onClick={jest.fn()}>Confirm</Button>
        <Button variant="outline" onClick={jest.fn()}>Cancel</Button>
      </Modal>
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  it('has no violations when open with title and description', async () => {
    const { container } = render(
      <Modal
        isOpen={true}
        onClose={jest.fn()}
        title="Delete Policy"
        description="This action cannot be undone. The policy will be permanently deleted."
      >
        <Button variant="danger" onClick={jest.fn()}>Delete</Button>
      </Modal>
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  it('returns null when closed (no violations)', async () => {
    const { container } = render(
      <Modal isOpen={false} onClose={jest.fn()} title="Hidden Modal">
        <p>Hidden content</p>
      </Modal>
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  it('has no violations without close button', async () => {
    const { container } = render(
      <Modal isOpen={true} onClose={jest.fn()} title="No Close Button" showCloseButton={false}>
        <Button onClick={jest.fn()}>Done</Button>
      </Modal>
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});

// ── Badge ──────────────────────────────────────────────────────────────────────

describe('Badge – accessibility (jest-axe)', () => {
  it('has no violations when rendered', async () => {
    const { container } = render(<Badge>Active</Badge>);
    expect(await axe(container)).toHaveNoViolations();
  });
});

// ── Card ───────────────────────────────────────────────────────────────────────

describe('Card – accessibility (jest-axe)', () => {
  it('has no violations with content', async () => {
    const { container } = render(
      <Card>
        <h2>Policy Details</h2>
        <p>Coverage: $10,000</p>
      </Card>
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
