export interface Product {
  id: number
  groupId: number | null
  barcode: string
  name: string
  department: string
  category: string
  subcategory: string
  manufacturer: string
  brand: string
  price: number | null
  isBasic: boolean
}

export interface Branch {
  format: string
  name: string
  address: string
  city: string
  wazeUrl: string
  mapsUrl: string
}

export interface ChainPrice {
  regular: number
  sale: number | null
  effective: number
}

export interface ChainProductPrices {
  groupId: number
  barcode: string
  name: string
  prices: {
    שופרסל?: ChainPrice | null
    'רמי לוי'?: ChainPrice | null
    יוחננוף?: ChainPrice | null
    'חצי חינם'?: ChainPrice | null
  }
}

export interface ChainPricesData {
  fetched_at: string
  chains: string[]
  product_count: number
  products: ChainProductPrices[]
}
