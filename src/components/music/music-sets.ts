export interface MusicSet {
  /** YouTube video id. */
  id: string;
  title: string;
  channel: string;
}

// The community's own live radios.
export const radios: MusicSet[] = [
  { id: '1vsUPluzAWo', title: 'Chill synthwave radio', channel: 'programaConNosotros' },
  { id: 'SpNIOu8LAFo', title: 'Dark synthwave radio', channel: 'programaConNosotros' },
  {
    id: 'sd9AbVNlgi4',
    title: 'Chill lofi & jazz hop radio',
    channel: 'programaConNosotros',
  },
];

// Playlists from other channels that the community recommends for focusing.
export const externalPlaylists: MusicSet[] = [
  {
    id: 'FejAQVk1NmU',
    title: 'this playlist will make you dangerously focused',
    channel: 'LOUNGE FOCUS',
  },
  {
    id: 'eE28XvrG0lM',
    title: 'this playlist will make you dangerously unstoppable',
    channel: 'LOUNGE FOCUS',
  },
  {
    id: 'MB6Fw9pp3g0',
    title: 'this playlist will make you dangerously focused',
    channel: 'LOUNGE FOCUS',
  },
];

export const musicSets = [...radios, ...externalPlaylists];

export const findMusicSet = (id: string) => musicSets.find((set) => set.id === id) ?? null;
