// 40 test personas — 10 different states + 30 different cities across states
module.exports = [
  // ─── 10 DIFFERENT STATES (one per state) ───────────────────────────────────
  {
    id: 'S01', label: 'Farmer – Uttar Pradesh',
    answers: { q_state:'UP', q_age:42, q_gender:'male', q_occupation:'farmer', q_land_holding:2, q_income:'50000_100000', q_family_size:6, q_bpl:'yes_bpl', q_disability:'no', q_caste:'obc', q_employment_status:'self_employed' }
  },
  {
    id: 'S02', label: 'Daily Wage Worker – Maharashtra',
    answers: { q_state:'MH', q_age:35, q_gender:'male', q_occupation:'daily_wage', q_income:'0_50000', q_family_size:4, q_bpl:'yes_bpl', q_disability:'no', q_caste:'sc', q_employment_status:'unemployed' }
  },
  {
    id: 'S03', label: 'Female Homemaker – Rajasthan',
    answers: { q_state:'RJ', q_age:30, q_gender:'female', q_occupation:'homemaker', q_income:'0_50000', q_family_size:5, q_bpl:'yes_bpl', q_disability:'no', q_caste:'general', q_employment_status:'not_applicable' }
  },
  {
    id: 'S04', label: 'Student – Madhya Pradesh',
    answers: { q_state:'MP', q_age:19, q_gender:'male', q_occupation:'student', q_education:'graduate', q_income:'0_50000', q_family_size:5, q_bpl:'yes_bpl', q_disability:'no', q_caste:'st', q_employment_status:'not_applicable' }
  },
  {
    id: 'S05', label: 'Small Business – Gujarat',
    answers: { q_state:'GJ', q_age:38, q_gender:'male', q_occupation:'small_business', q_income:'100000_250000', q_family_size:4, q_bpl:'no', q_disability:'no', q_caste:'general', q_employment_status:'self_employed' }
  },
  {
    id: 'S06', label: 'Farmer – West Bengal',
    answers: { q_state:'WB', q_age:55, q_gender:'male', q_occupation:'farmer', q_land_holding:1, q_income:'50000_100000', q_family_size:7, q_bpl:'yes_apl', q_disability:'no', q_caste:'sc', q_employment_status:'self_employed' }
  },
  {
    id: 'S07', label: 'Disabled Person – Tamil Nadu',
    answers: { q_state:'TN', q_age:28, q_gender:'male', q_occupation:'unemployed', q_income:'0_50000', q_family_size:3, q_bpl:'yes_bpl', q_disability:'yes_self', q_caste:'sc', q_employment_status:'unemployed' }
  },
  {
    id: 'S08', label: 'Private Employee – Karnataka',
    answers: { q_state:'KA', q_age:27, q_gender:'female', q_occupation:'private_employee', q_income:'250000_500000', q_family_size:2, q_bpl:'no', q_disability:'no', q_caste:'obc', q_employment_status:'employed_private' }
  },
  {
    id: 'S09', label: 'Farmer – Andhra Pradesh',
    answers: { q_state:'AP', q_age:50, q_gender:'male', q_occupation:'farmer', q_land_holding:3, q_income:'100000_250000', q_family_size:6, q_bpl:'yes_apl', q_disability:'no', q_caste:'obc', q_employment_status:'self_employed' }
  },
  {
    id: 'S10', label: 'Unemployed Youth – Bihar',
    answers: { q_state:'BR', q_age:22, q_gender:'male', q_occupation:'unemployed', q_education:'class12', q_income:'0_50000', q_family_size:8, q_bpl:'yes_bpl', q_disability:'no', q_caste:'sc', q_employment_status:'unemployed' }
  },

  // ─── 30 DIFFERENT CITIES ACROSS STATES ─────────────────────────────────────
  {
    id: 'C01', label: 'Street Vendor – Mumbai, MH',
    answers: { q_state:'MH', q_age:32, q_gender:'male', q_occupation:'small_business', q_income:'50000_100000', q_family_size:4, q_bpl:'yes_bpl', q_disability:'no', q_caste:'obc', q_employment_status:'self_employed' }
  },
  {
    id: 'C02', label: 'Farmer – Lucknow, UP',
    answers: { q_state:'UP', q_age:45, q_gender:'male', q_occupation:'farmer', q_land_holding:1.5, q_income:'50000_100000', q_family_size:5, q_bpl:'yes_bpl', q_disability:'no', q_caste:'general', q_employment_status:'self_employed' }
  },
  {
    id: 'C03', label: 'Girl Student – Jaipur, RJ',
    answers: { q_state:'RJ', q_age:16, q_gender:'female', q_occupation:'student', q_education:'class12', q_income:'50000_100000', q_family_size:5, q_bpl:'yes_apl', q_disability:'no', q_caste:'obc', q_employment_status:'not_applicable' }
  },
  {
    id: 'C04', label: 'Daily Wage – Bhopal, MP',
    answers: { q_state:'MP', q_age:40, q_gender:'male', q_occupation:'daily_wage', q_income:'0_50000', q_family_size:6, q_bpl:'yes_bpl', q_disability:'no', q_caste:'st', q_employment_status:'unemployed' }
  },
  {
    id: 'C05', label: 'Small Farmer – Ahmedabad, GJ',
    answers: { q_state:'GJ', q_age:48, q_gender:'male', q_occupation:'farmer', q_land_holding:0.5, q_income:'50000_100000', q_family_size:4, q_bpl:'yes_bpl', q_disability:'no', q_caste:'st', q_employment_status:'self_employed' }
  },
  {
    id: 'C06', label: 'Widow Homemaker – Kolkata, WB',
    answers: { q_state:'WB', q_age:38, q_gender:'female', q_occupation:'homemaker', q_income:'0_50000', q_family_size:3, q_bpl:'yes_bpl', q_disability:'no', q_caste:'sc', q_employment_status:'not_applicable' }
  },
  {
    id: 'C07', label: 'Graduate Unemployed – Chennai, TN',
    answers: { q_state:'TN', q_age:24, q_gender:'female', q_occupation:'unemployed', q_education:'graduate', q_income:'0_50000', q_family_size:4, q_bpl:'no', q_disability:'no', q_caste:'obc', q_employment_status:'unemployed' }
  },
  {
    id: 'C08', label: 'IT Employee – Bangalore, KA',
    answers: { q_state:'KA', q_age:26, q_gender:'male', q_occupation:'private_employee', q_income:'250000_500000', q_family_size:2, q_bpl:'no', q_disability:'no', q_caste:'general', q_employment_status:'employed_private' }
  },
  {
    id: 'C09', label: 'Farmer – Vijayawada, AP',
    answers: { q_state:'AP', q_age:52, q_gender:'male', q_occupation:'farmer', q_land_holding:2.5, q_income:'100000_250000', q_family_size:5, q_bpl:'yes_apl', q_disability:'no', q_caste:'obc', q_employment_status:'self_employed' }
  },
  {
    id: 'C10', label: 'Labourer – Patna, BR',
    answers: { q_state:'BR', q_age:36, q_gender:'male', q_occupation:'daily_wage', q_income:'0_50000', q_family_size:7, q_bpl:'yes_bpl', q_disability:'no', q_caste:'sc', q_employment_status:'unemployed' }
  },
  {
    id: 'C11', label: 'Disabled Farmer – Varanasi, UP',
    answers: { q_state:'UP', q_age:44, q_gender:'male', q_occupation:'farmer', q_land_holding:1, q_income:'50000_100000', q_family_size:5, q_bpl:'yes_bpl', q_disability:'yes_self', q_caste:'sc', q_employment_status:'self_employed' }
  },
  {
    id: 'C12', label: 'Street Vendor – Pune, MH',
    answers: { q_state:'MH', q_age:29, q_gender:'male', q_occupation:'small_business', q_income:'50000_100000', q_family_size:3, q_bpl:'yes_apl', q_disability:'no', q_caste:'obc', q_employment_status:'self_employed' }
  },
  {
    id: 'C13', label: 'SC Student – Jodhpur, RJ',
    answers: { q_state:'RJ', q_age:20, q_gender:'female', q_occupation:'student', q_education:'graduate', q_income:'0_50000', q_family_size:6, q_bpl:'yes_bpl', q_disability:'no', q_caste:'sc', q_employment_status:'not_applicable' }
  },
  {
    id: 'C14', label: 'MUDRA Applicant – Surat, GJ',
    answers: { q_state:'GJ', q_age:33, q_gender:'female', q_occupation:'small_business', q_income:'100000_250000', q_family_size:4, q_bpl:'no', q_disability:'no', q_caste:'obc', q_employment_status:'self_employed' }
  },
  {
    id: 'C15', label: 'Senior Farmer – Indore, MP',
    answers: { q_state:'MP', q_age:62, q_gender:'male', q_occupation:'farmer', q_land_holding:3, q_income:'100000_250000', q_family_size:4, q_bpl:'no', q_disability:'no', q_caste:'general', q_employment_status:'self_employed' }
  },
  {
    id: 'C16', label: 'BPL Family – Howrah, WB',
    answers: { q_state:'WB', q_age:40, q_gender:'female', q_occupation:'homemaker', q_income:'0_50000', q_family_size:6, q_bpl:'yes_bpl', q_disability:'no', q_caste:'st', q_employment_status:'not_applicable' }
  },
  {
    id: 'C17', label: 'Govt Employee – Coimbatore, TN',
    answers: { q_state:'TN', q_age:35, q_gender:'male', q_occupation:'government_employee', q_income:'250000_500000', q_family_size:4, q_bpl:'no', q_disability:'no', q_caste:'general', q_employment_status:'employed_govt' }
  },
  {
    id: 'C18', label: 'Young Entrepreneur – Mysore, KA',
    answers: { q_state:'KA', q_age:25, q_gender:'female', q_occupation:'small_business', q_income:'50000_100000', q_family_size:2, q_bpl:'no', q_disability:'no', q_caste:'sc', q_employment_status:'self_employed' }
  },
  {
    id: 'C19', label: 'Marginal Farmer – Guntur, AP',
    answers: { q_state:'AP', q_age:39, q_gender:'male', q_occupation:'farmer', q_land_holding:0.8, q_income:'0_50000', q_family_size:5, q_bpl:'yes_bpl', q_disability:'no', q_caste:'sc', q_employment_status:'self_employed' }
  },
  {
    id: 'C20', label: 'Unemployed Tribal – Ranchi, JH',
    answers: { q_state:'OTHER', q_age:21, q_gender:'male', q_occupation:'unemployed', q_education:'class8_10', q_income:'0_50000', q_family_size:6, q_bpl:'yes_bpl', q_disability:'no', q_caste:'st', q_employment_status:'unemployed' }
  },
  {
    id: 'C21', label: 'Female Farmer – Nagpur, MH',
    answers: { q_state:'MH', q_age:37, q_gender:'female', q_occupation:'farmer', q_land_holding:1.2, q_income:'50000_100000', q_family_size:5, q_bpl:'yes_apl', q_disability:'no', q_caste:'obc', q_employment_status:'self_employed' }
  },
  {
    id: 'C22', label: 'EWS Student – Agra, UP',
    answers: { q_state:'UP', q_age:18, q_gender:'male', q_occupation:'student', q_education:'class12', q_income:'50000_100000', q_family_size:5, q_bpl:'no', q_disability:'no', q_caste:'ews', q_employment_status:'not_applicable' }
  },
  {
    id: 'C23', label: 'Widow – Udaipur, RJ',
    answers: { q_state:'RJ', q_age:45, q_gender:'female', q_occupation:'homemaker', q_income:'0_50000', q_family_size:3, q_bpl:'yes_bpl', q_disability:'no', q_caste:'general', q_employment_status:'not_applicable' }
  },
  {
    id: 'C24', label: 'Gig Worker – Hyderabad, TS',
    answers: { q_state:'OTHER', q_age:27, q_gender:'male', q_occupation:'private_employee', q_income:'100000_250000', q_family_size:2, q_bpl:'no', q_disability:'no', q_caste:'obc', q_employment_status:'employed_private' }
  },
  {
    id: 'C25', label: 'ST Farmer – Tribal MP',
    answers: { q_state:'MP', q_age:41, q_gender:'male', q_occupation:'farmer', q_land_holding:1, q_income:'0_50000', q_family_size:7, q_bpl:'yes_bpl', q_disability:'no', q_caste:'st', q_employment_status:'self_employed' }
  },
  {
    id: 'C26', label: 'Artisan – Jamshedpur, JH',
    answers: { q_state:'OTHER', q_age:34, q_gender:'male', q_occupation:'small_business', q_income:'50000_100000', q_family_size:4, q_bpl:'yes_apl', q_disability:'no', q_caste:'obc', q_employment_status:'self_employed' }
  },
  {
    id: 'C27', label: 'Disabled Student – Pune, MH',
    answers: { q_state:'MH', q_age:17, q_gender:'female', q_occupation:'student', q_education:'class12', q_income:'50000_100000', q_family_size:4, q_bpl:'yes_bpl', q_disability:'yes_self', q_caste:'sc', q_employment_status:'not_applicable' }
  },
  {
    id: 'C28', label: 'Landless Labourer – Kanpur, UP',
    answers: { q_state:'UP', q_age:38, q_gender:'male', q_occupation:'daily_wage', q_land_holding:0, q_income:'0_50000', q_family_size:6, q_bpl:'yes_bpl', q_disability:'no', q_caste:'sc', q_employment_status:'unemployed' }
  },
  {
    id: 'C29', label: 'Senior Citizen – Chennai, TN',
    answers: { q_state:'TN', q_age:67, q_gender:'female', q_occupation:'homemaker', q_income:'0_50000', q_family_size:2, q_bpl:'yes_bpl', q_disability:'yes_self', q_caste:'general', q_employment_status:'not_applicable' }
  },
  {
    id: 'C30', label: 'Young Farmer – Nashik, MH',
    answers: { q_state:'MH', q_age:23, q_gender:'male', q_occupation:'farmer', q_land_holding:1.5, q_income:'50000_100000', q_family_size:4, q_bpl:'no', q_disability:'no', q_caste:'obc', q_employment_status:'self_employed' }
  },
];
