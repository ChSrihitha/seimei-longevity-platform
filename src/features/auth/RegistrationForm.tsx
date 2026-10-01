import { useState, type FormEvent } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { isEmailRegistered, signUp } from './auth';

type RegistrationValues = {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: string;
  department: string;
};

type RegistrationField = keyof RegistrationValues;
type RegistrationErrors = Partial<Record<RegistrationField, string>>;

type RegistrationFormProps = {
  onSuccess: () => void;
  onSignIn: () => void;
};

const initialValues: RegistrationValues = {
  fullName: '',
  email: '',
  password: '',
  confirmPassword: '',
  role: '',
  department: '',
};

const inputClass = 'h-11 w-full rounded border border-[#d9dfd6] bg-white px-3.5 text-sm outline-none transition focus:border-[var(--color-brand-600)] focus:ring-2 focus:ring-[var(--color-brand-100)]';

export function RegistrationForm({ onSuccess, onSignIn }: RegistrationFormProps) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState<RegistrationErrors>({});
  const [formError, setFormError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isFormValid = Boolean(
    values.fullName.trim() &&
    /^\S+@\S+\.\S+$/.test(values.email.trim()) &&
    values.password.length >= 8 &&
    values.confirmPassword === values.password &&
    !errors.fullName && !errors.email && !errors.password && !errors.confirmPassword,
  );

  function updateField(field: RegistrationField, value: string) {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({
      ...current,
      [field]: '',
      ...(field === 'password' && value === values.confirmPassword ? { confirmPassword: '' } : {}),
    }));
    setFormError('');
  }

  function validateField(field: RegistrationField) {
    const value = values[field];
    let message = '';
    if (field === 'fullName' && !value.trim()) message = 'Please enter your full name.';
    if (field === 'email') {
      if (!value.trim()) message = 'Please enter your work email.';
      else if (!/^\S+@\S+\.\S+$/.test(value.trim())) message = 'Please enter a valid email address.';
    }
    if (field === 'password') {
      if (!value) message = 'Please enter a password.';
      else if (value.length < 8) message = 'Use at least 8 characters.';
    }
    if (field === 'confirmPassword') {
      if (!value) message = 'Please confirm your password.';
      else if (value !== values.password) message = 'Passwords do not match.';
    }
    setErrors((current) => ({ ...current, [field]: message }));
  }

  async function validateEmailAvailability() {
    validateField('email');
    const email = values.email.trim();
    if (!/^\S+@\S+\.\S+$/.test(email)) return;

    try {
      if (await isEmailRegistered(email)) {
        setErrors((current) => ({ ...current, email: 'An account with this email already exists.' }));
      }
    } catch {
      setFormError('Account validation is temporarily unavailable. Please try again.');
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors: RegistrationErrors = {};
    const email = values.email.trim();

    if (!values.fullName.trim()) nextErrors.fullName = 'Please enter your full name.';
    if (!email) nextErrors.email = 'Please enter your work email.';
    else if (!/^\S+@\S+\.\S+$/.test(email)) nextErrors.email = 'Please enter a valid email address.';
    if (!values.password) nextErrors.password = 'Please enter a password.';
    else if (values.password.length < 8) nextErrors.password = 'Use at least 8 characters.';
    if (!values.confirmPassword) nextErrors.confirmPassword = 'Please confirm your password.';
    else if (values.password !== values.confirmPassword) nextErrors.confirmPassword = 'Passwords do not match.';

    setErrors(nextErrors);
    setFormError('');
    if (Object.keys(nextErrors).length > 0) return;

    setIsSubmitting(true);
    try {
      const result = await signUp({
        fullName: values.fullName.trim(),
        email,
        password: values.password,
        ...(values.role.trim() ? { role: values.role.trim() } : {}),
        ...(values.department.trim() ? { department: values.department.trim() } : {}),
      });

      if ('error' in result) {
        setFormError('An account with this email already exists.');
        return;
      }

      onSuccess();
    } catch {
      setFormError('Account creation is temporarily unavailable. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }

  function fieldError(field: RegistrationField) {
    return errors[field] ? <p id={`${field}-error`} className="mt-1.5 text-xs text-[#a53e35]">{errors[field]}</p> : null;
  }

  return <>
    <div className="mb-6">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--color-brand-700)]">Employee portal</p>
      <h2 className="mt-2 text-2xl font-semibold text-[var(--color-text-primary)]">Create your SEIMEI account</h2>
      <p className="mt-1.5 text-sm text-[var(--color-text-secondary)]">Set up your employee wellbeing profile to get started.</p>
    </div>

    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      <div>
        <label htmlFor="register-name" className="mb-2 block text-sm font-medium text-[#343b34]">Full Name</label>
        <input id="register-name" name="name" type="text" autoComplete="name" value={values.fullName} onChange={(event) => updateField('fullName', event.target.value)} onBlur={() => validateField('fullName')} aria-invalid={Boolean(errors.fullName)} aria-describedby={errors.fullName ? 'fullName-error' : undefined} className={`${inputClass} ${errors.fullName ? 'border-[#bd4d43]' : ''}`} placeholder="Your full name" />
        {fieldError('fullName')}
      </div>

      <div>
        <label htmlFor="register-email" className="mb-2 block text-sm font-medium text-[#343b34]">Work Email</label>
        <input id="register-email" name="email" type="email" autoComplete="email" value={values.email} onChange={(event) => updateField('email', event.target.value)} onBlur={validateEmailAvailability} aria-invalid={Boolean(errors.email)} aria-describedby={errors.email ? 'email-error' : undefined} className={`${inputClass} ${errors.email ? 'border-[#bd4d43]' : ''}`} placeholder="you@company.com" />
        {fieldError('email')}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="register-password" className="mb-2 block text-sm font-medium text-[#343b34]">Password</label>
          <div className="relative">
            <input id="register-password" name="new-password" type={showPassword ? 'text' : 'password'} autoComplete="new-password" value={values.password} onChange={(event) => updateField('password', event.target.value)} onBlur={() => validateField('password')} aria-invalid={Boolean(errors.password)} aria-describedby={errors.password ? 'password-error' : undefined} className={`${inputClass} pr-10 ${errors.password ? 'border-[#bd4d43]' : ''}`} placeholder="At least 8 characters" />
            <button type="button" onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? 'Hide password' : 'Show password'} className="absolute inset-y-0 right-0 flex w-10 items-center justify-center rounded-r text-[#737c73] hover:text-[var(--color-brand-800)] focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[var(--color-brand-400)]">{showPassword ? <EyeOff size={17} /> : <Eye size={17} />}</button>
          </div>
          {fieldError('password')}
        </div>
        <div>
          <label htmlFor="register-confirm-password" className="mb-2 block text-sm font-medium text-[#343b34]">Confirm Password</label>
          <div className="relative">
            <input id="register-confirm-password" name="confirm-password" type={showConfirmPassword ? 'text' : 'password'} autoComplete="new-password" value={values.confirmPassword} onChange={(event) => updateField('confirmPassword', event.target.value)} onBlur={() => validateField('confirmPassword')} aria-invalid={Boolean(errors.confirmPassword)} aria-describedby={errors.confirmPassword ? 'confirmPassword-error' : undefined} className={`${inputClass} pr-10 ${errors.confirmPassword ? 'border-[#bd4d43]' : ''}`} placeholder="Confirm password" />
            <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'} className="absolute inset-y-0 right-0 flex w-10 items-center justify-center rounded-r text-[#737c73] hover:text-[var(--color-brand-800)] focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[var(--color-brand-400)]">{showConfirmPassword ? <EyeOff size={17} /> : <Eye size={17} />}</button>
          </div>
          {fieldError('confirmPassword')}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="register-role" className="mb-2 block text-sm font-medium text-[#343b34]">Job Role <span className="font-normal text-[#788078]">(optional)</span></label>
          <input id="register-role" name="role" type="text" autoComplete="organization-title" value={values.role} onChange={(event) => updateField('role', event.target.value)} aria-invalid={Boolean(errors.role)} aria-describedby={errors.role ? 'role-error' : undefined} className={`${inputClass} ${errors.role ? 'border-[#bd4d43]' : ''}`} placeholder="e.g. Product Designer" />
          {fieldError('role')}
        </div>
        <div>
          <label htmlFor="register-department" className="mb-2 block text-sm font-medium text-[#343b34]">Department <span className="font-normal text-[#788078]">(optional)</span></label>
          <input id="register-department" name="department" type="text" autoComplete="organization" value={values.department} onChange={(event) => updateField('department', event.target.value)} className={inputClass} placeholder="e.g. Product" />
        </div>
      </div>

      {formError && <p role="alert" className="rounded border border-[#efd1cc] bg-[#fff7f5] px-3.5 py-3 text-sm leading-5 text-[#9b3d34]">{formError}</p>}

      <button type="submit" disabled={!isFormValid || isSubmitting} className="flex h-11 w-full items-center justify-center rounded bg-[var(--color-brand-800)] px-4 text-sm font-semibold text-white transition-colors hover:bg-[var(--color-brand-950)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-400)] focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">{isSubmitting ? 'Creating Account…' : 'Create Account'}</button>
    </form>

    <p className="mt-5 border-t border-[#edf0eb] pt-5 text-center text-sm text-[var(--color-text-secondary)]">Already have an account? <button type="button" onClick={onSignIn} className="font-semibold text-[var(--color-brand-700)] hover:text-[var(--color-brand-950)] focus:outline-none focus:underline">Sign in</button></p>
  </>;
}
