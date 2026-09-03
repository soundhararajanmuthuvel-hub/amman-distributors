import { createContext, useContext, useState, useEffect, type ReactNode } from "react";

export type Language = "en" | "ta";

export const translations = {
  en: {
    // Branding & Header
    brandName: "Amman Distributors",
    brandSubtitle: "Dairy Distribution System",
    signOut: "Sign out",
    language: "Language",
    tamil: "தமிழ் (Tamil)",
    english: "English",

    // Navigation
    navHome: "Home",
    navSales: "Sales",
    navStock: "Stock",
    navCustomers: "Customers",
    navSuppliers: "Suppliers",
    navMore: "More",
    navRoute: "Route",
    navVisits: "Shop Visits",

    // Admin More Menu
    mgmtSection: "Management",
    workspaceSection: "Workspace",
    purchaseEntry: "Purchase Entry",
    suppliersPayables: "Suppliers & Payables",
    staffAttendance: "Staff & Owner Attendance",
    usersSuperadmin: "Users & Superadmin",
    allocateStock: "Allocate Stock",
    routeSetup: "Route Setup",
    productsMaster: "Products Master",
    returnsMgmt: "Returns & Damage",
    dayClosing: "Day Closing",
    reportsCashFlow: "Reports & Cash Flow",
    resetDemoData: "Reset demo data",

    // Dashboard Overview
    managerSelfAtt: "Manager Self-Attendance",
    logShiftPresence: "Log your shift presence for accountability",
    punchIn: "Punch In",
    punchOut: "Punch Out",
    presentIn: "Present · In",
    attendanceCompleted: "Attendance Completed",
    currentCashInHand: "Current Cash in Hand",
    openingCash: "Opening",
    collections: "Collections",
    totalSupplierDue: "Total Supplier Outstanding",
    activeSuppliers: "Active Suppliers",
    godownStockVal: "Godown Stock Valuation",
    catalogLines: "Product Lines",
    todaysSales: "Today's Sales",
    cashCollected: "Cash Collected",
    customerDues: "Customer Dues",
    godownStock: "Godown Stock",
    newStock: "New Stock",
    purchasedToday: "Purchased Today",
    returns: "Returns",
    activeSalesmen: "Active Salesmen",
    shopsVisited: "Shops Visited",
    salesBreakdown: "Sales by salesman",
    viewProfile: "View profile",
    quickActions: "Quick Actions",
    newSaleBill: "New Sale Bill",
    receiveStock: "Receive Stock",
    viewReports: "View Reports",
    stockBalanceAlerts: "Drop in Sales Alerts",

    // Stock & Purchase
    mainGodown: "Main godown",
    salesman: "Salesman",
    openingStock: "Opening Stock",
    allocatedToday: "Allocated Today",
    godownAvailable: "Godown Available",
    newPurchaseBill: "New Purchase Bill",
    productStockDetails: "Product Stock Details",
    lowStock: "Low Stock",
    minLevel: "Min Level",
    supplier: "Supplier",
    billNumber: "Bill number",
    uploadBillPhoto: "Take Photo or Upload Physical Bill",
    productVerification: "Product Verification & Price Comparison",
    previousPrice: "Previous Price",
    billRate: "Bill Rate (₹)",
    billQty: "Bill Qty",
    lineTotal: "Line Total",
    verifiedCount: "Physical Verified Count",
    priceIncreased: "Increased",
    priceDecreased: "Decreased",
    priceUnchanged: "Price Unchanged",
    paymentSettlement: "Payment & Settlement",
    amountPaidNow: "Amount Paid Now (₹)",
    paymentMode: "Payment Mode",
    cashMode: "Cash (Outflow from cash in hand)",
    upiMode: "UPI / Online",
    bankMode: "Bank Transfer / Cheque",
    confirmPurchaseBtn: "Confirm Purchase & Update Stock",

    // Suppliers
    addSupplier: "Add Supplier",
    supplierName: "Supplier Name",
    supplierCode: "Supplier Code",
    phone: "Phone",
    address: "Address",
    gstin: "GSTIN",
    paymentTerms: "Payment Terms",
    outstandingPayable: "Outstanding Payable",
    payNow: "Pay Now",
    editDetails: "Edit Details",
    confirmPayment: "Confirm Payment",

    // Common Kit
    save: "Save",
    cancel: "Cancel",
    confirm: "Confirm",
    delete: "Delete",
    suspend: "Suspend",
    activate: "Activate",
    units: "units",
    total: "Total",

    // Field Module
    myDayTitle: "My Day",
    myDaySubtitle: "Attendance, stock & targets",
    myRouteTitle: "My Route",
    myRouteSubtitle: "Shops to visit today",
    newSaleTitle: "New Sale",
    newSaleSubtitle: "Bill a shop",
    myStockTitle: "My Stock",
    myStockSubtitle: "Loaded, sold & in hand",
    moreTitle: "More",
    moreSubtitle: "Returns, payments & settings",
    checkedInAt: "Checked in at",
    notCheckedIn: "Not checked in yet",
    checkInBtn: "Check in",
    salesStat: "Sales",
    collectedStat: "Collected",
    pendingStat: "Pending",
    stockInHandStat: "Stock in hand",
    myRouteBtn: "My route",
    myStockBtn: "My stock",
    returnBtn: "Return",
    recentBills: "Recent bills",
    noBillsYet: "No bills yet",
    startRouteMsg: "Start your route and record your first sale.",
    closeMyDayBtn: "Close my day",
    dayClosedBadge: "Day closed",
    closeDayConfirmTitle: "Close your day?",
  },
  ta: {
    // Branding & Header
    brandName: "அம்மன் டிஸ்ட்ரிபியூட்டர்ஸ்",
    brandSubtitle: "பால் விநியோக மேலாண்மை அமைப்பு",
    signOut: "வெளியேறு (Sign out)",
    language: "மொழி",
    tamil: "தமிழ்",
    english: "English (ஆங்கிலம்)",

    // Navigation
    navHome: "முகப்பு",
    navSales: "விற்பனை",
    navStock: "சரக்கு இருப்பு",
    navCustomers: "கடைகள்",
    navSuppliers: "சப்ளையர்கள்",
    navMore: "கூடுதல்",
    navRoute: "வழித்தடம்",
    navVisits: "கடை வருகை",

    // Admin More Menu
    mgmtSection: "நிர்வாகம்",
    workspaceSection: "பணிமனை",
    purchaseEntry: "கொள்முதல் பதிவு (Purchase)",
    suppliersPayables: "சப்ளையர் பாக்கி விவரம்",
    staffAttendance: "பணியாளர் & உரிமையாளர் வருகை",
    usersSuperadmin: "பயனாளர் & சூப்பர் அட்மின்",
    allocateStock: "சரக்கு பிரித்து வழங்குதல் (Allocate)",
    routeSetup: "வழித்தட அமைப்புகள்",
    productsMaster: "பொருட்கள் பட்டியல் (Products)",
    returnsMgmt: "சேதமடைந்தவை / திரும்ப வந்தவை",
    dayClosing: "நாள் கணக்கு முடித்தல்",
    reportsCashFlow: "அறிக்கைகள் & பணப்புழக்கம் (Cash Flow)",
    resetDemoData: "மாதிரி தரவை மீட்டமைக்க",

    // Dashboard Overview
    managerSelfAtt: "மேலாளர் வருகை பதிவு",
    logShiftPresence: "பொறுப்புணர்வுக்காக உங்கள் வருகையை பதிவு செய்யுங்கள்",
    punchIn: "வருகை பதிவு (Punch In)",
    punchOut: "வெளியேறுதல் (Punch Out)",
    presentIn: "பணியில் · நேரம்",
    attendanceCompleted: "இன்றைய பணி நிறைவுற்றது",
    currentCashInHand: "கையில் உள்ள ரொக்கப் பணம்",
    openingCash: "ஆரம்ப ரொக்கம்",
    collections: "வசூல் தொகை",
    totalSupplierDue: "சப்ளையர்களுக்கு கொடுக்க வேண்டிய பாக்கி",
    activeSuppliers: "செயலில் உள்ள சப்ளையர்கள்",
    godownStockVal: "கிடங்கு சரக்கின் மொத்த மதிப்பு",
    catalogLines: "பொருட்களின் வகைகள்",
    todaysSales: "இன்றைய விற்பனை",
    cashCollected: "ரொக்கமாக வசூலித்தது",
    customerDues: "கடைகளில் உள்ள பாக்கி",
    godownStock: "கிடங்கு இருப்பு",
    newStock: "புதிய சரக்கு",
    purchasedToday: "இன்று வாங்கியது",
    returns: "திரும்ப வந்தவை",
    activeSalesmen: "களத்தில் உள்ள பணியாளர்கள்",
    shopsVisited: "சென்ற கடைகளின் எண்ணிக்கை",
    salesBreakdown: "விற்பனையாளர் வாரியாக",
    viewProfile: "விவரம் பார்க்க",
    quickActions: "விரைவு செயல்பாடுகள்",
    newSaleBill: "புதிய விற்பனை ரசீது",
    receiveStock: "சரக்கு பெறுதல்",
    viewReports: "அறிக்கைகள் பார்க்க",
    stockBalanceAlerts: "விற்பனை சரிவு எச்சரிக்கைகள்",

    // Stock & Purchase
    mainGodown: "தலைமை கிடங்கு",
    salesman: "விற்பனையாளர்",
    openingStock: "தொடக்க இருப்பு",
    allocatedToday: "இன்று வழங்கியது",
    godownAvailable: "கிடங்கில் இருக்கும் இருப்பு",
    newPurchaseBill: "புதிய கொள்முதல் பில்",
    productStockDetails: "பொருட்கள் இருப்பு விவரம்",
    lowStock: "குறைந்த இருப்பு",
    minLevel: "குறைந்தபட்ச அளவு",
    supplier: "சப்ளையர்",
    billNumber: "பில் எண்",
    uploadBillPhoto: "பில் புகைப்படத்தை பதிவேற்றவும்",
    productVerification: "பொருட்கள் சரிபார்ப்பு & விலை ஒப்பீடு",
    previousPrice: "முந்தைய விலை",
    billRate: "பில் விலை (₹)",
    billQty: "பில் அளவு",
    lineTotal: "மொத்த விலை",
    verifiedCount: "சரிபார்க்கப்பட்ட எண்ணிக்கை",
    priceIncreased: "விலை உயர்ந்துள்ளது",
    priceDecreased: "விலை குறைந்துள்ளது",
    priceUnchanged: "விலை மாற்றம் இல்லை",
    paymentSettlement: "பணம் செலுத்துதல் & கணக்கு",
    amountPaidNow: "இப்போது செலுத்திய தொகை (₹)",
    paymentMode: "செலுத்தும் முறை",
    cashMode: "ரொக்கம் (கையிருப்பு பணத்திலிருந்து)",
    upiMode: "UPI / கூகுள் பே",
    bankMode: "வங்கி பரிமாற்றம் / காசோலை",
    confirmPurchaseBtn: "கொள்முதலை உறுதிசெய்து இருப்பை புதுப்பிக்கவும்",

    // Suppliers
    addSupplier: "புதிய சப்ளையர் சேர்க்க",
    supplierName: "சப்ளையர் பெயர்",
    supplierCode: "சப்ளையர் குறியீடு",
    phone: "தொலைபேசி எண்",
    address: "முகவரி",
    gstin: "ஜி.எஸ்.டி எண் (GSTIN)",
    paymentTerms: "பணம் செலுத்தும் விதிமுறைகள்",
    outstandingPayable: "கொடுக்க வேண்டிய பாக்கி",
    payNow: "பணம் செலுத்து",
    editDetails: "விவரங்களை மாற்ற",
    confirmPayment: "பணப் பரிவர்த்தனையை உறுதிசெய்",

    // Common Kit
    save: "சேமிக்க",
    cancel: "ரத்து செய்",
    confirm: "உறுதி செய்",
    delete: "நீக்கு",
    suspend: "இடைநிறுத்தம்",
    activate: "செயல்படுத்து",
    units: "அளவுகள்",
    total: "மொத்தம்",

    // Field Module (Tamil)
    myDayTitle: "இன்றைய பணி (My Day)",
    myDaySubtitle: "வருகை, இருப்பு மற்றும் விற்பனை இலக்குகள்",
    myRouteTitle: "எனது வழித்தடம் (My Route)",
    myRouteSubtitle: "இன்று செல்ல வேண்டிய கடைகள்",
    newSaleTitle: "புதிய விற்பனை (New Sale)",
    newSaleSubtitle: "கடைக்கு ரசீது போடவும்",
    myStockTitle: "எனது சரக்கு இருப்பு (My Stock)",
    myStockSubtitle: "வாகனத்தில் உள்ள இருப்பு விவரம்",
    moreTitle: "கூடுதல் (More)",
    moreSubtitle: "திரும்பியவை, வசூல் மற்றும் அமைப்புகள்",
    checkedInAt: "பணி தொடங்கிய நேரம்",
    notCheckedIn: "வருகை இன்னும் பதிவு செய்யப்படவில்லை",
    checkInBtn: "வருகை பதிவு செய்",
    salesStat: "விற்பனை",
    collectedStat: "வசூலித்தது",
    pendingStat: "பாக்கி தொகை",
    stockInHandStat: "கையிருப்பு சரக்கு",
    myRouteBtn: "எனது வழித்தடம்",
    myStockBtn: "எனது சரக்கு",
    returnBtn: "திரும்ப ஒப்படைக்க",
    recentBills: "சமீபத்திய விற்பனை ரசீதுகள்",
    noBillsYet: "இன்னும் ரசீதுகள் போடப்படவில்லை",
    startRouteMsg: "உங்கள் பயணத்தை தொடங்கி முதல் விற்பனையை பதிவு செய்யுங்கள்.",
    closeMyDayBtn: "இன்றைய நாள் கணக்கை முடிக்க",
    dayClosedBadge: "இன்றைய பணி முடிந்தது",
    closeDayConfirmTitle: "இன்றைய நாள் கணக்கை முடிக்கவா?",
  },
};

interface LanguageContextType {
  lang: Language;
  setLang: (l: Language) => void;
  t: typeof translations.en;
  toggleLang: () => void;
}

const LanguageContext = createContext<LanguageContextType | null>(null);

const LANG_STORAGE_KEY = "amman_app_lang";

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Language>("en");

  useEffect(() => {
    const saved = localStorage.getItem(LANG_STORAGE_KEY) as Language;
    if (saved === "en" || saved === "ta") {
      setLangState(saved);
    }
  }, []);

  const setLang = (newLang: Language) => {
    setLangState(newLang);
    localStorage.setItem(LANG_STORAGE_KEY, newLang);
  };

  const toggleLang = () => {
    const next = lang === "en" ? "ta" : "en";
    setLang(next);
  };

  const t = translations[lang] || translations.en;

  return (
    <LanguageContext.Provider value={{ lang, setLang, t, toggleLang }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLang() {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    return {
      lang: "en" as Language,
      setLang: () => {},
      t: translations.en,
      toggleLang: () => {},
    };
  }
  return ctx;
}
