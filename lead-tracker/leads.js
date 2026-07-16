const DEFAULT_LEADS = [
  {
    "name": "Anand Dental Care & Implant Centre",
    "phone": "8700634013",
    "email": "",
    "address": "\ue0c8 H-22, Tandoor Chowk, Manak Vihar, Tihar Village, New Delhi, Delhi, 110018",
    "specialty": "Dental",
    "city": "Delhi",
    "tier": "Metro"
  },
  {
    "name": "Bahl dental clinic",
    "phone": "8882541630",
    "email": "",
    "address": "\ue0c8 23A/7B, Ground Floor, Tilak Nagar, New Delhi, Delhi 110018",
    "specialty": "Dental",
    "city": "Delhi",
    "tier": "Metro"
  },
  {
    "name": "Dr. Astha Sharma- Dermatologist in Delhi, Skin Clinic, Best Skin Doctor & Skin Specialist in Janakpuri",
    "phone": "8595540359",
    "email": "",
    "address": "\ue0c8 Chamber No. 6, A-2/7, Pankha Rd, Block A2, Janakpuri, New Delhi, Delhi, 110058",
    "specialty": "Dermatology",
    "city": "Delhi",
    "tier": "Metro"
  },
  {
    "name": "Dr. Richa Chaudhary | Dermatologist | MBBS MD",
    "phone": "9711825991",
    "email": "",
    "address": "\ue0c8 Ekta Apartments, A2b/68A, A1 Rd, A 2B Block, Paschim Vihar, Delhi, 110063",
    "specialty": "Dermatology",
    "city": "Delhi",
    "tier": "Metro"
  },
  {
    "name": "Tooth saviour dental clinic",
    "phone": "9220859599",
    "email": "",
    "address": "\ue0c8 RZA-197, pipal wali gali, Nihal Vihar, A BLOCK, Nangloi, Delhi, 110041",
    "specialty": "Dental",
    "city": "Delhi",
    "tier": "Metro"
  },
  {
    "name": "Dr. Priyanka S. Jain - Dermatologist in Sion| Skin Specialist| Specialist in Acne , Acne Scars, Hair PRP treatments",
    "phone": "9820364079",
    "email": "",
    "address": "\ue0c8 Flat no.7 ,1st floor, Prem Kunj, Sion Cir, Sion West, Sion, Mumbai, Maharashtra 400022",
    "specialty": "Dermatology",
    "city": "Mumbai",
    "tier": "Metro"
  },
  {
    "name": "KYSHHA Skin & Hair by Dr. Sana Bhamla",
    "phone": "9987070019",
    "email": "",
    "address": "\ue0c8 B/62, Commercial Arcade, Nathani Heights, opp. Mumbai Central, Station (E, Mumbai, Maharashtra 400008",
    "specialty": "Dermatology",
    "city": "Mumbai",
    "tier": "Metro"
  },
  {
    "name": "Saifee Dental Clinic",
    "phone": "9870132176",
    "email": "",
    "address": "\ue0c8 1st floor, Noor Manzil, Masjid Railway Station, 62 bhandari street, road, Mumbai, Maharashtra 400003",
    "specialty": "Dental",
    "city": "Mumbai",
    "tier": "Metro"
  },
  {
    "name": "Sparkle Dental Care",
    "phone": "9869341311",
    "email": "",
    "address": "\ue0c8 Milan Building, 189, Perin Nariman St, near Paras Guest House, Borabazar Precinct, Fort, Mumbai, Maharashtra 400001",
    "specialty": "Dental",
    "city": "Mumbai",
    "tier": "Metro"
  },
  {
    "name": "Dr. Harshal's dental Clinic",
    "phone": "8888478098",
    "email": "",
    "address": "\ue0c8 Shop No. 3, Pendse Bhawan, Tilak Rd, opposite Durvankur Dining Hall, Sadashiv Peth, Pune, Maharashtra 411030",
    "specialty": "Dental",
    "city": "Pune",
    "tier": "Metro"
  },
  {
    "name": "Dermatologist And Skin Specialist For Treating White Patches AndTreatment For Dark Circle In Bangalore",
    "phone": "9036406152",
    "email": "",
    "address": "\ue0c8 Ph: (080) 41671253] 2nd block, RT nagar 4th cross 5th main no 520, ground floor, Bengaluru, Karnataka 560032",
    "specialty": "Dermatology",
    "city": "Bangalore",
    "tier": "Metro"
  },
  {
    "name": "Dr. Priya's Skin & Hair Clinic - Marathahalli",
    "phone": "9741032946",
    "email": "",
    "address": "\ue0c8 1st Floor, CRM Sowbhagya Enclave, Bus Stop, No:35/1, HAL Old Airport Rd, near Spice Garden Road, Lakshminarayana Pura, Marathahalli, Bengaluru, Karnataka 560037",
    "specialty": "Dermatology",
    "city": "Bangalore",
    "tier": "Metro"
  },
  {
    "name": "Honest Derma",
    "phone": "9908038145",
    "email": "",
    "address": "\ue0c8 6-2-664,Sri kalpa complex,beside Allwin hospital,chintal basthi, opp. Shadan college lane, khairtabad, Hyderabad, Telangana 500004",
    "specialty": "Dermatology",
    "city": "Hyderabad",
    "tier": "Metro"
  },
  {
    "name": "Oliva Skin, Hair & Aesthetic Clinic Jubilee Hills, Hyderabad",
    "phone": "8977755491",
    "email": "",
    "address": "\ue0c8 NBK Building, Road No. 36, opposite Manyavar & Mohey, Jubilee Hills, Hyderabad, Telangana 500033",
    "specialty": "Dermatology",
    "city": "Hyderabad",
    "tier": "Metro"
  },
  {
    "name": "Sitarra Dermatology",
    "phone": "8466881581",
    "email": "",
    "address": "\ue0c8 1-1-191,SIRI LAXMI ARCADE SHOP NO.2 ,Near MORE SuperMart Lane opposite to B1114/B1115 /PistaHouse, Chikkadpally Rd, RTC Cross Road, Himayatnagar, Hyderabad, Telangana 500020",
    "specialty": "Dermatology",
    "city": "Hyderabad",
    "tier": "Metro"
  },
  {
    "name": "Ahmedabad Dental \u0a85\u0aae\u0aa6\u0abe\u0ab5\u0abe\u0aa6 \u0aa1\u0ac7\u0aa8\u0acd\u0a9f\u0ab2",
    "phone": "9725368282",
    "email": "",
    "address": "\ue0c8 6th floor, Swanik Arcade, 610, Alok Rd, opposite to Arjun Greens, Pragatinagar, Nirnay Nagar, Ahmedabad, Gujarat 380061",
    "specialty": "Dental",
    "city": "Ahmedabad",
    "tier": "Metro"
  },
  {
    "name": "DR NEHA JOSHI - Dermatologist",
    "phone": "8675600088",
    "email": "",
    "address": "\ue0c8 5th floor, medico house, near Visat circle, Ahmedabad, Gujarat 382424",
    "specialty": "Dermatology",
    "city": "Ahmedabad",
    "tier": "Metro"
  },
  {
    "name": "Skin Caf\u00e9- The Holistic Skin Clinic | Dr. Manisha Chauhan | Skin Care Centre and Dermatologist Specialist",
    "phone": "9712951033",
    "email": "",
    "address": "\ue0c8 Amrapali Lakeview Tower, B-203, opposite Vastrapur Lake Road, Amphitheater, Vastrapur, Ahmedabad, Gujarat 380015",
    "specialty": "Dermatology",
    "city": "Ahmedabad",
    "tier": "Metro"
  },
  {
    "name": "SkinLab by Dr. Jamuna Pai",
    "phone": "9859856030",
    "email": "",
    "address": "\ue0c8 Amrapali Lake View tower Ground Floor , Shop No. 5, near Alpha One Mall, Vastrapur, Ahmedabad, Gujarat 380054",
    "specialty": "Dermatology",
    "city": "Ahmedabad",
    "tier": "Metro"
  },
  {
    "name": "STAVYA SKIN HAIR & LASER CLINIC",
    "phone": "9978351998",
    "email": "",
    "address": "\ue0c8 213/ 2ND FLOOR, ADITYA PLAZA, NEAR, Jodhpur Cross Rd, Satellite, Ahmedabad, Gujarat 380015",
    "specialty": "Dermatology",
    "city": "Ahmedabad",
    "tier": "Metro"
  },
  {
    "name": "AASMI Skin and Multispeciality clinic",
    "phone": "8240756618",
    "email": "",
    "address": "\ue0c8 P-912, P 912, Bangur Avenue, Block A, Lake Town, Kolkata, South Dumdum, West Bengal 700089",
    "specialty": "Dermatology",
    "city": "Kolkata",
    "tier": "Metro"
  },
  {
    "name": "Dr Sayantani Chakraborty",
    "phone": "9163324488",
    "email": "",
    "address": "\ue0c8 Ground Floor, P-912, Block A, Lake Town, Kolkata, South Dumdum, West Bengal 700048",
    "specialty": "Dermatology",
    "city": "Kolkata",
    "tier": "Metro"
  },
  {
    "name": "SmileArk",
    "phone": "8240077153",
    "email": "",
    "address": "\ue0c8 42/1 Prem Chand Boral St, Amherst St, Bowbazar, Kolkata, West Bengal 700012",
    "specialty": "Dental",
    "city": "Kolkata",
    "tier": "Metro"
  },
  {
    "name": "Dr komal gupta skin and laser clinic",
    "phone": "8005629798",
    "email": "",
    "address": "\ue0c8 167, Ajmer Rd, Heeranagar DCM, Mahatma Gandhi Nagar, Jaipur, Rajasthan 302021",
    "specialty": "Dermatology",
    "city": "Jaipur",
    "tier": "Metro"
  },
  {
    "name": "Atmiya dental and facial surgery clinic",
    "phone": "9886614013",
    "email": "",
    "address": "\ue0c8 103-A millennium point,opp gabani kidney hospital, Lal Darwaja Station Rd, Surat, Gujarat 395003",
    "specialty": "Dental",
    "city": "Surat",
    "tier": "Metro"
  },
  {
    "name": "Dr Payal N Choksi",
    "phone": "9879508337",
    "email": "",
    "address": "\ue0c8 First floor, hanuman temple, Jash Point Complex, Prasann skin laser hair care clinic, opp. Kshetrapal Dada Marg, Kailash Nagar, Majura Gate, Surat, Gujarat 395002",
    "specialty": "Dermatology",
    "city": "Surat",
    "tier": "Metro"
  },
  {
    "name": "Dr. Pratik Kela",
    "phone": "9427253180",
    "email": "",
    "address": "\ue0c8 near Raymond show room, Kailash Nagar, Sagrampura, Surat, Gujarat 395002",
    "specialty": "Dental",
    "city": "Surat",
    "tier": "Metro"
  },
  {
    "name": "My Dental Clinic",
    "phone": "9662670001",
    "email": "",
    "address": "\ue0c8 Shop No:110, Glamor Complex, Bhatar Rd, near Vaibhav Apartment, Bhatar, Athwa, Surat, Gujarat 395006",
    "specialty": "Dental",
    "city": "Surat",
    "tier": "Metro"
  },
  {
    "name": "Navadiya Skin Clinic",
    "phone": "9377927822",
    "email": "",
    "address": "\ue0c8 Shop No.101-106, Silver Trade Center, VIP Cir, near oxygen garden, Mota Varachha, Surat, Gujarat 394105",
    "specialty": "Dermatology",
    "city": "Surat",
    "tier": "Metro"
  },
  {
    "name": "Parshwa Implant and Dento-Surgical Care| Best Dental and surgery Clinic in Surat | Vesu",
    "phone": "8999079990",
    "email": "",
    "address": "\ue0c8 323, 324, 325 Times Square, Opp Money Arcade Vesu Canal Road, Bharthana - 395007, Surat, Gujarat 395009",
    "specialty": "Dental",
    "city": "Surat",
    "tier": "Metro"
  },
  {
    "name": "Rihaan Skin Clinic",
    "phone": "7434066100",
    "email": "",
    "address": "\ue0c8 611-614,6th floor,infinity tower, Lal Darwaja Station Rd, near ayurvedic college,station, Surat, Gujarat 395008",
    "specialty": "Dermatology",
    "city": "Surat",
    "tier": "Metro"
  },
  {
    "name": "Sai Smile Dental Clinic",
    "phone": "9879362024",
    "email": "",
    "address": "\ue0c8 Shop Number 3 , Building -13-14, 120 Feet Rd, Housing Char Rasta , Piyush Point, Laxmi Nagar, Pandesara, Udhana, Surat, Gujarat 394221",
    "specialty": "Dental",
    "city": "Surat",
    "tier": "Metro"
  },
  {
    "name": "Dr Ali Mohammad Abdi M.D Skin & Hair Centre",
    "phone": "9140107618",
    "email": "",
    "address": "\ue0c8 Hardoi Rd, opposite CMS Chowk School and BP Petrol Pump, below Fitness Freak Gym, Chaupatiyan, Chowk, Lucknow, Uttar Pradesh 226003",
    "specialty": "Dermatology",
    "city": "Lucknow",
    "tier": "Metro"
  },
  {
    "name": "Dr Anurag Skin Hair & Laser Clinic-Best Skin Doctor / Laser Treatment / Hair Transplant/ PRP/ Botox / Fillers/Glow Therapy",
    "phone": "7800052939",
    "email": "",
    "address": "\ue0c8 4/251, Vijayant Khand, Gomti Nagar, Lucknow, Uttar Pradesh 226010",
    "specialty": "Dermatology",
    "city": "Lucknow",
    "tier": "Metro"
  },
  {
    "name": "Dr Anurag Skin Hair & Laser Clinic-Best Skin Doctor / Laser Treatment / Hair Transplant/ PRP/ Botox / Fillers/Glow Therapy",
    "phone": "8887288870",
    "email": "",
    "address": "\ue0c8 B2/19, Tedhi Pulia Ring Rd, near Engineering College Chauraha, Sector F, Jankipuram, Lucknow, Uttar Pradesh 226021",
    "specialty": "Dermatology",
    "city": "Lucknow",
    "tier": "Metro"
  },
  {
    "name": "Dr. Himani tandon skin clinic | Best Dermatologist in Lucknow",
    "phone": "7881183671",
    "email": "",
    "address": "\ue0c8 Shop no. 1, Dr. Himani Tandon, opposite sant nirankari satsang bhawan, beside Chopra book store, Amrudhi Bagh, Singar Nagar, Alambagh, Lucknow, Uttar Pradesh 226005",
    "specialty": "Dermatology",
    "city": "Lucknow",
    "tier": "Metro"
  },
  {
    "name": "Maa Durga Dental and Maxillofacial trauma center",
    "phone": "9839585017",
    "email": "",
    "address": "\ue0c8 60 Feet Rd, Abhishekpuram, Janki Vihar Colony, Jankipuram, Lucknow, Uttar Pradesh 226031",
    "specialty": "Dental",
    "city": "Lucknow",
    "tier": "Metro"
  },
  {
    "name": "My Smile Artist Dental Clinic : Best Dental Clinic in Lucknow",
    "phone": "9170411889",
    "email": "",
    "address": "\ue0c8 1st floor, Balmiki Marg, above Capital Automobile, near Residency Apartments, Hazaratganj, Kaiser Bagh, Lucknow, Uttar Pradesh 226001",
    "specialty": "Dental",
    "city": "Lucknow",
    "tier": "Metro"
  },
  {
    "name": "Advanced Dental And Medical Care | Best Dentist & Dental Clinic In Chandigarh | Rct Treatment | Dental Implants Chandigarh",
    "phone": "1722691001",
    "email": "",
    "address": "\ue0c8 SCO 156 first floor, Sector 37 C, Chandigarh, 160036",
    "specialty": "Dental",
    "city": "Chandigarh",
    "tier": "Metro"
  },
  {
    "name": "Advanced Skin & Medicine Clinic",
    "phone": "",
    "email": "",
    "address": "\ue0c8 SCO 250, First Floor & 2nd Floor, Sector 44 C, near CANARA BANK - CHANDIGARH SEC 44 C, Chandigarh, 160043",
    "specialty": "Dermatology",
    "city": "Chandigarh",
    "tier": "Metro"
  },
  {
    "name": "City Dental Consultants",
    "phone": "9814005024",
    "email": "",
    "address": "\ue0c8 3363, Sector:15- D, 15D, Sector 15, Chandigarh, 160015",
    "specialty": "Dental",
    "city": "Chandigarh",
    "tier": "Metro"
  },
  {
    "name": "Dr Neha Singh",
    "phone": "8437510088",
    "email": "",
    "address": "\ue0c8 House no 7, opposite Gopal sweets, Sector 15-A, Sector 15, Chandigarh, 160015",
    "specialty": "Dermatology",
    "city": "Chandigarh",
    "tier": "Metro"
  },
  {
    "name": "Gill Dental & Oral Surgery",
    "phone": "9416081999",
    "email": "",
    "address": "\ue0c8 C-57, first floor Kendriya vihar, Sector 48B, Chandigarh, 160047",
    "specialty": "Dental",
    "city": "Chandigarh",
    "tier": "Metro"
  },
  {
    "name": "Gurukirpa Dental Care",
    "phone": "9501727278",
    "email": "",
    "address": "\ue0c8 Nanaksar gurdwara, sector 28 B, Sector 28, Chandigarh, 160002",
    "specialty": "Dental",
    "city": "Chandigarh",
    "tier": "Metro"
  },
  {
    "name": "ARORA DENTAL CARE",
    "phone": "9975146077",
    "email": "",
    "address": "\ue0c8 FIRST FLOOR, BUILDING D&E, Anjuman Shopping Complex, E-15/16, Mangalwari Bazar Rd, above SAMSUNG, near HALDIRAM, Sadar, Nagpur, Maharashtra 440001",
    "specialty": "Dental",
    "city": "Nagpur",
    "tier": "Metro"
  },
  {
    "name": "Dr. Saurabh Jaiswal",
    "phone": "8275757171",
    "email": "",
    "address": "\ue0c8 Opposite Centre Point Hotel, Mano-Laxmi Building, First floor, Central Bazar Road, above Namkeen Ghar, Ramdaspeth, Nagpur, Maharashtra 440010",
    "specialty": "Dermatology",
    "city": "Nagpur",
    "tier": "Metro"
  },
  {
    "name": "Sharma Skin Care Clinic",
    "phone": "8329139811",
    "email": "",
    "address": "\ue0c8 main market road, opp. Kachore lawn, next to Rakshak Mart, Manish Nagar, Somalwada, Nagpur, Maharashtra 440037",
    "specialty": "Dermatology",
    "city": "Nagpur",
    "tier": "Metro"
  },
  {
    "name": "Dr Aditya R Joshi/ BEST BRACES SPECIALIST| Best Dental clinic in indore",
    "phone": "9407147974",
    "email": "",
    "address": "\ue0c8 104 ( First Floor, BM Tower, Sapna Sangeeta Rd, opposite to Lotus Electronics, Old Agarwal Nagar, Indore, Madhya Pradesh 452001",
    "specialty": "Dental",
    "city": "Indore",
    "tier": "Metro"
  },
  {
    "name": "Indore Dental Clinic",
    "phone": "9109559550",
    "email": "",
    "address": "\ue0c8 MW87+CP3, 07, near Government School, Anand Nagar, Nayta Mundla, Indore, Madhya Pradesh 452001",
    "specialty": "Dental",
    "city": "Indore",
    "tier": "Metro"
  },
  {
    "name": "Manav dental clinic indore",
    "phone": "9685576137",
    "email": "",
    "address": "\ue0c8 Khati Pura Rd, New Gouri Nagar, Sukhliya, Indore, Madhya Pradesh 452003",
    "specialty": "Dental",
    "city": "Indore",
    "tier": "Metro"
  },
  {
    "name": "Novel Dental N Implant Clinic by Dr.Sumeet Jain",
    "phone": "9826054001",
    "email": "",
    "address": "\ue0c8 UG-6, 16, RS Bhandari Marg, opp. Basket Ball Complex, Near Janjeerwala Square, New Palasia, Indore, Madhya Pradesh 452003",
    "specialty": "Dental",
    "city": "Indore",
    "tier": "Metro"
  },
  {
    "name": "Best Skin and Hair Clinic in Kochi | Brighten Up",
    "phone": "8848190030",
    "email": "",
    "address": "\ue0c8 2nd Floor, Chakrampilly Avanue, Seaport - Airport Rd, near Bharath Matha College, Judgemukku, Thrikkakara, Kakkanad, Kochi, Kerala 682021",
    "specialty": "Dermatology",
    "city": "Kochi",
    "tier": "Metro"
  },
  {
    "name": "Dr. Malavika",
    "phone": "9400716020",
    "email": "",
    "address": "\ue0c8 SRRA 34, Society Rd, Shastri Nagar, Maradu, Kochi, Ernakulam, Kerala 682304",
    "specialty": "Dermatology",
    "city": "Kochi",
    "tier": "Metro"
  },
  {
    "name": "Dr. Naveen\u2019s Skin & Hair Clinic",
    "phone": "8590595755",
    "email": "",
    "address": "\ue0c8 Door no, House no HB-85, 4th Cross Rd, Ramaswamy colony, Panampilly Nagar, Kochi, Ernakulam, Kerala 682036",
    "specialty": "Dermatology",
    "city": "Kochi",
    "tier": "Metro"
  },
  {
    "name": "Radiant Skin Clinic",
    "phone": "9447233986",
    "email": "",
    "address": "\ue0c8 Dr Sanjay Cherian ,First floor, Ambady Apartments, Warriam Rd, Pallimukku, Kochi, Kerala 682016",
    "specialty": "Dermatology",
    "city": "Kochi",
    "tier": "Metro"
  },
  {
    "name": "SKIN LOUNGE KOCHI",
    "phone": "9633301666",
    "email": "",
    "address": "\ue0c8 1st Floor, Thulasi Building, KP Vallon Rd, Giri Nagar, Kadavanthra, Kochi, Ernakulam, Kerala 682020",
    "specialty": "Dermatology",
    "city": "Kochi",
    "tier": "Metro"
  },
  {
    "name": "Dr.R. Jayashree",
    "phone": "9952424135",
    "email": "",
    "address": "\ue0c8 Sembier Complex, 2203-A, Trichy Rd, Singanallur, Tamil Nadu 641005",
    "specialty": "Dermatology",
    "city": "Coimbatore",
    "tier": "Metro"
  },
  {
    "name": "Lotus Skin Clinic",
    "phone": "9489891739",
    "email": "",
    "address": "\ue0c8 532, Mettupalayam Rd, opp. sulochana pharmacy, Bharathiyar Nagar, K. Vadamadurai, Kurudampalayam, Tamil Nadu 641017",
    "specialty": "Dermatology",
    "city": "Coimbatore",
    "tier": "Metro"
  },
  {
    "name": "Shyam Dental Clinic Coimbatore",
    "phone": "9944366299",
    "email": "",
    "address": "\ue0c8 Shop No-545, car parking available, Vysial St, Prakasam, Town Hall, Coimbatore, Tamil Nadu 641001",
    "specialty": "Dental",
    "city": "Coimbatore",
    "tier": "Metro"
  },
  {
    "name": "Dr Ajay Singh Raghuwanshi | MD Dermatologist | Skin Hair Laser | Kalyani\u2122 Skin Clinic",
    "phone": "6262968686",
    "email": "",
    "address": "\ue0c8 TH-18, Main Rd, near Aura Mall, Akashganga Colony, Gulmohar Colony, Bhopal, Madhya Pradesh 462016",
    "specialty": "Dermatology",
    "city": "Bhopal",
    "tier": "Metro"
  },
  {
    "name": "Dr Anil mohite MD, Dr Pooja gupta MD, best dermatologist in bhopal",
    "phone": "7024701119",
    "email": "",
    "address": "\ue0c8 Skin Care clinic, Bittan Market, police station, opp. Rani kamlapati, Opposite Habibganj Police Station, Board Colony, Char Imli, Bhopal, Madhya Pradesh 462016",
    "specialty": "Dermatology",
    "city": "Bhopal",
    "tier": "Metro"
  },
  {
    "name": "Dr Ankita Agrawal",
    "phone": "7000556827",
    "email": "",
    "address": "\ue0c8 opp. orchard heights, near bisoniya hospital, Raghunath Nagar, Rohit Nagar, Bawadiya Kalan, Gulmohar Colony, Bhopal, Madhya Pradesh 462039",
    "specialty": "Dermatology",
    "city": "Bhopal",
    "tier": "Metro"
  },
  {
    "name": "Dr Nidhi Rana Skin Clinic | Dermatologist in Bhopal",
    "phone": "9896254925",
    "email": "",
    "address": "\ue0c8 1st Floor, E block Surendra Landmark, Narmadapuram Rd, Bhopal, Madhya Pradesh 462026",
    "specialty": "Dermatology",
    "city": "Bhopal",
    "tier": "Metro"
  },
  {
    "name": "Twacha Skin Clinic",
    "phone": "9074853213",
    "email": "",
    "address": "\ue0c8 Shop no. 10, Komal Complex, 171, near New star hospital, DIG Bunglow, Green Park Colony, Bhanpur, Bhopal, Madhya Pradesh 462001",
    "specialty": "Dermatology",
    "city": "Bhopal",
    "tier": "Metro"
  },
  {
    "name": "Wonder Tooth Dental Care",
    "phone": "8103999033",
    "email": "",
    "address": "\ue0c8 2nd Floor, Sawaliya Squre, Dk -3/20, Kolar Rd, near Danish Kunj, Danish Kunj, Churaha, Bhopal, Madhya Pradesh 462042",
    "specialty": "Dental",
    "city": "Bhopal",
    "tier": "Metro"
  },
  {
    "name": "Friends Dental Home &facial Surgery Centre",
    "phone": "7903687905",
    "email": "",
    "address": "\ue0c8 Near gold gym, ashiyana road, Samanpura, PFC, opposite neelkanth hospital, Patna, Bihar 800014",
    "specialty": "Dental",
    "city": "Patna",
    "tier": "Metro"
  },
  {
    "name": "Friends Dental Home &facial Surgery Centre",
    "phone": "7739953840",
    "email": "",
    "address": "\ue0c8 North of Pillar no 25, Nalanda Colony, nr. Ashokpuri Chouraha, Jyotipuram Colony, Khajpura, Patna, Bihar 800014",
    "specialty": "Dental",
    "city": "Patna",
    "tier": "Metro"
  },
  {
    "name": "KRISHNA DENTAL PATNA - By Dr. Rahul Kumar",
    "phone": "8210508110",
    "email": "",
    "address": "\ue0c8 Kriti Fuel, Kangkar Bagh Road, opp. H.P petrol pump, near Laddu Gopal Sweets, Kumhrar, Patna, Bihar 800026",
    "specialty": "Dental",
    "city": "Patna",
    "tier": "Metro"
  },
  {
    "name": "Patna Dental Clinic & Implant Centre",
    "phone": "9334934736",
    "email": "",
    "address": "\ue0c8 Makhania Kuan R.J. Complex, Ashok Rajpath Rd, Patna, Bihar 800004",
    "specialty": "Dental",
    "city": "Patna",
    "tier": "Metro"
  },
  {
    "name": "SAGUNA SKIN CLINIC",
    "phone": "9110087441",
    "email": "",
    "address": "\ue0c8 Shop no. 4 ,Ground Floor, Ganpati Rupa Tower, behind Harilal's sweets, RPS More, Kaliket Nagar, Danapur, Patna, Bihar 801503",
    "specialty": "Dermatology",
    "city": "Patna",
    "tier": "Metro"
  },
  {
    "name": "DERMA ONE by Dr SOVANA | Best Dermatologist in Visakhapatnam| Acne, Hair Fall, Scars and Botox treatment",
    "phone": "9966300034",
    "email": "",
    "address": "\ue0c8 1st floor, SS Medical Center, 14-36/2, near Quantum Diagnostics, beside SBI Doctor's Colony Branch, Krishnagar, Krishna Nagar, Maharani Peta, Visakhapatnam, Andhra Pradesh 530002",
    "specialty": "Dermatology",
    "city": "Visakhapatnam",
    "tier": "Metro"
  },
  {
    "name": "Dr Sanjana Dental",
    "phone": "9169828999",
    "email": "",
    "address": "\ue0c8 Doctors and Doctors Plaza, C-13, KGH Down Rd, Opposite KGH OP Gate, Maharani Peta, Visakhapatnam, Andhra Pradesh 530002",
    "specialty": "Dental",
    "city": "Visakhapatnam",
    "tier": "Metro"
  },
  {
    "name": "Happy Skin Clinic",
    "phone": "8019464040",
    "email": "",
    "address": "\ue0c8 Abid Nagar Rd, beside PEN school, opp. Masjid-E, Taj Bagh, Akkayyapalem, Visakhapatnam, Andhra Pradesh 530016",
    "specialty": "Dermatology",
    "city": "Visakhapatnam",
    "tier": "Metro"
  },
  {
    "name": "Tooth Point Multi Speciality Dental Clinic",
    "phone": "8912755739",
    "email": "",
    "address": "\ue0c8 1st Floor, Krishna Complex, Sankara Matam Rd, adjacent to Ramalingeswara Swamy Temple, Lalitha Nagar, Akkayyapalem, Visakhapatnam, Andhra Pradesh 530016",
    "specialty": "Dental",
    "city": "Visakhapatnam",
    "tier": "Metro"
  },
  {
    "name": "Dental Care",
    "phone": "",
    "email": "",
    "address": "\ue0c8 1st Floor, Shiv Mahal Appartment, New Sama Rd, near M.S Co-Opprative Bank, above \u0905\u092d\u093f\u0932\u093e\u0937\u093e \u092c\u0941\u0915 \u0938\u094d\u091f\u094b\u0930, Near Abhilasha Char Rasta, Raghuvir Nagar, Raghukul Nagar, New Sama, Vadodara, Gujarat 390024",
    "specialty": "Dental",
    "city": "Vadodara",
    "tier": "Metro"
  },
  {
    "name": "Dr Som Lakhani",
    "phone": "9825350198",
    "email": "",
    "address": "\ue0c8 109, Race Course Rd, near Natubhai Circle, Paris Nagar, Diwalipura, Vadodara, Gujarat 390007",
    "specialty": "Dermatology",
    "city": "Vadodara",
    "tier": "Metro"
  },
  {
    "name": "Dr. Archana's Skin Care Clinic",
    "phone": "9426270479",
    "email": "",
    "address": "\ue0c8 Nilamber Circle, 201, Labh Icon, 30 Mtr, Gotri - Vasna Rd, near Bansal Mall, Gotri, Vadodara, Gujarat 390021",
    "specialty": "Dermatology",
    "city": "Vadodara",
    "tier": "Metro"
  },
  {
    "name": "Family Dental Care & Implant Center \u2013 Best Dentist in Vadodara",
    "phone": "9601285785",
    "email": "",
    "address": "\ue0c8 1st Floor, Shiv Mahal Apartment, New Sama Rd, near M.S. Co-Operative Bank, Near Abhilasha Char Rasta, Raghukul Nagar, New Sama, Vadodara, Gujarat 390008",
    "specialty": "Dental",
    "city": "Vadodara",
    "tier": "Metro"
  },
  {
    "name": "PALKARS' Skin & Mind Clinic| Dr. Neha Purohit | Dr. Devashish Palkar",
    "phone": "6354458502",
    "email": "",
    "address": "\ue0c8 First floor, Shop no 2 &3, Rutukalash Complex Tulsidham, 390011, crossroads, Manjalpur, Vadodara, Gujarat 390011",
    "specialty": "Dermatology",
    "city": "Vadodara",
    "tier": "Metro"
  },
  {
    "name": "Sanjeevani Dental Clinic and Implant Centre",
    "phone": "9427409241",
    "email": "",
    "address": "\ue0c8 S-15, opp. Bhathiji Mandir, Shivam Society, Manjalpur, Vadodara, Gujarat 390011",
    "specialty": "Dental",
    "city": "Vadodara",
    "tier": "Metro"
  },
  {
    "name": "Saumya Skin Clinic - Hair Transplantation And Laser Hair Removal Expert",
    "phone": "9925030482",
    "email": "",
    "address": "\ue0c8 Char Rasta, 103, Kunal Complex, Deluxe Rd, beside Bank Of Baroda, opp. Arpan Complex, Bhakti Nagar, Pensionpura, Nizampura, Vadodara, Gujarat 390002",
    "specialty": "Dermatology",
    "city": "Vadodara",
    "tier": "Metro"
  },
  {
    "name": "Surdeep maxillofacial and dental hospital",
    "phone": "9428879089",
    "email": "",
    "address": "\ue0c8 10 sonal, Amruta Park Society, near jain upashraya, next to desai eye hospital, Subhanpura, Vadodara, Gujarat 390023",
    "specialty": "Dental",
    "city": "Vadodara",
    "tier": "Metro"
  },
  {
    "name": "AnuKrama Aesthetic & Skin Clinic",
    "phone": "8650086706",
    "email": "",
    "address": "\ue0c8 First Floor, Dwarika Grande Street, F-10, Road, Rajpur Chungi, Shamsabad, Agra, Uttar Pradesh 282001",
    "specialty": "Dermatology",
    "city": "Agra",
    "tier": "Tier-2"
  },
  {
    "name": "BEST DERMATOLOGIST IN AGRA BEST SKIN DOCTOR IN AGRA DR. VINOD KUMAR SINGH MBBS DVD ||FUNGAL ||SCAR||ACNE||SKIN",
    "phone": "9412256980",
    "email": "",
    "address": "\ue0c8 143,Jaipur House Colony, near Lord Bhairo Mandir, Lohamandi, Agra, Uttar Pradesh 282002",
    "specialty": "Dermatology",
    "city": "Agra",
    "tier": "Tier-2"
  },
  {
    "name": "CosmiQ Clinic (best Laser hair reduction in agra| Best hair loss treatment in agra| best skin care treatment in agra)",
    "phone": "7817040115",
    "email": "",
    "address": "\ue0c8 E-27, Pani Ki Tanki Rd, near HRIDYAM HOSPITAL, Professors Colony, Ghatwasan, Kamla Nagar, Agra, Uttar Pradesh 282005",
    "specialty": "Dermatology",
    "city": "Agra",
    "tier": "Tier-2"
  },
  {
    "name": "CosmiQ Clinic (best Laser hair reduction in agra| Best hair loss treatment in agra| best skin care treatment in agra)",
    "phone": "9410659481",
    "email": "",
    "address": "\ue0c8E-27, Pani Ki Tanki Rd, near HRIDYAM HOSPITAL, Professors Colony, Ghatwasan, Kamla Nagar, Agra, Uttar Pradesh 282005",
    "specialty": "Dermatology",
    "city": "Agra",
    "tier": "Tier-2"
  },
  {
    "name": "Dr. Isha Singh MD,THE DERMA CLINIC",
    "phone": "9720009373",
    "email": "",
    "address": "\ue0c8 Ground Floor, Ganga Ratan Square House, G-12B, Church Rd, Hariparwat, Professors Colony, Civil Lines, Agra, Uttar Pradesh 282002",
    "specialty": "Dermatology",
    "city": "Agra",
    "tier": "Tier-2"
  },
  {
    "name": "Siddhi skin solutions (Dr. Tunika Aroraa)",
    "phone": "9545662465",
    "email": "",
    "address": "\ue0c8 Shop no 1, DAV complex, Takkar road, Rajpur chungi, road, Shamsabad, Agra, Uttar Pradesh 282001",
    "specialty": "Dermatology",
    "city": "Agra",
    "tier": "Tier-2"
  },
  {
    "name": "Sparks Dental Clinic Agra",
    "phone": "7060092267",
    "email": "",
    "address": "\ue0c8 Rashmi, vihar road, opposite kehrai, Anantpuram, Indrapuram, mod, Shamsabad, Agra, Uttar Pradesh 282001",
    "specialty": "Dental",
    "city": "Agra",
    "tier": "Tier-2"
  },
  {
    "name": "The National Skin Care Centre Dr. Lalit Juneja",
    "phone": "9897432970",
    "email": "",
    "address": "\ue0c8 Hariparwat, Professors Colony, Civil Lines, Agra, Uttar Pradesh 282002",
    "specialty": "Dermatology",
    "city": "Agra",
    "tier": "Tier-2"
  },
  {
    "name": "Dr. Vinay 's Dentofix : Multi-speciality Dental Clinic and Implant Centre",
    "phone": "9569496899",
    "email": "",
    "address": "\ue0c8 Tridev Complex, Near, BHU Rd, Sundarpur, Nagwa, Varanasi, Uttar Pradesh 221005",
    "specialty": "Dental",
    "city": "Varanasi",
    "tier": "Tier-2"
  },
  {
    "name": "Kashi smile and braces multi-speciality dental clinic varanasi",
    "phone": "9369848184",
    "email": "",
    "address": "\ue0c8 93, Shivaji Nagar Colony, shivaji nagar, Mahmoorganj, Varanasi, Uttar Pradesh 221010",
    "specialty": "Dental",
    "city": "Varanasi",
    "tier": "Tier-2"
  },
  {
    "name": "Prakash Skin Clinic",
    "phone": "9956462872",
    "email": "",
    "address": "\ue0c8 Lane Number 1, Rajendra Vihar Colony, Kailashpuri Colony, Varanasi, Uttar Pradesh 221005",
    "specialty": "Dermatology",
    "city": "Varanasi",
    "tier": "Tier-2"
  },
  {
    "name": "RAVI DENTAL CARE",
    "phone": "8209417262",
    "email": "",
    "address": "\ue0c8 C-27/1-A, Sanskrit University Rd, near sampurnanand, Jagatganj, Chaukaghat, Varanasi, Uttar Pradesh 221002",
    "specialty": "Dental",
    "city": "Varanasi",
    "tier": "Tier-2"
  },
  {
    "name": "Dr. Amit Mittal Meerut - Best Skin Doctor | Best Hair Doctor | Best Cosmetologist | Best Aesthetic Doctor | In Meerut",
    "phone": "8958563684",
    "email": "",
    "address": "\ue0c8 Sai Baba Mandir, 31, Kanker Khera, Sardhana Rd, Meerut, Uttar Pradesh 250001",
    "specialty": "Dermatology",
    "city": "Meerut",
    "tier": "Tier-2"
  },
  {
    "name": "Dr.Vikas Chaudhary / Dr.Pratibha Singh Dental clinic, orthodontic & Implant center / Best Dentist in Meerut",
    "phone": "9634226530",
    "email": "",
    "address": "\ue0c8 Landmark - Hotel Jyoti palace, near Ratna medical store, Lal Kurti, BADA BAAZAR, Meerut Cantt, Meerut, Uttar Pradesh 250001",
    "specialty": "Dental",
    "city": "Meerut",
    "tier": "Tier-2"
  },
  {
    "name": "Mirza Dental And Implant Centre, Meerut",
    "phone": "7417943144",
    "email": "",
    "address": "\ue0c8 RTO, RTO Compound, Near, RTO Rd, opposite AL - Noor Plaza, Sector 12, Shastri Nagar, Meerut, Uttar Pradesh 250002",
    "specialty": "Dental",
    "city": "Meerut",
    "tier": "Tier-2"
  },
  {
    "name": "Premora Dental Clinic | Best Dentist in Meerut | Best Dental Clinic in Meerut | Root canal , Implant specialist",
    "phone": "9389333597",
    "email": "",
    "address": "\ue0c8 near kotak mahindra bank, Mangal Pandey Nagar, Ramgarhi, Meerut, Uttar Pradesh 250004",
    "specialty": "Dental",
    "city": "Meerut",
    "tier": "Tier-2"
  },
  {
    "name": "SKIN & ENT CLINIC| DR. BARKHA GOEL (MD SKIN&VD)| DR. LAKSHAY GUPTA (MS ENT&HNS)",
    "phone": "9205469277",
    "email": "",
    "address": "\ue0c8 Shiv Plaza, Baghpat Rd, Jwala Nagar, Naval Vihar, Meerut, Uttar Pradesh 250002",
    "specialty": "Dermatology",
    "city": "Meerut",
    "tier": "Tier-2"
  },
  {
    "name": "SMILE DENTAL CARE & IMPLANT CENTER (Dental Clinic)",
    "phone": "9837156784",
    "email": "",
    "address": "\ue0c8 shop no 9, Ground floor, Deep Complex, Begum Bridge Road,, Begambagh, Meerut, Uttar Pradesh 250001",
    "specialty": "Dental",
    "city": "Meerut",
    "tier": "Tier-2"
  },
  {
    "name": "SMILE DENTAL CARE & IMPLANT CENTER (Dental Clinic)",
    "phone": "9837173055",
    "email": "",
    "address": "\ue0c8shop no 9, Ground floor, Deep Complex, Begum Bridge Road,, Begambagh, Meerut, Uttar Pradesh 250001",
    "specialty": "Dental",
    "city": "Meerut",
    "tier": "Tier-2"
  },
  {
    "name": "Kanpur Dental Center | Dentist near me | clinic in Kanpur | RCT | Best Dentist in Kanpur",
    "phone": "7985724502",
    "email": "",
    "address": "\ue0c8 sanjha hall ke bagal me, Bamba Rd, Gumti No.5, Darshan Purwa, Kanpur, Uttar Pradesh 208009",
    "specialty": "Dental",
    "city": "Kanpur",
    "tier": "Tier-2"
  },
  {
    "name": "Kanpur Dental Clinic / Best Dental Clinic Near Me By Dr Ruchita Agarwal",
    "phone": "",
    "email": "",
    "address": "\ue0c8 120/669, Lajpat Nagar, Narainpurwa, Kanpur, Uttar Pradesh 208005",
    "specialty": "Dental",
    "city": "Kanpur",
    "tier": "Tier-2"
  },
  {
    "name": "Advanced Dental Lounge",
    "phone": "8418007034",
    "email": "",
    "address": "\ue0c8 G , 30, 138, MG Marg, behind Elchico Resturant, near Subhash Chauraha, Civil Lines, Prayagraj, Uttar Pradesh 211001",
    "specialty": "Dental",
    "city": "Prayagraj",
    "tier": "Tier-2"
  },
  {
    "name": "Amrita Clinic - Dr. Amrita Singh - Best Dermatologist in prayagraj",
    "phone": "9219724628",
    "email": "",
    "address": "\ue0c8 Van Vibhag Chauraha, 23/5, Amar Nath Jha Marg, near Dr Lal Path Labs, Darbhanga Colony, George Town, Prayagraj, Uttar Pradesh 211002",
    "specialty": "Dermatology",
    "city": "Prayagraj",
    "tier": "Tier-2"
  },
  {
    "name": "KeshDerma skin & hair clinic",
    "phone": "8840661981",
    "email": "",
    "address": "\ue0c8 Hashimpur Rd, Tagore Town, Prayagraj, Uttar Pradesh 211002",
    "specialty": "Dermatology",
    "city": "Prayagraj",
    "tier": "Tier-2"
  },
  {
    "name": "Pashupati Nursing Home",
    "phone": "",
    "email": "",
    "address": "\ue0c8 47/3, Lowther Rd, Darbhanga Colony, George Town, Prayagraj, Uttar Pradesh 211002",
    "specialty": "Dermatology",
    "city": "Prayagraj",
    "tier": "Tier-2"
  },
  {
    "name": "Dr. Aayushi Mohan Best dermatologist",
    "phone": "9648333186",
    "email": "",
    "address": "\ue0c8 Janki Kutir 22, near Malti lawns, behind Andrews Degree college, Judges Colony, Civil Lines, Gorakhpur, Uttar Pradesh 273001",
    "specialty": "Dermatology",
    "city": "Gorakhpur",
    "tier": "Tier-2"
  },
  {
    "name": "Rama multispeciality dental clinic",
    "phone": "8726241102",
    "email": "",
    "address": "\ue0c8 R.S.tower, near chaudhary sabji mandi, Khajanchi Chauraha, Raptinagar, Hussain Nagar, Gorakhpur, Uttar Pradesh 273003",
    "specialty": "Dental",
    "city": "Gorakhpur",
    "tier": "Tier-2"
  },
  {
    "name": "ASG Skin hospital",
    "phone": "9309309886",
    "email": "",
    "address": "\ue0c8 2nd Rd, Sardarpura, Jodhpur, Rajasthan 342003",
    "specialty": "Dermatology",
    "city": "Jodhpur",
    "tier": "Tier-2"
  },
  {
    "name": "DENTAL HUB JODHPUR",
    "phone": "9880815445",
    "email": "",
    "address": "\ue0c8 Dental hub, Subhash Chowk, opposite Police Line Road, family gate, Ratanada, Jodhpur, Rajasthan 342001",
    "specialty": "Dental",
    "city": "Jodhpur",
    "tier": "Tier-2"
  },
  {
    "name": "Dental Square | Dr. Anirudh Vyas & Dr. Preeti Vyas",
    "phone": "",
    "email": "",
    "address": "\ue0c8 D-61, Sector-D, Shastri Nagar, Jodhpur, Rajasthan 342003",
    "specialty": "Dental",
    "city": "Jodhpur",
    "tier": "Tier-2"
  },
  {
    "name": "Dr Dilip Kachhwaha",
    "phone": "9460550336",
    "email": "",
    "address": "\ue0c8 Out side of Main gate, no. 1, Ajeet Mal Bhandari Rd, Shastri Nagar, Jodhpur, Rajasthan 342003",
    "specialty": "Dermatology",
    "city": "Jodhpur",
    "tier": "Tier-2"
  },
  {
    "name": "Dr Divya Liler MD Dermatologist cosmetologist trichologist",
    "phone": "7568180296",
    "email": "",
    "address": "\ue0c8 IFT center, Saraswati Nagar, sector A, Basni, Jodhpur, Rajasthan 342005",
    "specialty": "Dermatology",
    "city": "Jodhpur",
    "tier": "Tier-2"
  },
  {
    "name": "Dr Mahesh Prajapat",
    "phone": "9875094860",
    "email": "",
    "address": "\ue0c8 23 sector C.H.B, Sector 23, Chopasni Housing Board, Jodhpur, Rajasthan 342014",
    "specialty": "Dermatology",
    "city": "Jodhpur",
    "tier": "Tier-2"
  },
  {
    "name": "Dr Manzoor Ilahi, Skin Hospital",
    "phone": "7976072904",
    "email": "",
    "address": "\ue0c8 Sector D - 217, Kamla Nehru Nagar, 1st Pulia, Jodhpur, Rajasthan 342001",
    "specialty": "Dermatology",
    "city": "Jodhpur",
    "tier": "Tier-2"
  },
  {
    "name": "Dr. Brajesh Patel",
    "phone": "9929047108",
    "email": "",
    "address": "\ue0c8 Pal Rd, opposite Dhanwantari Hospital, Subhash Nagar, Jodhpur, Rajasthan 342001",
    "specialty": "Dermatology",
    "city": "Jodhpur",
    "tier": "Tier-2"
  },
  {
    "name": "ELITE DENTAL CARE",
    "phone": "9660102489",
    "email": "",
    "address": "\ue0c8 RAJ, 224-B NG PLAZA, 2nd C Rd, near GANDHI MAIDHAN, Jodhpur, Rajasthan 342003",
    "specialty": "Dental",
    "city": "Jodhpur",
    "tier": "Tier-2"
  },
  {
    "name": "Saumya Dental Care",
    "phone": "9769898000",
    "email": "",
    "address": "\ue0c8 Sardar Club Scheme, 41 B, Polo Ground Rd, Air Force Area, Jodhpur, Rajasthan 342011",
    "specialty": "Dental",
    "city": "Jodhpur",
    "tier": "Tier-2"
  },
  {
    "name": "Shri Ram Dental Clinic Jodhpur",
    "phone": "",
    "email": "",
    "address": "\ue0c8 95A, Pal Rd, near Arihant Hospital, Narpat Nagar, Ashok Nagar, Jodhpur, Rajasthan 342003",
    "specialty": "Dental",
    "city": "Jodhpur",
    "tier": "Tier-2"
  },
  {
    "name": "Dr Anuj Kothari",
    "phone": "7878554538",
    "email": "",
    "address": "\ue0c8 Multilevel parking, Dr Rajiv eye Care hospital, Vinayak medical store c/o, near Vodafone office, opposite udaipur hotel, Surajpole, Udaipur, Rajasthan 313001",
    "specialty": "Dermatology",
    "city": "Udaipur",
    "tier": "Tier-2"
  },
  {
    "name": "Goyal Skin Clinic",
    "phone": "9413665143",
    "email": "",
    "address": "\ue0c8 328-A, behind akashwani colony, Vasant Vihar, Sector 5, Hiran Magri, Udaipur, Rajasthan 313002",
    "specialty": "Dermatology",
    "city": "Udaipur",
    "tier": "Tier-2"
  },
  {
    "name": "\ud835\uddd7\ud835\uddee\ud835\uddee\ud835\uddfb\ud835\ude01 \ud835\uddde \ud835\udde3\ud835\uddf5\ud835\uddfc\ud835\uddf7\ud835\uddf2\ud835\uddf2 \ud835\uddd7\ud835\uddf2\ud835\uddfb\ud835\ude01\ud835\uddee\ud835\uddf9 \ud835\uddd6\ud835\uddf9\ud835\uddf6\ud835\uddfb\ud835\uddf6\ud835\uddf0 \ud835\uddd4\ud835\uddfb\ud835\uddf1 \ud835\udddc\ud835\uddfa\ud835\uddfd\ud835\uddf9\ud835\uddee\ud835\uddfb\ud835\ude01 \ud835\uddd6\ud835\uddf2\ud835\uddfb\ud835\ude01\ud835\uddff\ud835\uddf2 - Best dentist in Udaipur, Best facial aesthetics in udaipur",
    "phone": "8277460496",
    "email": "",
    "address": "\ue0c8 14, Ganpati Vihar, Gayatri Nagar, Sector 5, Hiran Magri, Udaipur, Rajasthan 313001",
    "specialty": "Dental",
    "city": "Udaipur",
    "tier": "Tier-2"
  },
  {
    "name": "Dental Blisss (Best Dental clinic in Kunhari Kota)",
    "phone": "8058778444",
    "email": "",
    "address": "\ue0c8 Parshvnath Residency . Exotica, A-43, Canal Rd, Kunadi, Electricity Board Area, Kota, Rajasthan 324008",
    "specialty": "Dental",
    "city": "Kota",
    "tier": "Tier-2"
  },
  {
    "name": "Dr Archana Saxena Skin Clinic",
    "phone": "9571984928",
    "email": "",
    "address": "\ue0c8 11-B, Civil Lines Rd, Nayapura, Kota, Rajasthan 324001",
    "specialty": "Dermatology",
    "city": "Kota",
    "tier": "Tier-2"
  },
  {
    "name": "Dr Puja Sharma Best Dermatologist Skin Doctor Kota",
    "phone": "9636314061",
    "email": "",
    "address": "\ue0c8 5 A 1, Rangbari Rd, Talwandi, Kota, Rajasthan 324005",
    "specialty": "Dermatology",
    "city": "Kota",
    "tier": "Tier-2"
  },
  {
    "name": "Dr Renu Gupta Skin Specialist & Dermatologist | Agrawal Eye & Skin Hospital Kota",
    "phone": "9414728505",
    "email": "",
    "address": "\ue0c8 SFS, 1-C-13, Sheela Choudhary Rd, New Rajeev Gandhi Nagar, VIP Colony, Talwandi, Kota, Rajasthan 324005",
    "specialty": "Dermatology",
    "city": "Kota",
    "tier": "Tier-2"
  },
  {
    "name": "Dr Tushar Maheshwari|implant dentist|braces dentist|BDS |dentist in kota",
    "phone": "8003066117",
    "email": "",
    "address": "\ue0c8 354, Shastri Nagar, Dadabari, Kota, Rajasthan 324009",
    "specialty": "Dental",
    "city": "Kota",
    "tier": "Tier-2"
  },
  {
    "name": "Dr Umesh gautam | Best Dermatologist in Kota",
    "phone": "",
    "email": "",
    "address": "\ue0c8 Dr Umesh gautam, shri saisai diagnostic, 1 ta 20, Vigyan Nagar, Kota, Rajasthan 324005",
    "specialty": "Dermatology",
    "city": "Kota",
    "tier": "Tier-2"
  },
  {
    "name": "Dr. Rajeev Jain Clinic",
    "phone": "9413733810",
    "email": "",
    "address": "\ue0c8 NEAR, CIRCLE, Keshavpura, Talwandi, Kota, Rajasthan 324005",
    "specialty": "Dermatology",
    "city": "Kota",
    "tier": "Tier-2"
  },
  {
    "name": "Dr. Vineet Kumar Verma",
    "phone": "8094007554",
    "email": "",
    "address": "\ue0c8 14, R K Puram Rd, Sector B, Rama Krishna Puram, Kota, Rajasthan 324005",
    "specialty": "Dermatology",
    "city": "Kota",
    "tier": "Tier-2"
  },
  {
    "name": "Follicle Clinic - Dermatologist in kota | Skin Specialist | Hair Specialist | Hair Disease Treatment | Gynecologist in Kota",
    "phone": "6350504621",
    "email": "",
    "address": "\ue0c8 415, behind Commerce College, New Rajeev Gandhi Nagar, Instrumentation Limited Colony, Kota, Rajasthan 324005",
    "specialty": "Dermatology",
    "city": "Kota",
    "tier": "Tier-2"
  },
  {
    "name": "Bone and Skin Clinic. Orthopedic surgeon. Knee Replacement. Dermatologist.Dr Arun Rajpurohit DrDimple Rajpurohit",
    "phone": "6367953233",
    "email": "",
    "address": "\ue0c8 A-638, opposite guru Abhay residency, A Block Panchsheel Colony, Panchsheel Nagar, Ajmer, Rajasthan 305004",
    "specialty": "Dermatology",
    "city": "Ajmer",
    "tier": "Tier-2"
  },
  {
    "name": "Dr Ashok Meherda",
    "phone": "",
    "email": "",
    "address": "\ue0c8 78 B, Nagina Bagh, Muslim Mochi Mohalla, Ajmer, Rajasthan 305001",
    "specialty": "Dermatology",
    "city": "Ajmer",
    "tier": "Tier-2"
  },
  {
    "name": "Dr Raina Arora (MD Skin & VD), Dermatologist | Laser & hair Transplant Specialist",
    "phone": "",
    "email": "",
    "address": "\ue0c8 2nd Floor, near Kairos bistro, Cheeta Nagar, Abhiyanta Nagar, Ajmer, Rajasthan 305004",
    "specialty": "Dermatology",
    "city": "Ajmer",
    "tier": "Tier-2"
  },
  {
    "name": "DR SHASHIKALA CHAUDHARY (DERMATOLOGIST)",
    "phone": "9352868407",
    "email": "",
    "address": "\ue0c8 DR. SHASHIKALA CHAUDHARY \u201cSadguru Kuteer\u201d D - 41, D Block, Chandravardai Nagar, Taragarh Road, Opp, Stadium Main Entrance Gate, Ajmer, Rajasthan 305001",
    "specialty": "Dermatology",
    "city": "Ajmer",
    "tier": "Tier-2"
  },
  {
    "name": "DR SHASHIKALA CHAUDHARY (DERMATOLOGIST)",
    "phone": "7073794160",
    "email": "",
    "address": "\ue0c8DR. SHASHIKALA CHAUDHARY \u201cSadguru Kuteer\u201d D - 41, D Block, Chandravardai Nagar, Taragarh Road, Opp, Stadium Main Entrance Gate, Ajmer, Rajasthan 305001",
    "specialty": "Dermatology",
    "city": "Ajmer",
    "tier": "Tier-2"
  },
  {
    "name": "Dr Sonam Mehra (MD) (DNB) Dermatologist, Cosmetologist",
    "phone": "6375899878",
    "email": "",
    "address": "\ue0c8 124, near bharat hospital, Shastri Nagar, Ajmer, Rajasthan 305001",
    "specialty": "Dermatology",
    "city": "Ajmer",
    "tier": "Tier-2"
  },
  {
    "name": "Dr. Akshay Raj Goyal - BDS, MDS (Endodontist - Root Canal Specialist) Goyal Janana And Dental Hospital",
    "phone": "",
    "email": "",
    "address": "\ue0c8 Dayanand Market Cir, Kaisar Ganj, Ajmer, Rajasthan 305001",
    "specialty": "Dental",
    "city": "Ajmer",
    "tier": "Tier-2"
  },
  {
    "name": "Dr. Ambika Yadav - Skin specialist",
    "phone": "",
    "email": "",
    "address": "\ue0c8 Mayo ENT and cosmetic centre, F- block, Tempo stand road, opposite Khel maidan, Chandra Vardai Nagar, Ajmer, Rajasthan 305003",
    "specialty": "Dermatology",
    "city": "Ajmer",
    "tier": "Tier-2"
  },
  {
    "name": "Dr. Dinesh mundra",
    "phone": "",
    "email": "",
    "address": "\ue0c8 108, Gyan Vihar Colony, Ajmer, Rajasthan 305004",
    "specialty": "Dermatology",
    "city": "Ajmer",
    "tier": "Tier-2"
  },
  {
    "name": "Dr. Nimit Dube",
    "phone": "",
    "email": "",
    "address": "\ue0c8 AMC No. 23/11, Opp. TB Hospital, Agrasen Circle, Jaipur Rd, Ajmer, Rajasthan 305001",
    "specialty": "Dermatology",
    "city": "Ajmer",
    "tier": "Tier-2"
  },
  {
    "name": "Dr. Ritu Godara",
    "phone": "",
    "email": "",
    "address": "\ue0c8 opp. Relience Fresh Showroom, Sagar Vihar Colony, Vaishali Nagar, Ajmer, Rajasthan 305004",
    "specialty": "Dermatology",
    "city": "Ajmer",
    "tier": "Tier-2"
  },
  {
    "name": "Dr. Sanjay Purohit",
    "phone": "9251622151",
    "email": "",
    "address": "\ue0c8 310/10, opposite Daulat Bagh Road, Sundar Vilas, Ajmer, Rajasthan 305001",
    "specialty": "Dermatology",
    "city": "Ajmer",
    "tier": "Tier-2"
  },
  {
    "name": "Dr. Shivram Sinwar (Ayurveda Panchakarma Physician, Dermatologist, Sexologist)",
    "phone": "",
    "email": "",
    "address": "\ue0c8 108, Gyan Vihar Colony, Ajmer, Rajasthan 305004",
    "specialty": "Dermatology",
    "city": "Ajmer",
    "tier": "Tier-2"
  },
  {
    "name": "Kapoor Dental Hub",
    "phone": "9468683123",
    "email": "",
    "address": "\ue0c8 Krishna Bhawan, 118/24, Kaiser Ganj Rd, near dainik navjyoti press, Babu Mohalla, Parao, Ajmer, Rajasthan 305001",
    "specialty": "Dental",
    "city": "Ajmer",
    "tier": "Tier-2"
  },
  {
    "name": "Mittal Skin and ENT Clinic",
    "phone": "8302247173",
    "email": "",
    "address": "\ue0c8 Makan no 2, A-16, Gali Number 2, Shalimar Colony, Adarsh Nagar, Ajmer, Rajasthan 305002",
    "specialty": "Dermatology",
    "city": "Ajmer",
    "tier": "Tier-2"
  },
  {
    "name": "Sharda Dental Care, Ajmer",
    "phone": "9352002373",
    "email": "",
    "address": "\ue0c8 Ana Sagar Link Road, near Bajranggarh Choraha, Mali Mohalla, Ajmer, Rajasthan 305001",
    "specialty": "Dental",
    "city": "Ajmer",
    "tier": "Tier-2"
  },
  {
    "name": "Skin Win Hair Transplant & Dermatology Clinic",
    "phone": "9773311108",
    "email": "",
    "address": "\ue0c8 2nd Floor, Vijay ENT Hospital, St. Stephen Circle, Makarwali Rd, Cheeta Nagar, Abhiyanta Nagar, Ajmer, Rajasthan 305004",
    "specialty": "Dermatology",
    "city": "Ajmer",
    "tier": "Tier-2"
  },
  {
    "name": "Texas Dental Center -Best Dentist |Dental Clinic |Dental Implant in Lohagal Road Ajmer",
    "phone": "9983496969",
    "email": "",
    "address": "\ue0c8 B-105, Lohagal Rd, Data Nagar, Jattiya Hills, Lohagal Village, Ajmer, Rajasthan 305001",
    "specialty": "Dental",
    "city": "Ajmer",
    "tier": "Tier-2"
  },
  {
    "name": "Triveni dental clinic -Dental Implants in Ajmer |Dental Laboratory |Dental Clinic in Ajmer",
    "phone": "8955558620",
    "email": "",
    "address": "\ue0c8 Triveni Dental Clinic 7Fazlu Market, Alwar Gate, near SBI Bank, Arya Nagar, Ajmer, Rajasthan 305001",
    "specialty": "Dental",
    "city": "Ajmer",
    "tier": "Tier-2"
  },
  {
    "name": "Trust & Care Dental clinic",
    "phone": "7737622830",
    "email": "",
    "address": "\ue0c8 near bhola surgical, Kala Bagh, Ajmer, Rajasthan 305001",
    "specialty": "Dental",
    "city": "Ajmer",
    "tier": "Tier-2"
  },
  {
    "name": "Trust & Care Dental clinic",
    "phone": "9672085535",
    "email": "",
    "address": "\ue0c8near bhola surgical, Kala Bagh, Ajmer, Rajasthan 305001",
    "specialty": "Dental",
    "city": "Ajmer",
    "tier": "Tier-2"
  },
  {
    "name": "\u0921\u0949 \u092a\u093f\u092f\u0942\u0937 \u092a\u0939\u093e\u095c\u093f\u092f\u093e Dr piyush pahadiya \u090f\u092e\u0921\u0940 \u0938\u094d\u0915\u093f\u0928 (\u090f\u092e\u094d\u0938 \u0926\u093f\u0932\u094d\u0932\u0940) \u0938\u093f\u0935\u093f\u0932 \u0932\u093e\u0907\u0928\u094d\u0938 \u0930\u094b\u0921 \u0905\u091c\u092e\u0947\u0930",
    "phone": "9079775515",
    "email": "",
    "address": "\ue0c8infront of savitri primary school, 113/10, Civil Lines Rd, Civil Lines, Ajmer, Rajasthan 305001",
    "specialty": "Dermatology",
    "city": "Ajmer",
    "tier": "Tier-2"
  },
  {
    "name": "Aarshdeep dental clinic",
    "phone": "8511111566",
    "email": "",
    "address": "\ue0c8 32 n 33 ambika shopping center , raiya circle corner ,raiya chowk Rajkot Gujarat 360007 IN, Raiya Rd, Rajkot, Gujarat 360007",
    "specialty": "Dental",
    "city": "Rajkot",
    "tier": "Tier-2"
  },
  {
    "name": "Dr R R Sakhiya Skin Clinic",
    "phone": "9157367890",
    "email": "",
    "address": "\ue0c8 Shop No.FF 35, Suvarnabhoomi Complex, First Floor oppo. Speedwell Party Plot Ambika Township, 36, Main Road, Rajkot, Gujarat 360005",
    "specialty": "Dermatology",
    "city": "Rajkot",
    "tier": "Tier-2"
  },
  {
    "name": "Family Dental Care and Implant Center",
    "phone": "9033722930",
    "email": "",
    "address": "\ue0c8 Mota Mava, Rajkot, Gujarat 360005",
    "specialty": "Dental",
    "city": "Rajkot",
    "tier": "Tier-2"
  },
  {
    "name": "Gandhi Dental Clinic (Dr. Karan Gandhi) (Dr. Monal Gandhi)",
    "phone": "9558902596",
    "email": "",
    "address": "\ue0c8 Raiya Rd, above Gangotri Dairy, Raiya Chokdi, Kidwai Nagar Society, Rajkot, Gujarat 360005",
    "specialty": "Dental",
    "city": "Rajkot",
    "tier": "Tier-2"
  },
  {
    "name": "Laxmi Dental Clinic",
    "phone": "8849664970",
    "email": "",
    "address": "\ue0c8 first floor, Diamond plaza, 101, party plot road, opp. sanidhya 253 flat, beside Heera Panna Road, Speepwell, Mota Mava, Rajkot, Gujarat 360005",
    "specialty": "Dental",
    "city": "Rajkot",
    "tier": "Tier-2"
  },
  {
    "name": "Motwani dental clinic",
    "phone": "9558142345",
    "email": "",
    "address": "\ue0c8 Ramapir chowk, 150 Feet Ring Rd, opp. Fire station, Dharam Nagar, Rajkot, Gujarat 360007",
    "specialty": "Dental",
    "city": "Rajkot",
    "tier": "Tier-2"
  },
  {
    "name": "Roots Dentistry",
    "phone": "8347760330",
    "email": "",
    "address": "\ue0c8 208 Jasal complex Nanavati circle, 150 Feet Ring Rd, Rajkot, Gujarat 360007",
    "specialty": "Dental",
    "city": "Rajkot",
    "tier": "Tier-2"
  },
  {
    "name": "BAPA SITARAM SKIN & HAIR CLINIC",
    "phone": "9979335544",
    "email": "",
    "address": "\ue0c8 B Wing, Nilkanth Height, FF-7, Sardar Patel Institution Rd, near Akshardham -1, Shree Ramnagar, Kaliyabid, Bhavnagar, Gujarat 364002",
    "specialty": "Dermatology",
    "city": "Bhavnagar",
    "tier": "Tier-2"
  },
  {
    "name": "Bhavnagar Dental & Implant Hospital",
    "phone": "8320715460",
    "email": "",
    "address": "\ue0c8 Lakhubha Hall Road, opposite Om Plaza, near Ram Mantra Mandir, Ramnagar, Kaliyabid, Bhavnagar, Gujarat 364002",
    "specialty": "Dental",
    "city": "Bhavnagar",
    "tier": "Tier-2"
  },
  {
    "name": "Dr Chintan Makadia Skin & Dental Clinic And Advanced Root canal centre (Since 1986)",
    "phone": "2782425847",
    "email": "",
    "address": "\ue0c8 1st Floor, Samved Complex, Jail Rd, opp. Jail, Bhavnagar, Gujarat 364001",
    "specialty": "Dental",
    "city": "Bhavnagar",
    "tier": "Tier-2"
  },
  {
    "name": "Dr. Prachi Mehta | Dermatologist & Cosmetologist",
    "phone": "",
    "email": "",
    "address": "\ue0c8 Madhav Deep Complex, 104, Pragati Nagar, Kalanala, Panwadi, Bhavnagar, Gujarat 364001",
    "specialty": "Dermatology",
    "city": "Bhavnagar",
    "tier": "Tier-2"
  },
  {
    "name": "Dr.Teeth Dental Clinic-Advanced Microscopic Dental care",
    "phone": "9429558969",
    "email": "",
    "address": "\ue0c8 Shop no. 2, Dr Teeth Dental clinic, Iscon parasmani complex, Diamond Chowk, near SBI bank, Mahila College Area, Dawn, Krishna Nagar, Bhavnagar, Gujarat 364001",
    "specialty": "Dental",
    "city": "Bhavnagar",
    "tier": "Tier-2"
  },
  {
    "name": "Nirmal Eye, Skin and Laser Clinic | Dr Kunal & Shreya Nirmal | Best Dermatologist In Bhavnagar",
    "phone": "",
    "email": "",
    "address": "\ue0c83rd Floor, Sai Ganga complex, Kalubha Rd, near Rasoi Dining Hall, Kalanala, Panwadi, Bhavnagar, Gujarat 364001",
    "specialty": "Dermatology",
    "city": "Bhavnagar",
    "tier": "Tier-2"
  },
  {
    "name": "Saundarya skin clinic and laser center (Dr Dharmin Patel and Dr Ankita Patel)",
    "phone": "9316572199",
    "email": "",
    "address": "\ue0c8 SECOND Floor, kabariya sir, Satyam immunity plus, Jail Rd, opp. Ashirwad nursing home, near adarsh complex, Panwadi, Bhavnagar, Gujarat 364001",
    "specialty": "Dermatology",
    "city": "Bhavnagar",
    "tier": "Tier-2"
  },
  {
    "name": "Savani Skin Clinic ( Dr Hardik Savani )",
    "phone": "7203878271",
    "email": "",
    "address": "\ue0c8 7, VirBhadra Shoping Center, Nilambaug Circle, Devbagh, Bhavnagar, Gujarat 364001",
    "specialty": "Dermatology",
    "city": "Bhavnagar",
    "tier": "Tier-2"
  },
  {
    "name": "Shashwat Dental Care & Implant Center",
    "phone": "8141395971",
    "email": "",
    "address": "\ue0c8 Dr. Mayur Vaghela, F-10, Shree Krishana Complex, Desai Nagar, Bhavnagar Para, Bhavnagar, Gujarat 364003",
    "specialty": "Dental",
    "city": "Bhavnagar",
    "tier": "Tier-2"
  },
  {
    "name": "Sunrays Dental Care & Implant Centre Bhavnagar",
    "phone": "7016115161",
    "email": "",
    "address": "\ue0c8 27 Virbhadra Sinhji Shopting Centre, Jail Rd, Nilambaug, Bhavnagar, Gujarat 364001",
    "specialty": "Dental",
    "city": "Bhavnagar",
    "tier": "Tier-2"
  },
  {
    "name": "Swastik skin care",
    "phone": "9227030319",
    "email": "",
    "address": "\ue0c8 1st floor, Sanskar Mandal Rd, opp. Solanki restaurants, Hill Drive, Bhavnagar, Gujarat 364001",
    "specialty": "Dermatology",
    "city": "Bhavnagar",
    "tier": "Tier-2"
  },
  {
    "name": "Varahi Skin & Hair Care Laser Clinic by Dr Paras Panot",
    "phone": "9638838801",
    "email": "",
    "address": "\ue0c8 Leela Circle, Varahi Skin & Hair Care Clinic A-109, 1st floor, Shree Aalekh Complex, Bhavnagar - Sidsar Rd, Bhavnagar, Gujarat 364002",
    "specialty": "Dermatology",
    "city": "Bhavnagar",
    "tier": "Tier-2"
  },
  {
    "name": "YASH DENTAL CARE & IMPLANT CENTER",
    "phone": "7984088367",
    "email": "",
    "address": "\ue0c8 F-6, First Floor, Above Ramdut Medical, Apple Luxaria, Near Mantresh Circle Ghogha Road, 150ft, Ring Rd, Bhavnagar, Gujarat 364002",
    "specialty": "Dental",
    "city": "Bhavnagar",
    "tier": "Tier-2"
  },
  {
    "name": "\ud835\udc03\ud835\udc2b. \ud835\udc0b\ud835\udc1a\ud835\udc2d\ud835\udc21\ud835\udc22\ud835\udc32\ud835\udc1a'\ud835\udc2c \ud835\udc12\ud835\udc24\ud835\udc22\ud835\udc27 \ud835\udc07\ud835\udc1a\ud835\udc22\ud835\udc2b & \ud835\udc0b\ud835\udc1a\ud835\udc2c\ud835\udc1e\ud835\udc2b \ud835\udc02\ud835\udc25\ud835\udc22\ud835\udc27\ud835\udc22\ud835\udc1c -Skin & Hair Treatment |Hydrafacial",
    "phone": "7984166946",
    "email": "",
    "address": "\ue0c8 Ground floor, Carlton Square, near Madhav Deep Complex, Kalanala, Panwadi, Bhavnagar, Gujarat 364001",
    "specialty": "Dermatology",
    "city": "Bhavnagar",
    "tier": "Tier-2"
  },
  {
    "name": "ANAND DENTAL CARE",
    "phone": "8010339630",
    "email": "",
    "address": "\ue0c8 F-21, West, near ICICI BANK ATM, Block C, Milap Nagar, Uttam Nagar, New Delhi, Delhi, 110059",
    "specialty": "Dental",
    "city": "Anand",
    "tier": "Tier-2"
  },
  {
    "name": "Anand Dental Care | Best Dentist Near Me | Top Rated Dentist in Delhi-NCR for Scaling & RCT",
    "phone": "8527935777",
    "email": "",
    "address": "\ue0c8 Ground Floor, 40 A, C5B Block, Janakpuri, New Delhi, Delhi, 110058",
    "specialty": "Dental",
    "city": "Anand",
    "tier": "Tier-2"
  },
  {
    "name": "Anand Dental Clinic",
    "phone": "",
    "email": "",
    "address": "\ue0c8 A14, Gali No. A, SH. Ishwar Vatika, Shiv Ram Park Extention II, Nangloi, Delhi, 110041",
    "specialty": "Dental",
    "city": "Anand",
    "tier": "Tier-2"
  },
  {
    "name": "Anand Shanti Dental Hospital",
    "phone": "9315253033",
    "email": "",
    "address": "\ue0c8 Shop No, 402, Main, Sadh Nagar I, Sadh Nagar, Palam, New Delhi, Delhi, 110045",
    "specialty": "Dental",
    "city": "Anand",
    "tier": "Tier-2"
  },
  {
    "name": "Avira Hospital",
    "phone": "7359354201",
    "email": "",
    "address": "\ue0c8 Bhalej Rd, Ganesh Colony, Anand, Gujarat 388001",
    "specialty": "Dermatology",
    "city": "Anand",
    "tier": "Tier-2"
  },
  {
    "name": "Bavishi Dental Clinic - Dr Maitree Bavishi",
    "phone": "9925091952",
    "email": "",
    "address": "\ue0c8 Bavishi Dental Clinic, 2nd floor, Niramay Hospital Opposite Kishor Plaza, Nayapadkar Lane, Juna Rasta, Anand, Gujarat 388001",
    "specialty": "Dental",
    "city": "Anand",
    "tier": "Tier-2"
  },
  {
    "name": "Delhi Dental Station",
    "phone": "7259590022",
    "email": "",
    "address": "\ue0c8 Shop. No. 16, L Block Basement Market, Pocket BL, Hari Nagar, New Delhi, Delhi 110064",
    "specialty": "Dental",
    "city": "Anand",
    "tier": "Tier-2"
  },
  {
    "name": "Dr. Gunvant R Mayavanshi - Skin Specialist in Anand | Best Skin Clinic in Anand",
    "phone": "9512732585",
    "email": "",
    "address": "\ue0c8 Aarshvi skin clinic, ahinsa chok, vendor char rasta, near pioneer school, Patel Colony, Anand, Gujarat 388001",
    "specialty": "Dermatology",
    "city": "Anand",
    "tier": "Tier-2"
  },
  {
    "name": "Dr. Katariya's Skin & Hair Clinic",
    "phone": "8200869440",
    "email": "",
    "address": "\ue0c8 Gangotri Kamalam, 107/108, 100 Feet Rd, opp. Bhavnath Mahadev Temple, Nanikhodiyar, Anand, Gujarat 388001",
    "specialty": "Dermatology",
    "city": "Anand",
    "tier": "Tier-2"
  },
  {
    "name": "Dr. R D Joshi Clinic",
    "phone": "2692253938",
    "email": "",
    "address": "\ue0c8 Radha Swami Pavan Complex, Bhalej Rd, Patel Colony, Anand, Gujarat 388001",
    "specialty": "Dermatology",
    "city": "Anand",
    "tier": "Tier-2"
  },
  {
    "name": "New shreeji dental clinic",
    "phone": "9408925486",
    "email": "",
    "address": "\ue0c8 Jaykant complex , opp pc doctor,near apc anand vidhyanagar road, Anand, Gujarat 388120",
    "specialty": "Dental",
    "city": "Anand",
    "tier": "Tier-2"
  },
  {
    "name": "New shreeji dental clinic",
    "phone": "6353846481",
    "email": "",
    "address": "\ue0c8 102, Kabir Arcade, Beside ITI ground, Grid-X, Lambhvel Rd, Anand, Gujarat 388001",
    "specialty": "Dental",
    "city": "Anand",
    "tier": "Tier-2"
  },
  {
    "name": "Sabharwal Dental Clinic & Surgical Centre",
    "phone": "1145007225",
    "email": "",
    "address": "\ue0c8 KG-1/424, PVR Cinema Road, Landmark:, opposite Gujranwala Apartment, Vikaspuri, Delhi, 110018",
    "specialty": "Dental",
    "city": "Anand",
    "tier": "Tier-2"
  },
  {
    "name": "Shakti Esthetics Dental Clinic & Implant Centre",
    "phone": "7016236869",
    "email": "",
    "address": "\ue0c8 Ramshikhar Complex, 205/206, near New Bus Stand, Ganesh Colony, Anand, Gujarat 388001",
    "specialty": "Dental",
    "city": "Anand",
    "tier": "Tier-2"
  },
  {
    "name": "Apex Dental Multi-Speciality Clinic | Best Dental Clinic in Nashik | Best Dentist in Nashik",
    "phone": "9022807158",
    "email": "",
    "address": "\ue0c8 Shop No. 1, Padma Niwas, Link Road, near Hotel Rau, Somnath Shinde Nagar, Shirish Society, Mhasrul, Makhmalabad, Nashik, Maharashtra 422003",
    "specialty": "Dental",
    "city": "Nashik",
    "tier": "Tier-2"
  },
  {
    "name": "Dr Aher's Dental Care",
    "phone": "9923539253",
    "email": "",
    "address": "\ue0c8 Deore Marg, M P, Gangapur Rd, Rameshwar Nagar, Balawant Nagar, Anandvalli, Nashik, Maharashtra 422013",
    "specialty": "Dental",
    "city": "Nashik",
    "tier": "Tier-2"
  },
  {
    "name": "DR. RICHA SALUNKE, MD(DVL),SCE(DERMATOLOGY, MRCP-UK), SKINACCESS CLINICS",
    "phone": "7413965965",
    "email": "",
    "address": "\ue0c8 Shop No. 1/2, Ramrajya No. 5, Circle, College Rd, near Bhosala House, Rambhoomi, Parijat Nagar, Nashik, Maharashtra 422005",
    "specialty": "Dermatology",
    "city": "Nashik",
    "tier": "Tier-2"
  },
  {
    "name": "Dr. Snehal Daga - Best Dermatologist in Nashik | Skin Doctor | Best Skin Specialist in Nashik",
    "phone": "7066311666",
    "email": "",
    "address": "\ue0c8 College Rd, above Woodland showroom, Patil Colony, Canada Corner, Nashik, Maharashtra 422005",
    "specialty": "Dermatology",
    "city": "Nashik",
    "tier": "Tier-2"
  },
  {
    "name": "Smile Dental Clinic",
    "phone": "9975715505",
    "email": "",
    "address": "\ue0c8 Shop number 7, Murlidhar Nagar Rd, opposite Hotel Changal Chungal, Murlidhar Vyas Colony, Prashant Nagar, Pathardi Phata, Nashik, Maharashtra 422010",
    "specialty": "Dental",
    "city": "Nashik",
    "tier": "Tier-2"
  },
  {
    "name": "Centre For Advance Dentistry",
    "phone": "8379955551",
    "email": "",
    "address": "\ue0c8 1st floor, chopda landmark, chetak ghoda chowk, above bank of maharashtra, Garkheda Area, Ulkanagari, Chhatrapati Sambhajinagar, Maharashtra 431009",
    "specialty": "Dental",
    "city": "Aurangabad",
    "tier": "Tier-2"
  },
  {
    "name": "Dental clinic",
    "phone": "9767026244",
    "email": "",
    "address": "\ue0c8 Near Tara Pan Center, New Usmanpura, Chhatrapati Sambhajinagar, Maharashtra 431005",
    "specialty": "Dental",
    "city": "Aurangabad",
    "tier": "Tier-2"
  },
  {
    "name": "Dental Clinic",
    "phone": "9920209411",
    "email": "",
    "address": "\ue0c8 sarthank building, shop no-4, f-02/02 adjacent to canara bank, M2 road, N9, Cidco, Chhatrapati Sambhajinagar, Maharashtra 431003",
    "specialty": "Dental",
    "city": "Aurangabad",
    "tier": "Tier-2"
  },
  {
    "name": "Doshi Dental Clinic",
    "phone": "9423153602",
    "email": "",
    "address": "\ue0c8 Shakuntal, Kranti Chowk, Nutan Colony, Nirala Bazar, Chhatrapati Sambhajinagar, Maharashtra 431001",
    "specialty": "Dental",
    "city": "Aurangabad",
    "tier": "Tier-2"
  },
  {
    "name": "Dr.Pooja's (skin |Hair|Laser Clinic)",
    "phone": "",
    "email": "",
    "address": "\ue0c8 Shop No 24, beside August Heights, Basant Bahar, Ulkanagari, Chhatrapati Sambhajinagar, Maharashtra 431009",
    "specialty": "Dermatology",
    "city": "Aurangabad",
    "tier": "Tier-2"
  },
  {
    "name": "Kranti Multispeciality Dental Clinic",
    "phone": "8766921820",
    "email": "",
    "address": "\ue0c8 Om 25, Shri Vyankatesh Housing Society, Ulkanagari Rd, near Chetak Ghoda Chowk, Jawahar Colony, Area, Chhatrapati Sambhajinagar, Maharashtra 431005",
    "specialty": "Dental",
    "city": "Aurangabad",
    "tier": "Tier-2"
  },
  {
    "name": "Maple Skin Clinic",
    "phone": "9923249503",
    "email": "",
    "address": "\ue0c8 431003, E1 Sector, Pratapgarh Nagar, Sri Krishnanagar, Cidco, Chhatrapati Sambhajinagar, Maharashtra 431003",
    "specialty": "Dermatology",
    "city": "Aurangabad",
    "tier": "Tier-2"
  },
  {
    "name": "Maple Skin Clinic",
    "phone": "2402354232",
    "email": "",
    "address": "\ue0c8 431003, E1 Sector, Pratapgarh Nagar, Sri Krishnanagar, Cidco, Chhatrapati Sambhajinagar, Maharashtra 431003",
    "specialty": "Dermatology",
    "city": "Aurangabad",
    "tier": "Tier-2"
  },
  {
    "name": "REJUVEN SPINE AND SKIN CLINIC",
    "phone": "7058172525",
    "email": "",
    "address": "\ue0c8 Shop No 104, Next to Sudarshan Netralay, Matrix business centre, Amarpreet Roplekar Road, Kalda Corner, Chhatrapati Sambhajinagar, Maharashtra 431005",
    "specialty": "Dermatology",
    "city": "Aurangabad",
    "tier": "Tier-2"
  },
  {
    "name": "Somani Dental Clinic",
    "phone": "7566983598",
    "email": "",
    "address": "\ue0c8 Samrat Ashok Chowk, and, opposite to Krishna saree, near Jain traders, Mondha Naka, Jaffer Gate, Chhatrapati Sambhajinagar, Maharashtra 431001",
    "specialty": "Dental",
    "city": "Aurangabad",
    "tier": "Tier-2"
  },
  {
    "name": "\u2705\ud835\uddd7\ud835\uddff. \ud835\uddd5\ud835\uddf5\ud835\uddee\ud835\ude03\ud835\uddee\ud835\uddfb\ud835\uddee`\ud835\ude00 \ud835\uddd4\ud835\ude02\ud835\uddff\ud835\uddee \ud835\uddd7\ud835\uddf2\ud835\uddfb\ud835\ude01\ud835\uddee\ud835\uddf9 \ud835\uddd6\ud835\uddf9\ud835\uddf6\ud835\uddfb\ud835\uddf6\ud835\uddf0 - Best dentist in Aurangabad / dental clinic near me Chhatrapati Sambhajinagar",
    "phone": "8530150610",
    "email": "",
    "address": "\ue0c8 Akashwani, Jawahar Colony Rd, Near Durga Mata Mandir, trimurti chauk, Chhatrapati Sambhajinagar, Maharashtra 431005",
    "specialty": "Dental",
    "city": "Aurangabad",
    "tier": "Tier-2"
  },
  {
    "name": "Aditi's",
    "phone": "",
    "email": "",
    "address": "\ue0c8C-02, Royal Prestige, Sykes Extension, above Kotak Mahindra and Swarg Jewellers, Rajarampuri, Kolhapur, Maharashtra 416001",
    "specialty": "Dental",
    "city": "Kolhapur",
    "tier": "Tier-2"
  },
  {
    "name": "Dental Health Centre",
    "phone": "7517510600",
    "email": "",
    "address": "\ue0c8 Pendharkar Complex, Venus Corner, 646-E, Shahupuri, Kolhapur, Maharashtra 416001",
    "specialty": "Dental",
    "city": "Kolhapur",
    "tier": "Tier-2"
  },
  {
    "name": "DENTOLE MULTI SPECIALITY DENTAL CLINIC",
    "phone": "",
    "email": "",
    "address": "\ue0c8 DENTOLE MULTI SPECIALITY DENTAL CLINIC, 62, Shivaji Park, Kolhapur, Maharashtra 416001",
    "specialty": "Dental",
    "city": "Kolhapur",
    "tier": "Tier-2"
  },
  {
    "name": "Dr Noopur Patil\u2019s DERMA LAB CLINIC [MD Dermatology, Venerology & Leprosy]",
    "phone": "9153190999",
    "email": "",
    "address": "\ue0c8 Navrang Housing Society, Collector Office Rd, opposite Esther Patton Highschool Ground, E Ward, Nagalapark, Kolhapur, Maharashtra 416003",
    "specialty": "Dermatology",
    "city": "Kolhapur",
    "tier": "Tier-2"
  },
  {
    "name": "Dr. Bhavana Phulari\u2019s Skin, Hair & Laser Clinic",
    "phone": "8329708084",
    "email": "",
    "address": "\ue0c8 Basement Floor, Jupiter Complex, below Gold's Gym, Tarabai Park, Kolhapur, Maharashtra 416003",
    "specialty": "Dermatology",
    "city": "Kolhapur",
    "tier": "Tier-2"
  },
  {
    "name": "Dr. Dhanale Dental Care",
    "phone": "9890171711",
    "email": "",
    "address": "\ue0c8 C-02, Royal Prestige, Sykes Extension, above Kotak Mahindra and Swarg Jewellers, Rajarampuri, Kolhapur, Maharashtra 416001",
    "specialty": "Dental",
    "city": "Kolhapur",
    "tier": "Tier-2"
  },
  {
    "name": "Dr. Ghanasham Heda Clinic",
    "phone": "2312661814",
    "email": "",
    "address": "\ue0c8 584/1, 1st Ln, E Ward, Shahupuri, Kolhapur, Maharashtra 416001",
    "specialty": "Dermatology",
    "city": "Kolhapur",
    "tier": "Tier-2"
  },
  {
    "name": "Dr.Swati's \u0935\u093f\u0920\u093e\u0908 \u0926\u093e\u0924\u093e\u0902\u091a\u093e \u0926\u0935\u093e\u0916\u093e\u0928\u093e",
    "phone": "9552761082",
    "email": "",
    "address": "\ue0c8 First floor of, Vitthal Mandir, MADHALI GALLI, VITTAL MANDIR CHOWK, near VITTHAL MANDIR, Scheme No.4, Kadamwadi, Kolhapur, Maharashtra 416003",
    "specialty": "Dental",
    "city": "Kolhapur",
    "tier": "Tier-2"
  },
  {
    "name": "Durga Dental Clinic",
    "phone": "8407926228",
    "email": "",
    "address": "\ue0c8 S01, 2nd Floor, Business Bay, opp. Bank Of Maharashtra, near Aditya Corner, Tarabai Park, Kolhapur, Maharashtra 416003",
    "specialty": "Dental",
    "city": "Kolhapur",
    "tier": "Tier-2"
  },
  {
    "name": "My City Dentist-Dentistry Redefined",
    "phone": "7798587000",
    "email": "",
    "address": "\ue0c8 Shop No 1, Landmark Residency, Indumati Rd, opp. New Circuit House, Sarlashkar Park, Tarabai Park, Kolhapur, Maharashtra 416003",
    "specialty": "Dental",
    "city": "Kolhapur",
    "tier": "Tier-2"
  },
  {
    "name": "Chakote Cosmeto Care",
    "phone": "9922522498",
    "email": "",
    "address": "\ue0c8 Shripad srivallabh kunj, samrat chowk, New Budhwar Peth, Solapur, Maharashtra 413002",
    "specialty": "Dermatology",
    "city": "Solapur",
    "tier": "Tier-2"
  },
  {
    "name": "Dr Gaddam Skin, Hair & Laser Clinic",
    "phone": "9404550929",
    "email": "",
    "address": "\ue0c81st floor, Datta Deep Chambers, Police station, 80/81, opp. Kaka Halwai, near Sakhar peth, Sakhar Peth, Shaniwar Peth, Solapur, Maharashtra 413005",
    "specialty": "Dermatology",
    "city": "Solapur",
    "tier": "Tier-2"
  },
  {
    "name": "Dr Kore Sachin Sun Skin Hospital",
    "phone": "2172313917",
    "email": "",
    "address": "\ue0c8 Samrudhi-1, near Juna RTO Employment Chowk, Railway lines, Solapur, Maharashtra 413001",
    "specialty": "Dermatology",
    "city": "Solapur",
    "tier": "Tier-2"
  },
  {
    "name": "KARADAGE SKIN CLINIC",
    "phone": "8928927172",
    "email": "",
    "address": "\ue0c8 71-A , behind shivparvati lodge, Navi Peth, Solapur, Maharashtra 413007",
    "specialty": "Dermatology",
    "city": "Solapur",
    "tier": "Tier-2"
  },
  {
    "name": "Pristine Dental Care. Cosmetic and dental Implants center",
    "phone": "8459541743",
    "email": "",
    "address": "\ue0c8 Besides Bank of Maharashtra, Infront of Samarth Sahakari Bank, Ground floor, Abhishek Apartment, Hotagi Rd, near kinara hotel, Solapur, Maharashtra 413003",
    "specialty": "Dental",
    "city": "Solapur",
    "tier": "Tier-2"
  },
  {
    "name": "Rahat Dental Clinic",
    "phone": "8983911131",
    "email": "",
    "address": "\ue0c8 Plot no.1 Opp Sahara Multi Purpose Hall Siddheshwar Nagar, Road, Majrewadi, Solapur, Maharashtra 413003",
    "specialty": "Dental",
    "city": "Solapur",
    "tier": "Tier-2"
  },
  {
    "name": "Solace cosmetology & laser centre",
    "phone": "9326183999",
    "email": "",
    "address": "\ue0c8 Sainath Nagar, Solapur, Maharashtra 413003",
    "specialty": "Dermatology",
    "city": "Solapur",
    "tier": "Tier-2"
  },
  {
    "name": "Solapur CBCT Centre",
    "phone": "8788258349",
    "email": "",
    "address": "\ue0c8 Shop No. 8, Advait Apartment Besides Dr Bachuwar Clinic, opp. Muncipal Commisioner Home, near Naval Petrol Pump, Railway lines, Solapur, Maharashtra 413001",
    "specialty": "Dental",
    "city": "Solapur",
    "tier": "Tier-2"
  },
  {
    "name": "Suyog Clinic & Cosmo Laser Center",
    "phone": "8983977300",
    "email": "",
    "address": "\ue0c8 Shop No 1,2,3, Jule Solapur Rd, opp. to D-Mart, Kalyan Nagar, Jule, Solapur, Maharashtra 413004",
    "specialty": "Dermatology",
    "city": "Solapur",
    "tier": "Tier-2"
  },
  {
    "name": "Tangsal Dental Clinic",
    "phone": "9021971820",
    "email": "",
    "address": "\ue0c8 Asra, Shop 2, Hotgi Road,Tangsal Shopping Centre, Solapur, Maharashtra 413003",
    "specialty": "Dental",
    "city": "Solapur",
    "tier": "Tier-2"
  },
  {
    "name": "Athithi Skin, Hair, Laser & Cosmetic Clinic. Dr. R. Priyadharsini, MD.DVL.,",
    "phone": "8056430016",
    "email": "",
    "address": "\ue0c8 158 KK Nagar Arch road, 5th St, KK Nagar, Madurai, Tamil Nadu 625020",
    "specialty": "Dermatology",
    "city": "Madurai",
    "tier": "Tier-2"
  },
  {
    "name": "Madura Dental Clinic",
    "phone": "9944724564",
    "email": "",
    "address": "\ue0c8 No 278, Goods Shed St, near Railway station, Madurai Main, Madurai, Tamil Nadu 625001",
    "specialty": "Dental",
    "city": "Madurai",
    "tier": "Tier-2"
  },
  {
    "name": "MSR TOOTH CLINIC",
    "phone": "9442531441",
    "email": "",
    "address": "\ue0c8 V P Rathinasamy Nadar Rd, Madurai, Tamil Nadu 625002",
    "specialty": "Dental",
    "city": "Madurai",
    "tier": "Tier-2"
  },
  {
    "name": "Ocean Dental Care",
    "phone": "4523559075",
    "email": "",
    "address": "\ue0c8 110-114,1st Floor P.P.Chavadi, Main, Theni Rd, Tirumalai Colony, Madurai, Tamil Nadu 625016",
    "specialty": "Dental",
    "city": "Madurai",
    "tier": "Tier-2"
  },
  {
    "name": "SMILE STYLE Dental clinic",
    "phone": "7373047575",
    "email": "",
    "address": "\ue0c8 12A/59A, Kuruvikkaran salai, 1st Cross St, Anna Nagar, Madurai, Tamil Nadu 625020",
    "specialty": "Dental",
    "city": "Madurai",
    "tier": "Tier-2"
  },
  {
    "name": "Sri Chakra Clinic Skin and Bone Speciality",
    "phone": "7708302136",
    "email": "",
    "address": "\ue0c8 3/444, Lake Ave St, near raymond showroom, Naganakulam, Indian Bank Colony, Mahalakshmi Nagar, Madurai, Tamil Nadu 625014",
    "specialty": "Dermatology",
    "city": "Madurai",
    "tier": "Tier-2"
  },
  {
    "name": "Sri sivam dental clinic",
    "phone": "8056591160",
    "email": "",
    "address": "\ue0c8 186, Thathaneri Main Rd, opposite to ESI HOSPITAL, near HP petrol bunk, Madurai, Tamil Nadu 625018",
    "specialty": "Dental",
    "city": "Madurai",
    "tier": "Tier-2"
  },
  {
    "name": "ABRA Dental Clinic & ESTHETIC DENTAL LAB",
    "phone": "9940587391",
    "email": "",
    "address": "\ue0c8 NO1 K.V.K RAMASAMY STREET, Thanjavur Rd, Ariyamangalam, Kamaraj Nagar, Tiruchirappalli, Tamil Nadu 620010",
    "specialty": "Dental",
    "city": "Trichy",
    "tier": "Tier-2"
  },
  {
    "name": "Cutis Skin Clinic",
    "phone": "8870676014",
    "email": "",
    "address": "\ue0c8 B25, Rahumaniya Puram, Tennur, Tiruchirappalli, Tamil Nadu 620018",
    "specialty": "Dermatology",
    "city": "Trichy",
    "tier": "Tier-2"
  },
  {
    "name": "Dr Gokul Kannan MDS MOI | KM Dental Clinic Trichy Branch",
    "phone": "9585576627",
    "email": "",
    "address": "\ue0c8 54, Heber Rd, Bhima Nagar, Sangillyandapuram, Tiruchirappalli, Tamil Nadu 620001",
    "specialty": "Dental",
    "city": "Trichy",
    "tier": "Tier-2"
  },
  {
    "name": "MEGAVI DENTAL CARE",
    "phone": "9865964607",
    "email": "",
    "address": "\ue0c8 JK Residency Basement, A-92, Dindigul Main Road, IOB Nagar, Karumandapam, Tiruchirappalli, Tamil Nadu 620001",
    "specialty": "Dental",
    "city": "Trichy",
    "tier": "Tier-2"
  },
  {
    "name": "Precise Multispeciality Dental Clinic",
    "phone": "9846253754",
    "email": "",
    "address": "\ue0c8 1st floor, MP Plazaa, oil mil bus stop, ariyamangalam, Malayappa Nagar, Tiruchirappalli, Tamil Nadu 620010",
    "specialty": "Dental",
    "city": "Trichy",
    "tier": "Tier-2"
  },
  {
    "name": "Balaji Skin Hospital",
    "phone": "8807708749",
    "email": "",
    "address": "\ue0c8 #257 Sharada College, Main Rd, Swarnapuri, Salem, Tamil Nadu 636016",
    "specialty": "Dermatology",
    "city": "Salem",
    "tier": "Tier-2"
  },
  {
    "name": "J.P.Dental Clinic",
    "phone": "9843733855",
    "email": "",
    "address": "\ue0c8 Sumangalee Jewellers, Sendarapatti, Salem (M.Corp.), Tamil Nadu 636006",
    "specialty": "Dental",
    "city": "Salem",
    "tier": "Tier-2"
  },
  {
    "name": "LAK Skin clinic",
    "phone": "",
    "email": "",
    "address": "\ue0c8 1st Floor, Advaitha Ashram Rd, Fairlands, Salem, Tamil Nadu 636016",
    "specialty": "Dermatology",
    "city": "Salem",
    "tier": "Tier-2"
  },
  {
    "name": "NIMAI DENTAL CARE",
    "phone": "9790091964",
    "email": "",
    "address": "\ue0c8 OPP TO K S THEATRE, Ground floor & 1st floor, Sankari Main Rd, Linemedu, Salem (M.Corp.), Tamil Nadu 636006",
    "specialty": "Dental",
    "city": "Salem",
    "tier": "Tier-2"
  },
  {
    "name": "SALEM DENTAL CLINIC AND ROOT CANAL CENTER (A2A)",
    "phone": "8189984959",
    "email": "",
    "address": "\ue0c8 Annadanapatti, Salem, Tamil Nadu 636002",
    "specialty": "Dental",
    "city": "Salem",
    "tier": "Tier-2"
  },
  {
    "name": "SMILELINE DENTAL CLINIC & MAXILLOFACIAL CENTRE",
    "phone": "9047654231",
    "email": "",
    "address": "\ue0c8 RAJAN TOWERS, 547/1, Kitchipalayam Main Rd, near NATIONAL SCHOOL, EXTENSION, Sanyasigundu, Salem (M.Corp.), Tamil Nadu 636015",
    "specialty": "Dental",
    "city": "Salem",
    "tier": "Tier-2"
  },
  {
    "name": "Yuva Skin and Cosmetology Centre",
    "phone": "9042499804",
    "email": "",
    "address": "\ue0c8 Upstairs, Jewel One showroom, JK Medical Centre, to, Omalur Main Rd, opposite New Bus Stand Road, Salem, Tamil Nadu 636004",
    "specialty": "Dermatology",
    "city": "Salem",
    "tier": "Tier-2"
  },
  {
    "name": "Charli Dental",
    "phone": "9790033373",
    "email": "",
    "address": "\ue0c8 1st Cross street, North, RTO office Main road, Vasantha Nagar, NGO A Colony, Tirunelveli, Tamil Nadu 627007",
    "specialty": "Dental",
    "city": "Tirunelveli",
    "tier": "Tier-2"
  },
  {
    "name": "Dr Hassan Ibrahim Dental Clinic, Tirunelveli",
    "phone": "6374264432",
    "email": "",
    "address": "\ue0c8 32, Trivandrum Rd, opp. Selvarani Textile, Murugankurichi, Palayamkottai, Tirunelveli, Tamil Nadu 627002",
    "specialty": "Dental",
    "city": "Tirunelveli",
    "tier": "Tier-2"
  },
  {
    "name": "NELLAI DENTAL CARE",
    "phone": "8870251198",
    "email": "",
    "address": "\ue0c8 MR complex, Palay market, 1/3, Kottur Rd, near SBI ATM, Palayamkottai, Tirunelveli, Tamil Nadu 627002",
    "specialty": "Dental",
    "city": "Tirunelveli",
    "tier": "Tier-2"
  },
  {
    "name": "Skin Care Centre Dr.Sujatha Andrew",
    "phone": "9245278810",
    "email": "",
    "address": "\ue0c8 1st floor, Caussanal Complex, North, High Ground Rd, opposite to Krishna hospital, Palayamkottai, Tirunelveli, Tamil Nadu 627002",
    "specialty": "Dermatology",
    "city": "Tirunelveli",
    "tier": "Tier-2"
  },
  {
    "name": "Viji dental care",
    "phone": "8883755997",
    "email": "",
    "address": "\ue0c8 40A,thondar sannathi, Tamil Nadu 627006",
    "specialty": "Dental",
    "city": "Tirunelveli",
    "tier": "Tier-2"
  },
  {
    "name": "Dr Ashwini PK. Skin specialist/Dermatologist/Cosmetologist/Dermatosurgeon",
    "phone": "9632672727",
    "email": "",
    "address": "\ue0c8 Aceso BKG Health care, New Kantharaj Urs Rd, Kuvempunagara North, Saraswathipuram, Mysuru, Karnataka 570023",
    "specialty": "Dermatology",
    "city": "Mysore",
    "tier": "Tier-2"
  },
  {
    "name": "Dr Ashwini PK. Skin specialist/Dermatologist/Cosmetologist/Dermatosurgeon",
    "phone": "9353218589",
    "email": "",
    "address": "\ue0c8 1st, stage, KHB Complex, Megha Clinic, 26, Nrupathugha Rd, Kuvempu Nagara, Mysuru, Karnataka 570023",
    "specialty": "Dermatology",
    "city": "Mysore",
    "tier": "Tier-2"
  },
  {
    "name": "Dr. Lavanya's Skin Clinic",
    "phone": "9886916975",
    "email": "",
    "address": "\ue0c8 138/B, NEW KANTHRAJ URS ROAD, BETWEEN VIJAYABANK CIRCLE AND KAVITHA BAKERY CIRCLE, DIAGONALLY OPPOSITE TO PANTALOONS SHOWROOM TK LAYOUT, KUVEMPUNAGAR, NORTH, Saraswathipuram, Mysuru, Karnataka 570009",
    "specialty": "Dermatology",
    "city": "Mysore",
    "tier": "Tier-2"
  },
  {
    "name": "MG dental clinic",
    "phone": "9986124484",
    "email": "",
    "address": "\ue0c8 No.2894/3, kenchappa building, 1st Main Rd, opposite HDFC Bank, Saraswathipuram, Mysuru, Karnataka 570005",
    "specialty": "Dental",
    "city": "Mysore",
    "tier": "Tier-2"
  },
  {
    "name": "MMS DENTAL Centre",
    "phone": "8212411572",
    "email": "",
    "address": "\ue0c8 Gokulum Main Rd, 2nd Stage, Mysuru,, 2963, Gokulam Main Rd, Gokulam 2nd Stage, Gokulam, Mysuru, Karnataka 570002",
    "specialty": "Dental",
    "city": "Mysore",
    "tier": "Tier-2"
  },
  {
    "name": "Sampreethi Skin Care Centre",
    "phone": "8212425707",
    "email": "",
    "address": "\ue0c8 1st Floor, Sapna Book House, Divan's Road, next to Tribhuvan Tower, near Devaraja Mohalla, Devaraja Mohalla, Shivarampet, Mysuru, Karnataka 570001",
    "specialty": "Dermatology",
    "city": "Mysore",
    "tier": "Tier-2"
  },
  {
    "name": "Sandeep Dental Speciality Centre",
    "phone": "9845383921",
    "email": "",
    "address": "\ue0c8 Near, Sayyaji Rao Rd, Mandi Mohalla, Mysuru, Karnataka 570001",
    "specialty": "Dental",
    "city": "Mysore",
    "tier": "Tier-2"
  },
  {
    "name": "Sanjeevani Dental Healthcare",
    "phone": "8971063214",
    "email": "",
    "address": "\ue0c8 333/69, NS Road, next to Linen Club, Devaraja Mohalla, Chamrajpura, Mysuru, Karnataka 570004",
    "specialty": "Dental",
    "city": "Mysore",
    "tier": "Tier-2"
  },
  {
    "name": "SKIN PARTNER (Dr. N. S. Shreyas)",
    "phone": "7483377640",
    "email": "",
    "address": "\ue0c8 1118, Vinoba Rd, Subbarayanakere, Shivarampet, Mysuru, Karnataka 570001",
    "specialty": "Dermatology",
    "city": "Mysore",
    "tier": "Tier-2"
  },
  {
    "name": "Dr Spandana P Hegde: Dermis Skin & Hair Care | Best Dermatologist in Mangaluru",
    "phone": "8310960780",
    "email": "",
    "address": "\ue0c8 1st Floor, Pulse Polyclinic, KSR Road, next to City Centre Mall, opp. Prabhat Talkies, Hampankatta, Mangaluru, Karnataka 575001",
    "specialty": "Dermatology",
    "city": "Mangalore",
    "tier": "Tier-2"
  },
  {
    "name": "Dr. K Narendra Kamath",
    "phone": "",
    "email": "",
    "address": "\ue0c8 2nd Floor, CUTIS' 2nd Floor, MG Rd, near pvs circle, Kodailbail, Mangaluru, Karnataka 575003",
    "specialty": "Dermatology",
    "city": "Mangalore",
    "tier": "Tier-2"
  },
  {
    "name": "Dr. Pramod Kumar's Skin Clinic. Dermatologist , Mangalore.",
    "phone": "8217636420",
    "email": "",
    "address": "\ue0c8 City Plaza, 209-210, KRR Road, near PVS circle, Tilak Nagar, Boloor, Kodailbail, Mangaluru, Karnataka 575003",
    "specialty": "Dermatology",
    "city": "Mangalore",
    "tier": "Tier-2"
  },
  {
    "name": "Dr. Sandeep Shetty's Dental Clinic and Orthodontic Centre",
    "phone": "8244113388",
    "email": "",
    "address": "\ue0c8 Dr. Sandeep Shetty's Dental Clinic and Orthodontic Centre, Marian Paradise Plaza 1st floor, shop no.:, 106, Bunts Hostel Rd, near PSR silk sarees, Mangaluru, Karnataka 575003",
    "specialty": "Dental",
    "city": "Mangalore",
    "tier": "Tier-2"
  },
  {
    "name": "Dr.Pai's Precision Dental clinic and Implant Centre",
    "phone": "9686260303",
    "email": "",
    "address": "\ue0c8Ground Floor, Sai Arcade, Bejai - Kapikad Rd, Bejai, Mangaluru, Karnataka 575004",
    "specialty": "Dental",
    "city": "Mangalore",
    "tier": "Tier-2"
  },
  {
    "name": "Eira Dental - Invisalign / Braces / Implants.. Dental Clinic - Bejai, Mangalore",
    "phone": "8088631168",
    "email": "",
    "address": "\ue0c8 1st Floor, next to Ganesh Medicals, Kankanady, Mangaluru, Karnataka 575002",
    "specialty": "Dental",
    "city": "Mangalore",
    "tier": "Tier-2"
  },
  {
    "name": "MARIGOLD House of Dermatology Mangalore",
    "phone": "9845723077",
    "email": "",
    "address": "\ue0c8 Fourth Floor, Lotus Paradise Elite, 407, KRR Road, opp. AJ Grand Elite Hotel, above Orra Fine Jewellery, Boloor, Kodailbail, Mangaluru, Karnataka 575003",
    "specialty": "Dermatology",
    "city": "Mangalore",
    "tier": "Tier-2"
  },
  {
    "name": "One Dentistry - Advanced Dental Implant Center (Dr Rakshith Hegde)",
    "phone": "9459599797",
    "email": "",
    "address": "\ue0c8 3rd floor, lotus Paradise plaza, next to St Theresa's School, Bendoor, Mangaluru, Karnataka 575002",
    "specialty": "Dental",
    "city": "Mangalore",
    "tier": "Tier-2"
  },
  {
    "name": "S.A. Dental Clinic",
    "phone": "9448177938",
    "email": "",
    "address": "\ue0c8 Bus Stop, Solomon Complex, opposite Amar Alva, Nagori, Mangaluru, Karnataka 575002",
    "specialty": "Dental",
    "city": "Mangalore",
    "tier": "Tier-2"
  },
  {
    "name": "Skin Code by Dr Snigdha Hegde",
    "phone": "7204093803",
    "email": "",
    "address": "\ue0c8 202, 2nd Floor, Lotus Paradise Plaza, beside St Theresa School, Bendoor, Mangaluru, Karnataka 575002",
    "specialty": "Dermatology",
    "city": "Mangalore",
    "tier": "Tier-2"
  },
  {
    "name": "VISH Skin Clinic",
    "phone": "8242430559",
    "email": "",
    "address": "\ue0c8 Collectors Gate, 25, circle, Mallikatte, Balmatta, Mangaluru, Karnataka 575001",
    "specialty": "Dermatology",
    "city": "Mangalore",
    "tier": "Tier-2"
  },
  {
    "name": "Dr Patil's Derma Centre",
    "phone": "9482237070",
    "email": "",
    "address": "\ue0c8 First floor, Neeligin Road Near Rani Channamma Circle Tirumala trade centre, Karnataka 580029",
    "specialty": "Dermatology",
    "city": "Hubli",
    "tier": "Tier-2"
  },
  {
    "name": "Dr Shruti Teggimani's Skin hair & laser clinic",
    "phone": "9482906088",
    "email": "",
    "address": "\ue0c8 VIBHA MULTI-SPECIALTY CLINIC, Kusugal Rd, behind Union Bank of India, Keshwapur, Bhavani Nagar, Keshwapur, Hubballi, Karnataka 580023",
    "specialty": "Dermatology",
    "city": "Hubli",
    "tier": "Tier-2"
  },
  {
    "name": "Hubli Skin Clinic (Dr CHANABASAPPA)",
    "phone": "9108517456",
    "email": "",
    "address": "\ue0c8 1st Floor, SVB City Center, Club Rd, above YES Bank, Deshpande Nagar, Hubballi, Karnataka 580020",
    "specialty": "Dermatology",
    "city": "Hubli",
    "tier": "Tier-2"
  },
  {
    "name": "Smile world - Best Dentist in Hubli | Implant Centre | Orthodontist Specialist | Periodontist | Cosmetic Dentist in Hubli",
    "phone": "9036141344",
    "email": "",
    "address": "\ue0c8 UGF no 4, A Mallikarjun Avenue, Koppikar Rd, Dajiban Peth, Kamaripeth, New Hubli, Hubballi, Karnataka 580020",
    "specialty": "Dental",
    "city": "Hubli",
    "tier": "Tier-2"
  },
  {
    "name": "Twacha Skin Hair Laser Clinic by Dr. Suman Odugoudar's - Best dermatologist in Vidyanagar, Hubli.",
    "phone": "9535474155",
    "email": "",
    "address": "\ue0c8 Opposite BVB college ,4th floor katwe complex, above SBI Bank, Vidya Nagar, Hubballi, Karnataka 580031",
    "specialty": "Dermatology",
    "city": "Hubli",
    "tier": "Tier-2"
  },
  {
    "name": "URBAN DENTAL CLINIC",
    "phone": "8277070512",
    "email": "",
    "address": "\ue0c8 1st Floor, R.R.Mahalakshmi Mansion, Pinto Rd, above The IndusInd Bank, Deshpande Nagar, Hubballi, Karnataka 580020",
    "specialty": "Dental",
    "city": "Hubli",
    "tier": "Tier-2"
  },
  {
    "name": "32 Dental Care",
    "phone": "9736323232",
    "email": "",
    "address": "\ue0c8 AB Towers, Mogalrajpuram, Siddhartha College Rd, beside HP petroleum, Jammi Chettu Centre, Christurajupuram, Vijayawada, Andhra Pradesh 520010",
    "specialty": "Dental",
    "city": "Vijayawada",
    "tier": "Tier-2"
  },
  {
    "name": "Dr. Bhargavi's Skin Clinic",
    "phone": "9849278309",
    "email": "",
    "address": "\ue0c8 57-14-25, Panta Kaluva Rd, New Postal Colony-2, Patamata, Benz Circle, Vijayawada, Andhra Pradesh 520008",
    "specialty": "Dermatology",
    "city": "Vijayawada",
    "tier": "Tier-2"
  },
  {
    "name": "Dr.Sailaja Skin Care Clinic",
    "phone": "8186994444",
    "email": "",
    "address": "\ue0c8 1st Floor, Eluru Rd, beside Vins Complex, Vijayatakies Centre, Governor Peta, Vijayawada, Andhra Pradesh 520002",
    "specialty": "Dermatology",
    "city": "Vijayawada",
    "tier": "Tier-2"
  },
  {
    "name": "Dr YUGANDAR SKIN HAIR LASER CLINIC & Hair Transplantation Center { Best Dermatologist}",
    "phone": "9394093940",
    "email": "",
    "address": "\ue0c8 Main Road, Next to TRIVENI CHILDRENS HOSPITAL, Reddy and Reddy's Colony, Tirupati, Andhra Pradesh 517501",
    "specialty": "Dermatology",
    "city": "Tirupati",
    "tier": "Tier-2"
  },
  {
    "name": "Dr.Sajja's",
    "phone": "7416915969",
    "email": "",
    "address": "\ue0c8 Padmavathi nagar, near D- Mart, Bank Employees Colony, Mangalam, Tirupati, Andhra Pradesh 517501",
    "specialty": "Dermatology",
    "city": "Tirupati",
    "tier": "Tier-2"
  },
  {
    "name": "Dr.Sajja's",
    "phone": "9440830455",
    "email": "",
    "address": "\ue0c8 18-1-514, Beside line to Reliance trends show room, Bhavani Nagar, Tirupati, Andhra Pradesh 517501",
    "specialty": "Dermatology",
    "city": "Tirupati",
    "tier": "Tier-2"
  },
  {
    "name": "Dr.Swetha's Skin, Cosmetology & Surgical Gastro centre",
    "phone": "7995831988",
    "email": "",
    "address": "\ue0c8 10-3-206/M6, near V.V plaza, beside Sparsh Hospital, Reddy and Reddy's Colony, Tirupati, Andhra Pradesh 517501",
    "specialty": "Dermatology",
    "city": "Tirupati",
    "tier": "Tier-2"
  },
  {
    "name": "Haripriya Dental Clinic",
    "phone": "9642000004",
    "email": "",
    "address": "\ue0c8KT Rd, opp. Income Tax Office, Bhavani Nagar, Tirupati, Andhra Pradesh 517501",
    "specialty": "Dental",
    "city": "Tirupati",
    "tier": "Tier-2"
  },
  {
    "name": "Kommineni Super Speciality Dental Hospital",
    "phone": "9491150133",
    "email": "",
    "address": "\ue0c8 Reddy & Reddy's Colony, Reddy and Reddy's Colony, Tirupati, Andhra Pradesh 517501",
    "specialty": "Dental",
    "city": "Tirupati",
    "tier": "Tier-2"
  },
  {
    "name": "Sai Sreenidhi Skin, Hair and Pediatrics Hospital",
    "phone": "9494395001",
    "email": "",
    "address": "\ue0c8 13-7-936/6, Tuda Main Rd, opp. Vasan Eye Care, Tetagunta, Korlagunta, Tirupati, Andhra Pradesh 517501",
    "specialty": "Dermatology",
    "city": "Tirupati",
    "tier": "Tier-2"
  },
  {
    "name": "Sri Padmavathi Skin Clinic",
    "phone": "7842867202",
    "email": "",
    "address": "\ue0c8 Opp: Tiffins@30, Indian Bank Road, Bairagi patteda, Tirupati, Andhra Pradesh 517501",
    "specialty": "Dermatology",
    "city": "Tirupati",
    "tier": "Tier-2"
  },
  {
    "name": "SriVatsa Multispeciality Dental Clinic",
    "phone": "9949074816",
    "email": "",
    "address": "\ue0c8 1st Floor, Police Station, 23-1-40/13B, beside ESI hospital, near MR Palli, Tirupati, Andhra Pradesh 517502",
    "specialty": "Dental",
    "city": "Tirupati",
    "tier": "Tier-2"
  },
  {
    "name": "Dr.Pooja's B18 Skin Clinic | Best Dermatologist in Guntur | Cosmetology | Trichologist | Anti Aging | Skin Doctor Guntur",
    "phone": "9441789897",
    "email": "",
    "address": "\ue0c8 Amaravathi Rd, beside BVR Convention, opp. Axis Bank, Panduranga Nagar, Guntur, Andhra Pradesh 522034",
    "specialty": "Dermatology",
    "city": "Guntur",
    "tier": "Tier-2"
  },
  {
    "name": "Kesavam Dermacare",
    "phone": "6301971891",
    "email": "",
    "address": "\ue0c8 1st Line, behind saraswati theater, Sambasiva Pet, Guntur, Andhra Pradesh 522001",
    "specialty": "Dermatology",
    "city": "Guntur",
    "tier": "Tier-2"
  },
  {
    "name": "Kothamas Dental Care",
    "phone": "9575959585",
    "email": "",
    "address": "\ue0c8 4th Ln, opposite Women's College Road, Sambasiva Pet, Guntur, Andhra Pradesh 522001",
    "specialty": "Dental",
    "city": "Guntur",
    "tier": "Tier-2"
  },
  {
    "name": "Skin kare Clinic",
    "phone": "7893333555",
    "email": "",
    "address": "\ue0c8 Lakshmipuram Main Rd, Lakshmipuram, Ashok Nagar, Guntur, Andhra Pradesh 522007",
    "specialty": "Dermatology",
    "city": "Guntur",
    "tier": "Tier-2"
  },
  {
    "name": "SKIN LANE CLINIC-Kothapet /Dr.AKSHAY JAIN /Best Dermatologist in Guntur /Trichologist /Best Skin & Hair doctor in GUNTUR",
    "phone": "7989455662",
    "email": "",
    "address": "\ue0c8 Skin Lane Clinic, 0pp : Muthoot finance, Somuvari St, Kothapeta, Guntur, Andhra Pradesh 522001",
    "specialty": "Dermatology",
    "city": "Guntur",
    "tier": "Tier-2"
  },
  {
    "name": "Skin Perfect Clinic",
    "phone": "9490903999",
    "email": "",
    "address": "\ue0c8Old Club Rd, beside Yoda diagnostic lab, Kothapeta, Guntur, Andhra Pradesh 522001",
    "specialty": "Dermatology",
    "city": "Guntur",
    "tier": "Tier-2"
  },
  {
    "name": "Sree Sai Swaraj Dental Clinic",
    "phone": "7893352679",
    "email": "",
    "address": "\ue0c8 Sanakkayala Factory Rd, Kothapeta, Guntur, Andhra Pradesh 522001",
    "specialty": "Dental",
    "city": "Guntur",
    "tier": "Tier-2"
  },
  {
    "name": "Vijaya Krishna Dental | Best Dental Hospital in Guntur",
    "phone": "7989126839",
    "email": "",
    "address": "\ue0c8 Between BVR convention and swarguha function hall, Amaravathi Rd, Munuswamy nagar, Panduranga Nagar, Guntur, Andhra Pradesh 522034",
    "specialty": "Dental",
    "city": "Guntur",
    "tier": "Tier-2"
  },
  {
    "name": "All Smiles",
    "phone": "",
    "email": "",
    "address": "\ue0c8 1st floor, A83, Saheed Nagar, Bhubaneswar, Odisha 751007",
    "specialty": "Dental",
    "city": "Bhubaneswar",
    "tier": "Tier-2"
  },
  {
    "name": "DR BHARATI PANDA",
    "phone": "9910493693",
    "email": "",
    "address": "\ue0c8 KAR CLINIC, NEW OPD, A-33, near RABINDRA MANDAP, Unit 4, Bhouma Nagar, Bhubaneswar, Odisha 751001",
    "specialty": "Dermatology",
    "city": "Bhubaneswar",
    "tier": "Tier-2"
  },
  {
    "name": "Dr. Grin Dental Hub",
    "phone": "8249775514",
    "email": "",
    "address": "\ue0c8 PLOT NO 133A, Forest Park Rd, Forest Park, Bhubaneswar, Odisha 751009",
    "specialty": "Dental",
    "city": "Bhubaneswar",
    "tier": "Tier-2"
  },
  {
    "name": "Glow dental clinic",
    "phone": "9776655134",
    "email": "",
    "address": "\ue0c8 Back side of Alok Bharati complex, 183, Saheed Nagar, Bhubaneswar, Odisha 751007",
    "specialty": "Dental",
    "city": "Bhubaneswar",
    "tier": "Tier-2"
  },
  {
    "name": "Perfect smile laser dental clinic",
    "phone": "9777282206",
    "email": "",
    "address": "\ue0c8 Shop No, 261, adjacent to axis bank, N1, CRPF Colony, IRC Village, Nayapalli, Bhubaneswar, Odisha 751015",
    "specialty": "Dental",
    "city": "Bhubaneswar",
    "tier": "Tier-2"
  },
  {
    "name": "Siddhi Vinayak Dental Clinic",
    "phone": "7739701801",
    "email": "",
    "address": "\ue0c8 House no 1, no 1, Lane, Janpath Rd, opposite Sishu Bhawan Road, chhak, Forest Park, Bhubaneswar, Odisha 751009",
    "specialty": "Dental",
    "city": "Bhubaneswar",
    "tier": "Tier-2"
  },
  {
    "name": "Dr Ashish Bhagat Dental Clinic (Sambodhi Dental) Ranchi",
    "phone": "7004079967",
    "email": "",
    "address": "\ue0c8 Sahay Tower, Kutchery Rd, near Raj residency, beside Dr. Ajit Sahay, Ahirtoli, Ranchi, Jharkhand 834001",
    "specialty": "Dental",
    "city": "Ranchi",
    "tier": "Tier-2"
  },
  {
    "name": "Dr. Minali Midha",
    "phone": "9234266335",
    "email": "",
    "address": "\ue0c8 GEL Church Complex, above TBZ jewellers, AC Market, Kanka, Ranchi, Jharkhand 834001",
    "specialty": "Dermatology",
    "city": "Ranchi",
    "tier": "Tier-2"
  },
  {
    "name": "Dr. Saroj Rai\u2019s ISHAAN SKIN CARE HOSPITAL",
    "phone": "9431992950",
    "email": "",
    "address": "\ue0c8 Medical chowk, 2nd floor, Orchid Mall, Bariatu Rd, Medical Chowk, opp. Rims Circle, opposite Durga Mandir, Bariatu, Ranchi, Jharkhand 834009",
    "specialty": "Dermatology",
    "city": "Ranchi",
    "tier": "Tier-2"
  },
  {
    "name": "Hi Dent Dental Clinic - Best Dental Surgeon in Ranchi/ RCT Specialist in Kokar Ranchi",
    "phone": "9471717965",
    "email": "",
    "address": "\ue0c8 Add, Heritage Garden, opp. :surendranath school, Deepatoli, Santman Nagar, Ranchi, Jharkhand 834012",
    "specialty": "Dental",
    "city": "Ranchi",
    "tier": "Tier-2"
  },
  {
    "name": "Shree Renu Skin & Cosmetic Clinic",
    "phone": "9153272110",
    "email": "",
    "address": "\ue0c8 1st floor, \u0936\u094d\u0930\u0940 Renu Skin and Cosmetic Clinic, RS Tower, opposite KC Roy Memorial Hospital, Lalpur, Ranchi, Jharkhand 834001",
    "specialty": "Dermatology",
    "city": "Ranchi",
    "tier": "Tier-2"
  },
  {
    "name": "Shubh Skin Care And Research Centre",
    "phone": "9204511970",
    "email": "",
    "address": "\ue0c8 Shubh Complex, near Sunday Market Road, Ratu, Ranchi, Jharkhand 835222",
    "specialty": "Dermatology",
    "city": "Ranchi",
    "tier": "Tier-2"
  },
  {
    "name": "Dr Saurabh Raut, Dr Shraddha Ukey",
    "phone": "",
    "email": "",
    "address": "\ue0c8 Discount Medical, In front of Yashwant Hospital Tatyapara, chowk, Great Eastern Rd, Raipur, Chhattisgarh 492001",
    "specialty": "Dermatology",
    "city": "Raipur",
    "tier": "Tier-2"
  },
  {
    "name": "Dr. Teeth Dental Clinic",
    "phone": "8871720043",
    "email": "",
    "address": "\ue0c8 Sector 1, Shankar Nagar, Raipur, Chhattisgarh 492004",
    "specialty": "Dental",
    "city": "Raipur",
    "tier": "Tier-2"
  },
  {
    "name": "Dr. Yuvraj Sahu",
    "phone": "9993906143",
    "email": "",
    "address": "\ue0c8 Besides Union bank of India, 69, Pension Bada Rd, near Holy Cross Girls School, Vivekanand Nagar, Janta Colony, Raipur, Chhattisgarh 492001",
    "specialty": "Dermatology",
    "city": "Raipur",
    "tier": "Tier-2"
  },
  {
    "name": "Hi-Tech dental care",
    "phone": "6362399443",
    "email": "",
    "address": "\ue0c8 B-33, Katora Talab Main Rd, beside Zudio, Old Rajendra Nagar, Shailendra Nagar, Raipur, Chhattisgarh 492001",
    "specialty": "Dental",
    "city": "Raipur",
    "tier": "Tier-2"
  },
  {
    "name": "Dentales - Dr. Ridhima Uppal",
    "phone": "7888613608",
    "email": "",
    "address": "\ue0c8 LGF-4, Mall Rd, Kennedy Avenue, Amritsar, Punjab 143001",
    "specialty": "Dental",
    "city": "Amritsar",
    "tier": "Tier-2"
  },
  {
    "name": "Dr Poonam's Inskin Aesthetics Skin and Laser clinic",
    "phone": "6284657810",
    "email": "",
    "address": "\ue0c8 12-Akshath Enclave, behind power house, C Block, Ranjit Avenue, Amritsar, Punjab 143001",
    "specialty": "Dermatology",
    "city": "Amritsar",
    "tier": "Tier-2"
  },
  {
    "name": "Dr. Ameesha Mahajan",
    "phone": "7710117777",
    "email": "",
    "address": "\ue0c8 Second Floor, Eden Skin Clinic, Amritsar, SCO 35-36, above Starbucks, Gumtala Sub Urban, D - Block, Ranjit Avenue, Amritsar, Punjab 143001",
    "specialty": "Dermatology",
    "city": "Amritsar",
    "tier": "Tier-2"
  },
  {
    "name": "Dr. Anurag Mahajan Skin Clinic and Laser Hair Removal Center",
    "phone": "8146449350",
    "email": "",
    "address": "\ue0c8 19, Race Course Rd, near Blue Bakers, Beauty Avenue, Amritsar, Punjab 143001",
    "specialty": "Dermatology",
    "city": "Amritsar",
    "tier": "Tier-2"
  },
  {
    "name": "Dr. Mohindru\u2019s Medical & Dental Care",
    "phone": "6239245040",
    "email": "",
    "address": "\ue0c8 128, Gopal Nagar, Gali, 3, Majitha Rd, Amritsar, Punjab 143001",
    "specialty": "Dental",
    "city": "Amritsar",
    "tier": "Tier-2"
  },
  {
    "name": "Goenka's Dental Care centre",
    "phone": "9803340496",
    "email": "",
    "address": "\ue0c8 Sultanwind Rd, opposite Ajit Vidyalaya School, Ajit Nagar, Katra Ahluwalia, Amritsar, Amritsar Cantt., Punjab 143006",
    "specialty": "Dental",
    "city": "Amritsar",
    "tier": "Tier-2"
  },
  {
    "name": "Perfect 32 Dental Clinic",
    "phone": "9877006820",
    "email": "",
    "address": "\ue0c8 123, Race Course Rd, Shastri Nagar, White Avenue, Amritsar, Punjab 143001",
    "specialty": "Dental",
    "city": "Amritsar",
    "tier": "Tier-2"
  },
  {
    "name": "Skin care clinic Amritsar Punjab",
    "phone": "9779257050",
    "email": "",
    "address": "\ue0c8 101-A, behind Gurudwara sahib, Rani Ka Bagh, Amritsar Cantonment, Amritsar, Punjab 143001",
    "specialty": "Dermatology",
    "city": "Amritsar",
    "tier": "Tier-2"
  },
  {
    "name": "Best Dentist in Ludhiana-Dr Goyals Dental Super Speciality Clinic",
    "phone": "",
    "email": "",
    "address": "\ue0c8 VV6P+X8F, Main Market,Daba-Lohara Road,Near Daba Police ChonkiLudhiana India, Guru Nanak Nagar, Nitesh Vihar, Shimlapuri, Ludhiana, Punjab 141003",
    "specialty": "Dental",
    "city": "Ludhiana",
    "tier": "Tier-2"
  },
  {
    "name": "Confidental Clinic - Child Specialist / Root Canal Specialist/ Braces/ Implant/ Best Dentist in Ludhiana",
    "phone": "8699546959",
    "email": "",
    "address": "\ue0c8 33 Feet Rd, opp. uspc jain school, Urban Estate, Guru Teg Bahadur Nagar, Ludhiana, Punjab 141008",
    "specialty": "Dental",
    "city": "Ludhiana",
    "tier": "Tier-2"
  },
  {
    "name": "Dr Gaganjot Kaur",
    "phone": "9888996694",
    "email": "",
    "address": "\ue0c8 631-L, opposite Deep Hospital Road, Shastri Nagar, Model Town, Ludhiana, Punjab 141002",
    "specialty": "Dermatology",
    "city": "Ludhiana",
    "tier": "Tier-2"
  },
  {
    "name": "Dr Rupinder Kaur",
    "phone": "9988233229",
    "email": "",
    "address": "\ue0c8 112, Block H Rd, Block H, Bhai Randhir Singh Nagar, Ludhiana, Punjab 141012",
    "specialty": "Dermatology",
    "city": "Ludhiana",
    "tier": "Tier-2"
  },
  {
    "name": "Jolly Dental Care - Best Implant Centre in Ludhiana/ Best Orthodontist in Ludhiana",
    "phone": "9501867112",
    "email": "",
    "address": "\ue0c8 L Opposite Old, 120, Krishna Mandir Rd, Pritm Nagar, Model Town, Ludhiana, Punjab 141002",
    "specialty": "Dental",
    "city": "Ludhiana",
    "tier": "Tier-2"
  },
  {
    "name": "Karvi Skin Clinic - Best Dermatologist in Ludhiana | Laser Hair Removal | Anti Ageing Treatment | Pigmentation Treatment",
    "phone": "9501525598",
    "email": "",
    "address": "\ue0c8 75, Vishal Nagar Ext, Vishal Nagar, Jawaddi Taksal, Ludhiana, Punjab 141013",
    "specialty": "Dermatology",
    "city": "Ludhiana",
    "tier": "Tier-2"
  },
  {
    "name": "Kukreja Dental Clinic - Implant, Veneer & Invisalign specialist in ludhiana",
    "phone": "8146560555",
    "email": "",
    "address": "\ue0c8 602-A, Krishna Mandir Rd, behind New, Nehru Nagar, Model Town Extension, Model Town, Ludhiana, Punjab 141002",
    "specialty": "Dental",
    "city": "Ludhiana",
    "tier": "Tier-2"
  },
  {
    "name": "Skin Rise Clinic",
    "phone": "9853100014",
    "email": "",
    "address": "\ue0c8 Lower ground floor, SCF 17 18-D, Model Town Extension, Mkt, Ludhiana, Punjab 141002",
    "specialty": "Dermatology",
    "city": "Ludhiana",
    "tier": "Tier-2"
  },
  {
    "name": "Vishal Dental Clinic - Best Dentist in Ludhiana, Dental Implant Center",
    "phone": "8556929385",
    "email": "",
    "address": "\ue0c8 MAIN CHANDEN, Chander Nagar Rd, opposite B.M.MOTORS, near BHURIWALA GURUDWARA, Shakti Vihar, Vivek Nagar, Haibowal Kalan, Ludhiana, Punjab 141001",
    "specialty": "Dental",
    "city": "Ludhiana",
    "tier": "Tier-2"
  },
  {
    "name": "\ud835\udde6\ud835\uddee\ud835\uddf6 \ud835\uddd7\ud835\uddf2\ud835\uddfb\ud835\ude01\ud835\uddee\ud835\uddf9 \ud835\uddd6\ud835\uddf9\ud835\uddf6\ud835\uddfb\ud835\uddf6\ud835\uddf0 - Best Dentist Near Me in Ludhiana",
    "phone": "",
    "email": "",
    "address": "\ue0c8 VV6P+X8F, Main Market,Daba-Lohara Road,Near Daba Police ChonkiLudhiana India, Guru Nanak Nagar, Nitesh Vihar, Shimlapuri, Ludhiana, Punjab 141003",
    "specialty": "Dental",
    "city": "Ludhiana",
    "tier": "Tier-2"
  },
  {
    "name": "Ayushmaan Dental Clinic",
    "phone": "9761740018",
    "email": "",
    "address": "\ue0c8 118/68, chakrata road, Govind Garh Rd, opposite shani mandir, Dehradun, Uttarakhand 248001",
    "specialty": "Dental",
    "city": "Dehradun",
    "tier": "Tier-2"
  },
  {
    "name": "City Smiles Dental - best implantologist doctor in Dehradun | Best RCT doctor in dehradun | Dentist in dehradun",
    "phone": "8534990506",
    "email": "",
    "address": "\ue0c8 Ground floor Delight Tower Lane Number 5, Sahastradhara Rd, opp. Krishna Wedding Point, Vikas Lok, Dehradun, Uttarakhand 248013",
    "specialty": "Dental",
    "city": "Dehradun",
    "tier": "Tier-2"
  },
  {
    "name": "Dr.Pal's Multispeciality Dental Care",
    "phone": "8894881616",
    "email": "",
    "address": "\ue0c8 Gurudwara Dilaram Bazaar, Old Survey Rd, Karanpur, Dehradun, Uttarakhand 248001",
    "specialty": "Dental",
    "city": "Dehradun",
    "tier": "Tier-2"
  },
  {
    "name": "DENTAL CENTRAL - Multispeciality Aesthetic & Orthodontic Clinic",
    "phone": "6009292562",
    "email": "",
    "address": "\ue0c8 1st floor, 108, MC Rd, opp. SK Paints, near Momo Lab, Barowari, Uzan Bazar, Guwahati, Assam 781003",
    "specialty": "Dental",
    "city": "Guwahati",
    "tier": "Tier-2"
  },
  {
    "name": "Dentination",
    "phone": "7838802541",
    "email": "",
    "address": "\ue0c8 Room no A3, ground floor, siddha point, opp. Marwari maternity hospital, Athgaon, Guwahati, Assam 781008",
    "specialty": "Dental",
    "city": "Guwahati",
    "tier": "Tier-2"
  },
  {
    "name": "Guwahati Dental Care",
    "phone": "8638191861",
    "email": "",
    "address": "\ue0c8 AEC Rd, Pragjyotish Nagar, Jalukbari, Guwahati, Assam 781014",
    "specialty": "Dental",
    "city": "Guwahati",
    "tier": "Tier-2"
  },
  {
    "name": "Guwahati Dental Care",
    "phone": "9387868037",
    "email": "",
    "address": "\ue0c8 Petrol Pump, GS Rd, near Ulubari, Manipuri Rajbari, Ulubari, Guwahati, Assam 781008",
    "specialty": "Dental",
    "city": "Guwahati",
    "tier": "Tier-2"
  },
  {
    "name": "Guwahati Dental Clinic",
    "phone": "9864056026",
    "email": "",
    "address": "\ue0c8 Zoo Rd, opp. AIDC, AIDC, Nabin Nagar, Guwahati, Assam 781024",
    "specialty": "Dental",
    "city": "Guwahati",
    "tier": "Tier-2"
  },
  {
    "name": "32 pearls dental clinic",
    "phone": "9775265471",
    "email": "",
    "address": "\ue0c8 janki residency, Ward 46, Devidanga, Siliguri, West Bengal 734003",
    "specialty": "Dental",
    "city": "Siliguri",
    "tier": "Tier-2"
  },
  {
    "name": "Dr Kunal Roy",
    "phone": "9733346430",
    "email": "",
    "address": "\ue0c8 Royz skin and aesthetic clinic, Mangaldeep Building, 2nd floor, Saibal Mansion, above Titan World, opposite SBI, Siliguri, West Bengal 734001",
    "specialty": "Dermatology",
    "city": "Siliguri",
    "tier": "Tier-2"
  },
  {
    "name": "Dr Priya Rajbansh Mohpal",
    "phone": "9113364923",
    "email": "",
    "address": "\ue0c8 Dr Mohpal\u2019s Nursing Home Pvt Ltd, Meghnad Saha Sarani, Ward 2, Pradhan Nagar, Siliguri, West Bengal 734003",
    "specialty": "Dermatology",
    "city": "Siliguri",
    "tier": "Tier-2"
  },
  {
    "name": "Dr. Debolina Chowdhury - Best Dentist | Best RCT Specialist | Best Root Canal Treatment | Best Dental Implant in Siliguri",
    "phone": "7679667242",
    "email": "",
    "address": "\ue0c8Sachin Saurav Apartment, Ashutosh Mukherjee Rd, College Para, Old Matigara, Siliguri, West Bengal 734001",
    "specialty": "Dental",
    "city": "Siliguri",
    "tier": "Tier-2"
  },
  {
    "name": "Ivory Dental Clinic And Implant Centre [Dr. Sourav Bose, M.D.S (Prosthodontist And Implantologist),Certified RCT Specialist]",
    "phone": "8967183019",
    "email": "",
    "address": "\ue0c8 Basjhar More, Munibala Academy, Near, Iskcon Rd, Ward 40, Bankim Nagar, Siliguri, West Bengal 734001",
    "specialty": "Dental",
    "city": "Siliguri",
    "tier": "Tier-2"
  },
  {
    "name": "Mehi Skin Clinic",
    "phone": "9933390009",
    "email": "",
    "address": "\ue0c8 2nd,floor, Galaxy House, Bus Stand, Sevoke Rd, beside P.C.Mittal, Ward 43, Siliguri, West Bengal 734001",
    "specialty": "Dermatology",
    "city": "Siliguri",
    "tier": "Tier-2"
  },
  {
    "name": "Bright Smile Dental Clinic (Most Advanced Dental Clinic)",
    "phone": "8921061678",
    "email": "",
    "address": "\ue0c8 JR MULTI-SPECIALITY DENTAL CLINIC, SS Kovil Rd, near AYYAPPAN COVIL, Overbridge, Santhi Nagar, Thampanoor, Thiruvananthapuram, Kerala 695001",
    "specialty": "Dental",
    "city": "Thiruvananthapuram",
    "tier": "Tier-2"
  },
  {
    "name": "Dr Suchithra's Skin and Hair care",
    "phone": "9074714272",
    "email": "",
    "address": "\ue0c8 1st floor, CM Complex, opposite Chaithanya eye hospital and Opticals, Kunjalumoodu, Shastri Nagar, Karamana, Thiruvananthapuram, Kerala 695002",
    "specialty": "Dermatology",
    "city": "Thiruvananthapuram",
    "tier": "Tier-2"
  },
  {
    "name": "Dr. Derma Skin, Hair & Cosmetic Center",
    "phone": "6238069383",
    "email": "",
    "address": "\ue0c8 Kavaradi Rd, Pettah, Thiruvananthapuram, Kerala 695024",
    "specialty": "Dermatology",
    "city": "Thiruvananthapuram",
    "tier": "Tier-2"
  },
  {
    "name": "Dr. Vivek's Skin & Hair Clinic",
    "phone": "9037603579",
    "email": "",
    "address": "\ue0c8 First Floor, Attinkuzhy Rd, above Sha Margin-Free Supermarket, Pallinada, Kazhakkoottam, Thiruvananthapuram, Kerala 695582",
    "specialty": "Dermatology",
    "city": "Thiruvananthapuram",
    "tier": "Tier-2"
  },
  {
    "name": "The Dentofacial Studio | Pattom",
    "phone": "9447777010",
    "email": "",
    "address": "\ue0c8 Ground Floor - Menathottam Chambers, Thiruvananthapuram, Kerala 695004",
    "specialty": "Dental",
    "city": "Thiruvananthapuram",
    "tier": "Tier-2"
  }
];