import { getSeriesTitles } from '@/lib/recommendations';
import { SeriesClient } from './series-client';
import { mergeTitles } from './titles';

// The curated list plus the series and movies members recommended and an admin approved.
export default async function SeriesYPeliculasPage() {
  return <SeriesClient titles={mergeTitles(await getSeriesTitles())} />;
}
