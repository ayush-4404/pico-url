import { Check, Circle } from 'lucide-react';

export default function PasswordStrength({ password }) {
  if (!password) return null;

  const checks = [
    { label: 'At least 8 characters', pass: password.length >= 8 },
    { label: 'One uppercase letter',   pass: /[A-Z]/.test(password) },
    { label: 'One lowercase letter',   pass: /[a-z]/.test(password) },
    { label: 'One number',             pass: /[0-9]/.test(password) },
  ];

  const passed = checks.filter((c) => c.pass).length;
  const strength = passed <= 1 ? 'Weak' : passed <= 2 ? 'Fair' : passed === 3 ? 'Good' : 'Strong';
  const colors   = { Weak: 'bg-red-500', Fair: 'bg-yellow-500', Good: 'bg-blue-500', Strong: 'bg-green-500' };
  const widths   = { Weak: 'w-1/4', Fair: 'w-2/4', Good: 'w-3/4', Strong: 'w-full' };
  const labelColor = { Weak: 'text-red-400', Fair: 'text-yellow-400', Good: 'text-blue-400', Strong: 'text-green-400' };

  return (
    <div className="mt-2 space-y-2">
      <div className="flex items-center gap-2">
        <div className="flex-1 h-1 bg-zinc-800 rounded-full overflow-hidden">
          <div className={`h-full rounded-full transition-all duration-500 ${colors[strength]} ${widths[strength]}`} />
        </div>
        <span className={`text-xs font-medium ${labelColor[strength]}`}>
          {strength}
        </span>
      </div>
      <ul className="space-y-1">
        {checks.map((c) => (
          <li key={c.label} className={`text-xs flex items-center gap-1.5 ${c.pass ? 'text-green-400' : 'text-zinc-500'}`}>
            {c.pass
              ? <Check className="h-3 w-3 flex-shrink-0" />
              : <Circle className="h-3 w-3 flex-shrink-0" />
            }
            {c.label}
          </li>
        ))}
      </ul>
    </div>
  );
}
