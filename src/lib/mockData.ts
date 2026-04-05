export interface Event {
  id: string;
  title: string;
  description: string;
  category: string;
  date: string;
  time: string;
  venue: string;
  city: string;
  language: string;
  price: number;
  image: string;
  lat: number;
  lng: number;
  totalSeats: number;
  availableSeats: number;
  familyFriendly: boolean;
  hasParking: boolean;
  parkingSlots: number;
  artist?: string;
  tags: string[];
}

export const CATEGORIES = ['Music', 'Comedy', 'Theatre', 'Sports', 'Workshop', 'Festival', 'Tech', 'Food'] as const;
export const CITIES = ['Bengaluru', 'Mumbai', 'Delhi', 'Chennai', 'Hyderabad', 'Pune', 'Kolkata', 'Jaipur'] as const;
export const LANGUAGES = ['English', 'Hindi', 'Kannada', 'Tamil', 'Telugu', 'Marathi', 'Bengali'] as const;

export const mockEvents: Event[] = [
  {
    id: '1',
    title: 'Arijit Singh Live in Concert',
    description: 'Experience the magic of Arijit Singh live! An unforgettable evening of soulful melodies and chart-topping hits that will leave you spellbound.',
    category: 'Music',
    date: '2026-05-15',
    time: '19:00',
    venue: 'Palace Grounds',
    city: 'Bengaluru',
    language: 'Hindi',
    price: 2500,
    image: '',
    lat: 12.9981,
    lng: 77.5722,
    totalSeats: 200,
    availableSeats: 142,
    familyFriendly: true,
    hasParking: true,
    parkingSlots: 60,
    artist: 'Arijit Singh',
    tags: ['bollywood', 'live-music', 'concert'],
  },
  {
    id: '2',
    title: 'Zakir Khan – Haq Se Single 4.0',
    description: 'India\'s favourite stand-up comedian is back with a brand new hour! Get ready for relatable comedy, killer punchlines, and non-stop laughter.',
    category: 'Comedy',
    date: '2026-05-20',
    time: '20:00',
    venue: 'Chowdiah Memorial Hall',
    city: 'Bengaluru',
    language: 'Hindi',
    price: 999,
    image: '',
    lat: 12.9896,
    lng: 77.5700,
    totalSeats: 150,
    availableSeats: 38,
    familyFriendly: false,
    hasParking: true,
    parkingSlots: 40,
    artist: 'Zakir Khan',
    tags: ['standup', 'comedy', 'hindi'],
  },
  {
    id: '3',
    title: 'Bengaluru Theatre Festival',
    description: 'A week-long celebration of performing arts featuring plays in Kannada, English, and Hindi. Multiple performances across iconic venues.',
    category: 'Theatre',
    date: '2026-06-01',
    time: '18:00',
    venue: 'Ranga Shankara',
    city: 'Bengaluru',
    language: 'Kannada',
    price: 500,
    image: '',
    lat: 12.9166,
    lng: 77.6101,
    totalSeats: 100,
    availableSeats: 67,
    familyFriendly: true,
    hasParking: false,
    parkingSlots: 0,
    artist: undefined,
    tags: ['theatre', 'kannada', 'arts', 'festival'],
  },
  {
    id: '4',
    title: 'IPL Fan Park – RCB vs MI',
    description: 'Watch the biggest IPL rivalry on the giant screen! Food stalls, games, and an electric atmosphere. Wear your team colors!',
    category: 'Sports',
    date: '2026-05-10',
    time: '15:30',
    venue: 'Cubbon Park Fan Zone',
    city: 'Bengaluru',
    language: 'English',
    price: 350,
    image: '',
    lat: 12.9763,
    lng: 77.5929,
    totalSeats: 500,
    availableSeats: 220,
    familyFriendly: true,
    hasParking: true,
    parkingSlots: 80,
    tags: ['ipl', 'cricket', 'sports', 'rcb'],
  },
  {
    id: '5',
    title: 'Mumbai Electronic Music Festival',
    description: 'Three stages, 20+ artists, one unforgettable night. Featuring international and local DJs spinning everything from house to techno.',
    category: 'Music',
    date: '2026-06-15',
    time: '16:00',
    venue: 'MMRDA Grounds',
    city: 'Mumbai',
    language: 'English',
    price: 3500,
    image: '',
    lat: 19.0630,
    lng: 72.8681,
    totalSeats: 1000,
    availableSeats: 580,
    familyFriendly: false,
    hasParking: true,
    parkingSlots: 100,
    tags: ['edm', 'electronic', 'festival', 'nightlife'],
  },
  {
    id: '6',
    title: 'Pottery & Chai Workshop',
    description: 'Learn the art of pottery with expert guidance. Includes all materials, chai breaks, and you take home your creations!',
    category: 'Workshop',
    date: '2026-05-25',
    time: '10:00',
    venue: 'The Clay Studio',
    city: 'Pune',
    language: 'English',
    price: 1200,
    image: '',
    lat: 18.5204,
    lng: 73.8567,
    totalSeats: 20,
    availableSeats: 8,
    familyFriendly: true,
    hasParking: false,
    parkingSlots: 0,
    tags: ['workshop', 'pottery', 'art', 'creative'],
  },
  {
    id: '7',
    title: 'Delhi Street Food Festival',
    description: 'Explore 100+ stalls from across India. From chaat to dosa, biryani to momos — your ultimate foodie weekend awaits.',
    category: 'Food',
    date: '2026-06-08',
    time: '11:00',
    venue: 'JLN Stadium Complex',
    city: 'Delhi',
    language: 'Hindi',
    price: 200,
    image: '',
    lat: 28.5808,
    lng: 77.2336,
    totalSeats: 2000,
    availableSeats: 1450,
    familyFriendly: true,
    hasParking: true,
    parkingSlots: 120,
    tags: ['food', 'festival', 'street-food', 'family'],
  },
  {
    id: '8',
    title: 'React India Conference 2026',
    description: 'India\'s premier React conference. Two days of talks, workshops, and networking with the best developers in the ecosystem.',
    category: 'Tech',
    date: '2026-07-12',
    time: '09:00',
    venue: 'HICC',
    city: 'Hyderabad',
    language: 'English',
    price: 4000,
    image: '',
    lat: 17.4854,
    lng: 78.3806,
    totalSeats: 300,
    availableSeats: 195,
    familyFriendly: true,
    hasParking: true,
    parkingSlots: 50,
    tags: ['tech', 'react', 'conference', 'developer'],
  },
];

export const generateSeatLayout = (totalSeats: number) => {
  const rows = Math.ceil(totalSeats / 10);
  const seats: { id: string; row: string; number: number; status: 'available' | 'booked' | 'held' }[] = [];
  for (let r = 0; r < rows; r++) {
    const rowLabel = String.fromCharCode(65 + r);
    const seatsInRow = Math.min(10, totalSeats - r * 10);
    for (let s = 1; s <= seatsInRow; s++) {
      seats.push({
        id: `${rowLabel}${s}`,
        row: rowLabel,
        number: s,
        status: Math.random() > 0.7 ? 'booked' : 'available',
      });
    }
  }
  return seats;
};
