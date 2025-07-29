export interface PaddleCustomData {
  app_id?: number;
  product_name?: string;
  product_image?: string;
  product_price?: number;
  product_is_bundle?: boolean;
  duration_days?: number;
  plan_code?: string;
  plan_name?: string;
}

export interface PaddleAddress {
  id: string;
  country_code: string;
  postal_code: string;
  city: string;
  region: string;
  first_line: string;
}

export interface PaddleCustomer {
  id: string;
  email: string;
  address: PaddleAddress | null;
  business: any | null;
}

export interface PaddleProductInfo {
  id: string;
  name: string;
  description: string | null;
  image_url: string;
}

export interface PaddleItemTotals {
  subtotal: number;
  tax: number;
  total: number;
  discount: number;
  balance: number;
  credit: number;
}

export interface PaddleItem {
  price_id: string;
  product: PaddleProductInfo;
  billing_cycle: any | null;
  trial_period: any | null;
  quantity: number;
  totals: PaddleItemTotals;
}

export interface PaddleTransactionTotals {
  subtotal: number;
  tax: number;
  total: number;
  discount: number;
  credit: number;
  balance: number;
}

export interface PaddlePaymentDetails {
  type: string;
}

export interface PaddleSettings {
  display_mode: string;
  theme: string;
  variant: string;
}

export interface PaddleCheckoutCompletedData {
  id: string;
  transaction_id: string;
  status: string;
  custom_data: PaddleCustomData;
  currency_code: string;
  customer: PaddleCustomer;
  items: PaddleItem[];
  totals: PaddleTransactionTotals;
  payment: {
    method_details: PaddlePaymentDetails;
  };
  settings: PaddleSettings;
}

export interface PaddleCheckoutCompletedEvent {
  name: 'checkout.completed';
  data: PaddleCheckoutCompletedData;
}

// 新增 Paddle 类型定义
export interface BillingCycle {
  frequency: number;
  interval: string;
}

export interface TrialPeriod {
  frequency: number;
  interval: string;
}

export interface UnitPrice {
  amount: string;
  currency_code: string;
}

export interface Quantity {
  minimum: number;
  maximum: number;
}

export interface UnitPriceOverride {
  country_codes: string[];
  unit_price: UnitPrice;
}

export interface PaddleProductData {
  id: string;
  name: string;
  description: string;
  type: string;
  taxCategory: string;
  imageUrl: string | null;
  customData: PaddleCustomData;
  status: string;
  createdAt: string;
  updatedAt: string;
  importMeta: any | null;
}

export interface PaddlePriceData {
  id: string;
  productId: string;
  description: string;
  type: string;
  name: string | null;
  billingCycle: BillingCycle | null;
  trialPeriod: TrialPeriod | null;
  taxMode: string;
  unitPrice: UnitPrice;
  unitPriceOverrides: UnitPriceOverride[];
  quantity: Quantity;
  status: string;
  customData: PaddleCustomData;
}