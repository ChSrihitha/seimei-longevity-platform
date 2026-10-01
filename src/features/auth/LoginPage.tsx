import { useEffect, useState, type FormEvent } from 'react';
import { Eye, EyeOff, LockKeyhole, ShieldCheck } from 'lucide-react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { authenticate, getAuthenticatedUser, initializeAuth } from './auth';
import { RegistrationForm } from './RegistrationForm';

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const mode = location.pathname === '/create-account' ? 'register' : 'signin';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [loginError, setLoginError] = useState('');
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    let isMounted = true;
    initializeAuth()
      .then(() => { if (isMounted) setAuthReady(true); })
      .catch(() => {
        if (isMounted) {
          setAuthReady(true);
          setLoginError('Sign in is temporarily unavailable. Please try again.');
        }
      });
    return () => { isMounted = false; };
  }, []);

  if (getAuthenticatedUser()) return <Navigate to="/dashboard" replace />;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const normalizedEmail = email.trim();
    const nextEmailError = !normalizedEmail
      ? 'Enter your work email.'
      : !/^\S+@\S+\.\S+$/.test(normalizedEmail)
        ? 'Enter a valid email address.'
        : '';
    const nextPasswordError = password ? '' : 'Enter your password.';

    setEmailError(nextEmailError);
    setPasswordError(nextPasswordError);
    setLoginError('');

    if (nextEmailError || nextPasswordError) return;

    setIsSubmitting(true);
    try {
      if (!await authenticate(normalizedEmail, password)) {
        setLoginError('Incorrect email or password.');
        return;
      }
      navigate('/dashboard', { replace: true });
    } catch {
      setLoginError('Sign in is temporarily unavailable. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#f5f6f1] text-[var(--color-text-primary)]">
      <div className="mx-auto flex min-h-screen w-full max-w-[1280px] flex-col px-5 py-6 sm:px-8 lg:px-12">
        <header className="flex items-center">
          <Link to="/" aria-label="SEIMEI home" className="flex items-center gap-2.5">
            <span className="relative h-12 w-[72px] shrink-0 overflow-hidden" aria-hidden="true">
              <img src={`${import.meta.env.BASE_URL}logo.jpeg`} alt="" className="absolute -left-[42px] -top-[38px] h-[160px] w-[160px] max-w-none" />
            </span>
            <span className="-ml-2 leading-none">
              <span className="text-[21px] font-semibold text-[var(--color-brand-950)]">SEIMEI</span>
              <span className="mt-1 block text-[9px] text-[var(--color-brand-700)]">Corporate Longevity Hive</span>
            </span>
          </Link>
        </header>

        <div className="grid flex-1 items-center gap-10 py-10 lg:grid-cols-[1fr_440px] lg:gap-24 lg:py-14">
          <section className="mx-auto w-full max-w-xl lg:mx-0">
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.15em] text-[var(--color-brand-700)]">Your wellbeing, in focus</p>
            <h1 className="max-w-lg text-4xl font-semibold leading-[1.12] text-[var(--color-brand-950)] sm:text-5xl">A more thoughtful way to care for yourself.</h1>
            <p className="mt-5 max-w-md text-base leading-7 text-[var(--color-text-secondary)]">Sign in to check in with how you feel, understand your patterns, and find a next step that fits your day.</p>
            <div className="mt-10 hidden max-w-md items-start gap-4 border-t border-[#dfe5dc] pt-6 sm:flex">
              <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#e8efe4] text-[var(--color-brand-700)]"><ShieldCheck size={18} /></span>
              <div>
                <p className="text-sm font-semibold text-[var(--color-brand-950)]">A private space for your wellbeing</p>
                <p className="mt-1 text-sm leading-6 text-[var(--color-text-secondary)]">A quiet space to reflect, understand your patterns, and choose a next step.</p>
              </div>
            </div>
          </section>

          <section className="mx-auto w-full max-w-[520px] rounded-lg border border-[#e3e7df] bg-white p-6 shadow-[0_12px_36px_rgba(34,54,37,0.07)] sm:p-9">
            {mode === 'signin' ? <>
            <div className="mb-7">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--color-brand-700)]">Employee portal</p>
              <h2 className="mt-2 text-2xl font-semibold text-[var(--color-text-primary)]">Welcome back</h2>
              <p className="mt-1.5 text-sm text-[var(--color-text-secondary)]">Continue your wellbeing journey with SEIMEI.</p>
            </div>

            <form onSubmit={handleSubmit} noValidate>
              <div className="mb-5">
                <label htmlFor="email" className="mb-2 block text-sm font-medium text-[#343b34]">Work email</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="username"
                  value={email}
                  onChange={(event) => { setEmail(event.target.value); setEmailError(''); setLoginError(''); }}
                  aria-invalid={Boolean(emailError)}
                  aria-describedby={emailError ? 'email-error' : undefined}
                  className={`h-11 w-full rounded border bg-white px-3.5 text-sm outline-none transition focus:border-[var(--color-brand-600)] focus:ring-2 focus:ring-[var(--color-brand-100)] ${emailError ? 'border-[#bd4d43]' : 'border-[#d9dfd6]'}`}
                  placeholder="you@company.com"
                />
                {emailError && <p id="email-error" className="mt-1.5 text-xs text-[#a53e35]">{emailError}</p>}
              </div>

              <div>
                <label htmlFor="password" className="mb-2 block text-sm font-medium text-[#343b34]">Password</label>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    value={password}
                    onChange={(event) => { setPassword(event.target.value); setPasswordError(''); setLoginError(''); }}
                    aria-invalid={Boolean(passwordError)}
                    aria-describedby={passwordError ? 'password-error' : undefined}
                    className={`h-11 w-full rounded border bg-white px-3.5 pr-11 text-sm outline-none transition focus:border-[var(--color-brand-600)] focus:ring-2 focus:ring-[var(--color-brand-100)] ${passwordError ? 'border-[#bd4d43]' : 'border-[#d9dfd6]'}`}
                    placeholder="Enter your password"
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? 'Hide password' : 'Show password'} className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-[#737c73] hover:text-[var(--color-brand-800)]">
                    {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>
                {passwordError && <p id="password-error" className="mt-1.5 text-xs text-[#a53e35]">{passwordError}</p>}
              </div>

              <div className="mt-5 flex items-center justify-between gap-3 text-sm">
                <label className="flex cursor-pointer items-center gap-2 text-[#4f574f]">
                  <input type="checkbox" checked={rememberMe} onChange={(event) => setRememberMe(event.target.checked)} className="h-4 w-4 accent-[var(--color-brand-700)]" />
                  Remember me
                </label>
                <button type="button" className="font-medium text-[var(--color-brand-700)] hover:text-[var(--color-brand-950)]">Forgot password?</button>
              </div>

              {loginError && <p role="alert" className="mt-5 rounded border border-[#efd1cc] bg-[#fff7f5] px-3.5 py-3 text-sm leading-5 text-[#9b3d34]">{loginError}</p>}

              <button type="submit" disabled={isSubmitting || !authReady} className="mt-7 flex h-11 w-full items-center justify-center gap-2 rounded bg-[var(--color-brand-800)] px-4 text-sm font-semibold text-white transition-colors hover:bg-[var(--color-brand-950)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-400)] focus:ring-offset-2 disabled:cursor-wait disabled:opacity-70">
                {isSubmitting ? 'Signing In…' : authReady ? 'Sign In' : 'Loading account…'}
              </button>
            </form>

            <div className="mt-6 flex items-start gap-2.5 border-t border-[#edf0eb] pt-5 text-xs leading-5 text-[#687168]">
              <LockKeyhole size={15} className="mt-0.5 shrink-0 text-[var(--color-brand-700)]" />
              <p>Prototype accounts are stored in this browser. Choose a password you do not use elsewhere.</p>
            </div>
            <p className="mt-5 text-center text-sm text-[var(--color-text-secondary)]">Don't have an account? <button type="button" onClick={() => navigate('/create-account')} className="font-semibold text-[var(--color-brand-700)] hover:text-[var(--color-brand-950)] focus:outline-none focus:underline">Create an account</button></p>
            </> : <RegistrationForm onSuccess={() => navigate('/dashboard', { replace: true })} onSignIn={() => navigate('/sign-in')} />}
          </section>
        </div>
        <footer className="flex justify-between border-t border-[#e2e6de] pt-4 text-[11px] text-[#788078]">
          <span>© 2026 SEIMEI</span>
          <span>Designed for human wellbeing</span>
        </footer>
      </div>
    </main>
  );
}