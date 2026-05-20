// Common country dial codes for the checkout phone field.
// `len` is the expected national-number length (digits, excluding code).
// India is first so it stays default.
export const COUNTRY_CODES = [
  { code: '+91',  flag: '🇮🇳', name: 'India',                len: 10 },
  { code: '+1',   flag: '🇺🇸', name: 'USA / Canada',         len: 10 },
  { code: '+44',  flag: '🇬🇧', name: 'United Kingdom',       len: 10 },
  { code: '+61',  flag: '🇦🇺', name: 'Australia',            len: 9  },
  { code: '+971', flag: '🇦🇪', name: 'United Arab Emirates', len: 9  },
  { code: '+966', flag: '🇸🇦', name: 'Saudi Arabia',         len: 9  },
  { code: '+974', flag: '🇶🇦', name: 'Qatar',                len: 8  },
  { code: '+968', flag: '🇴🇲', name: 'Oman',                 len: 8  },
  { code: '+965', flag: '🇰🇼', name: 'Kuwait',               len: 8  },
  { code: '+973', flag: '🇧🇭', name: 'Bahrain',              len: 8  },
  { code: '+65',  flag: '🇸🇬', name: 'Singapore',            len: 8  },
  { code: '+60',  flag: '🇲🇾', name: 'Malaysia',             len: 9  },
  { code: '+92',  flag: '🇵🇰', name: 'Pakistan',             len: 10 },
  { code: '+880', flag: '🇧🇩', name: 'Bangladesh',           len: 10 },
  { code: '+94',  flag: '🇱🇰', name: 'Sri Lanka',            len: 9  },
  { code: '+977', flag: '🇳🇵', name: 'Nepal',                len: 10 },
  { code: '+49',  flag: '🇩🇪', name: 'Germany',              len: 11 },
  { code: '+33',  flag: '🇫🇷', name: 'France',               len: 9  },
  { code: '+81',  flag: '🇯🇵', name: 'Japan',                len: 10 },
  { code: '+82',  flag: '🇰🇷', name: 'South Korea',          len: 10 },
  { code: '+86',  flag: '🇨🇳', name: 'China',                len: 11 },
]

export const DEFAULT_COUNTRY = COUNTRY_CODES[0]
