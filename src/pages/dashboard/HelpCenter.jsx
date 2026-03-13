import { useState, useMemo } from 'react';
import { useLanguage } from '../../context/LanguageContext';

const HELP_CATEGORIES = [
  { id: 'sales', name_en: 'SALES', name_ta: 'விற்பனை', name_hi: 'बिक्री', icon: '💰' },
  { id: 'inventory', name_en: 'INVENTORY', name_ta: 'சரக்கு மேலாண்மை', name_hi: 'इन्वेंटरी', icon: '📦' },
  { id: 'purchases', name_en: 'PURCHASES', name_ta: 'கொள்முதல்', name_hi: 'खरीद', icon: '🛍️' },
  { id: 'crm', name_en: 'CRM', name_ta: 'வாடிக்கையாளர் மேலாண்மை', name_hi: 'ग्राहक संबंध', icon: '🤝' },
  { id: 'staff', name_en: 'STAFF MANAGEMENT', name_ta: 'பணியாளர்கள் மேலாண்மை', name_hi: 'कर्मचारी प्रबंधन', icon: '👥' },
  { id: 'analytics', name_en: 'ANALYTICS', name_ta: 'பகுப்பாய்வு', name_hi: 'विश्लेषण', icon: '📊' },
  { id: 'settings', name_en: 'ACCOUNT SETTINGS', name_ta: 'கணக்கு அமைப்புகள்', name_hi: 'खाता सेटिंग्स', icon: '⚙️' },
];

