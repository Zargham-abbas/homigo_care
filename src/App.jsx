import { useEffect, useMemo, useState } from "react";
import "./App.css";

const FIELDS = ["Nursing Division", "Medical & Dental Practitioners", "Pharmacy Operations"];
const PROFESSIONS = {
  "Nursing Division": ["Registered Nurse", "Nursing Assistant", "Midwife"],
  "Medical & Dental Practitioners": ["Medical Doctor", "Specialist Doctor", "Dentist"],
  "Pharmacy Operations": ["Registered Pharmacist", "Pharmacy Technician"]
};
const NURSING_MODALITIES = ["Home Visit Framework", "Dedicated Shift Framework", "Hospital Companion Framework", "Hospital Navigator Framework"];
const DEMO_OTP = "123456";
const DEMO_PASSWORD = "12345678";
const DEMO_ACCOUNTS = [
  {
    id: "DEMO-PATIENT-001", name: "Demo Patient", email: "patient@homigo.demo",
    phone: "+923001111111", password: DEMO_PASSWORD, role: "PATIENT",
    status: "ACTIVE · DEMO", passportPin: "1234", createdAt: "2026-10-10T09:00:00.000Z"
  },
  {
    id: "DEMO-DOCTOR-001", name: "Demo Doctor", email: "doctor@homigo.demo",
    phone: "+923002222222", password: DEMO_PASSWORD, role: "PROFESSIONAL",
    field: "Medical & Dental Practitioners", profession: "Medical Doctor",
    authority: "Pakistan Medical and Dental Council (PMDC)", registration: "DEMO-PMDC-001",
    status: "APPROVED · DEMO", createdAt: "2026-10-10T09:00:00.000Z"
  },
  {
    id: "DEMO-NURSE-001", name: "Demo Nurse", email: "nurse@homigo.demo",
    phone: "+923003333333", password: DEMO_PASSWORD, role: "PROFESSIONAL",
    field: "Nursing Division", profession: "Registered Nurse",
    modality: "Home Visit Framework", authority: "Pakistan Nursing and Midwifery Council (PNMC)",
    registration: "DEMO-PNMC-001", status: "APPROVED · DEMO", createdAt: "2026-10-10T09:00:00.000Z"
  },
  {
    id: "DEMO-ADMIN-001", name: "Demo Admin", email: "admin@homigo.demo",
    phone: "+923004444444", password: DEMO_PASSWORD, role: "ADMIN",
    status: "ADMIN · DEMO", createdAt: "2026-10-10T09:00:00.000Z"
  }
];
const DEMO_BOOKINGS = [
  {
    id: "DEMO-BK-001", patientId: "DEMO-PATIENT-001", patientName: "Demo Patient",
    service: "Doctor Consultation", date: "2026-10-12", time: "10:30 AM",
    address: "Demo address, Islamabad", notes: "Routine consultation demo",
    status: "REQUESTED", assignedTo: "", createdAt: "2026-10-10T09:00:00.000Z"
  },
  {
    id: "DEMO-BK-002", patientId: "DEMO-PATIENT-001", patientName: "Demo Patient",
    service: "Home Nursing", date: "2026-10-13", time: "02:00 PM",
    address: "Demo address, Islamabad", notes: "Sample nursing visit",
    status: "CONFIRMED", assignedTo: "DEMO-NURSE-001", createdAt: "2026-10-10T09:00:00.000Z"
  }
];
const DEMO_CARE_PLANS = [
  {
    id: "DEMO-CP-001", patientId: "DEMO-PATIENT-001", professionalId: "DEMO-DOCTOR-001",
    patientName: "Demo Patient", medication: "Demo only: review current medication with clinician",
    vitals: "Sample only: BP 120/80 mmHg", activity: "Light activity as advised by clinician",
    nutrition: "Sample plan — follow qualified clinician advice", milestones: "Demo follow-up appointment",
    updatedAt: "2026-10-10T09:00:00.000Z"
  }
];

function readStore(key, fallback) {
  try { return JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback)); }
  catch { return fallback; }
}
function Field({ label, children, hint }) {
  return <label className="hc-field"><span>{label}</span>{children}{hint && <small>{hint}</small>}</label>;
}
function Logo() {
  const [failed, setFailed] = useState(false);
  return <div className="hc-logo-wrap">
    {!failed && <img className="hc-logo" src="/homigo-logo.png" alt="HomiGo Care" onError={() => setFailed(true)} />}
    {failed && <div className="hc-logo-fallback"><strong>HOMIGO</strong><b>CARE</b></div>}
  </div>;
}
function Action({ children, onClick, secondary = false, type = "button" }) {
  return <button type={type} className={secondary ? "hc-secondary" : "hc-primary"} onClick={onClick}>{children}</button>;
}
function Upload({ label, file, onFile, accept = "image/*,.pdf" }) {
  return <label className="hc-upload"><span className="hc-upload-icon">↑</span><strong>{label}</strong><small>{file?.name || "Choose a file · Maximum 5 MB"}</small><input type="file" accept={accept} onChange={e => onFile(e.target.files?.[0] || null)} /></label>;
}

