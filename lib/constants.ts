export interface Facility {
  id: string;
  label: string;
  icon: string;
}

export const FACILITIES: Facility[] = [
  { id: 'wifi',            label: 'WiFi',              icon: '📶' },
  { id: 'parking',         label: 'Parking',            icon: '🅿️' },
  { id: 'kitchen',         label: 'Kitchen',            icon: '🍳' },
  { id: 'fireplace',       label: 'Fireplace',          icon: '🔥' },
  { id: 'bbq',             label: 'BBQ Grill',          icon: '🍖' },
  { id: 'hot_tub',         label: 'Hot Tub',            icon: '🛁' },
  { id: 'heating',         label: 'Heating',            icon: '♨️' },
  { id: 'washing_machine', label: 'Washing Machine',    icon: '🫧' },
  { id: 'tv',              label: 'TV',                 icon: '📺' },
  { id: 'pets',            label: 'Pet Friendly',       icon: '🐾' },
  { id: 'hiking',          label: 'Hiking Trails',      icon: '🥾' },
  { id: 'mountain_view',   label: 'Mountain View',      icon: '⛰️' },
  { id: 'outdoor_seating', label: 'Outdoor Seating',    icon: '🪑' },
  { id: 'terrace',         label: 'Terrace / Balcony',  icon: '🌿' },
  { id: 'river_view',      label: 'River View',         icon: '🏞️' },
  { id: 'sauna',           label: 'Sauna',              icon: '🧖' },
];