const tutorials = [
  // SALES
  {
    id: 'create-invoice',
    category: 'sales',
    title_en: 'How to Create an Invoice',
    title_ta: 'இன்வாய்ஸ் உருவாக்குவது எப்படி',
    title_hi: 'इनवॉइस कैसे बनाएं',
    steps_en: [
      'Go to the Sales module from the dashboard sidebar.',
      'Click the "New Invoice" button.',
      'Select a customer, add products, and set the invoice date.',
      'Click the "Save" or "Generate" button.',
      'Verify the created invoice in the list view.'
    ],
    steps_ta: [
      'டாஷ்போர்டில் உள்ள Sales பகுதியைத் திறக்கவும்.',
      '"New Invoice" பொத்தானைக் கிளிக் செய்யவும்.',
      'வாடிக்கையாளரைத் தேர்ந்தெடுத்து, தயாரிப்புகளைச் சேர்க்கவும்.',
      '"Save" அல்லது "Generate" பொத்தானைக் கிளிக் செய்யவும்.',
      'உருவாக்கப்பட்ட இன்வாய்ஸை பட்டியலில் சரிபார்க்கவும்.'
    ],
    steps_hi: [
      'डैशबोर्ड में Sales सेक्शन खोलें।',
      '"New Invoice" बटन पर क्लिक करें।',
      'ग्राहक चुनें, उत्पाद जोड़ें और तारीख सेट करें।',
      '"Save" या "Generate" बटन पर क्लिक करें।',
      'सूची में बनाए गए इनवॉइस की जांच करें।'
    ]
  },
  {
    id: 'view-invoices',
    category: 'sales',
    title_en: 'How to View Invoices',
    title_ta: 'இன்வாய்ஸ்களைப் பார்ப்பது எப்படி',
    title_hi: 'इनवॉइस कैसे देखें',
    steps_en: [
      'Navigate to the Sales module.',
      'Select the "Invoices" tab to see all generated invoices.',
      'Use the search bar to find specific invoices by name or number.',
      'Click on an invoice row to view its details.'
    ],
    steps_ta: [
      'Sales பகுதிக்குச் செல்லவும்.',
      'அனைத்து இன்வாய்ஸ்களையும் பார்க்க "Invoices" தாவலைத் தேர்ந்தெடுக்கவும்.',
      'பெயர் அல்லது எண் மூலம் தேட தேடல் பட்டையைப் பயன்படுத்தவும்.',
      'விவரங்களைப் பார்க்க ஒரு இன்வாய்ஸைக் கிளிக் செய்யவும்.'
    ],
    steps_hi: [
      'Sales मॉड्यूल पर जाएं।',
      'सभी इनवॉइस देखने के लिए "Invoices" टैब चुनें।',
      'नाम या नंबर से खोजने के लिए सर्च बार का उपयोग करें।',
      'विवरण देखने के लिए किसी इनवॉइस पर क्लिक करें।'
    ]
  },
  {
    id: 'track-status',
    category: 'sales',
    title_en: 'How to Track Payment Status',
    title_ta: 'பண நிலையை கண்காணிப்பது எப்படி',
    title_hi: 'भुगतान की स्थिति कैसे ट्रैक करें',
    steps_en: [
      'Open the Invoices list in the Sales module.',
      'Look at the "Status" column next to each invoice.',
      'Statuses include Paid, Unpaid, and Overdue.',
      'Filter invoices by status using the filter dropdown.'
    ],
    steps_ta: [
      'Sales பகுதியில் இன்வாய்ஸ் பட்டியலைத் திறக்கவும்.',
      'ஒவ்வொரு இன்வாய்ஸிற்கும் அருகிலுள்ள "Status" பகுதியைப் பார்க்கவும்.',
      'நிலைகளில் Paid, Unpaid மற்றும் Overdue ஆகியவை அடங்கும்.',
      'வடிகட்டி மூலம் நிலைகளைத் தேர்வு செய்யவும்.'
    ],
    steps_hi: [
      'Sales मॉड्यूल में इनवॉइस सूची खोलें।',
      'प्रत्येक इनवॉइस के बगल में "Status" कॉलम देखें।',
      'स्थितियों में Paid, Unpaid और Overdue शामिल हैं।',
      'फ़िल्टर का उपयोग करके स्थिति के अनुसार इनवॉइस देखें।'
    ]
  },
  {
    id: 'edit-delete-invoice',
    category: 'sales',
    title_en: 'How to Edit or Delete an Invoice',
    title_ta: 'இன்வாய்ஸை திருத்துவது அல்லது நீக்குவது எப்படி',
    title_hi: 'इनवॉइस को कैसे संपादित करें या हटाएं',
    steps_en: [
      'Locate the invoice in the Sales list.',
      'Click the three dots or action icon on the right.',
      'Select "Edit" to make changes or "Delete" to remove it.',
      'Confirm your action in the popup dialog.'
    ],
    steps_ta: [
      'Sales பட்டியலில் இன்வாய்ஸைக் கண்டறியவும்.',
      'வலதுபுறத்தில் உள்ள மூன்று புள்ளிகள் அல்லது செயல் ஐகானைக் கிளிக் செய்யவும்.',
      'மாற்றங்களைச் செய்ய "Edit" அல்லது நீக்க "Delete" என்பதைத் தேர்ந்தெடுக்கவும்.',
      'உறுதிப்படுத்தும் சாளரத்தில் உங்கள் செயலை உறுதிப்படுத்தவும்.'
    ],
    steps_hi: [
      'Sales सूची में इनवॉइस ढूंढें।',
      'दाईं ओर तीन बिंदुओं या एक्शन आइकन पर क्लिक करें।',
      'बदलाव के लिए "Edit" या हटाने के लिए "Delete" चुनें।',
      'पॉपअप में अपनी कार्रवाई की पुष्टि करें।'
    ]
  },
  // INVENTORY
  {
    id: 'add-product',
    category: 'inventory',
    title_en: 'How to Add a Product',
    title_ta: 'ஒரு பொருளைச் சேர்ப்பது எப்படி',
    title_hi: 'उत्पाद कैसे जोड़ें',
    steps_en: [
      'Go to the Inventory module from the sidebar.',
      'Click the "Add Product" button.',
      'Enter product name, category, price, and initial stock.',
      'Click "Save".',
      'The product will now appear in your inventory list.'
    ],
    steps_ta: [
      'பக்கப்பட்டியில் உள்ள Inventory பகுதிக்குச் செல்லவும்.',
      '"Add Product" பொத்தானைக் கிளிக் செய்யவும்.',
      'பெயர், வகை, விலை மற்றும் ஆரம்ப இருப்பை உள்ளிடவும்.',
      '"Save" என்பதைக் கிளிக் செய்யவும்.',
      'தயாரிப்பு இப்போது உங்கள் சரக்கு பட்டியலில் தோன்றும்.'
    ],
    steps_hi: [
      'साइडबार से Inventory मॉड्यूल पर जाएं।',
      '"Add Product" बटन पर क्लिक करें।',
      'उत्पाद का नाम, श्रेणी, मूल्य और स्टॉक दर्ज करें।',
      '"Save" पर क्लिक करें।',
      'उत्पाद अब आपकी इन्वेंट्री सूची में दिखाई देगा।'
    ]
  },
  {
    id: 'update-stock',
    category: 'inventory',
    title_en: 'How to Update Stock',
    title_ta: 'இருப்பை புதுப்பிப்பது எப்படி',
    title_hi: 'स्टॉक कैसे अपडेट करें',
    steps_en: [
      'Find the product in the Inventory list.',
      'Click the "Edit" icon next to the product.',
      'Update the quantity field.',
      'Save the changes to reflect the new stock level.'
    ],
    steps_ta: [
      'Inventory பட்டியலில் தயாரிப்பைக் கண்டறியவும்.',
      'தயாரிப்புக்கு அருகிலுள்ள "Edit" ஐகானைக் கிளிக் செய்யவும்.',
      'அளவு (Quantity) பகுதியை மாற்றவும்.',
      'இருப்பைப் புதுப்பிக்க "Save" என்பதைக் கிளிக் செய்யவும்.'
    ],
    steps_hi: [
      'इन्वेंट्री सूची में उत्पाद ढूंढें।',
      'उत्पाद के बगल में "Edit" आइकन पर क्लिक करें।',
      'मात्रा (Quantity) फ़ील्ड अपडेट करें।',
      'स्टॉक अपडेट करने के लिए बदलाव सहेजें।'
    ]
  },
  {
    id: 'track-inventory',
    category: 'inventory',
    title_en: 'How to Track Inventory',
    title_ta: 'சரக்குகளை கண்காணிப்பது எப்படி',
    title_hi: 'इन्वेंट्री कैसे ट्रैक करें',
    steps_en: [
      'Access the Inventory dashboard.',
      'View current stock levels for all products.',
      'Use filters to sort by category or stock status.',
      'Check the total asset value of your inventory at the top.'
    ],
    steps_ta: [
      'Inventory டாஷ்போர்டைத் திறக்கவும்.',
      'அனைத்து தயாரிப்புகளின் தற்போதைய இருப்பைக் காணவும்.',
      'வகை அல்லது இருப்பு நிலை மூலம் வரிசைப்படுத்த வடிகட்டிகளைப் பயன்படுத்தவும்.',
      'மேலே உள்ள சரக்குகளின் மொத்த மதிப்பைப் பார்க்கவும்.'
    ],
    steps_hi: [
      'इन्वेंट्री डैशबोर्ड पर जाएं।',
      'सभी उत्पादों के स्टॉक स्तर देखें।',
      'श्रेणी या स्टॉक स्थिति के अनुसार देखने के लिए फ़िल्टर का उपयोग करें।',
      'सबसे ऊपर अपनी इन्वेंट्री का कुल मूल्य देखें।'
    ]
  },
  {
    id: 'manage-low-stock',
    category: 'inventory',
    title_en: 'How to Manage Low Stock Alerts',
    title_ta: 'குறைந்த இருப்பு எச்சரிக்கைகளை நிர்வகிப்பது எப்படி',
    title_hi: 'कम स्टॉक अलर्ट कैसे प्रबंधित करें',
    steps_en: [
      'Go to the Inventory page.',
      'Items with low stock will be highlighted with a red badge.',
      'Set your preferred low-stock threshold in product settings.',
      'Regularly check the "Low Stock" filter to restock items.'
    ],
    steps_ta: [
      'Inventory பக்கத்திற்குச் செல்லவும்.',
      'குறைந்த இருப்பு உள்ள பொருட்கள் சிவப்பு நிறத்தில் காட்டப்படும்.',
      'தயாரிப்பு அமைப்புகளில் குறைந்த இருப்பு அளவை அமைக்கவும்.',
      'மறுதொடக்கத்திற்கு "Low Stock" வடிகட்டியை அவ்வப்போது சரிபார்க்கவும்.'
    ],
    steps_hi: [
      'इन्वेंट्री पेज पर जाएं।',
      'कम स्टॉक वाली वस्तुओं को लाल रंग से दिखाया जाएगा।',
      'उत्पाद सेटिंग्स में अपनी पसंदीदा कम स्टॉक सीमा सेट करें।',
      'स्टॉक भरने के लिए नियमित रूप से "Low Stock" फ़िल्टर देखें।'
    ]
  },
  // PURCHASES
  {
    id: 'record-purchase',
    category: 'purchases',
    title_en: 'How to Record a Purchase',
    title_ta: 'கொள்முதலைப் பதிவு செய்வது எப்படி',
    title_hi: 'खरीद कैसे रिकॉर्ड करें',
    steps_en: [
      'Go to the Purchases module.',
      'Click "Record Purchase".',
      'Select a vendor and add products purchased.',
      'Enter the purchase price and quantity.',
      'Save to update your inventory and financial records.'
    ],
    steps_ta: [
      'Purchases பகுதிக்குச் செல்லவும்.',
      '"Record Purchase" என்பதைக் கிளிக் செய்யவும்.',
      'விற்பனையாளரைத் தேர்ந்தெடுத்து தயாரிப்புகளைச் சேர்க்கவும்.',
      'விலை மற்றும் அளவை உள்ளிடவும்.',
      'சரக்கு மற்றும் நிதிப் பதிவுகளைப் புதுப்பிக்க "Save" செய்யவும்.'
    ],
    steps_hi: [
      'Purchases मॉड्यूल पर जाएं।',
      '"Record Purchase" पर क्लिक करें।',
      'विक्रेता चुनें और खरीदे गए उत्पाद जोड़ें।',
      'खरीद मूल्य और मात्रा दर्ज करें।',
      'इन्वेंट्री और वित्तीय रिकॉर्ड अपडेट करने के लिए सहेजें।'
    ]
  },
  {
    id: 'purchase-history',
    category: 'purchases',
    title_en: 'How to View Purchase History',
    title_ta: 'கொள்முதல் வரலாற்றைப் பார்ப்பது எப்படி',
    title_hi: 'खरीद इतिहास कैसे देखें',
    steps_en: [
      'Open the Purchases page.',
      'Browse the list of all past purchase records.',
      'Filter by date or vendor to find specific entries.',
      'Click a record to view full invoice details from the vendor.'
    ],
    steps_ta: [
      'Purchases பக்கத்தைத் திறக்கவும்.',
      'அனைத்து முந்தைய கொள்முதல் பதிவுகளையும் பார்க்கவும்.',
      'தேதி அல்லது விற்பனையாளர் மூலம் தேடவும்.',
      'முழு விவரங்களைப் பார்க்க ஒரு பதிவைக் கிளிக் செய்யவும்.'
    ],
    steps_hi: [
      'Purchases पेज खोलें।',
      'पिछले सभी खरीद रिकॉर्ड देखें।',
      'विशिष्ट प्रविष्टियां खोजने के लिए तिथि या विक्रेता के अनुसार फ़िल्टर करें।',
      'पूर्ण विवरण देखने के लिए किसी रिकॉर्ड पर क्लिक करें।'
    ]
  },
  // CRM
  {
    id: 'add-customer',
    category: 'crm',
    title_en: 'How to Add a Customer',
    title_ta: 'வாடிக்கையாளரைச் சேர்ப்பது எப்படி',
    title_hi: 'ग्राहक कैसे जोड़ें',
    steps_en: [
      'Go to the CRM section.',
      'Click "Add Customer".',
      'Fill in the name, phone number, and address.',
      'Click "Save".'
    ],
    steps_ta: [
      'CRM பகுதிக்குச் செல்லவும்.',
      '"Add Customer" ஐக் கிளிக் செய்யவும்.',
      'பெயர், தொலைபேசி மற்றும் முகவரியை உள்ளிடவும்.',
      '"Save" என்பதைக் கிளிக் செய்யவும்.'
    ],
    steps_hi: [
      'CRM सेक्शन पर जाएं।',
      '"Add Customer" पर क्लिक करें।',
      'नाम, फोन नंबर और पता दर्ज करें।',
      '"Save" पर क्लिक करें।'
    ]
  },
  {
    id: 'cust-history',
    category: 'crm',
    title_en: 'How to View Customer Purchase History',
    title_ta: 'வாடிக்கையாளர் கொள்முதல் வரலாற்றைப் பார்ப்பது எப்படி',
    title_hi: 'ग्राहक खरीद इतिहास कैसे देखें',
    steps_en: [
      'Find the customer in your CRM list.',
      'Click on their name to open their profile.',
      'Select the "Purchase History" tab.',
      'View all past invoices associated with this customer.'
    ],
    steps_ta: [
      'CRM பட்டியலில் வாடிக்கையாளரைக் கண்டறியவும்.',
      'அவர்களின் சுயவிவரத்தைத் திறக்க பெயரைக் கிளிக் செய்யவும்.',
      '"Purchase History" தாவலைத் தேர்ந்தெடுக்கவும்.',
      'அந்த வாடிக்கையாளரின் அனைத்து முந்தைய இன்வாய்ஸ்களையும் பார்க்கவும்.'
    ],
    steps_hi: [
      'अपनी CRM सूची में ग्राहक को ढूंढें।',
      'उनका प्रोफ़ाइल खोलने के लिए उनके नाम पर क्लिक करें।',
      '"Purchase History" टैब चुनें।',
      'इस ग्राहक से जुड़े सभी पिछले इनवॉइस देखें।'
    ]
  },
  {
    id: 'edit-customer',
    category: 'crm',
    title_en: 'How to Edit Customer Information',
    title_ta: 'வாடிக்கையாளர் தகவலைத் திருத்துவது எப்படி',
    title_hi: 'ग्राहक की जानकारी कैसे संपादित करें',
    steps_en: [
      'Navigate to the CRM list.',
      'Click the "Edit" button next to a customer entry.',
      'Modify the contact details or notes.',
      'Click Save to update the record.'
    ],
    steps_ta: [
      'CRM பட்டியலுக்குச் செல்லவும்.',
      'வாடிக்கையாளருக்கு அருகிலுள்ள "Edit" பொத்தானைக் கிளிக் செய்யவும்.',
      'தகவல்களைத் திருத்தவும்.',
      'பதிவைப் புதுப்பிக்க "Save" செய்யவும்.'
    ],
    steps_hi: [
      'CRM सूची पर जाएं।',
      'ग्राहक के बगल में "Edit" बटन पर क्लिक करें।',
      'संपर्क विवरण या नोट्स बदलें।',
      'रिकॉर्ड अपडेट करने के लिए सहेजें पर क्लिक करें।'
    ]
  },
  // STAFF
  {
    id: 'add-staff',
    category: 'staff',
    title_en: 'How to Add Staff',
    title_ta: 'பணியாளரைச் சேர்ப்பது எப்படி',
    title_hi: 'कर्मचारी कैसे जोड़ें',
    steps_en: [
      'Go to the Staff section in the dashboard.',
      'Click "Add Staff" or manage invitations.',
      'Enter their details and assign a role (Admin, Accountant, etc.).',
      'The staff member can now log in to the platform.'
    ],
    steps_ta: [
      'டாஷ்போர்டில் உள்ள Staff பகுதிக்குச் செல்லவும்.',
      '"Add Staff" என்பதைக் கிளிக் செய்யவும்.',
      'விவரங்களை உள்ளிட்டு ஒரு பொறுப்பை (Role) ஒதுக்கவும்.',
      'பணியாளர் இப்போது தளத்தில் நுழைய முடியும்.'
    ],
    steps_hi: [
      'डैशबोर्ड में Staff सेक्शन पर जाएं।',
      '"Add Staff" पर क्लिक करें।',
      'उनका विवरण दर्ज करें और एक भूमिका (Role) सौंपें।',
      'कर्मचारी अब प्लेटफॉर्म पर लॉगिन कर सकता है।'
    ]
  },
  {
    id: 'assign-tasks',
    category: 'staff',
    title_en: 'How to Assign Tasks',
    title_ta: 'பணிகளை ஒதுக்குவது எப்படி',
    title_hi: 'कार्य कैसे सौंपें',
    steps_en: [
      'Navigate to the Tasks module.',
      'Click "Create New Task".',
      'Add a title and description.',
      'Select a staff member from the dropdown to assign the task.',
      'Set a due date and click Save.'
    ],
    steps_ta: [
      'Tasks பகுதிக்குச் செல்லவும்.',
      '"Create New Task" பொத்தானைக் கிளிக் செய்யவும்.',
      'தலைப்பு மற்றும் விவரங்களைச் சேர்க்கவும்.',
      'பணியாளரைத் தேர்ந்தெடுத்து பணியை ஒதுக்கவும்.',
      'தேதியை அமைத்து "Save" செய்யவும்.'
    ],
    steps_hi: [
      'Tasks मॉड्यूल पर जाएं।',
      '"Create New Task" पर क्लिक करें।',
      'शीर्षक और विवरण जोड़ें।',
      'कार्य सौंपने के लिए सूची से एक कर्मचारी का चयन करें।',
      'अंतिम तिथि सेट करें और सहेजें पर क्लिक करें।'
    ]
  },
  {
    id: 'track-attendance',
    category: 'staff',
    title_en: 'How to Track Attendance',
    title_ta: 'வருகையை கண்காணிப்பது எப்படி',
    title_hi: 'उपस्थिति कैसे ट्रैक करें',
    steps_en: [
      'Go to the Attendance page.',
      'View daily check-in and check-out logs for all staff.',
      'Use the calendar filter to view attendance history.',
      'Review total worked hours for any employee.'
    ],
    steps_ta: [
      'Attendance பக்கத்திற்குச் செல்லவும்.',
      'தினசரி வருகைப் பதிவுகளைப் பார்க்கவும்.',
      'வரலாற்றைப் பார்க்க காலண்டர் வடிகட்டியைப் பயன்படுத்தவும்.',
      'மொத்த வேலை நேரத்தைச் சரிபார்க்கவும்.'
    ],
    steps_hi: [
      'उपस्थिति (Attendance) पेज पर जाएं।',
      'सभी कर्मचारियों के दैनिक चेक-इन और चेक-आउट लॉग देखें।',
      'इतिहास देखने के लिए कैलेंडर फ़िल्टर का उपयोग करें।',
      'किसी भी कर्मचारी के कुल कार्य घंटों की समीक्षा करें।'
    ]
  },
  // ANALYTICS
  {
    id: 'view-analytics',
    category: 'analytics',
    title_en: 'How to View Sales Analytics',
    title_ta: 'விற்பனை பகுப்பாய்வைப் பார்ப்பது எப்படி',
    title_hi: 'बिक्री विश्लेषण कैसे देखें',
    steps_en: [
      'Open the Analytics Overview page.',
      'View charts for revenue, profit, and loss over time.',
      'Compare performance between different months.',
      'Check top-selling products and top customers.'
    ],
    steps_ta: [
      'Analytics Overview பக்கத்தைத் திறக்கவும்.',
      'வருவாய் மற்றும் லாப வரைபடங்களைப் பார்க்கவும்.',
      'மாதங்களுக்கு இடையிலான செயல்பாட்டை ஒப்பிடவும்.',
      'அதிக விற்பனையான தயாரிப்புகளைச் சரிபார்க்கவும்.'
    ],
    steps_hi: [
      'Analytics Overview पेज खोलें।',
      'राजस्व और लाभ के चार्ट देखें।',
      'विभिन्न महीनों के प्रदर्शन की तुलना करें।',
      'सबसे अधिक बिकने वाले उत्पादों की जांच करें।'
    ]
  },
  {
    id: 'biz-reports',
    category: 'analytics',
    title_en: 'How to Understand Business Reports',
    title_ta: 'வணிக அறிக்கைகளைப் புரிந்துகொள்வது எப்படி',
    title_hi: 'व्यापार रिपोर्ट कैसे समझें',
    steps_en: [
      'Go to the Reports section.',
      'Select a report type (Tax, Sales, or Inventory).',
      'Filter data by specific time periods (Daily, Monthly, Yearly).',
      'Use the visual cards to quickly grasp business health.'
    ],
    steps_ta: [
      'Reports பகுதிக்குச் செல்லவும்.',
      'அறிக்கை வகையைத் தேர்ந்தெடுக்கவும் (வரி, விற்பனை அல்லது சரக்கு).',
      'குறிப்பிட்ட காலத்திற்கு தரவை வடிகட்டவும்.',
      'வணிக நிலையை விரைவாகப் புரிந்துகொள்ள வரைபடங்களைப் பார்க்கவும்.'
    ],
    steps_hi: [
      'Reports सेक्शन पर जाएं।',
      'रिपोर्ट प्रकार (टैक्स, सेल्स या इन्वेंट्री) चुनें।',
      'समय अवधि के अनुसार डेटा फ़िल्टर करें।',
      'व्यापार की स्थिति समझने के लिए विजुअल कार्ड का उपयोग करें।'
    ]
  },
  // SETTINGS
  {
    id: 'update-profile',
    category: 'settings',
    title_en: 'How to Update Business Profile',
    title_ta: 'வணிக சுயவிவரத்தைப் புதுப்பிப்பது எப்படி',
    title_hi: 'व्यापार प्रोफ़ाइल कैसे अपडेट करें',
    steps_en: [
      'Go to Settings > Business Profile.',
      'Update your business name, logo, address, and GST number.',
      'Save changes to update how details appear on invoices.'
    ],
    steps_ta: [
      'Settings > Business Profile பகுதிக்குச் செல்லவும்.',
      'வணிகப் பெயர், லோகோ, முகவரி மற்றும் GST எண்ணைப் புதுப்பிக்கவும்.',
      'இன்வாய்ஸ்களில் விவரங்கள் மாற "Save" செய்யவும்.'
    ],
    steps_hi: [
      'Settings > Business Profile पर जाएं।',
      'अपना व्यापार का नाम, लोगो, पता और GST नंबर अपडेट करें।',
      'इनवॉइस पर विवरण अपडेट करने के लिए सहेजें।'
    ]
  },
  {
    id: 'change-pass',
    category: 'settings',
    title_en: 'How to Change Password',
    title_ta: 'கடவுச்சொல்லை மாற்றுவது எப்படி',
    title_hi: 'पासवर्ड कैसे बदलें',
    steps_en: [
      'Go to User Profile in settings.',
      'Click the "Change Password" section.',
      'Enter your current and new password.',
      'Confirm the change.'
    ],
    steps_ta: [
      'Settingsல் உள்ள User Profileக்குச் செல்லவும்.',
      '"Change Password" பகுதியைக் கிளிக் செய்யவும்.',
      'தற்போதைய மற்றும் புதிய கடவுச்சொல்லை உள்ளிடவும்.',
      'மாற்றத்தை உறுதிப்படுத்தவும்.'
    ],
    steps_hi: [
      'सेटिंग्स में User Profile पर जाएं।',
      '"Change Password" सेक्शन पर क्लिक करें।',
      'अपना वर्तमान और नया पासवर्ड दर्ज करें।',
      'बदलाव की पुष्टि करें।'
    ]
  },
  {
    id: 'manage-sub',
    category: 'settings',
    title_en: 'How to Manage Subscription',
    title_ta: 'சந்தாவை நிர்வகிப்பது எப்படி',
    title_hi: 'सब्सक्रिप्शन कैसे प्रबंधित करें',
    steps_en: [
      'Navigate to Settings > Subscription.',
      'View your current plan and renewal date.',
      'Click "Upgrade" to see available premium features.',
      'Manage billing information and invoices.'
    ],
    steps_ta: [
      'Settings > Subscription பகுதிக்குச் செல்லவும்.',
      'தற்போதைய திட்டம் மற்றும் தேதியைப் பார்க்கவும்.',
      'மேம்படுத்த "Upgrade" என்பதைக் கிளிக் செய்யவும்.',
      'பில்லிங் விவரங்களை நிர்வகிக்கவும்.'
    ],
    steps_hi: [
      'Settings > Subscription पर जाएं।',
      'अपना वर्तमान प्लान और नवीनीकरण तिथि देखें।',
      'प्रीमियम सुविधाएं देखने के लिए "Upgrade" पर क्लिक करें।',
      'बिलिंग जानकारी प्रबंधित करें।'
    ]
  }
];

