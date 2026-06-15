import { memo, useCallback, useMemo } from 'react';
import type { ChangeEvent } from 'react';
import styles from './year-selector.module.css';

type YearSelectorProps = {
  year: number;
  years: number[];
  onChange: (year: number) => void;
};

export const YearSelector = memo(function YearSelector({ year, years, onChange }: YearSelectorProps) {
  const handleChange = useCallback(
    (event: ChangeEvent<HTMLSelectElement>) => {
      onChange(Number(event.target.value));
    },
    [onChange]
  );

  const yearOptions = useMemo(
    () =>
      years.map((availableYear) => (
        <option key={availableYear} value={availableYear}>
          {availableYear}
        </option>
      )),
    [years]
  );

  return (
    <div className={styles.container}>
      <label htmlFor="year" className={styles.label}>
        Select year:
      </label>
      <select
        id="year"
        value={year}
        onChange={handleChange}
        className={styles.select}
      >
        {yearOptions}
      </select>
    </div>
  );
});
