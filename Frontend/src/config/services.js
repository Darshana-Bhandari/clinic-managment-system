import {
  HeartPulse,
  Sparkles,
  Brain,
  Baby,
  Bone,
  Flower2,
  Eye,
  Ear,
  Smile,
  Pill,
  Siren,
} from 'lucide-react';

/**
 * Single source of truth for clinic services.
 * Shared by the navbar dropdown, Services page, and ServiceDetail page.
 */
export const services = [
  {
    id: 'cardiology',
    label: 'Cardiology',
    Icon: HeartPulse,
    tint: 'rose',
    tagline: 'Heart care and treatment',
    description:
      'Comprehensive heart care including diagnosis, treatment, and prevention of cardiovascular disease.',
    longDescription:
      'Our cardiology department combines advanced diagnostics with compassionate, patient-centred care. From routine heart checkups to complex interventional procedures, our specialists help you protect and strengthen your cardiovascular health.',
    features: ['Heart checkups', 'ECG / EKG', 'Cardiac surgery', 'Rehabilitation'],
    procedures: ['ECG', 'Echocardiogram', 'Cardiac catheterisation', 'Angioplasty'],
    doctors: ['Dr. Ram Sharma', 'Dr. Hari Adhikari'],
    availability: 'Sunday – Friday',
  },
  {
    id: 'dermatology',
    label: 'Dermatology',
    Icon: Sparkles,
    tint: 'amber',
    tagline: 'Skin care and treatment',
    description:
      'Expert skin care for all conditions including acne, eczema, and cosmetic procedures.',
    longDescription:
      'Our dermatology team treats the full range of skin, hair, and nail conditions using evidence-based clinical and aesthetic techniques tailored to your skin.',
    features: ['Skin consultation', 'Acne treatment', 'Laser therapy', 'Cosmetic procedures'],
    procedures: ['Skin examination', 'Biopsy', 'Laser treatment', 'Acne therapy'],
    doctors: ['Dr. Sita Gurung'],
    availability: 'Sunday – Friday',
  },
  {
    id: 'neurology',
    label: 'Neurology',
    Icon: Brain,
    tint: 'violet',
    tagline: 'Brain and nervous system',
    description: 'Advanced diagnosis and treatment for disorders of the brain and nervous system.',
    longDescription:
      'Our neurology department offers specialised care for conditions of the brain, spine, and nervous system, backed by modern imaging and a dedicated stroke pathway.',
    features: ['Stroke care', 'Epilepsy treatment', 'Neurological exams', 'Brain imaging'],
    procedures: ['EEG', 'Nerve conduction study', 'Stroke assessment', 'Neurological exam'],
    doctors: ['Dr. Hari Adhikari'],
    availability: 'Monday – Saturday',
  },
  {
    id: 'pediatrics',
    label: 'Pediatrics',
    Icon: Baby,
    tint: 'sky',
    tagline: 'Child healthcare',
    description: 'Comprehensive healthcare for children from birth to adolescence.',
    longDescription:
      'From newborn checkups to childhood illnesses and vaccinations, our paediatricians provide gentle, thorough care that supports every stage of your child’s development.',
    features: ['Well-baby visits', 'Vaccinations', 'Child development', 'Paediatric surgery'],
    procedures: ['Growth monitoring', 'Immunisation', 'Developmental screening', 'Sick-child visit'],
    doctors: ['Dr. Laxmi Poudel'],
    availability: 'Sunday – Friday',
  },
  {
    id: 'orthopedics',
    label: 'Orthopedics',
    Icon: Bone,
    tint: 'orange',
    tagline: 'Bone and joint care',
    description: 'Specialised care for bones, joints, ligaments, and musculoskeletal conditions.',
    longDescription:
      'Our orthopaedic specialists treat everything from sports injuries to joint replacement, helping you move freely and recover with confidence.',
    features: ['Fracture care', 'Joint replacement', 'Sports medicine', 'Physical therapy'],
    procedures: ['X-ray assessment', 'Joint injection', 'Fracture management', 'Arthroscopy'],
    doctors: ['Dr. Bijay Shrestha'],
    availability: 'Sunday – Friday',
  },
  {
    id: 'gynecology',
    label: 'Gynecology',
    Icon: Flower2,
    tint: 'pink',
    tagline: 'Women’s health',
    description: 'Comprehensive women’s health from adolescence through menopause.',
    longDescription:
      'Our gynaecology department provides confidential, respectful care across every stage of a woman’s life, including pregnancy care and minimally invasive surgery.',
    features: ['Annual exams', 'Pregnancy care', 'Menopause management', 'Gynaecological surgery'],
    procedures: ['Ultrasound', 'Pap smear', 'Antenatal checkup', 'Colposcopy'],
    doctors: ['Dr. Sunita Karki'],
    availability: 'Sunday – Friday',
  },
  {
    id: 'ophthalmology',
    label: 'Ophthalmology',
    Icon: Eye,
    tint: 'cyan',
    tagline: 'Eye care and surgery',
    description: 'Complete eye care including diagnosis and treatment of eye conditions.',
    longDescription:
      'From routine eye exams to cataract and refractive surgery, our ophthalmologists help protect and restore your vision with precision.',
    features: ['Eye exams', 'Cataract surgery', 'LASIK', 'Glaucoma treatment'],
    procedures: ['Vision test', 'Retinal exam', 'Cataract surgery', 'Glaucoma screening'],
    doctors: ['Dr. Kiran Nepal'],
    availability: 'Monday – Saturday',
  },
  {
    id: 'ent',
    label: 'ENT',
    Icon: Ear,
    tint: 'teal',
    tagline: 'Ear, nose, throat care',
    description: 'Specialised care for ear, nose, and throat conditions.',
    longDescription:
      'Our ENT specialists diagnose and treat conditions affecting hearing, breathing, and the sinuses using both medical and surgical approaches.',
    features: ['Hearing tests', 'Sinus treatment', 'Tonsillectomy', 'Balance disorders'],
    procedures: ['Audiometry', 'Endoscopy', 'Sinus treatment', 'Ear microsuction'],
    doctors: ['Dr. Raju Thapa'],
    availability: 'Sunday – Friday',
  },
  {
    id: 'psychiatry',
    label: 'Psychiatry',
    Icon: Brain,
    tint: 'indigo',
    tagline: 'Mental health services',
    description: 'Mental health services for depression, anxiety, and other conditions.',
    longDescription:
      'Our psychiatry team offers confidential, stigma-free support for mental well-being, combining therapy and medication management tailored to you.',
    features: ['Mental health evaluation', 'Therapy', 'Medication management', 'Crisis support'],
    procedures: ['Assessment', 'Counselling', 'Medication review', 'Follow-up care'],
    doctors: ['Dr. Gita Sharma'],
    availability: 'Sunday – Friday',
  },
  {
    id: 'dentistry',
    label: 'Dentistry',
    Icon: Smile,
    tint: 'blue',
    tagline: 'Dental care and treatment',
    description: 'Preventive, restorative, and cosmetic dental care for the whole family.',
    longDescription:
      'Our dental team keeps your smile healthy with gentle preventive care, restorative treatments, and cosmetic dentistry in a comfortable setting.',
    features: ['Cleanings', 'Fillings', 'Root canals', 'Orthodontics'],
    procedures: ['Scaling', 'Filling', 'Root canal', 'Tooth extraction'],
    doctors: ['Dr. Raju Thapa'],
    availability: 'Sunday – Friday',
  },
  {
    id: 'pharmacy',
    label: 'Pharmacy',
    Icon: Pill,
    tint: 'emerald',
    tagline: 'Prescriptions and counselling',
    description: 'Full-service pharmacy with prescription fulfilment and medication counselling.',
    longDescription:
      'Our in-house pharmacy makes it easy to fill prescriptions, understand your medicines, and get trusted advice from qualified pharmacists.',
    features: ['Prescription filling', 'Medication counselling', 'Delivery service', 'Health products'],
    procedures: ['Prescription fill', 'Medication review', 'Home delivery', 'Health screening'],
    doctors: ['On-site pharmacist'],
    availability: 'Sunday – Friday',
  },
  {
    id: 'emergency',
    label: 'Emergency Care',
    Icon: Siren,
    tint: 'red',
    tagline: '24/7 urgent medical care',
    description: '24/7 emergency medical services for urgent and life-threatening conditions.',
    longDescription:
      'Our emergency department is staffed around the clock to provide rapid, expert care when every minute matters — including trauma and critical care.',
    features: ['24/7 availability', 'Trauma care', 'Ambulance service', 'Critical care'],
    procedures: ['Triage', 'Emergency stabilisation', 'Trauma care', 'Ambulance dispatch'],
    doctors: ['Emergency team'],
    availability: 'Open 24 / 7',
  },
];

export const getService = (id) => services.find((service) => service.id === id);

export default services;