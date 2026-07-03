// Common country dial codes for the checkout phone field.
// `len` is the expected national-number length (digits, excluding code).
// `example` is shown as the input placeholder so users see the expected shape.
// `short` is a compact ISO-style label (e.g. IND, UK) shown in the collapsed
// dropdown so long country names never get clipped in the narrow select.
// India is first so it stays the default.
export const COUNTRY_CODES = [
  { code: '+91',  flag: '🇮🇳', short: 'IND', name: 'India',                len: 10, example: '9876543210' },
  { code: '+1',   flag: '🇺🇸', short: 'USA', name: 'USA / Canada',         len: 10, example: '4155551234' },
  { code: '+44',  flag: '🇬🇧', short: 'UK',  name: 'United Kingdom',       len: 10, example: '7700123456' },
  { code: '+61',  flag: '🇦🇺', short: 'AUS', name: 'Australia',            len: 9,  example: '412345678'  },
  { code: '+971', flag: '🇦🇪', short: 'UAE', name: 'United Arab Emirates', len: 9,  example: '501234567'  },
  { code: '+966', flag: '🇸🇦', short: 'KSA', name: 'Saudi Arabia',         len: 9,  example: '512345678'  },
  { code: '+974', flag: '🇶🇦', short: 'QAT', name: 'Qatar',                len: 8,  example: '33123456'   },
  { code: '+968', flag: '🇴🇲', short: 'OMN', name: 'Oman',                 len: 8,  example: '92123456'   },
  { code: '+965', flag: '🇰🇼', short: 'KWT', name: 'Kuwait',               len: 8,  example: '50012345'   },
  { code: '+973', flag: '🇧🇭', short: 'BHR', name: 'Bahrain',              len: 8,  example: '36123456'   },
  { code: '+65',  flag: '🇸🇬', short: 'SGP', name: 'Singapore',            len: 8,  example: '91234567'   },
  { code: '+60',  flag: '🇲🇾', short: 'MYS', name: 'Malaysia',             len: 9,  example: '123456789'  },
  { code: '+92',  flag: '🇵🇰', short: 'PAK', name: 'Pakistan',             len: 10, example: '3001234567' },
  { code: '+880', flag: '🇧🇩', short: 'BGD', name: 'Bangladesh',           len: 10, example: '1712345678' },
  { code: '+94',  flag: '🇱🇰', short: 'LKA', name: 'Sri Lanka',            len: 9,  example: '712345678'  },
  { code: '+977', flag: '🇳🇵', short: 'NPL', name: 'Nepal',                len: 10, example: '9812345678' },
  { code: '+49',  flag: '🇩🇪', short: 'GER', name: 'Germany',              len: 11, example: '15123456789'},
  { code: '+33',  flag: '🇫🇷', short: 'FRA', name: 'France',               len: 9,  example: '612345678'  },
  { code: '+81',  flag: '🇯🇵', short: 'JPN', name: 'Japan',                len: 10, example: '9012345678' },
  { code: '+82',  flag: '🇰🇷', short: 'KOR', name: 'South Korea',          len: 10, example: '1012345678' },
  { code: '+86',  flag: '🇨🇳', short: 'CHN', name: 'China',                len: 11, example: '13912345678'},
]

export const DEFAULT_COUNTRY = COUNTRY_CODES[0]
