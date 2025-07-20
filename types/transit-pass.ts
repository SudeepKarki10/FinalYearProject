export interface TimsData {
  id: number;
  name: string;
  Transit_Pass_Cost: Record<string, number>;
  Total_Transit_Cost_NPR: number;
}

export interface TransitPassFormData {
  tims_card_no?: string;
  transaction_id?: string;
  issue_date?: string;
  full_name: string;
  nationality: string;
  passport_number: string;
  gender: string;
  date_of_birth: Date;
  trekker_area: string;
  route: string;
  entry_date: Date;
  exit_date: Date;
  nepal_contact_name: string;
  nepal_organization: string;
  nepal_designation: string;
  nepal_mobile: string;
  nepal_office_number: string;
  nepal_address: string;
  home_contact_name: string;
  home_city: string;
  home_mobile: string;
  home_office_number: string;
  home_address: string;
  status?: string;
  payment_status?: string;
  transit_pass_cost?: Record<string, number>;
  permit_cost?: number;
}
