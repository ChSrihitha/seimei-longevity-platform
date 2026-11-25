import { useMemo, useState } from 'react';
import { AlertTriangle, Calculator, RotateCcw } from 'lucide-react';
import { calculateRoi, formatInr, ROI_DEFAULTS, ROI_LIMITS, validateRoiField, type RoiField, type RoiInputs } from '../data/roi';
import { panelClass } from '../components/AdminUi';

const FIELDS: { field: RoiField; label: string; prefix?: string; suffix: string; help: string }[] = [
  { field: 'employees', label: 'Number of employees', suffix: 'people', help: 'Headcount covered by the subscription.' },
  { field: 'attritionPct', label: 'Annual attrition rate', suffix: '%', help: 'Share of employees who leave each year.' },
  { field: 'ctcLakh', label: 'Average CTC per employee', prefix: '₹', suffix: 'lakh', help: 'Average annual cost to company.' },
  { field: 'replacementPct', label: 'Replacement cost', suffix: '% of CTC', help: 'Hiring, onboarding and lost productivity per leaver.' },
  { field: 'reductionPp', label: 'Expected attrition reduction', suffix: 'pp', help: 'Percentage points, e.g. 18% → 16% is 2 pp.' },
  { field: 'pricePerMonth', label: 'SEIMEI subscription price', prefix: '₹', suffix: '/ employee / month', help: 'Per-employee monthly price.' },
];

const toRaw = (inputs: RoiInputs) => Object.fromEntries(Object.entries(inputs).map(([key, value]) => [key, String(value)])) as Record<RoiField, string>;

