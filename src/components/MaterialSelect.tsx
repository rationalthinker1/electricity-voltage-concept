import { MATERIALS, type MaterialKey } from '@/lib/physics';

interface MaterialSelectProps {
  value: MaterialKey;
  onChange: (v: MaterialKey) => void;
}

/**
 * The shared material dropdown. Used by Ohm's-law, Resistance, Drift,
 * and Joule labs — keep entries here in sync with MATERIALS in physics.ts.
 */
export function MaterialSelect({ value, onChange }: MaterialSelectProps) {
  return (
    <select
      className="material-select"
      value={value}
      onChange={(e) => onChange(e.target.value as MaterialKey)}
    >
      {Object.entries(MATERIALS).map(([key, mat]) => (
        <option key={key} value={key}>
          {mat.name}
        </option>
      ))}
    </select>
  );
}
