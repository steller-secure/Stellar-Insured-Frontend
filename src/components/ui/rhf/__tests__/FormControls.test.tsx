import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { FormInput } from '@/components/ui/rhf/FormInput';
import { FormTextarea } from '@/components/ui/rhf/FormTextarea';
import { FormSelect } from '@/components/ui/rhf/FormSelect';
import { FormCheckbox } from '@/components/ui/rhf/FormCheckbox';
import { FormSummaryError } from '@/components/ui/rhf/FormSummaryError';

const categoryMessage = 'Please choose a category';

const schema = z.object({
  email: z.string().email('Please enter a valid email address'),
  notes: z.string().min(10, 'Notes must be at least 10 characters'),
  category: z.enum(['A', 'B'], {
    errorMap: () => ({ message: categoryMessage }),
  }),
  terms: z.boolean().refine((v) => v, { message: 'You must agree to the terms' }),
});

type Values = z.infer<typeof schema>;

function Harness() {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<Values>({
    resolver: zodResolver(schema),
    mode: 'onChange',
    defaultValues: { email: '', notes: '', category: '' as never, terms: false },
  });

  const rootError = (errors.root as { message?: string } | undefined)?.message;

  return (
    <form onSubmit={handleSubmit(() => {})} noValidate>
      <FormSummaryError id="summary" message={rootError} />
      <FormInput name="email" control={control} label="Email Address" required placeholder="you@example.com" />
      <FormTextarea name="notes" control={control} label="Notes" helperText="Tell us more" />
      <FormSelect
        name="category"
        control={control}
        label="Category"
        options={[
          { value: 'A', label: 'Option A' },
          { value: 'B', label: 'Option B' },
        ]}
        placeholder="Choose one"
      />
      <FormCheckbox name="terms" control={control} label="I accept the terms" required />
      <button type="submit">Submit</button>
    </form>
  );
}

describe('RHF form controls', () => {
  it('renders labeled controls with aria wiring', () => {
    render(<Harness />);

    const email = screen.getByLabelText(/email address/i);
    expect(email).toHaveAttribute('id', 'email');
    expect(email).toHaveAttribute('aria-invalid', 'false');

    expect(screen.getByLabelText(/notes/i)).toHaveAttribute('id', 'notes');
    expect(screen.getByLabelText(/category/i)).toHaveAttribute('id', 'category');
    expect(screen.getByLabelText(/i accept the terms/i)).toHaveAttribute('id', 'terms');
  });

  it('surfaces validation errors on blur with aria-invalid and aria-describedby', async () => {
    const user = userEvent.setup();
    render(<Harness />);

    const email = screen.getByLabelText(/email address/i);
    await user.type(email, 'not-an-email');
    await user.tab();

    expect(email).toHaveAttribute('aria-invalid', 'true');
    expect(email).toHaveAttribute('aria-describedby', 'email-description');
    expect(screen.getByRole('alert')).toHaveTextContent('Please enter a valid email address');
  });

  it('clears the error once the value becomes valid', async () => {
    const user = userEvent.setup();
    render(<Harness />);

    const email = screen.getByLabelText(/email address/i);
    await user.type(email, 'user@example.com');
    await user.tab();

    expect(email).toHaveAttribute('aria-invalid', 'false');
    expect(screen.queryByText('Please enter a valid email address')).not.toBeInTheDocument();
  });

  it('shows errors for checkbox and select after they are touched', async () => {
    const user = userEvent.setup();
    render(<Harness />);

    const terms = screen.getByLabelText(/i accept the terms/i);
    await user.click(terms);
    await user.click(terms);
    await user.tab();

    expect(screen.getByText(/you must agree to the terms/i)).toBeInTheDocument();

    const category = screen.getByLabelText(/category/i);
    await user.click(category);
    await user.selectOptions(category, 'A');
    await user.tab();
    expect(screen.queryByText(categoryMessage)).not.toBeInTheDocument();

    fireEvent.change(category, { target: { value: '' } });
    await user.tab();
    expect(screen.getByText(categoryMessage)).toBeInTheDocument();
  });
});

describe('FormSummaryError', () => {
  it('renders nothing when there is no message', () => {
    render(<FormSummaryError message={undefined} id="summary" />);
    expect(document.getElementById('summary')).not.toBeInTheDocument();
  });

  it('renders the message in an alert region', () => {
    render(<FormSummaryError message="Something went wrong" id="summary" />);
    const alert = screen.getByRole('alert');
    expect(alert).toHaveAttribute('aria-live', 'assertive');
    expect(alert).toHaveTextContent('Something went wrong');
  });
});