export function RoiCalculator() {
  const [raw, setRaw] = useState<Record<RoiField, string>>(() => toRaw(ROI_DEFAULTS));

  const { errors, result, inputs } = useMemo(() => {
    const attrition = Number(raw.attritionPct);
    const attritionValid = validateRoiField('attritionPct', raw.attritionPct) === null;
    const fieldErrors = Object.fromEntries(FIELDS.map(({ field }) => [field, validateRoiField(field, raw[field], attritionValid ? attrition : undefined)])) as Record<RoiField, string | null>;
    const valid = Object.values(fieldErrors).every((error) => error === null);
    const parsed = Object.fromEntries(FIELDS.map(({ field }) => [field, Number(raw[field])])) as RoiInputs;
    return { errors: fieldErrors, inputs: parsed, result: valid ? calculateRoi(parsed) : null };
  }, [raw]);

  const coverageBar = result?.coveragePct === null || !result ? 0 : Math.min(100, result.coveragePct);

  return (
    <div className="space-y-5">
      <section className={`${panelClass} p-5 sm:p-7`}>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="flex items-center gap-2 text-sm font-medium text-[var(--color-brand-800)]"><Calculator size={16} /> ROI estimate</p>
            <h2 className="mt-2 text-2xl font-semibold leading-tight tracking-tight text-[var(--color-text-primary)] sm:text-3xl">What does employee attrition cost your organisation?</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--color-text-secondary)]">Enter your own figures. Results update as you type and are illustrative estimates, not SEIMEI results.</p>
          </div>
          <button type="button" onClick={() => setRaw(toRaw(ROI_DEFAULTS))} className="inline-flex h-10 shrink-0 items-center gap-2 self-start rounded-xl border border-[var(--color-border)] bg-white px-4 text-sm font-medium text-[var(--color-text-primary)] hover:bg-[var(--color-brand-50)]">
            <RotateCcw size={13} /> Reset defaults
          </button>
        </div>

        <div className="mt-7 grid gap-7 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <form className="grid content-start gap-5 sm:grid-cols-2" onSubmit={(event) => event.preventDefault()} noValidate>
            {FIELDS.map(({ field, label, prefix, suffix, help }) => {
              const error = errors[field];
              const id = `roi-${field}`;
              return (
                <div key={field} className="min-w-0">
                  <label htmlFor={id} className="block text-sm font-medium text-[var(--color-text-primary)]">{label}</label>
                  <div className={`mt-2 flex h-11 items-center rounded-xl border bg-white px-3 focus-within:border-[var(--color-accent)] focus-within:ring-2 focus-within:ring-[var(--color-accent)]/15 ${error ? 'border-[#c0703f]' : 'border-[var(--color-border)]'}`}>
                    {prefix && <span className="mr-1 text-sm text-[var(--color-text-secondary)]">{prefix}</span>}
                    <input
                      id={id}
                      type="number"
                      inputMode="decimal"
                      min={ROI_LIMITS[field].min}
                      max={ROI_LIMITS[field].max}
                      step={ROI_LIMITS[field].step}
                      value={raw[field]}
                      onChange={(event) => setRaw((current) => ({ ...current, [field]: event.target.value }))}
                      onKeyDown={(event) => { if (event.key === '-' || event.key === 'e' || event.key === 'E') event.preventDefault(); }}
                      aria-invalid={Boolean(error)}
                      aria-describedby={`${id}-hint`}
                      className="min-w-0 flex-1 bg-transparent text-sm tabular-nums text-[var(--color-text-primary)] outline-none"
                    />
                    <span className="ml-2 shrink-0 text-xs text-[var(--color-text-secondary)]">{suffix}</span>
                  </div>
                  <p id={`${id}-hint`} className={`mt-1.5 text-xs leading-5 ${error ? 'text-[#9a4f23]' : 'text-[var(--color-text-secondary)]'}`}>{error ?? help}</p>
                </div>
              );
            })}
          </form>

          <div className="rounded-2xl border border-[var(--color-brand-100)] bg-[var(--color-brand-50)] p-5 sm:p-6" aria-live="polite">
            <p className="text-sm font-semibold text-[var(--color-brand-800)]">Estimated annual figures</p>
            {result ? (
              <>
                <dl className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <ResultTile label="Current annual attrition cost" value={formatInr(result.currentAttritionCost)} detail={`${inputs.employees.toLocaleString('en-IN')} × ${inputs.attritionPct}% × ₹${inputs.ctcLakh} lakh × ${inputs.replacementPct}%`} />
                  <ResultTile label="Estimated savings from reduced attrition" value={formatInr(result.estimatedSavings)} detail={`${inputs.reductionPp} pp fewer leavers per year`} emphasis />
                  <ResultTile label="Annual SEIMEI subscription cost" value={formatInr(result.subscriptionCost)} detail={`${inputs.employees.toLocaleString('en-IN')} × ₹${inputs.pricePerMonth.toLocaleString('en-IN')} × 12 months`} />
                  <ResultTile
                    label="Subscription covered by savings"
                    value={result.coveragePct === null ? 'n/a' : `${Math.round(result.coveragePct).toLocaleString('en-IN')}%`}
                    detail={result.coveragePct === null ? 'Subscription price is ₹0, so coverage is undefined.' : result.coveragePct >= 100 ? 'Estimated savings exceed the subscription cost.' : 'Estimated savings cover part of the subscription cost.'}
                  />
                </dl>
                {result.coveragePct !== null && (
                  <div className="mt-5">
                    <div className="h-2 overflow-hidden rounded-full bg-[var(--color-brand-100)]" role="img" aria-label={`Coverage ${Math.round(result.coveragePct)}%`}>
                      <div className="h-full rounded-full bg-[var(--color-brand-600)]" style={{ width: `${coverageBar}%` }} />
                    </div>
                    <div className="mt-2 flex justify-between text-xs text-[var(--color-text-secondary)]"><span>0%</span><span>100% = break-even</span></div>
                  </div>
                )}
                {result.breakEvenReductionPp !== null && result.subscriptionCost > 0 && (
                  <p className="mt-4 text-sm leading-6 text-[var(--color-text-secondary)]">
                    Break-even: an attrition reduction of about <strong className="font-semibold">{result.breakEvenReductionPp.toLocaleString('en-IN', { maximumFractionDigits: 2 })} pp</strong> would offset the subscription cost.
                  </p>
                )}
              </>
            ) : (
              <div className="mt-4 flex items-start gap-2 rounded-xl border border-[#ead8c4] bg-[#fdf7ef] p-4 text-sm leading-6 text-[#7a4b22]">
                <AlertTriangle size={15} className="mt-0.5 shrink-0" />
                <p>Correct the highlighted inputs to see the estimate.</p>
              </div>
            )}
          </div>
        </div>
      </section>

      <div className="grid gap-5 lg:grid-cols-2">
        <section className={`${panelClass} flex items-start gap-3 border-[#e8dfce] bg-[#fffaf1] p-5 sm:p-6`}>
          <AlertTriangle size={18} className="mt-0.5 shrink-0 text-[#9b783c]" />
          <div>
            <p className="text-sm font-semibold text-[#4a4335]">This is an estimate, not a guarantee</p>
            <p className="mt-2 text-sm leading-6 text-[#746e5f]">
              The calculator multiplies the figures you enter. The attrition reduction is your assumption — SEIMEI has not measured it for your organisation.
              Actual business impact must be validated against your own HR attrition and cost data, ideally with a baseline and comparison period.
            </p>
          </div>
        </section>
        <details className={`${panelClass} group self-start p-5 sm:p-6`}>
          <summary className="cursor-pointer text-sm font-semibold text-[var(--color-text-primary)]">How this is calculated</summary>
          <ul className="mt-4 space-y-2 text-sm leading-6 text-[var(--color-text-secondary)]">
            <li><strong className="font-semibold">Current cost</strong> = employees × attrition rate × average CTC × replacement cost %</li>
            <li><strong className="font-semibold">Estimated savings</strong> = employees × reduction (pp) × average CTC × replacement cost %</li>
            <li><strong className="font-semibold">Subscription</strong> = employees × monthly price × 12</li>
            <li><strong className="font-semibold">Coverage</strong> = estimated savings ÷ subscription × 100</li>
            <li>Percentages are converted to decimals; CTC in lakh is converted to rupees (1 lakh = ₹1,00,000).</li>
          </ul>
        </details>
      </div>
    </div>
  );
}

function ResultTile({ label, value, detail, emphasis = false }: { label: string; value: string; detail: string; emphasis?: boolean }) {
  return (
    <div className={`min-w-0 rounded-xl border p-4 ${emphasis ? 'border-[var(--color-brand-200)] bg-white' : 'border-[var(--color-border)] bg-white/75'}`}>
      <dt className="text-xs font-medium leading-5 text-[var(--color-text-secondary)]">{label}</dt>
      <dd className="mt-1 break-words text-xl font-semibold leading-7 tracking-tight text-[var(--color-text-primary)]">{value}</dd>
      <dd className="mt-1 text-xs leading-5 text-[var(--color-text-secondary)]">{detail}</dd>
    </div>
  );
}