export default function App() {
  const [screen, setScreen] = useState("entry");
  const [selectedAccountType, setSelectedAccountType] = useState("PATIENT");
  const [field, setField] = useState("");
  const [profession, setProfession] = useState("");
  const [modality, setModality] = useState("");
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [accounts, setAccounts] = useState(() => {
    const saved = readStore("homigo_demo_accounts_v2", []);
    const merged = [...DEMO_ACCOUNTS];
    saved.forEach(account => {
      const index = merged.findIndex(item => item.id === account.id || item.email?.toLowerCase() === account.email?.toLowerCase());
      if (index >= 0) merged[index] = { ...merged[index], ...account };
      else merged.push(account);
    });
    return merged;
  });
  const [active, setActive] = useState(() => readStore("homigo_demo_active_v2", null));
  const [patientForm, setPatientForm] = useState({ name:"", email:"", phone:"", password:"", terms:false });
  const [proForm, setProForm] = useState({ name:"", email:"", phone:"", password:"", qualification:"", experience:"", cnic:"", house:"", street:"", city:"", authority:"", registration:"" });
  const [documents, setDocuments] = useState({ front:null, back:null, licence:null });
  const [otp, setOtp] = useState("");
  const [loginId, setLoginId] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [forgotEmail, setForgotEmail] = useState("");
  const [bookings, setBookings] = useState(() => {
    const saved = readStore("homigo_demo_bookings_v2", null);
    return saved === null ? DEMO_BOOKINGS : saved;
  });
  const [carePlans, setCarePlans] = useState(() => {
    const saved = readStore("homigo_demo_careplans_v2", null);
    return saved === null ? DEMO_CARE_PLANS : saved;
  });
  const [careNotes, setCareNotes] = useState(() => readStore("homigo_demo_notes_v2", []));
  const [referrals, setReferrals] = useState(() => readStore("homigo_demo_referrals_v2", []));
  const [selectedPatientId, setSelectedPatientId] = useState("");
  const [selectedService, setSelectedService] = useState("");
  const [selectedBookingId, setSelectedBookingId] = useState("");
  const [pin, setPin] = useState("");
  const [pinEntry, setPinEntry] = useState("");
  const [passportUnlocked, setPassportUnlocked] = useState(false);
  const [bookingForm, setBookingForm] = useState({ date:"", time:"", address:"", notes:"" });
  const [carePlanForm, setCarePlanForm] = useState({ medication:"", vitals:"", activity:"", nutrition:"", milestones:"" });
  const [noteText, setNoteText] = useState("");
  const [deployForm, setDeployForm] = useState({ deployerId:"", accessCode:"", time:"", address:"", security:false });
  const [search, setSearch] = useState("");

  useEffect(() => { localStorage.setItem("homigo_demo_accounts_v2", JSON.stringify(accounts)); }, [accounts]);
  useEffect(() => { localStorage.setItem("homigo_demo_active_v2", JSON.stringify(active)); }, [active]);
  useEffect(() => { localStorage.setItem("homigo_demo_bookings_v2", JSON.stringify(bookings)); }, [bookings]);
  useEffect(() => { localStorage.setItem("homigo_demo_careplans_v2", JSON.stringify(carePlans)); }, [carePlans]);
  useEffect(() => { localStorage.setItem("homigo_demo_notes_v2", JSON.stringify(careNotes)); }, [careNotes]);
  useEffect(() => { localStorage.setItem("homigo_demo_referrals_v2", JSON.stringify(referrals)); }, [referrals]);

  const isProfessional = active?.role === "PROFESSIONAL";
  const isAdmin = active?.role === "ADMIN";
  const patients = accounts.filter(a => a.role === "PATIENT");
  const myBookings = bookings.filter(b => isProfessional ? (!b.assignedTo || b.assignedTo === active?.id) : b.patientId === active?.id);
  const activeBooking = bookings.find(b => b.id === selectedBookingId);
  const myCarePlans = carePlans.filter(p => isProfessional ? p.professionalId === active?.id || !p.professionalId : p.patientId === active?.id);
  const myNotes = careNotes.filter(n => isProfessional ? n.professionalId === active?.id || !n.professionalId : n.patientId === active?.id);
  const filteredPatients = patients.filter(p => `${p.name} ${p.email} ${p.phone}`.toLowerCase().includes(search.toLowerCase()));

  function go(next) {
    setScreen(next); setError(""); setNotice("");
    window.scrollTo({ top:0, behavior:"smooth" });
  }
  function updatePatient(e) {
    const { name, value, checked, type } = e.target;
    setPatientForm(p => ({ ...p, [name]: type === "checkbox" ? checked : value }));
  }
  function updatePro(e) { const { name, value } = e.target; setProForm(p => ({ ...p, [name]:value })); }
  function setStore(setter, key, list) { setter(list); localStorage.setItem(key, JSON.stringify(list)); }
  function unique(email, phone) {
    return !accounts.some(a => a.email?.toLowerCase() === email.toLowerCase() || (phone && a.phone === phone));
  }
  function back() {
    const map = {
      patientRegister:"entry", patientOtp:"patientRegister", fields:"entry", profession:"fields",
      modality:"profession", professionalIntro:field==="Nursing Division"?"modality":"profession",
      professionalRegister:"professionalIntro", cnic:"professionalRegister", location:"cnic", licence:"location",
      login:"entry", forgot:"login", patientHome:"entry", professionalReview:"entry",
      patientBooking:"patientHome", bookingForm:"patientBooking", myBookings:"patientHome",
      healthPassport:"patientHome", patientProfile:"patientHome", patientCarePlan:"patientHome",
      professionalHome:"entry", professionalProfile:"professionalHome", cases:"professionalHome", ongoing:"professionalHome", verifyRecords:"professionalHome",
      deployment:"professionalHome", carePlanEditor:"ongoing", careNoteEditor:"ongoing", deploymentConfirm:"deployment",
      adminHome:"entry", adminPatients:"adminHome", adminProfessionals:"adminHome", adminBookings:"adminHome", adminReferrals:"adminHome"
    };
    go(map[screen] || "entry");
  }
  function signOut() { setActive(null); setStore(setAccounts, "homigo_demo_accounts_v2", accounts); go("entry"); }

  function patientRegister(e) {
    e.preventDefault();
    if (patientForm.password.length < 8) return setError("Password must be at least 8 characters.");
    if (!patientForm.terms) return setError("Accept the Terms and Privacy Policy.");
    if (!unique(patientForm.email, patientForm.phone)) return setError("Email or phone already registered. Please sign in.");
    setOtp(""); go("patientOtp"); setNotice(`Demo OTP: ${DEMO_OTP}`);
  }
  function verifyPatientOtp(e) {
    e.preventDefault();
    if (otp !== DEMO_OTP) return setError(`Use demo OTP ${DEMO_OTP}.`);
    const account = { id:`PAT-${Date.now()}`, name:patientForm.name, email:patientForm.email, phone:patientForm.phone, password:patientForm.password, role:"PATIENT", status:"ACTIVE · DEMO", createdAt:new Date().toISOString() };
    setAccounts(old => [...old, account]); setActive(account); go("patientHome"); setNotice("Patient demo account created.");
  }
  function professionalRegister(e) {
    e.preventDefault();
    if (proForm.password.length < 8) return setError("Password must be at least 8 characters.");
    if (!unique(proForm.email, proForm.phone)) return setError("Email or phone already registered. Please sign in.");
    go("cnic");
  }
  function chooseFile(key, file) {
    if (!file) return;
    if (!["image/jpeg","image/png","image/webp","application/pdf"].includes(file.type)) return setError("Select a JPG, PNG, WEBP or PDF file.");
    if (file.size > 5 * 1024 * 1024) return setError("File must be smaller than 5 MB.");
    setDocuments(d => ({...d, [key]:file})); setError("");
  }
  function cnicSubmit(e) {
    e.preventDefault();
    if (!/^\d{13}$/.test(proForm.cnic)) return setError("Enter all 13 CNIC digits without dashes.");
    if (!documents.front || !documents.back) return setError("Upload both CNIC front and back images.");
    go("location");
  }
  function locationSubmit(e) {
    e.preventDefault();
    if (!proForm.house.trim() || !proForm.street.trim() || !proForm.city.trim()) return setError("Complete house number, street and city.");
    go("licence");
  }
  function licenceSubmit(e) {
    e.preventDefault();
    if (!proForm.authority || !proForm.registration.trim()) return setError("Choose a council and enter registration number.");
    if (!documents.licence) return setError("Upload your licence or degree document.");
    const account = { id:`PRO-${Date.now()}`, name:proForm.name, email:proForm.email, phone:proForm.phone, password:proForm.password, role:"PROFESSIONAL", field, profession, modality, qualification:proForm.qualification, experience:proForm.experience, cnic:proForm.cnic, house:proForm.house, street:proForm.street, city:proForm.city, authority:proForm.authority, registration:proForm.registration, status:"PENDING REVIEW", createdAt:new Date().toISOString() };
    setAccounts(old => [...old, account]); setActive(account); go("professionalReview"); setNotice("Demo profile saved. No official council verification was performed.");
  }
  function signIn(e) {
    e.preventDefault();
    const account = accounts.find(a => (a.email?.toLowerCase() === loginId.toLowerCase() || a.phone === loginId) && a.password === loginPassword);
    if (!account) return setError("Account not found in this browser demo. Sign up first.");
    setActive(account);
    if (account.role === "PATIENT") go("patientHome");
    else if (account.role === "ADMIN") go("adminHome");
    else go("professionalHome");
    setNotice(`Demo sign-in successful — ${account.role.toLowerCase()} dashboard opened.`);
  }
  function demoGoogle() {
    const account = { id:`PAT-DEMO-${Date.now()}`, name:"Demo Patient", email:`google-demo-${Date.now()}@example.com`, role:"PATIENT", status:"DEMO ACCOUNT" };
    setActive(account); go("patientHome"); setNotice("Demo sign-in only. No Google account was connected.");
  }
  function forgotPassword(e) {
    e.preventDefault();
    const account = accounts.find(a => a.email?.toLowerCase() === forgotEmail.toLowerCase());
    if (!account) return setError("No demo account found for that email.");
    setLoginId(account.email); go("login"); setNotice("Demo reset: use your existing password. No email was sent.");
  }
  function startProfessional(fieldName) {
    setField(fieldName); setProfession(""); setModality("");
    go("profession");
  }
  function chooseProfession(name) {
    setProfession(name);
    const auth = name.includes("Nurse") || name === "Midwife" ? "Pakistan Nursing and Midwifery Council (PNMC)"
      : name.includes("Doctor") || name === "Dentist" ? "Pakistan Medical and Dental Council (PMDC)"
      : "Relevant Pharmacy Council";
    setProForm(p => ({...p, authority:auth}));
    go(field === "Nursing Division" ? "modality" : "professionalIntro");
  }
  function saveBooking(e) {
    e.preventDefault();
    if (!selectedService) return setError("Select a healthcare service first.");
    const booking = { id:`BK-${Date.now()}`, patientId:active.id, patientName:active.name, service:selectedService, date:bookingForm.date, time:bookingForm.time, address:bookingForm.address, notes:bookingForm.notes, status:"REQUESTED", assignedTo:"", createdAt:new Date().toISOString() };
    setBookings(old => [...old, booking]); go("myBookings"); setNotice("Your demo booking request has been saved.");
    setBookingForm({date:"",time:"",address:"",notes:""});
  }
  function updateBooking(id, updates) {
    setBookings(old => old.map(b => b.id === id ? {...b,...updates} : b));
  }
  function savePin(e) {
    e.preventDefault();
    if (!/^\d{4}$/.test(pin)) return setError("PIN must contain exactly 4 digits.");
    setAccounts(old => old.map(a => a.id === active.id ? {...a, passportPin:pin} : a));
    setActive(old => ({...old, passportPin:pin})); setPassportUnlocked(true); setPinEntry(""); setNotice("Demo Health Passport PIN saved in browser storage.");
  }
  function unlockPassport(e) {
    e.preventDefault();
    if (pinEntry !== active?.passportPin) return setError("Incorrect PIN.");
    setPassportUnlocked(true); setError("");
  }
  function saveCarePlan(e) {
    e.preventDefault();
    if (!selectedPatientId) return setError("Select a patient before saving a care plan.");
    const record = { id:`CP-${Date.now()}`, patientId:selectedPatientId, professionalId:active?.id, patientName:patients.find(p=>p.id===selectedPatientId)?.name || "Selected demo patient", ...carePlanForm, updatedAt:new Date().toISOString() };
    setCarePlans(old => [...old.filter(p => p.patientId !== selectedPatientId), record]);
    go("ongoing"); setNotice("Care plan saved in the browser demo.");
  }
  function saveCareNote(e) {
    e.preventDefault();
    if (!selectedPatientId) return setError("Select a patient before saving a care note.");
    if (!noteText.trim()) return setError("Write a care note first.");
    const note = { id:`NOTE-${Date.now()}`, patientId:selectedPatientId, professionalId:active?.id, patientName:patients.find(p=>p.id===selectedPatientId)?.name || "Selected demo patient", text:noteText, createdAt:new Date().toISOString() };
    setCareNotes(old => [...old, note]); setNoteText(""); go("ongoing"); setNotice("Care note saved.");
  }
  function createReferral(e) {
    e.preventDefault();
    const item = { id:`SOS-${Date.now()}`, patientId:selectedPatientId, patientName:patients.find(p=>p.id===selectedPatientId)?.name || "Patient", reason:e.target.reason.value, urgency:e.target.urgency.value, status:"OPEN", createdAt:new Date().toISOString() };
    setReferrals(old => [item,...old]); go("professionalHome"); setNotice("Demo urgent referral created. No real emergency service was contacted.");
  }
  function updateReferral(id, status) { setReferrals(old => old.map(r => r.id === id ? {...r,status} : r)); }
  function uploadDummy() {}

  const authorityOptions = profession.includes("Nurse") || profession === "Midwife" ? ["Pakistan Nursing and Midwifery Council (PNMC)", "Other relevant nursing council"]
    : profession.includes("Doctor") || profession === "Dentist" ? ["Pakistan Medical and Dental Council (PMDC)", "Other relevant medical council"]
    : ["Relevant Pharmacy Council", "Other relevant authority"];
  const patientAppointments = bookings.filter(b => b.patientId === active?.id);
  const professionalBookings = bookings.filter(b => b.status !== "COMPLETED");
  const patientPlan = carePlans.find(p => p.patientId === active?.id);

  return <main className="hc-page"><section className="hc-phone">
    <header className="hc-header"><button className="hc-back" type="button" onClick={back}>{screen !== "entry" && !["patientHome","professionalHome","adminHome"].includes(screen) ? "‹ Back" : ""}</button><Logo/><span /></header>
    <div className="hc-content">
      {screen === "entry" && <section className="hc-entry">
        <p className="hc-eyebrow">BECAUSE CARE BEGINS AT HOME</p><h1 className="hc-screen-title">Professional Portal Login</h1>
        <button type="button" className={`hc-choice ${selectedAccountType==="PATIENT"?"selected":""}`} onClick={()=>setSelectedAccountType("PATIENT")}><span className="hc-choice-icon">♡</span><span>I Need Home Healthcare</span></button>
        <button type="button" className={`hc-choice ${selectedAccountType==="PROFESSIONAL"?"selected":""}`} onClick={()=>setSelectedAccountType("PROFESSIONAL")}><span className="hc-choice-icon">▣</span><span>I Am A Clinical Professional</span></button>
        <Action onClick={()=>go(selectedAccountType==="PATIENT"?"patientRegister":"fields")}>Continue <span>✦</span></Action>
        <p className="hc-switch">Already have an account? <button onClick={()=>go("login")}>Sign In</button></p>
      </section>}

      {screen === "patientRegister" && <section><p className="hc-eyebrow">PATIENT PORTAL</p><h1>Create your patient account</h1><p className="hc-subtitle">Register to book healthcare services at home.</p>
        <form className="hc-form" onSubmit={patientRegister}>
          <Field label="Full Name"><input name="name" value={patientForm.name} onChange={updatePatient} required placeholder="Full name"/></Field>
          <Field label="Email Address"><input name="email" type="email" value={patientForm.email} onChange={updatePatient} required placeholder="name@example.com"/></Field>
          <Field label="Phone Number (+92)"><input name="phone" type="tel" value={patientForm.phone} onChange={updatePatient} required placeholder="+92 3XX XXXXXXX"/></Field>
          <Field label="Create Password"><input name="password" type="password" value={patientForm.password} onChange={updatePatient} minLength={8} required placeholder="At least 8 characters"/></Field>
          <label className="hc-terms"><input name="terms" type="checkbox" checked={patientForm.terms} onChange={updatePatient} required/><span>I agree to the privacy policy and terms of condition.</span></label>
          <Action type="submit">CREATE ACCOUNT <span>✦</span></Action>
        </form><p className="hc-switch">Already have an account? <button onClick={()=>go("login")}>Sign In</button></p>
      </section>}

      {screen === "patientOtp" && <section><p className="hc-eyebrow">DEMO PHONE VERIFICATION</p><h1>Verify Your Number</h1><p className="hc-subtitle">Use the demo OTP shown below.</p><div className="hc-demo-otp">DEMO OTP: {DEMO_OTP}</div>
        <form className="hc-form" onSubmit={verifyPatientOtp}><Field label="Six-digit verification code"><input value={otp} onChange={e=>setOtp(e.target.value.replace(/\D/g,"").slice(0,6))} maxLength={6} inputMode="numeric" required placeholder="123456"/></Field><Action type="submit">Verify Code <span>✦</span></Action></form>
      </section>}

      {screen === "fields" && <section><h1>What is your Professional Field?</h1><p className="hc-subtitle">Select the relevant healthcare field.</p><div className="hc-options">{FIELDS.map(x=><button className="hc-option" key={x} onClick={()=>startProfessional(x)}><span>{x}</span><span className="hc-arrow">›</span></button>)}</div></section>}

      {screen === "profession" && <section><p className="hc-eyebrow">PROFESSIONAL TYPE</p><h1>Which professional are you?</h1><p className="hc-subtitle">Selected field: <strong>{field}</strong></p><div className="hc-options">{(PROFESSIONS[field]||[]).map(x=><button className="hc-option" key={x} onClick={()=>chooseProfession(x)}><span>{x}</span><span className="hc-arrow">›</span></button>)}</div></section>}

      {screen === "modality" && <section><p className="hc-eyebrow">NURSING DIVISION</p><h1>Select Your Nursing Modalities</h1><p className="hc-subtitle">Choose the service model you will provide.</p><div className="hc-options">{NURSING_MODALITIES.map(x=><button className={`hc-option ${modality===x?"selected":""}`} key={x} onClick={()=>setModality(x)}><span>{x}</span><span className="hc-arrow">{modality===x?"✓":"›"}</span></button>)}</div><Action onClick={()=>modality?go("professionalIntro"):setError("Select a nursing modality first.")}>Proceed to Account Creation <span>✦</span></Action></section>}

      {screen === "professionalIntro" && <section className="hc-onboarding"><p className="hc-eyebrow">HOMIGO CARE</p><div className="hc-trust-icon">✓</div><h1>Verified &amp; Trusted Network</h1><p className="hc-subtitle">Clinical practitioners submit their identity and professional credentials for review before approval.</p><div className="hc-summary"><span>Field</span><strong>{field}</strong><span>Profession</span><strong>{profession}</strong>{modality && <><span>Modality</span><strong>{modality}</strong></>}</div><Action onClick={()=>go("professionalRegister")}>Next <span>✦</span></Action></section>}

      {screen === "professionalRegister" && <section><p className="hc-eyebrow">PROFESSIONAL ACCOUNT</p><h1>Create your professional account</h1><p className="hc-subtitle">{profession} · {field}</p><form className="hc-form" onSubmit={professionalRegister}>
        <Field label="Full Name"><input name="name" value={proForm.name} onChange={updatePro} required/></Field>
        <Field label="Email Address"><input name="email" type="email" value={proForm.email} onChange={updatePro} required/></Field>
        <Field label="Phone Number (+92)"><input name="phone" value={proForm.phone} onChange={updatePro} required placeholder="+92 3XX XXXXXXX"/></Field>
        <Field label="Create Password"><input name="password" type="password" value={proForm.password} onChange={updatePro} minLength={8} required/></Field>
        <Field label="Qualification / Degree"><input name="qualification" value={proForm.qualification} onChange={updatePro} required/></Field>
        <Field label="Years of Experience"><input name="experience" type="number" min="0" value={proForm.experience} onChange={updatePro} required/></Field>
        <Action type="submit">Continue to Identity Verification <span>✦</span></Action>
      </form></section>}

      {screen === "cnic" && <section><p className="hc-eyebrow">STEP 1 OF 3 · IDENTITY</p><h1>Verify your identity credentials</h1><form className="hc-form" onSubmit={cnicSubmit}>
        <Field label="National CNIC Number (13 digits)"><input value={proForm.cnic} onChange={e=>setProForm(p=>({...p,cnic:e.target.value.replace(/\D/g,"").slice(0,13)}))} inputMode="numeric" maxLength={13} required placeholder="Without dashes"/></Field>
        <Upload label="Upload CNIC Front Image" file={documents.front} onFile={f=>chooseFile("front",f)} accept="image/*"/>
        <Upload label="Upload CNIC Back Image" file={documents.back} onFile={f=>chooseFile("back",f)} accept="image/*"/>
        <Action type="submit">Proceed to Location Selection <span>✦</span></Action>
      </form></section>}

      {screen === "location" && <section><p className="hc-eyebrow">STEP 2 OF 3 · LOCATION</p><h1>Location Allocation</h1><button className="hc-location" type="button" onClick={()=>setError("GPS is not connected in this demo. Enter your address manually.")}>◎ Use My Current GPS Position</button><form className="hc-form" onSubmit={locationSubmit}>
        <Field label="House / Apartment Number"><input name="house" value={proForm.house} onChange={updatePro} required/></Field><Field label="Street Address / Sector"><input name="street" value={proForm.street} onChange={updatePro} required/></Field><Field label="City"><input name="city" value={proForm.city} onChange={updatePro} required/></Field><Action type="submit">Save and Continue <span>✦</span></Action>
      </form></section>}

      {screen === "licence" && <section><p className="hc-eyebrow">STEP 3 OF 3 · COUNCIL VERIFICATION</p><h1>Council Licence Verification</h1><p className="hc-subtitle">Select the relevant council for your profession.</p><form className="hc-form" onSubmit={licenceSubmit}>
        <Field label="Council / Licensing Authority"><select value={proForm.authority} onChange={e=>setProForm(p=>({...p,authority:e.target.value}))} required><option value="">Select council</option>{authorityOptions.map(x=><option key={x}>{x}</option>)}<option>Other relevant authority</option></select></Field>
        <Field label="Council Registration Number"><input value={proForm.registration} onChange={e=>setProForm(p=>({...p,registration:e.target.value}))} required placeholder="Registration / licence number"/></Field>
        <Upload label="Upload Valid Licence / Degree Copy" file={documents.licence} onFile={f=>chooseFile("licence",f)}/>
        <label className="hc-terms"><input type="checkbox" required/><span>I confirm that the details submitted are accurate. This is a demo acknowledgement, not regulatory verification.</span></label>
        <Action type="submit">Submit Profile for Review <span>✦</span></Action>
      </form></section>}

      {screen === "professionalReview" && <section className="hc-review"><p className="hc-eyebrow">PROFILE VERIFICATION PENDING</p><div className="hc-review-icon">◷</div><h1>Profile Under Review</h1><p className="hc-subtitle">Your demo profile has been saved. No council API or official licence check is connected.</p><div className="hc-status">STATUS: PENDING REVIEW</div><div className="hc-summary"><span>Name</span><strong>{active?.name}</strong><span>Profession</span><strong>{active?.profession}</strong><span>Reference ID</span><strong>{active?.id}</strong></div><Action onClick={()=>go("professionalHome")}>Acknowledge &amp; Open Dashboard</Action></section>}

      {screen === "login" && <section><h1>Sign In</h1><p className="hc-subtitle">Use a registered account or one of these built-in demo accounts.</p>
        <div className="hc-demo-credentials">
          <strong>Demo logins · Password for all: {DEMO_PASSWORD}</strong>
          <span>Patient: patient@homigo.demo</span>
          <span>Doctor: doctor@homigo.demo</span>
          <span>Nurse: nurse@homigo.demo</span>
          <span>Admin: admin@homigo.demo</span>
          <small>These are public demo credentials only. Never use them in production.</small>
        </div>
        <form className="hc-form" onSubmit={signIn}><Field label="Phone Number (+92) or Email"><input value={loginId} onChange={e=>setLoginId(e.target.value)} required placeholder="Email or phone"/></Field><Field label="Password"><input type="password" value={loginPassword} onChange={e=>setLoginPassword(e.target.value)} required/></Field><button className="hc-text-button" type="button" onClick={()=>go("forgot")}>Forgot Password?</button><Action type="submit">Continue via Phone OTP <span>✦</span></Action></form><div className="hc-divider">or continue with</div><button className="hc-google" onClick={demoGoogle}><span>G</span> Continue with Google · Demo</button><p className="hc-switch">Don’t have an account? <button onClick={()=>go("entry")}>Sign Up</button></p></section>}

      {screen === "forgot" && <section><h1>Forgot Password?</h1><p className="hc-subtitle">Demo reset only; no email or SMS will be sent.</p><form className="hc-form" onSubmit={forgotPassword}><Field label="Registered Email"><input type="email" value={forgotEmail} onChange={e=>setForgotEmail(e.target.value)} required/></Field><Action type="submit">Find Demo Account</Action></form></section>}

      {screen === "patientHome" && <section><p className="hc-eyebrow">PATIENT DASHBOARD</p><h1>Welcome, {active?.name || "Patient"}</h1><p className="hc-subtitle">Book care, review appointments, and manage your demo health passport.</p><div className="hc-dashboard-grid">
        <button className="hc-dashboard-card" onClick={()=>go("patientBooking")}><span>＋</span><strong>Book Appointment</strong><small>Doctor, nurse, medicines, lab</small></button>
        <button className="hc-dashboard-card" onClick={()=>{setPassportUnlocked(false);go("healthPassport");}}><span>▣</span><strong>Health Passport</strong><small>PIN-protected demo record</small></button>
        <button className="hc-dashboard-card" onClick={()=>go("myBookings")}><span>◷</span><strong>My Appointments</strong><small>Track booking status</small></button>
        <button className="hc-dashboard-card" onClick={()=>go("patientCarePlan")}><span>♡</span><strong>Care Plan</strong><small>View care notes and plan</small></button>
        <button className="hc-dashboard-card" onClick={()=>go("patientProfile")}><span>○</span><strong>My Profile</strong><small>Account details</small></button>
      </div><Action onClick={signOut}>Sign Out</Action></section>}

      {screen === "patientBooking" && <section><p className="hc-eyebrow">ALL-IN-ONE BOOKING</p><h1>Book a Healthcare Service</h1><p className="hc-subtitle">Choose a service, date and time.</p><div className="hc-options">{["Doctor Consultation","Home Nursing","Medicine Delivery","Lab Test","Physiotherapy"].map(x=><button className={`hc-option ${selectedService===x?"selected":""}`} key={x} onClick={()=>setSelectedService(x)}><span>{x}</span><span className="hc-arrow">{selectedService===x?"✓":"›"}</span></button>)}</div><form className="hc-form" onSubmit={saveBooking}>
        <Field label="Preferred Date"><input type="date" min={new Date().toISOString().slice(0,10)} value={bookingForm.date} onChange={e=>setBookingForm(b=>({...b,date:e.target.value}))} required/></Field>
        <Field label="Preferred Time"><select value={bookingForm.time} onChange={e=>setBookingForm(b=>({...b,time:e.target.value}))} required><option value="">Select time</option>{["09:00 AM","10:30 AM","11:15 AM","02:00 PM","04:00 PM","06:00 PM"].map(t=><option key={t}>{t}</option>)}</select></Field>
        <Field label="Home Address"><input value={bookingForm.address} onChange={e=>setBookingForm(b=>({...b,address:e.target.value}))} required placeholder="House, street, city"/></Field>
        <Field label="Additional Notes"><textarea value={bookingForm.notes} onChange={e=>setBookingForm(b=>({...b,notes:e.target.value}))} rows="3" placeholder="Symptoms or service details"/></Field>
        <Action type="submit" onClick={()=>{if(!selectedService)setError("Select a service first.");}}>Book Appointment <span>✦</span></Action>
      </form></section>}

      {screen === "myBookings" && <section><h1>Patient Appointments</h1><p className="hc-subtitle">Your demo booking history.</p>{patientAppointments.length===0?<div className="hc-empty">No appointments yet. Book a service to see it here.</div>:patientAppointments.map(b=><div className="hc-record" key={b.id}><strong>{b.service}</strong><span>{b.date} · {b.time}</span><span>{b.address}</span><span className="hc-pill">{b.status}</span><small>Booking ID: {b.id}</small></div>)}<Action onClick={()=>go("patientBooking")}>Book Appointment</Action></section>}

      {screen === "healthPassport" && <section><p className="hc-eyebrow">DIGITAL HEALTH PASSPORT</p><h1>My Health Passport</h1>{!active?.passportPin ? <><p className="hc-subtitle">Create a 4-digit demo PIN to open your sample health record.</p><form className="hc-form" onSubmit={savePin}><Field label="Create 4-digit PIN"><input value={pin} onChange={e=>setPin(e.target.value.replace(/\D/g,"").slice(0,4))} inputMode="numeric" maxLength={4} required placeholder="••••"/></Field><Action type="submit">Set PIN &amp; Open Passport</Action></form></> : !passportUnlocked ? <form className="hc-form" onSubmit={unlockPassport}><p className="hc-subtitle">Enter your 4-digit PIN.</p><Field label="Health Passport PIN"><input value={pinEntry} onChange={e=>setPinEntry(e.target.value.replace(/\D/g,"").slice(0,4))} inputMode="numeric" maxLength={4} required placeholder="••••"/></Field><Action type="submit">Unlock Passport</Action></form> : <><div className="hc-status">UNLOCKED · DEMO RECORD</div><div className="hc-summary"><span>Patient</span><strong>{active?.name}</strong><span>Medical records</span><strong>Sample record only — no real medical data</strong><span>Medication</span><strong>{patientPlan?.medication || "No care plan recorded"}</strong><span>Vitals</span><strong>{patientPlan?.vitals || "Not recorded"}</strong><span>Care activity</span><strong>{patientPlan?.activity || "Not recorded"}</strong></div><button className="hc-secondary" onClick={()=>setPassportUnlocked(false)}>Lock Passport</button></>}<p className="hc-demo-note">Demo PIN is stored locally and is not encrypted. Do not use real medical data.</p></section>}

      {screen === "patientCarePlan" && <section><h1>Care Plan Details</h1>{patientPlan ? <div className="hc-summary"><span>Medication Schedule</span><strong>{patientPlan.medication||"Not specified"}</strong><span>Vital Signs Monitoring</span><strong>{patientPlan.vitals||"Not specified"}</strong><span>Physical Activity Plan</span><strong>{patientPlan.activity||"Not specified"}</strong><span>Nutrition Guidelines</span><strong>{patientPlan.nutrition||"Not specified"}</strong><span>Upcoming Milestones</span><strong>{patientPlan.milestones||"Not specified"}</strong></div> : <div className="hc-empty">No care plan has been entered for this demo account yet.</div>}<h2>Care Notes</h2>{myNotes.map(n=><div className="hc-record" key={n.id}><span>{new Date(n.createdAt).toLocaleString()}</span><p>{n.text}</p></div>)}<Action onClick={()=>go("patientHome")}>Back to Dashboard</Action></section>}

      {screen === "patientProfile" && <section><h1>My Profile</h1><div className="hc-summary"><span>Full Name</span><strong>{active?.name}</strong><span>Email</span><strong>{active?.email}</strong><span>Phone</span><strong>{active?.phone || "Not linked"}</strong><span>Account ID</span><strong>{active?.id}</strong><span>Account Status</span><strong>{active?.status}</strong></div><Action onClick={()=>go("patientHome")}>Back to Dashboard</Action></section>}

      {screen === "professionalHome" && <section><p className="hc-eyebrow">CLINICAL PROFESSIONAL PORTAL</p><div className="hc-status">CREDENTIAL STATUS: {active?.status || "PENDING REVIEW"}</div><h1>Welcome, {active?.name}</h1><div className="hc-summary"><span>Profession</span><strong>{active?.profession}</strong><span>Modality</span><strong>{active?.modality || "Not applicable"}</strong></div><div className="hc-dashboard-grid">
        <button className="hc-dashboard-card" onClick={()=>go("cases")}><span>▤</span><strong>Open New Cases</strong><small>Review and accept requests</small></button>
        <button className="hc-dashboard-card" onClick={()=>go("ongoing")}><span>♡</span><strong>Ongoing Treatments</strong><small>Patients and care plans</small></button>
        <button className="hc-dashboard-card" onClick={()=>go("verifyRecords")}><span>✓</span><strong>Verify My Records</strong><small>Credential status</small></button>
        <button className="hc-dashboard-card" onClick={()=>go("deployment")}><span>⌖</span><strong>Deployment Hub</strong><small>Deployment checklist</small></button>
      </div><Action onClick={()=>go("urgentReferral")}>Request Urgent Patient Referral <span>✦</span></Action><p className="hc-switch"><button onClick={()=>go("professionalProfile")}>View my profile</button></p><Action secondary onClick={signOut}>Sign Out</Action></section>}

      {screen === "professionalProfile" && <section><h1>Professional Profile</h1><div className="hc-summary"><span>Name</span><strong>{active?.name}</strong><span>Field</span><strong>{active?.field}</strong><span>Profession</span><strong>{active?.profession}</strong><span>Council</span><strong>{active?.authority}</strong><span>Registration number</span><strong>{active?.registration}</strong><span>Status</span><strong>{active?.status}</strong></div><Action onClick={()=>go("professionalHome")}>Back to Dashboard</Action></section>}

      {screen === "cases" && <section><p className="hc-eyebrow">OPEN NEW CASES</p><h1>Available Patient Requests</h1><p className="hc-subtitle">Demo requests from registered patient accounts.</p>{professionalBookings.length===0?<div className="hc-empty">No open cases at the moment.</div>:professionalBookings.map(b=><div className="hc-record" key={b.id}><strong>{b.service}</strong><span>Patient: {b.patientName}</span><span>{b.date} · {b.time}</span><span>{b.address}</span><p>{b.notes}</p><span className="hc-pill">{b.status}</span>{b.status==="REQUESTED"&&<Action onClick={()=>{updateBooking(b.id,{status:"ACCEPTED",assignedTo:active.id});setNotice("Case accepted in demo.");}}>Accept Case</Action>}</div>)}<Action secondary onClick={()=>go("professionalHome")}>Back to Dashboard</Action></section>}

      {screen === "ongoing" && <section><p className="hc-eyebrow">ONGOING TREATMENTS</p><h1>Patient Care Management</h1><Field label="Find a patient"><select value={selectedPatientId} onChange={e=>setSelectedPatientId(e.target.value)}><option value="">Select patient</option>{patients.map(p=><option key={p.id} value={p.id}>{p.name} — {p.phone}</option>)}</select></Field><div className="hc-options"><button className="hc-option" onClick={()=>{setCarePlanForm({medication:"",vitals:"",activity:"",nutrition:"",milestones:""});go("carePlanEditor");}}>Update Care Plan <span className="hc-arrow">›</span></button><button className="hc-option" onClick={()=>{setNoteText("");go("careNoteEditor");}}>Add Care Note <span className="hc-arrow">›</span></button></div><h2>Recent Care Plans</h2>{myCarePlans.map(p=><div className="hc-record" key={p.id}><strong>{p.patientName}</strong><span>Medication: {p.medication||"Not entered"}</span><span>Vitals: {p.vitals||"Not entered"}</span><small>{p.id}</small></div>)}<h2>Recent Notes</h2>{myNotes.map(n=><div className="hc-record" key={n.id}><strong>{n.patientName}</strong><p>{n.text}</p><small>{n.id}</small></div>)}<Action onClick={()=>go("professionalHome")}>Back to Dashboard</Action></section>}

      {screen === "carePlanEditor" && <section><p className="hc-eyebrow">CARE PLAN DETAILS</p><h1>Update Patient Care Plan</h1>{!selectedPatientId&&<p className="hc-message">Select a patient on the previous screen first.</p>}<form className="hc-form" onSubmit={saveCarePlan}><Field label="Medication Schedule"><textarea rows="2" value={carePlanForm.medication} onChange={e=>setCarePlanForm(p=>({...p,medication:e.target.value}))} required placeholder="Medication and timing"/></Field><Field label="Vital Signs Monitoring"><textarea rows="2" value={carePlanForm.vitals} onChange={e=>setCarePlanForm(p=>({...p,vitals:e.target.value}))} placeholder="BP, pulse, temperature"/></Field><Field label="Physical Activity Plan"><textarea rows="2" value={carePlanForm.activity} onChange={e=>setCarePlanForm(p=>({...p,activity:e.target.value}))} placeholder="Activity and frequency"/></Field><Field label="Nutrition Guidelines"><textarea rows="2" value={carePlanForm.nutrition} onChange={e=>setCarePlanForm(p=>({...p,nutrition:e.target.value}))} placeholder="Diet and hydration"/></Field><Field label="Upcoming Milestones"><textarea rows="2" value={carePlanForm.milestones} onChange={e=>setCarePlanForm(p=>({...p,milestones:e.target.value}))} placeholder="Follow-up dates and goals"/></Field><Action type="submit">Save Care Plan</Action></form></section>}

      {screen === "careNoteEditor" && <section><p className="hc-eyebrow">CARE NOTES</p><h1>Document Care Observations</h1><Field label="Patient"><select value={selectedPatientId} onChange={e=>setSelectedPatientId(e.target.value)}><option value="">Select patient</option>{patients.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}</select></Field><form className="hc-form" onSubmit={saveCareNote}><Field label="Care note"><textarea rows="6" value={noteText} onChange={e=>setNoteText(e.target.value)} required placeholder="Medication observations, activity changes, dietary notes, reviewer feedback..."/></Field><Action type="submit">Submit Care Note</Action></form></section>}

      {screen === "verifyRecords" && <section><p className="hc-eyebrow">VERIFY RECORDS</p><h1>Professional Verification Checklist</h1><div className="hc-record"><span>1. Identity and CNIC submitted</span><span className="hc-pill">DEMO · NOT VERIFIED</span></div><div className="hc-record"><span>2. Council registration number</span><strong>{active?.registration || "Not provided"}</strong></div><div className="hc-record"><span>3. Council affiliation</span><strong>{active?.authority || "Not provided"}</strong></div><div className="hc-record"><span>4. Professional profile</span><strong>{active?.status || "PENDING REVIEW"}</strong></div><p className="hc-demo-note">The app does not contact PNMC, PMDC, or any regulator. A real admin review is required.</p><Action onClick={()=>go("professionalProfile")}>View Profile</Action></section>}

      {screen === "deployment" && <section><p className="hc-eyebrow">CARE DEPLOYMENT HUB</p><h1>Deployment Checklist</h1><p className="hc-subtitle">Choose a patient and confirm the demo deployment parameters.</p><Field label="Patient"><select value={selectedPatientId} onChange={e=>setSelectedPatientId(e.target.value)}><option value="">Select patient</option>{patients.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}</select></Field><div className="hc-checklist">{["Identity reviewed","Care plan reviewed","Address confirmed","Schedule confirmed","Data security terms acknowledged"].map((x,i)=><label key={x}><input type="checkbox" defaultChecked={i<2}/><span>{x}</span></label>)}</div><Action onClick={()=>go("deploymentConfirm")}>Process Deployment Request</Action></section>}

      {screen === "deploymentConfirm" && <section><p className="hc-eyebrow">DEPLOYMENT CONFIRMATION</p><h1>Confirm Deployment</h1><form className="hc-form" onSubmit={e=>{e.preventDefault();if(!deployForm.security)return setError("Acknowledge demo security terms.");setBookings(old=>old.map(b=>b.patientId===selectedPatientId?{...b,status:"DEPLOYMENT REVIEW"}:b));go("deployment");setNotice("Deployment review status saved in demo.");}}><Field label="Deployer ID"><input value={deployForm.deployerId} onChange={e=>setDeployForm(p=>({...p,deployerId:e.target.value}))} required placeholder="Professional ID"/></Field><Field label="Access Code"><input value={deployForm.accessCode} onChange={e=>setDeployForm(p=>({...p,accessCode:e.target.value}))} required placeholder="Demo access code"/></Field><Field label="Deployment Time"><input type="datetime-local" value={deployForm.time} onChange={e=>setDeployForm(p=>({...p,time:e.target.value}))} required/></Field><Field label="Deployment Address"><input value={deployForm.address} onChange={e=>setDeployForm(p=>({...p,address:e.target.value}))} required/></Field><label className="hc-terms"><input type="checkbox" checked={deployForm.security} onChange={e=>setDeployForm(p=>({...p,security:e.target.checked}))}/><span>I acknowledge the demo medical data security terms.</span></label><Action type="submit">Confirm Deployment</Action></form></section>}

      {screen === "urgentReferral" && <section><p className="hc-eyebrow">URGENT PATIENT REFERRAL · DEMO</p><h1>Request Urgent Patient Referral</h1><form className="hc-form" onSubmit={createReferral}><Field label="Patient"><select value={selectedPatientId} onChange={e=>setSelectedPatientId(e.target.value)} required><option value="">Select patient</option>{patients.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}</select></Field><Field label="Urgency"><select name="urgency" required><option>Urgent</option><option>High</option><option>Routine</option></select></Field><Field label="Reason / Notes"><textarea name="reason" rows="4" required placeholder="Describe the referral reason"/></Field><Action type="submit">Submit Demo Referral</Action></form><p className="hc-demo-note">This only saves a demo record. For a real emergency in Pakistan, call local emergency services; this button does not contact them.</p></section>}

      {screen === "adminHome" && <section><p className="hc-eyebrow">ADMIN DASHBOARD · DEMO</p><h1>HomiGo Care Administration</h1><div className="hc-dashboard-grid"><button className="hc-dashboard-card" onClick={()=>go("adminPatients")}><span>♙</span><strong>Patients</strong><small>{patients.length} registered</small></button><button className="hc-dashboard-card" onClick={()=>go("adminProfessionals")}><span>✓</span><strong>Professionals</strong><small>{accounts.filter(a=>a.role==="PROFESSIONAL").length} profiles</small></button><button className="hc-dashboard-card" onClick={()=>go("adminBookings")}><span>◷</span><strong>Bookings</strong><small>{bookings.length} requests</small></button><button className="hc-dashboard-card" onClick={()=>go("adminReferrals")}><span>!</span><strong>Urgent Referrals</strong><small>{referrals.filter(r=>r.status==="OPEN").length} open</small></button></div><Action onClick={signOut}>Sign Out</Action></section>}

      {screen === "adminPatients" && <section><h1>Patient Directory</h1><Field label="Search patient"><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Name, email or phone"/></Field>{filteredPatients.map(p=><div className="hc-record" key={p.id}><strong>{p.name}</strong><span>{p.email}</span><span>{p.phone}</span><small>{p.id}</small></div>)}<Action onClick={()=>go("adminHome")}>Back to Admin</Action></section>}

      {screen === "adminProfessionals" && <section><h1>Professional Review Queue</h1>{accounts.filter(a=>a.role==="PROFESSIONAL").map(p=><div className="hc-record" key={p.id}><strong>{p.name} · {p.profession}</strong><span>{p.authority}</span><span>Registration: {p.registration}</span><span className="hc-pill">{p.status}</span><div className="hc-inline-actions"><button className="hc-secondary" onClick={()=>setAccounts(old=>old.map(a=>a.id===p.id?{...a,status:"APPROVED · DEMO"}:a))}>Approve Demo</button><button className="hc-secondary" onClick={()=>setAccounts(old=>old.map(a=>a.id===p.id?{...a,status:"REJECTED · DEMO"}:a))}>Reject Demo</button></div></div>)}<Action onClick={()=>go("adminHome")}>Back to Admin</Action></section>}

      {screen === "adminBookings" && <section><h1>All Bookings</h1>{bookings.map(b=><div className="hc-record" key={b.id}><strong>{b.service}</strong><span>Patient: {b.patientName}</span><span>{b.date} · {b.time}</span><span className="hc-pill">{b.status}</span><div className="hc-inline-actions"><button className="hc-secondary" onClick={()=>updateBooking(b.id,{status:"CONFIRMED"})}>Confirm</button><button className="hc-secondary" onClick={()=>updateBooking(b.id,{status:"COMPLETED"})}>Complete</button><button className="hc-secondary" onClick={()=>updateBooking(b.id,{status:"CANCELLED"})}>Cancel</button></div></div>)}<Action onClick={()=>go("adminHome")}>Back to Admin</Action></section>}

      {screen === "adminReferrals" && <section><h1>Urgent Referral Queue</h1>{referrals.length===0?<div className="hc-empty">No demo referrals.</div>:referrals.map(r=><div className="hc-record" key={r.id}><strong>{r.patientName} · {r.urgency}</strong><p>{r.reason}</p><span className="hc-pill">{r.status}</span><div className="hc-inline-actions"><button className="hc-secondary" onClick={()=>updateReferral(r.id,"ACKNOWLEDGED · DEMO")}>Acknowledge</button><button className="hc-secondary" onClick={()=>updateReferral(r.id,"CLOSED · DEMO")}>Close</button></div></div>)}<Action onClick={()=>go("adminHome")}>Back to Admin</Action></section>}

      {error && <div className="hc-message" role="alert">{error}</div>}
      {notice && <div className="hc-demo-note" role="status">{notice}</div>}
    </div>
    <footer className="hc-footer">HomiGo Care · Because Care Begins at Home · Demo prototype</footer>
  </section></main>;
}