const faqs = [
  {
    q_en: 'How can I reset my password?',
    q_ta: 'எனது கடவுச்சொல்லை எவ்வாறு மீட்டமைப்பது?',
    q_hi: 'मैं अपना पासवर्ड कैसे रीसेट कर सकता हूं?',
    a_en: 'Go to User Profile in settings and click "Change Password". If you forgotten it, use the "Forgot Password" link on the login page.',
    a_ta: 'Settingsல் உள்ள User Profileக்குச் சென்று "Change Password" என்பதைக் கிளிக் செய்யவும். மறந்துவிட்டால், லாகின் பக்கத்தில் உள்ள இணைப்பைப் பயன்படுத்தவும்.',
    a_hi: 'सेटिंग्स में यूजर प्रोफाइल पर जाएं और "Change Password" पर क्लिक करें। यदि आप भूल गए हैं, तो लॉगिन पेज पर "Forgot Password" लिंक का उपयोग करें।'
  },
  {
    q_en: 'How do I upgrade to Premium?',
    q_ta: 'Premium திட்டத்திற்கு மாறுவது எப்படி?',
    q_hi: 'मैं प्रीमियम में कैसे अपग्रेड करूं?',
    a_en: 'Navigate to Settings > Subscription and click on the "Upgrade" button to view plan options.',
    a_ta: 'Settings > Subscription பகுதிக்குச் சென்று "Upgrade" பொத்தானைக் கிளிக் செய்யவும்.',
    a_hi: 'Settings > Subscription पर जाएं और प्लान विकल्प देखने के लिए "Upgrade" बटन पर क्लिक करें।'
  },
  {
    q_en: 'How do I export reports?',
    q_ta: 'அறிக்கைகளை எவ்வாறு ஏற்றுமதி செய்வது?',
    q_hi: 'मैं रिपोर्ट कैसे निर्यात करूं?',
    a_en: 'Most list pages (Sales, Inventory) have an "Export CSV" button in the top right corner.',
    a_ta: 'Sales மற்றும் Inventory பக்கங்களில் வலதுபுறத்தில் "Export CSV" பொத்தான் இருக்கும்.',
    a_hi: 'अधिकांश सूची पृष्ठों (Sales, Inventory) में ऊपरी दाएं कोने में "Export CSV" बटन होता है।'
  }
];

