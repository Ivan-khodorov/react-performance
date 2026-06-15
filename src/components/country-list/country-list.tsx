import { memo, useCallback, useMemo, useState } from 'react';
import type { UIEvent } from 'react';
import type { Country } from '../../types';
import { CountryCard } from '../country-card/country-card';
import { getPopulationForYear, createYearDataMap } from '../../utils/data-transformers';

import styles from './country-list.module.css';

const LIST_HEIGHT = 720;
const CARD_VERTICAL_GAP = 16;
const CARD_BASE_HEIGHT = 154;
const COLUMN_ROW_HEIGHT = 34;
const OVERSCAN_COUNT = 4;

type CountryListProps = {
  countries: Country[];
  searchQuery: string;
  selectedColumns: string[];
  selectedYear: number;
  sortField: 'name' | 'population';
  sortOrder: 'asc' | 'desc';
};

export const CountryList = memo(function CountryList({
  countries,
  searchQuery,
  selectedColumns,
  selectedYear,
  sortField,
  sortOrder,
}: CountryListProps) {
  const [scrollTop, setScrollTop] = useState(0);

  const normalizedSearchQuery = useMemo(() => searchQuery.toLowerCase(), [searchQuery]);

  const countryYearDataMaps = useMemo(() => {
    return new Map(countries.map((country) => [country.id, createYearDataMap(country.data)]));
  }, [countries]);

  const filteredCountries = useMemo(() => {
    return countries
      .filter((country) => {
        const matchesSearch = country.id.toLowerCase().includes(normalizedSearchQuery);

        return matchesSearch;
      })
      .sort((a, b) => {
      if (sortField === 'name') {
        return sortOrder === 'asc' ? a.id.localeCompare(b.id) : b.id.localeCompare(a.id);
      }

      const popA = getPopulationForYear(countryYearDataMaps.get(a.id)!, selectedYear) || 0;
      const popB = getPopulationForYear(countryYearDataMaps.get(b.id)!, selectedYear) || 0;

      return sortOrder === 'asc' ? popA - popB : popB - popA;
    });
  }, [
    countries,
    countryYearDataMaps,
    normalizedSearchQuery,
    selectedYear,
    sortField,
    sortOrder,
  ]);

  const itemHeight = CARD_BASE_HEIGHT + selectedColumns.length * COLUMN_ROW_HEIGHT;
  const totalHeight = filteredCountries.length * itemHeight;
  const firstVisibleIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - OVERSCAN_COUNT);
  const visibleItemCount = Math.ceil(LIST_HEIGHT / itemHeight) + OVERSCAN_COUNT * 2;
  const lastVisibleIndex = Math.min(filteredCountries.length, firstVisibleIndex + visibleItemCount);
  const visibleCountries = filteredCountries.slice(firstVisibleIndex, lastVisibleIndex);

  const handleScroll = useCallback((event: UIEvent<HTMLDivElement>) => {
    setScrollTop(event.currentTarget.scrollTop);
  }, []);

  return (
    <div className={styles.countryList} onScroll={handleScroll}>
      <div className={styles.virtualListSpacer} style={{ height: totalHeight }}>
        {visibleCountries.map((country, index) => (
          <div
            key={country.id}
            className={styles.virtualListItem}
            style={{
              height: itemHeight - CARD_VERTICAL_GAP,
              transform: `translateY(${(firstVisibleIndex + index) * itemHeight}px)`,
            }}
          >
            <CountryCard
              country={country}
              selectedYear={selectedYear}
              selectedColumns={selectedColumns}
            />
          </div>
        ))}
      </div>
    </div>
  );
});
