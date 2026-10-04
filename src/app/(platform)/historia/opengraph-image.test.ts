import { describeSectionOgImage } from '@/test/pages-a-l';
import * as image from './opengraph-image';

jest.mock('next/og', () => require('@/test/pages-a-l').nextOgMock);

describeSectionOgImage(image, { path: 'historia', title: 'Nuestra historia' });