export default function HelpCenter() {
  const { language, changeLanguage, t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [openFaq, setOpenFaq] = useState(null);
  const [expandedTutorial, setExpandedTutorial] = useState(null);

  const filteredTutorials = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return tutorials;
    return tutorials.filter(t => 
      t.title_en.toLowerCase().includes(query) || 
      t.title_ta.includes(query) || 
      t.title_hi.includes(query) ||
      t.category.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  const tutorialsByCategory = useMemo(() => {
    const grouped = {};
    filteredTutorials.forEach(t => {
      if (!grouped[t.category]) grouped[t.category] = [];
      grouped[t.category].push(t);
    });
    return grouped;
  }, [filteredTutorials]);

  const getLocalizedTitle = (tut) => {
    if (language === 'ta') return tut.title_ta;
    if (language === 'hi') return tut.title_hi;
    return tut.title_en;
  };

  const getLocalizedSteps = (tut) => {
    if (language === 'ta') return tut.steps_ta;
    if (language === 'hi') return tut.steps_hi;
    return tut.steps_en;
  };

  const getCategoryName = (cat) => {
    const category = HELP_CATEGORIES.find(c => c.id === cat);
    if (!category) return cat.toUpperCase();
    if (language === 'ta') return category.name_ta;
    if (language === 'hi') return category.name_hi;
    return category.name_en;
  };

  return (
    <div className="max-w-5xl mx-auto anime-fade-in pb-20 space-y-10 px-4">
      
      {/* Header with Language Selector */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pt-10">
        <div className="flex items-center gap-4">
          <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-primary-50 border border-primary-100 text-2xl">
            🎓
          </div>
          <div>
            <h1 className="text-3xl font-black text-surface-900 tracking-tight">{t('Help Center')}</h1>
            <p className="text-surface-500 font-medium text-sm">
              {t('Step-by-step guides to help you use UDAAN-SME.')}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 bg-white border border-surface-200 p-1.5 rounded-xl shadow-sm self-start md:self-center">
          <span className="text-xs font-bold text-surface-400 px-2 uppercase tracking-wider">Language</span>
          <div className="flex gap-1">
            {[
              { code: 'en', label: 'English' },
              { code: 'ta', label: 'தமிழ்' },
              { code: 'hi', label: 'हिन्दी' }
            ].map((lang) => (
              <button
                key={lang.code}
                onClick={() => changeLanguage(lang.code)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  language === lang.code
                    ? 'bg-primary-600 text-white shadow-md shadow-primary-500/20'
                    : 'text-surface-600 hover:bg-surface-100'
                }`}
              >
                {lang.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative group max-w-2xl mx-auto">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <svg className="h-5 w-5 text-surface-400 group-focus-within:text-primary-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <input
          type="text"
          placeholder={t('Search help articles (e.g. "create invoice", "add product")')}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="block w-full pl-11 pr-4 py-4 bg-white border border-surface-200 rounded-2xl text-surface-900 placeholder-surface-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all shadow-sm group-hover:shadow-md"
        />
      </div>

      {/* Categories and Tutorials */}
      <div className="space-y-12">
        {HELP_CATEGORIES.map(category => {
          const categoryTutorials = tutorialsByCategory[category.id];
          if (!categoryTutorials || categoryTutorials.length === 0) return null;

          return (
            <div key={category.id} className="space-y-6">
              <div className="flex items-center gap-3 border-b border-surface-200 pb-3">
                <span className="text-2xl">{category.icon}</span>
                <h2 className="text-xl font-black text-surface-900 tracking-tight">
                  {getCategoryName(category.id)}
                </h2>
                <span className="ml-auto text-xs font-bold text-surface-400 bg-surface-100 px-2 py-1 rounded-full">
                  {categoryTutorials.length} Articles
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {categoryTutorials.map(tut => {
                  const isExpanded = expandedTutorial === tut.id;
                  return (
                    <div 
                      key={tut.id}
                      className={`group bg-white border rounded-2xl transition-all duration-300 ${
                        isExpanded ? 'border-primary-200 shadow-xl ring-1 ring-primary-100 md:col-span-2' : 'border-surface-200 shadow-sm hover:border-primary-200 hover:shadow-md'
                      }`}
                    >
                      <button
                        onClick={() => setExpandedTutorial(isExpanded ? null : tut.id)}
                        className="w-full text-left p-6 flex items-center justify-between"
                      >
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                            isExpanded ? 'bg-primary-100 text-primary-600' : 'bg-surface-100 text-surface-500'
                          }`}>
                            <svg className={`w-5 h-5 transition-transform duration-300 ${isExpanded ? 'rotate-90' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                            </svg>
                          </div>
                          <span className={`font-bold transition-colors ${isExpanded ? 'text-primary-700' : 'text-surface-700'}`}>
                            {getLocalizedTitle(tut)}
                          </span>
                        </div>
                        {!isExpanded && (
                          <span className="text-[10px] font-black uppercase tracking-widest text-surface-400 bg-surface-50 px-2.5 py-1 rounded-full group-hover:text-primary-500 group-hover:bg-primary-50 transition-colors">
                            {t('Show Steps')}
                          </span>
                        )}
                      </button>

                      <div className={`overflow-hidden transition-all duration-300 ${isExpanded ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'}`}>
                        <div className="px-6 pb-8 pt-2 border-t border-surface-100 mx-6">
                          <div className="space-y-4 pt-4">
                            {getLocalizedSteps(tut).map((step, i) => (
                              <div key={i} className="flex gap-4">
                                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary-50 border border-primary-100 flex items-center justify-center text-primary-600 font-black text-xs">
                                  {i + 1}
                                </div>
                                <p className="text-sm text-surface-600 font-medium leading-relaxed pt-1.5">
                                  {step}
                                </p>
                              </div>
                            ))}
                          </div>
                          
                          <div className="mt-8 p-4 bg-emerald-50 rounded-xl border border-emerald-100 flex items-start gap-3">
                            <span className="text-lg">✅</span>
                            <p className="text-xs font-bold text-emerald-700 leading-tight">
                              {t('Tip')}: <span className="font-medium text-emerald-600/80">{t('Follow these steps exactly to maintain data accuracy in your business records.')}</span>
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* FAQ Section */}
      <div className="pt-10">
        <h2 className="text-2xl font-black text-surface-900 mb-8 flex items-center gap-3">
          <span className="text-2xl">❓</span>
          {t('Frequently Asked Questions')}
        </h2>
        <div className="space-y-4">
          {faqs.map((faq, i) => {
            const isOpen = openFaq === i;
            const q = language === 'ta' ? faq.q_ta : (language === 'hi' ? faq.q_hi : faq.q_en);
            const a = language === 'ta' ? faq.a_ta : (language === 'hi' ? faq.a_hi : faq.a_en);

            return (
              <div
                key={i}
                className={`bg-white border rounded-2xl overflow-hidden shadow-sm transition-all ${
                  isOpen ? 'border-primary-200' : 'border-surface-200 hover:border-surface-300'
                }`}
              >
                <button
                  onClick={() => setOpenFaq(isOpen ? null : i)}
                  className="w-full flex items-center justify-between px-6 py-5 text-left transition-colors"
                >
                  <span className={`font-bold text-sm ${isOpen ? 'text-primary-700' : 'text-surface-900'}`}>{q}</span>
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-all ${
                    isOpen ? 'bg-primary-600 text-white rotate-180' : 'bg-surface-100 text-surface-400'
                  }`}>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </button>
                <div className={`overflow-hidden transition-all duration-300 ${isOpen ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'}`}>
                  <div className="px-6 pb-6 pt-0">
                    <p className="text-sm text-surface-500 leading-relaxed font-medium">
                      {a}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
