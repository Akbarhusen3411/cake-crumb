// INR formatter — uses Indian numbering (lakhs/crores) automatically
const fmt = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
})

export const inr = (n) => fmt.format(Number(n) || 0)
