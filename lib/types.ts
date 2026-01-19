export enum AccountStatus {
  Active = 'Active',
  Deactivated = 'Deactivated',
}

export enum MarketplaceStatus {
  Activated = 'Activated',
  Retained = 'Retained',
  Dormant = 'Dormant',
  Churned = 'Churned',
  Resurrected = 'Resurrected',
}

export enum ProposalStatus {
  Draft = 'Draft',
  Sent = 'Sent',
  Viewed = 'Viewed',
  Accepted = 'Accepted',
  Rejected = 'Rejected',
}

export enum UserType {
  Retailer = 'Retailer',
  Vendor = 'Vendor',
}

export enum TicketStatus {
  Open = 'Open',
  InProgress = 'In Progress',
  Closed = 'Closed',
}

export enum TicketType {
  Support = 'Support',
  FeatureRequest = 'Feature Request',
}

export enum LeadStatus {
  New = 'New',
  Contacted = 'Contacted',
  Proposal = 'Proposal',
  Qualified = 'Qualified',
  Lost = 'Lost',
}

export enum DealStage {
  New = 'New',
  Discovery = 'Discovery',
  Proposal = 'Proposal',
  Negotiation = 'Negotiation',
  ClosedWon = 'Closed Won',
  Lost = 'Lost',
}

export type ActivityIcon = 
  | 'user-plus' 
  | 'clipboard' 
  | 'envelope' 
  | 'user-x' 
  | 'phone' 
  | 'bell' 
  | 'deal-won' 
  | 'proposal-sent';
