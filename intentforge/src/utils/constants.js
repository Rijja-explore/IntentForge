export const CATEGORIES = [
  { id: 'food', label: 'Food & Dining', icon: '🍽️', mcc: '5812' },
  { id: 'shopping', label: 'Shopping', icon: '🛍️', mcc: '5411' },
  { id: 'transport', label: 'Transport', icon: '🚗', mcc: '4111' },
  { id: 'gambling', label: 'Gambling', icon: '🎰', mcc: '7995' },
  { id: 'entertainment', label: 'Entertainment', icon: '🎬', mcc: '7832' },
  { id: 'healthcare', label: 'Healthcare', icon: '💊', mcc: '5912' },
  { id: 'education', label: 'Education', icon: '📚', mcc: '8211' },
  { id: 'utilities', label: 'Utilities', icon: '⚡', mcc: '4911' },
  { id: 'travel', label: 'Travel', icon: '✈️', mcc: '4511' },
  { id: 'crypto', label: 'Crypto', icon: '₿', mcc: '6051' },
];

export const MERCHANTS = [
  { name: 'Swiggy', category: 'food', avatar: '🍔' },
  { name: 'Zomato', category: 'food', avatar: '🍕' },
  { name: 'Amazon', category: 'shopping', avatar: '📦' },
  { name: 'Flipkart', category: 'shopping', avatar: '🛒' },
  { name: 'Dream11', category: 'gambling', avatar: '🏏' },
  { name: 'Uber', category: 'transport', avatar: '🚗' },
  { name: 'Ola', category: 'transport', avatar: '🚕' },
  { name: 'BookMyShow', category: 'entertainment', avatar: '🎭' },
  { name: 'MakeMyTrip', category: 'travel', avatar: '✈️' },
  { name: 'Apollo Pharmacy', category: 'healthcare', avatar: '💊' },
];

export const RULE_TEMPLATES = [
  {
    id: 'daily-limit',
    title: 'Daily Spending Cap',
    description: 'Block all transactions after daily limit is reached',
    icon: '🔒',
    color: 'blue',
    rule: { type: 'daily_limit', condition: 'amount_exceeds', value: 5000 },
  },
  {
    id: 'block-gambling',
    title: 'Block Gambling Sites',
    description: 'Automatically block all gambling transactions',
    icon: '🚫',
    color: 'red',
    rule: { type: 'category_block', condition: 'category_is', value: 'gambling' },
  },
  {
    id: 'night-lock',
    title: 'Night Time Lock',
    description: 'Lock wallet between 11 PM and 6 AM',
    icon: '🌙',
    color: 'purple',
    rule: { type: 'time_restriction', condition: 'time_between', value: '23:00-06:00' },
  },
  {
    id: 'merchant-whitelist',
    title: 'Merchant Whitelist',
    description: 'Only allow approved merchants',
    icon: '✅',
    color: 'green',
    rule: { type: 'merchant_whitelist', condition: 'merchant_not_in', value: [] },
  },
  {
    id: 'savings-lock',
    title: 'Savings Vault Lock',
    description: 'Lock a portion of balance as savings',
    icon: '🏦',
    color: 'gold',
    rule: { type: 'savings_lock', condition: 'reserve_amount', value: 10000 },
  },
  {
    id: 'single-limit',
    title: 'Per Transaction Cap',
    description: 'Limit individual transaction amounts',
    icon: '💳',
    color: 'orange',
    rule: { type: 'single_limit', condition: 'amount_exceeds', value: 2000 },
  },
];

export const DEMO_TRANSACTIONS = [
  { id: 1, merchant: 'Swiggy', amount: 450, category: 'food', status: 'approved', timestamp: new Date(Date.now() - 300000) },
  { id: 2, merchant: 'Dream11', amount: 1000, category: 'gambling', status: 'blocked', timestamp: new Date(Date.now() - 600000) },
  { id: 3, merchant: 'Amazon', amount: 2500, category: 'shopping', status: 'approved', timestamp: new Date(Date.now() - 900000) },
  { id: 4, merchant: 'Uber', amount: 280, category: 'transport', status: 'approved', timestamp: new Date(Date.now() - 1200000) },
  { id: 5, merchant: 'BookMyShow', amount: 600, category: 'entertainment', status: 'pending', timestamp: new Date(Date.now() - 1500000) },
];

export const SPENDING_DATA = [
  { name: 'Food', value: 8500, color: '#06D6A0' },
  { name: 'Shopping', value: 12000, color: '#3E92CC' },
  { name: 'Transport', value: 3200, color: '#FFB81C' },
  { name: 'Entertainment', value: 2800, color: '#FF6B35' },
  { name: 'Healthcare', value: 1500, color: '#9B59B6' },
  { name: 'Others', value: 2000, color: '#718096' },
];

export const AI_SUGGESTIONS = [
  {
    id: 1,
    title: 'Block Late Night Spending',
    description: 'You spent ₹8,500 between 11 PM - 2 AM last month. Lock wallet during these hours?',
    action: 'Create Rule',
    confidence: 94,
    impact: 'Save ~₹8,500/month',
    type: 'time_restriction',
  },
  {
    id: 2,
    title: 'Gambling Risk Detected',
    description: 'Dream11 transactions increased 340% this week. Block gaming platforms?',
    action: 'Block Now',
    confidence: 98,
    impact: 'Prevent potential losses',
    type: 'category_block',
  },
  {
    id: 3,
    title: 'Subscription Audit',
    description: '6 recurring subscriptions detected. Review and cancel unused ones?',
    action: 'Review',
    confidence: 87,
    impact: 'Save ₹2,400/month',
    type: 'merchant_whitelist',
  },
];
