export const getRiskColor = (category: number): string => {
  switch(category) {
    case 4: return '#dc2626' // red-600
    case 3: return '#ea580c' // orange-600
    case 2: return '#d97706' // amber-600
    case 1: return '#16a34a' // green-600
    default: return '#6b7280' // gray-500
  }
}

export const getRiskBgColor = (category: number): string => {
  switch(category) {
    case 4: return 'bg-red-100'
    case 3: return 'bg-orange-100'
    case 2: return 'bg-amber-100'
    case 1: return 'bg-green-100'
    default: return 'bg-gray-100'
  }
}

export const getRiskTextColor = (category: number): string => {
  switch(category) {
    case 4: return 'text-red-700'
    case 3: return 'text-orange-700'
    case 2: return 'text-amber-700'
    case 1: return 'text-green-700'
    default: return 'text-gray-700'
  }
}

export const getRiskBorderColor = (category: number): string => {
  switch(category) {
    case 4: return 'border-red-200'
    case 3: return 'border-orange-200'
    case 2: return 'border-amber-200'
    case 1: return 'border-green-200'
    default: return 'border-gray-200'
  }
}
