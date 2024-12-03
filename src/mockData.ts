import { Playlist } from './types';

export const playlists: Playlist[] = [
  {
    id: '1',
    name: 'Discover Weekly',
    cover: 'https://images.unsplash.com/photo-1687424909155-2ab96ed71f1d',
    tracks: [
      {
        id: '1',
        title: 'Dreams',
        artist: 'Fleetwood Mac',
        album: 'Rumours',
        duration: '4:14',
        albumCover: 'https://images.unsplash.com/photo-1687424909155-2ab96ed71f1d',
        mp3: 'https://www2.cs.uic.edu/~i101/SoundFiles/BabyElephantWalk60.wav' // Example audio file
      },
      {
        id: '2',
        title: 'Don\'t Stop Believin\'',
        artist: 'Journey',
        album: 'Escape',
        duration: '4:11',
        albumCover: 'https://images.unsplash.com/photo-1619983081563-430f63602796',
        mp3: 'https://www2.cs.uic.edu/~i101/SoundFiles/CantinaBand60.wav' // Example audio file
      },
      {
        id: '3',
        title: 'Bohemian Rhapsody',
        artist: 'Queen',
        album: 'A Night at the Opera',
        duration: '5:55',
        albumCover: 'https://images.unsplash.com/photo-1514924013411-cbf25faa35bb',
        mp3: 'https://www2.cs.uic.edu/~i101/SoundFiles/StarWars60.wav' // Example audio file
      },
    ]
  },
  {
    id: '2',
    name: 'Daily Mix 1',
    cover: 'https://images.unsplash.com/photo-1619983081563-430f63602796',
    tracks: []
  },
  {
    id: '3',
    name: 'Chill Vibes',
    cover: 'https://images.unsplash.com/photo-1514924013411-cbf25faa35bb',
    tracks: []
  },
  {
    id: '4',
    name: 'Rock Classics',
    cover: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea',
    tracks: []
  },
  {
    id: '5',
    name: 'Jazz Essentials',
    cover: 'https://images.unsplash.com/photo-1511735111819-9a3f7709049c',
    tracks: []
  }
];