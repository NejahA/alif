import { Song, Playlist } from '../types/music';

export const sampleSongs: Song[] = [
  { id: '1', title: 'Neon Lights', artist: 'Electra', album: 'Electric Dreams', genre: 'Electronic', duration: '3:45', cover: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=200&h=200&fit=crop', audioUrl: '' },
  { id: '2', title: 'Ocean Waves', artist: 'Coral Reef', album: 'Deep Blue', genre: 'Ambient', duration: '4:20', cover: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=200&h=200&fit=crop', audioUrl: '' },
  { id: '3', title: 'Midnight Jazz', artist: 'Blue Note', album: 'Late Sessions', genre: 'Jazz', duration: '5:10', cover: 'https://images.unsplash.com/photo-1511192336575-5a79af67a629?w=200&h=200&fit=crop', audioUrl: '' },
  { id: '4', title: 'Summer Breeze', artist: 'The Coastliners', album: 'Seaside', genre: 'Pop', duration: '3:30', cover: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=200&h=200&fit=crop', audioUrl: '' },
  { id: '5', title: 'Urban Flow', artist: 'MC Rhythm', album: 'City Streets', genre: 'Hip Hop', duration: '3:55', cover: 'https://images.unsplash.com/photo-1571330735066-03aaa9429d89?w=200&h=200&fit=crop', audioUrl: '' },
  { id: '6', title: 'Starlight Symphony', artist: 'Orion', album: 'Cosmos', genre: 'Classical', duration: '6:15', cover: 'https://images.unsplash.com/photo-1504898770365-14faca6a7320?w=200&h=200&fit=crop', audioUrl: '' },
  { id: '7', title: 'Electric Feel', artist: 'Voltage', album: 'High Power', genre: 'Rock', duration: '4:05', cover: 'https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?w=200&h=200&fit=crop', audioUrl: '' },
  { id: '8', title: 'Rainy Day', artist: 'Cloud Nine', album: 'Weather Patterns', genre: 'Lo-Fi', duration: '3:15', cover: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=200&h=200&fit=crop', audioUrl: '' },
  { id: '9', title: 'Desert Road', artist: 'Mirage', album: 'Sand & Sky', genre: 'Folk', duration: '4:40', cover: 'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=200&h=200&fit=crop', audioUrl: '' },
  { id: '10', title: 'Pulse', artist: 'Beat Engine', album: 'Frequency', genre: 'Electronic', duration: '3:25', cover: 'https://images.unsplash.com/photo-1574169208507-84376144848b?w=200&h=200&fit=crop', audioUrl: '' },
  { id: '11', title: 'Golden Hour', artist: 'Sunset Blvd', album: 'Twilight', genre: 'Indie', duration: '4:00', cover: 'https://images.unsplash.com/photo-1506157786151-b8491531f063?w=200&h=200&fit=crop', audioUrl: '' },
  { id: '12', title: 'Bass Drop', artist: 'Subwoofer', album: 'Low End', genre: 'Dubstep', duration: '3:50', cover: 'https://images.unsplash.com/photo-1571266028243-e4733b0f0bb0?w=200&h=200&fit=crop', audioUrl: '' },
];

export const defaultPlaylists: Playlist[] = [
  {
    id: 'pl1',
    name: 'Favorites',
    description: 'Your top picks',
    cover: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=200&h=200&fit=crop',
    songs: [sampleSongs[0], sampleSongs[3], sampleSongs[6]],
    createdAt: '2025-01-01',
  },
  {
    id: 'pl2',
    name: 'Chill Vibes',
    description: 'Relax and unwind',
    cover: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=200&h=200&fit=crop',
    songs: [sampleSongs[1], sampleSongs[7], sampleSongs[10]],
    createdAt: '2025-02-15',
  },
  {
    id: 'pl3',
    name: 'Workout Mix',
    description: 'High energy tracks',
    cover: 'https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?w=200&h=200&fit=crop',
    songs: [sampleSongs[4], sampleSongs[6], sampleSongs[9], sampleSongs[11]],
    createdAt: '2025-03-10',
  },
];