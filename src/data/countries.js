// Common country dial codes for the checkout phone field.
// `len` is the expected national-number length (digits, excluding code).
// `example` is shown as the input placeholder so users see the expected shape.
// India is first so it stays the default.
export const COUNTRY_CODES = [
  { code: '+91',  flag: '🇮🇳', name: 'India',                len: 10, example: '9876543210' },
  { code: '+1',   flag: '🇺🇸', name: 'USA / Canada',         len: 10, example: '4155551234' },
  { code: '+44',  flag: '🇬🇧', name: 'United Kingdom',       len: 10, example: '7700123456' },
  { code: '+61',  flag: '🇦🇺', name: 'Australia',            len: 9,  example: '412345678'  },
  { code: '+971', flag: '🇦🇪', name: 'United Arab Emirates', len: 9,  example: '501234567'  },
  { code: '+966', flag: '🇸🇦', name: 'Saudi Arabia',         len: 9,  example: '512345678'  },
  { code: '+974', flag: '🇶🇦', name: 'Qatar',                len: 8,  example: '33123456'   },
  { code: '+968', flag: '🇴🇲', name: 'Oman',                 len: 8,  example: '92123456'   },
  { code: '+965', flag: '🇰🇼', name: 'Kuwait',               len: 8,  example: '50012345'   },
  { code: '+973', flag: '🇧🇭', name: 'Bahrain',              len: 8,  example: '36123456'   },
  { code: '+65',  flag: '🇸🇬', name: 'Singapore',            len: 8,  example: '91234567'   },
  { code: '+60',  flag: '🇲🇾', name: 'Malaysia',             len: 9,  example: '123456789'  },
  { code: '+92',  flag: '🇵🇰', name: 'Pakistan',             len: 10, example: '3001234567' },
  { code: '+880', flag: '🇧🇩', name: 'Bangladesh',           len: 10, example: '1712345678' },
  { code: '+94',  flag: '🇱🇰', name: 'Sri Lanka',            len: 9,  example: '712345678'  },
  { code: '+977', flag: '🇳🇵', name: 'Nepal',                len: 10, example: '9812345678' },
  { code: '+49',  flag: '🇩🇪', name: 'Germany',              len: 11, example: '15123456789'},
  { code: '+33',  flag: '🇫🇷', name: 'France',               len: 9,  example: '612345678'  },
  { code: '+81',  flag: '🇯🇵', name: 'Japan',                len: 10, example: '9012345678' },
  { code: '+82',  flag: '🇰🇷', name: 'South Korea',          len: 10, example: '1012345678' },
  { code: '+86',  flag: '🇨🇳', name: 'China',                len: 11, example: '13912345678'},
]

export const DEFAULT_COUNTRY = COUNTRY_CODES[0]
