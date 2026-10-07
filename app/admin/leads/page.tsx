"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

// ======================================================
// TYPES
// ======================================================

type Lead = {
id: number;
fullName: string;
phone: string;
email: string | null;
eventType: string;
eventDate: string | null;
guests: number | null;
services: string | null;
notes: string | null;
status: string;
createdAt: string;
};

type ServiceItem = {
id: string;
name: string;
amount: string;
};

type NewClientForm = {
fullName: string;
phone: string;
email: string;
eventType: string;
eventDate: string;
guests: string;
notes: string;
paymentStatus: string;
paymentMethod: string;
paidAmount: string;
services: ServiceItem[];
};

// ======================================================
// SERVICES - MAESTRO EVENTS
// ======================================================

const MAESTRO_SERVICES = [
"בר אקטיבי",
"עמדת תדלוק",
"צילום מגנטים",
"בלוקים",
"צילום סטילס",
"צילום וידאו",
"קיר זכוכית",
"זיקוקים קרים",
"חבילת סלואו",
"בלונים הליום",
"קיאק פירות",
"תותחי עשן",
"DJ",
];

// ======================================================
// HELPERS
// ======================================================

const formatDate = (value: string | null) => {
if (!value) return "לא צוין";

const date = new Date(value);

if (Number.isNaN(date.getTime())) {
return "לא צוין";
}

return date.toLocaleDateString("he-IL", {
day: "2-digit",
month: "2-digit",
year: "numeric",
});
};

const formatDateTime = (value: string) => {
const date = new Date(value);

if (Number.isNaN(date.getTime())) {
return "לא צוין";
}

return date.toLocaleString("he-IL", {
day: "2-digit",
month: "2-digit",
year: "numeric",
hour: "2-digit",
minute: "2-digit",
});
};

const statusStyle = (status: string) => {
switch (status) {
case "חדש":
return "bg-blue-500/10 text-blue-400 border-blue-500/30";

case "בטיפול":
return "bg-yellow-500/10 text-yellow-400 border-yellow-500/30";

case "נסגר":
return "bg-green-500/10 text-green-400 border-green-500/30";

case "בוטל":
return "bg-red-500/10 text-red-400 border-red-500/30";

default:
return "bg-gray-500/10 text-gray-400 border-gray-500/30";
}
};

// ======================================================
// PAGE
// ======================================================

export default function LeadsPage() {
const [leads, setLeads] = useState<Lead[]>([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState("");
const [search, setSearch] = useState("");

const [selectedLead, setSelectedLead] =
useState<Lead | null>(null);

const [sourceLead, setSourceLead] =
  useState<Lead | null>(null);

const [updatingStatus, setUpdatingStatus] =
useState(false);

// ======================================================
// NEW CLIENT MODAL
// ======================================================

const [showNewClient, setShowNewClient] =
useState(false);

const [savingClient, setSavingClient] =
useState(false);

const [clientSuccess, setClientSuccess] =
useState("");

const [clientError, setClientError] =
useState("");

const [newClient, setNewClient] =
useState<NewClientForm>({
fullName: "",
phone: "",
email: "",
eventType: "",
eventDate: "",
guests: "",
notes: "",
paymentStatus: "לא שולם",
paymentMethod: "",
paidAmount: "",
services: [],
});

// ======================================================
// LOAD LEADS
// ======================================================

const loadLeads = async () => {
try {
setLoading(true);
setError("");

const response = await fetch("/api/leads", {
cache: "no-store",
});

if (!response.ok) {
throw new Error("Failed to load leads");
}

const data: Lead[] = await response.json();

setLeads(data);

setSelectedLead((current) => {
if (!current) return null;

const updated = data.find(
(lead) => lead.id === current.id
);

return updated || current;
});
} catch (error) {
console.error(
"שגיאה בטעינת הפניות:",
error
);

setError(
"אירעה שגיאה בטעינת הפניות. נסה לרענן את העמוד."
);
} finally {
setLoading(false);
}
};

useEffect(() => {
loadLeads();
}, []);

// ======================================================
// UPDATE STATUS
// ======================================================

const updateLeadStatus = async (
  lead: Lead,
  newStatus: string
) => {
  try {
    console.log("================================");
    console.log("🔄 UPDATING LEAD STATUS");
    console.log("LEAD:", lead);
    console.log("LEAD ID:", lead.id);
    console.log("NEW STATUS:", newStatus);
    console.log("================================");

    setUpdatingStatus(true);
    setError("");

    const response = await fetch(`/api/leads/${lead.id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        status: newStatus,
      }),
    });

    const responseText = await response.text();

    console.log("================================");
    console.log("📡 PATCH RESPONSE");
    console.log("STATUS:", response.status);
    console.log("OK:", response.ok);
    console.log("BODY:", responseText);
    console.log("================================");

    if (!response.ok) {
      throw new Error(
        responseText || "Failed to update lead status"
      );
    }

    const updatedLead: Lead = JSON.parse(responseText);

    setLeads((currentLeads) =>
      currentLeads.map((item) =>
        item.id === updatedLead.id
          ? updatedLead
          : item
      )
    );

    setSelectedLead(updatedLead);

    console.log("✅ LEAD STATUS UPDATED SUCCESSFULLY");

    return updatedLead;
  } catch (error) {
    console.error("================================");
    console.error("❌ LEAD STATUS UPDATE ERROR");
    console.error(error);
    console.error("================================");

    setError(
      error instanceof Error
        ? error.message
        : "לא הצלחנו לעדכן את סטטוס הליד"
    );

    throw error;
  } finally {
    setUpdatingStatus(false);
  }
};

// ======================================================
// CLOSE LEAD
// ======================================================

const handleCloseLead = async () => {
if (!selectedLead) return;

const confirmed = window.confirm(
`האם אתה בטוח שברצונך לסגור את הפנייה של ${selectedLead.fullName}?`
);

if (!confirmed) return;

await updateLeadStatus(
selectedLead,
"נסגר"
);
};

// ======================================================
// REOPEN LEAD
// ======================================================

const handleReopenLead = async () => {
if (!selectedLead) return;

await updateLeadStatus(
selectedLead,
"בטיפול"
);
};

// ======================================================
// OPEN NEW CLIENT
// ======================================================

const openNewClient = () => {
if (!selectedLead) return;

setSourceLead(selectedLead);

setClientError("");
setClientSuccess("");


// --------------------------------------------------
// העתקת השירותים הקיימים מהפנייה
// --------------------------------------------------

let services: ServiceItem[] = [];

if (selectedLead.services) {
const rawServices =
selectedLead.services
.split(",")
.map((item) => item.trim())
.filter(Boolean);

services = rawServices.map(
(service, index) => ({
id: `${Date.now()}-${index}`,
name: service,
amount: "",
})
);
}

setNewClient({
fullName: selectedLead.fullName || "",
phone: selectedLead.phone || "",
email: selectedLead.email || "",
eventType:
selectedLead.eventType || "",
eventDate:
selectedLead.eventDate
? selectedLead.eventDate.substring(
0,
10
)
: "",
guests:
selectedLead.guests
? String(selectedLead.guests)
: "",
notes:
selectedLead.notes || "",
paymentStatus: "לא שולם",
paymentMethod: "",
paidAmount: "",
services,
});

setShowNewClient(true);
};

// ======================================================
// ADD SERVICE
// ======================================================

const addService = () => {
setNewClient((current) => ({
...current,
services: [
...current.services,
{
id: `${Date.now()}-${Math.random()}`,
name: "",
amount: "",
},
],
}));
};

// ======================================================
// REMOVE SERVICE
// ======================================================

const removeService = (id: string) => {
setNewClient((current) => ({
...current,
services:
current.services.filter(
(service) => service.id !== id
),
}));
};

// ======================================================
// UPDATE SERVICE
// ======================================================

const updateService = (
id: string,
field: "name" | "amount",
value: string
) => {
setNewClient((current) => ({
...current,
services:
current.services.map((service) =>
service.id === id
? {
...service,
[field]: value,
}
: service
),
}));
};

// ======================================================
// TOTAL
// ======================================================

const totalAmount = useMemo(() => {
return newClient.services.reduce(
(total, service) => {
const amount =
Number(service.amount) || 0;

return total + amount;
},
0
);
}, [newClient.services]);

const paidAmount =
Number(newClient.paidAmount) || 0;

const remainingAmount =
Math.max(
totalAmount - paidAmount,
0
);

// ======================================================
// SAVE CLIENT
// ======================================================

const saveNewClient = async () => {
setClientError("");
setClientSuccess("");

if (!newClient.fullName.trim()) {
setClientError(
"יש להזין שם לקוח."
);
return;
}

if (!newClient.phone.trim()) {
setClientError(
"יש להזין מספר טלפון."
);
return;
}

if (!newClient.eventType.trim()) {
setClientError(
"יש להזין סוג אירוע."
);
return;
}

// --------------------------------------------------
// ניקוי שירותים ריקים
// --------------------------------------------------

const cleanServices =
newClient.services.filter(
(service) =>
service.name.trim() !== ""
);

// --------------------------------------------------
// יצירת טקסט שירותים
// --------------------------------------------------

const servicesText =
cleanServices.length > 0
? cleanServices
.map((service) => {
const amount =
Number(service.amount) || 0;

return `${service.name} - ₪${amount.toLocaleString(
"he-IL"
)}`;
})
.join(", ")
: "";

try {
setSavingClient(true);

const response = await fetch(
"/api/testimonials/clients",
{
method: "POST",
headers: {
"Content-Type": "application/json",
},
body: JSON.stringify({
name:
newClient.fullName.trim(),
 
phone:
newClient.phone.trim(),

email:
newClient.email.trim() ||
null,

eventType:
newClient.eventType.trim(),

eventDate:
newClient.eventDate ||
null,

guests:
newClient.guests
? Number(newClient.guests)
: null,

services:
servicesText || null,

notes:
newClient.notes.trim() ||
null,

status: "פעיל",

paymentStatus:
newClient.paymentStatus,

paymentMethod:
newClient.paymentMethod ||
null,

totalAmount,

paidAmount,

remainingAmount,

serviceItems:
cleanServices,

sourceLeadId:
selectedLead?.id || null,
}),
}
);

// --------------------------------------------------
// קבלת הודעת שגיאה מהשרת
// --------------------------------------------------

if (!response.ok) {
let serverMessage =
"לא הצלחנו לשמור את הלקוח.";

try {
const errorData =
await response.json();

if (
errorData?.error
) {
serverMessage =
errorData.error;
}

if (
errorData?.message
) {
serverMessage =
errorData.message;
}
} catch {
// אין JSON מהשרת
}

throw new Error(
serverMessage
);
}

// --------------------------------------------------
// הצלחה
// --------------------------------------------------

await response.json();

setClientSuccess(
"✓ הלקוח נשמר בהצלחה ונוסף למערכת הלקוחות."
);

// --------------------------------------------------
// אם זו פנייה - מעדכנים אותה
// --------------------------------------------------

if (selectedLead) {
try {
await updateLeadStatus(
selectedLead,
"בטיפול"
);
} catch {
// הלקוח כבר נשמר, לכן לא מבטלים את ההצלחה
}
}

// --------------------------------------------------
// סגירת חלון לאחר רגע
// --------------------------------------------------

setTimeout(() => {
setShowNewClient(false);
setClientSuccess("");
}, 1200);
} catch (error) {
console.error(
"שגיאה בשמירת לקוח:",
error
);

setClientError(
error instanceof Error
? error.message
: "אירעה שגיאה בשמירת הלקוח."
);
} finally {
setSavingClient(false);
}
};

// ======================================================
// SEARCH
// ======================================================

const filteredLeads = useMemo(() => {
const query =
search.trim().toLowerCase();

if (!query) {
return leads;
}

return leads.filter((lead) => {
return (
lead.fullName
?.toLowerCase()
.includes(query) ||
lead.phone
?.toLowerCase()
.includes(query) ||
lead.email
?.toLowerCase()
.includes(query) ||
lead.eventType
?.toLowerCase()
.includes(query) ||
lead.services
?.toLowerCase()
.includes(query) ||
lead.notes
?.toLowerCase()
.includes(query)
);
});
}, [leads, search]);

// ======================================================
// STATS
// ======================================================

const newLeadsCount =
leads.filter(
(lead) =>
lead.status === "חדש"
).length;

const inProgressLeadsCount =
leads.filter(
(lead) =>
lead.status === "בטיפול"
).length;

const closedLeadsCount =
leads.filter(
(lead) =>
lead.status === "נסגר"
).length;

const todayLeadsCount =
leads.filter((lead) => {
const created =
new Date(lead.createdAt);

const today = new Date();

return (
created.getDate() ===
today.getDate() &&
created.getMonth() ===
today.getMonth() &&
created.getFullYear() ===
today.getFullYear()
);
}).length;

// ======================================================
// RETURN
// ======================================================

return (
<main
dir="rtl"
className="
min-h-screen
bg-[#090909]
text-white
p-4
md:p-6
pt-24
md:pt-28
"
>

{/* ==================================================
HEADER
================================================== */}

<div
className="
flex
flex-col
md:flex-row
md:items-center
md:justify-between
gap-5
mb-8
"
>

<div>

<p
className="
text-[#D4AF37]
text-sm
tracking-[0.3em]
mb-2
"
>
MAESTRO EVENTS
</p>

<h1 className="text-3xl md:text-4xl font-bold">
פניות מהאתר
</h1>

<p className="text-gray-500 mt-2">
ניהול פניות, לקוחות ואירועים
</p>

</div>

<Link
href="/admin/dashboard"
className="
inline-flex
items-center
justify-center
border
border-[#D4AF37]
text-[#D4AF37]
px-5
py-3
rounded-xl
font-semibold
hover:bg-[#D4AF37]
hover:text-black
transition
"
>
← חזרה לדאשבורד
</Link>

</div>

{/* ==================================================
STATS
================================================== */}

<div
className="
grid
grid-cols-2
lg:grid-cols-5
gap-3
mb-6
"
>

<div className="bg-[#111] border border-[#292929] rounded-2xl p-4">
<p className="text-gray-500 text-sm mb-2">
📞 סה״כ פניות
</p>

<p className="text-3xl font-bold text-[#D4AF37]">
{leads.length}
</p>
</div>

<div className="bg-[#111] border border-blue-500/20 rounded-2xl p-4">
<p className="text-gray-500 text-sm mb-2">
🆕 חדשות
</p>

<p className="text-3xl font-bold text-blue-400">
{newLeadsCount}
</p>
</div>

<div className="bg-[#111] border border-yellow-500/20 rounded-2xl p-4">
<p className="text-gray-500 text-sm mb-2">
🔄 בטיפול
</p>

<p className="text-3xl font-bold text-yellow-400">
{inProgressLeadsCount}
</p>
</div>

<div className="bg-[#111] border border-green-500/20 rounded-2xl p-4">
<p className="text-gray-500 text-sm mb-2">
✅ נסגרו
</p>

<p className="text-3xl font-bold text-green-400">
{closedLeadsCount}
</p>
</div>

<div className="bg-[#111] border border-[#292929] rounded-2xl p-4">
<p className="text-gray-500 text-sm mb-2">
📅 היום
</p>

<p className="text-3xl font-bold text-[#D4AF37]">
{todayLeadsCount}
</p>
</div>

</div>

{/* ==================================================
SEARCH
================================================== */}

<div
className="
bg-[#111]
border
border-[#292929]
rounded-2xl
p-4
mb-6
"
>

<div className="flex flex-col md:flex-row gap-3">

<div className="flex-1 relative">

<span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">
🔎
</span>

<input
type="text"
value={search}
onChange={(event) =>
setSearch(
event.target.value
)
}
placeholder="חיפוש לקוח, טלפון, אירוע..."
className="
w-full
bg-[#0b0b0b]
border
border-[#292929]
rounded-xl
py-3
pr-12
pl-4
text-white
outline-none
focus:border-[#D4AF37]
"
/>

</div>

<button
onClick={loadLeads}
disabled={loading}
className="
border
border-[#D4AF37]
text-[#D4AF37]
px-6
py-3
rounded-xl
font-semibold
hover:bg-[#D4AF37]
hover:text-black
transition
disabled:opacity-50
"
>
🔄 רענון
</button>

</div>

</div>

{/* ==================================================
ERROR
================================================== */}

{error && (
<div className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl p-4 mb-6">
{error}
</div>
)}

{/* ==================================================
LOADING
================================================== */}

{loading ? (

<div className="bg-[#111] border border-[#292929] rounded-2xl p-16 text-center">
<div className="text-5xl mb-4">
⏳
</div>

<p className="text-gray-400">
טוען את הפניות...
</p>
</div>

) : filteredLeads.length === 0 ? (

<div className="bg-[#111] border border-[#292929] rounded-2xl p-16 text-center">

<div className="text-5xl mb-4">
📭
</div>

<h2 className="text-2xl font-bold mb-2">
{search
? "לא נמצאו פניות"
: "עדיין אין פניות"}
</h2>

<p className="text-gray-500">
{search
? "נסה חיפוש אחר."
: "כאשר לקוח ישאיר פרטים באתר, הפנייה תופיע כאן."}
</p>

</div>

) : (

<div className="bg-[#111] border border-[#292929] rounded-2xl overflow-hidden">

{/* TABLE HEADER */}

<div
className="
hidden
lg:grid
lg:grid-cols-7
gap-4
p-4
border-b
border-[#292929]
text-gray-500
text-sm
font-semibold
"
>
<div>לקוח</div>
<div>טלפון</div>
<div>אירוע</div>
<div>תאריך</div>
<div>מוזמנים</div>
<div>סטטוס</div>
<div>פעולה</div>
</div>

{filteredLeads.map((lead) => (

<div
key={lead.id}
className="
border-b
border-[#292929]
last:border-b-0
p-4
hover:bg-[#151515]
transition
"
>

{/* DESKTOP */}

<div
className="
hidden
lg:grid
lg:grid-cols-7
gap-4
items-center
"
>

<div>
<p className="font-bold">
{lead.fullName}
</p>

{lead.email && (
<p className="text-gray-500 text-xs mt-1 truncate">
{lead.email}
</p>
)}
</div>

<a
href={`tel:${lead.phone}`}
className="text-[#D4AF37] hover:underline"
>
{lead.phone}
</a>

<div>
<p className="text-gray-300">
{lead.eventType}
</p>

{lead.services && (
<p className="text-gray-600 text-xs mt-1 truncate">
{lead.services}
</p>
)}
</div>

<div className="text-gray-400">
{formatDate(
lead.eventDate
)}
</div>

<div className="text-gray-400">
{lead.guests
? `${lead.guests} איש`
: "לא צוין"}
</div>

<div>
<span
className={`
inline-flex
items-center
px-3
py-1
rounded-full
border
text-xs
font-semibold
${statusStyle(
lead.status
)}
`}
>
{lead.status}
</span>
</div>

<button
onClick={() =>
setSelectedLead(
lead
)
}
className="
border
border-[#D4AF37]
text-[#D4AF37]
px-4
py-2
rounded-lg
text-sm
hover:bg-[#D4AF37]
hover:text-black
transition
"
>
פרטים
</button>

</div>

{/* MOBILE */}

<div className="lg:hidden">

<div className="flex items-start justify-between gap-4 mb-4">

<div>
<h2 className="text-xl font-bold">
{lead.fullName}
</h2>

<p className="text-gray-500 mt-1">
{lead.eventType}
</p>
</div>

<span
className={`
shrink-0
inline-flex
px-3
py-1
rounded-full
border
text-xs
font-semibold
${statusStyle(
lead.status
)}
`}
>
{lead.status}
</span>

</div>

<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

<a
href={`tel:${lead.phone}`}
className="
bg-[#0b0b0b]
border
border-[#292929]
rounded-xl
p-4
text-[#D4AF37]
"
>
📞 {lead.phone}
</a>

<div className="bg-[#0b0b0b] border border-[#292929] rounded-xl p-4 text-gray-400">
📅{" "}
{formatDate(
lead.eventDate
)}
</div>

<div className="bg-[#0b0b0b] border border-[#292929] rounded-xl p-4 text-gray-400">
👥{" "}
{lead.guests
? `${lead.guests} מוזמנים`
: "לא צוין"}
</div>

</div>

<button
onClick={() =>
setSelectedLead(
lead
)
}
className="
w-full
mt-4
border
border-[#D4AF37]
text-[#D4AF37]
py-3
rounded-xl
font-semibold
hover:bg-[#D4AF37]
hover:text-black
transition
"
>
צפייה בפרטי הפנייה
</button>

</div>

</div>

))}

</div>

)}

{/* ==================================================
LEAD MODAL
================================================== */}

{selectedLead && (

<div
className="
fixed
inset-0
z-[9999]
bg-black/85
backdrop-blur-sm
flex
items-center
justify-center
p-4
md:p-6
"
>

<div
  dir="rtl"
  className="
  w-full
  max-w-[1150px]
  max-h-[calc(100vh-110px)]
  overflow-y-auto
  bg-[#111]
  border
  border-[#D4AF37]/50
  rounded-3xl
  shadow-[0_0_70px_rgba(0,0,0,0.8)]
  "

>

{/* HEADER */}

<div
className="
sticky
top-0
z-20
bg-[#111]
p-5
md:p-6
border-b
border-[#292929]
flex
items-center
justify-between
gap-4
"
>

<div>

<p className="text-[#D4AF37] text-sm">
פנייה #{selectedLead.id}
</p>

<h2 className="text-2xl md:text-3xl font-bold">
{selectedLead.fullName}
</h2>

<p className="text-gray-500 text-sm mt-1">
התקבלה{" "}
{formatDateTime(
selectedLead.createdAt
)}
</p>

</div>

<button
onClick={() =>
setSelectedLead(null)
}
className="
w-10
h-10
rounded-xl
border
border-[#292929]
text-gray-400
hover:text-white
hover:border-red-500
transition
"
>
✕
</button>

</div>

<div className="p-5 md:p-6 space-y-5">

{/* STATUS + NEW CLIENT */}

<div
className="
bg-[#0b0b0b]
border
border-[#292929]
rounded-2xl
p-4
"
>

<div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

<div>

<p className="text-gray-500 text-sm mb-2">
סטטוס הפנייה
</p>

<span
className={`
inline-flex
px-4
py-2
rounded-full
border
text-sm
font-semibold
${statusStyle(
selectedLead.status
)}
`}
>
{selectedLead.status}
</span>

</div>

<div className="flex flex-wrap gap-3">

<button
onClick={
openNewClient
}
className="
bg-[#D4AF37]
text-black
font-bold
px-5
py-3
rounded-xl
hover:bg-[#c89d24]
transition
"
>
👤 הקמת לקוח חדש
</button>

{selectedLead.status !==
"נסגר" ? (

<button
onClick={
handleCloseLead
}
disabled={
updatingStatus
}
className="
bg-green-500
text-black
font-bold
px-5
py-3
rounded-xl
hover:bg-green-400
transition
disabled:opacity-50
"
>
{updatingStatus
? "סוגר..."
: "✓ סגירת פנייה"}
</button>

) : (

<button
onClick={
handleReopenLead
}
disabled={
updatingStatus
}
className="
border
border-yellow-500/50
text-yellow-400
font-semibold
px-5
py-3
rounded-xl
hover:bg-yellow-500
hover:text-black
transition
"
>
↩ פתיחת פנייה מחדש
</button>

)}

</div>

</div>

</div>

{/* CONTACT + EVENT */}

<div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">

<div className="bg-[#0b0b0b] border border-[#292929] rounded-xl p-4">

<p className="text-[#D4AF37] text-xs mb-2">
טלפון
</p>

<a
href={`tel:${selectedLead.phone}`}
className="text-lg font-semibold text-[#D4AF37]"
>
📞 {selectedLead.phone}
</a>

</div>

<div className="bg-[#0b0b0b] border border-[#292929] rounded-xl p-4">

<p className="text-[#D4AF37] text-xs mb-2">
אימייל
</p>

<p className="font-semibold break-all">
{selectedLead.email ||
"לא צוין"}
</p>

</div>

<div className="bg-[#0b0b0b] border border-[#292929] rounded-xl p-4">

<p className="text-[#D4AF37] text-xs mb-2">
סוג אירוע
</p>

<p className="font-semibold">
{selectedLead.eventType}
</p>

</div>

<div className="bg-[#0b0b0b] border border-[#292929] rounded-xl p-4">

<p className="text-[#D4AF37] text-xs mb-2">
תאריך האירוע
</p>

<p className="font-semibold">
{formatDate(
selectedLead.eventDate
)}
</p>

</div>

<div className="bg-[#0b0b0b] border border-[#292929] rounded-xl p-4">

<p className="text-[#D4AF37] text-xs mb-2">
מוזמנים
</p>

<p className="font-semibold">
{selectedLead.guests
? `${selectedLead.guests} איש`
: "לא צוין"}
</p>

</div>

</div>

{/* SERVICES */}

<div>

<h3 className="text-[#D4AF37] text-sm mb-2">
שירותים שביקש הלקוח
</h3>

<div className="bg-[#0b0b0b] border border-[#292929] rounded-xl p-4 text-gray-300">
{selectedLead.services ||
"הלקוח לא ציין שירותים."}
</div>

</div>

{/* NOTES */}

<div>

<h3 className="text-[#D4AF37] text-sm mb-2">
הערות
</h3>

<div className="bg-[#0b0b0b] border border-[#292929] rounded-xl p-4 text-gray-300 whitespace-pre-wrap">
{selectedLead.notes ||
"אין הערות."}
</div>

</div>

</div>

{/* FOOTER */}

<div
className="
sticky
bottom-0
bg-[#111]
p-4
border-t
border-[#292929]
flex
flex-col
md:flex-row
gap-3
"
>

<a
href={`tel:${selectedLead.phone}`}
className="
flex-1
text-center
bg-[#D4AF37]
text-black
font-bold
py-3
rounded-xl
"
>
📞 התקשר
</a>

<a
href={`https://wa.me/${selectedLead.phone.replace(
/[^0-9]/g,
""
)}`}
target="_blank"
rel="noopener noreferrer"
className="
flex-1
text-center
border
border-green-500/50
text-green-400
font-semibold
py-3
rounded-xl
hover:bg-green-500
hover:text-white
transition
"
>
💬 WhatsApp
</a>

<button
onClick={() =>
setSelectedLead(null)
}
className="
flex-1
border
border-[#292929]
text-gray-400
py-3
rounded-xl
"
>
סגירה
</button>

</div>

</div>

</div>

)}

{/* ==================================================
NEW CLIENT MODAL
================================================== */}

{showNewClient && (

<div
className="
fixed
inset-0
z-[9999]
bg-black/90
backdrop-blur-sm
flex
items-start
justify-center
p-3
md:p-4
pt-[75px]
md:pt-[82px]
"
onClick={() =>
!savingClient &&
setShowNewClient(false)
}
>

<div
dir="rtl"
className="
w-[calc(100vw-60px)]
max-w-none
h-[calc(100vh-120px)]
max-h-none
overflow-y-auto
bg-[#111]
border
border-[#D4AF37]/50
rounded-3xl
shadow-[0_0_70px_rgba(0,0,0,0.8)]
"
onClick={(event) =>
event.stopPropagation()
}
>

{/* NEW CLIENT HEADER */}

<div
className="
sticky
top-0
z-30
bg-[#111]
border-b
border-[#292929]
p-5
md:p-6
flex
items-center
justify-between
"
>

<div>

<p className="text-[#D4AF37] text-sm mb-1">
MAESTRO EVENTS
</p>

<h2 className="text-2xl md:text-3xl font-bold">
הקמת לקוח חדש
</h2>

<p className="text-gray-500 text-sm mt-1">
פרטי הפנייה הועברו אוטומטית
</p>

</div>

<button
onClick={() =>
!savingClient &&
setShowNewClient(false)
}
className="
w-10
h-10
rounded-xl
border
border-[#292929]
text-gray-400
hover:text-white
hover:border-red-500
"
>
✕
</button>

</div>

<div className="p-4 md:p-5 space-y-4">

{/* SUCCESS */}

{clientSuccess && (
<div className="bg-green-500/10 border border-green-500/30 text-green-400 rounded-xl p-4 font-semibold">
{clientSuccess}
</div>
)}

{/* ERROR */}

{clientError && (
<div className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl p-4 font-semibold">
{clientError}
</div>
)}

{/* =========================================
CLIENT DETAILS
========================================= */}

<section>

<h3 className="text-[#D4AF37] font-bold text-sm mb-2">
פרטי לקוח
</h3>

<div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">

<div>
<label className="text-gray-500 text-xs block mb-2">
שם מלא *
</label>

<input
value={
newClient.fullName
}
onChange={(e) =>
setNewClient(
(current) => ({
...current,
fullName:
e.target.value,
})
)
}
className="
w-full
bg-[#0b0b0b]
border
border-[#292929]
rounded-xl
p-3
outline-none
focus:border-[#D4AF37]
"
/>
</div>

<div>
<label className="text-gray-500 text-xs block mb-2">
טלפון *
</label>

<input
value={
newClient.phone
}
onChange={(e) =>
setNewClient(
(current) => ({
...current,
phone:
e.target.value,
})
)
}
className="
w-full
bg-[#0b0b0b]
border
border-[#292929]
rounded-xl
p-3
outline-none
focus:border-[#D4AF37]
"
/>
</div>

<div>
<label className="text-gray-500 text-xs block mb-2">
אימייל
</label>

<input
type="email"
value={
newClient.email
}
onChange={(e) =>
setNewClient(
(current) => ({
...current,
email:
e.target.value,
})
)
}
className="
w-full
bg-[#0b0b0b]
border
border-[#292929]
rounded-xl
p-3
outline-none
focus:border-[#D4AF37]
"
/>
</div>

<div>
<label className="text-gray-500 text-xs block mb-2">
מספר מוזמנים
</label>

<input
type="number"
value={
newClient.guests
}
onChange={(e) =>
setNewClient(
(current) => ({
...current,
guests:
e.target.value,
})
)
}
className="
w-full
bg-[#0b0b0b]
border
border-[#292929]
rounded-xl
p-3
outline-none
focus:border-[#D4AF37]
"
/>
</div>

</div>

</section>

{/* =========================================
EVENT
========================================= */}

<section>

<h3 className="text-[#D4AF37] font-bold mb-3">
פרטי אירוע
</h3>

<div className="grid grid-cols-1 md:grid-cols-3 gap-3">

<div>
<label className="text-gray-500 text-xs block mb-2">
סוג אירוע *
</label>

<input
value={
newClient.eventType
}
onChange={(e) =>
setNewClient(
(current) => ({
...current,
eventType:
e.target.value,
})
)
}
className="
w-full
bg-[#0b0b0b]
border
border-[#292929]
rounded-xl
p-3
outline-none
focus:border-[#D4AF37]
"
/>
</div>

<div>
<label className="text-gray-500 text-xs block mb-2">
תאריך האירוע
</label>

<input
type="date"
value={
newClient.eventDate
}
onChange={(e) =>
setNewClient(
(current) => ({
...current,
eventDate:
e.target.value,
})
)
}
className="
w-full
bg-[#0b0b0b]
border
border-[#292929]
rounded-xl
p-3
text-white
outline-none
focus:border-[#D4AF37]
"
/>
</div>

<div>
<label className="text-gray-500 text-xs block mb-2">
סטטוס תשלום
</label>

<select
value={
newClient.paymentStatus
}
onChange={(e) =>
setNewClient(
(current) => ({
...current,
paymentStatus:
e.target.value,
})
)
}
className="
w-full
bg-[#0b0b0b]
border
border-[#292929]
rounded-xl
p-3
text-white
outline-none
focus:border-[#D4AF37]
"
>
<option>
לא שולם
</option>

<option>
מקדמה
</option>

<option>
שולם חלקית
</option>

<option>
שולם במלואו
</option>
</select>
</div>

</div>

</section>

{/* =========================================
SERVICES
========================================= */}

<section>

<div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-3">

<div>
<h3 className="text-[#D4AF37] font-bold">
שירותים
</h3>

<p className="text-gray-500 text-xs mt-1">
בחר שירות של Maestro Events או "אחר"
</p>
</div>

<button
type="button"
onClick={addService}
className="
bg-[#D4AF37]
text-black
font-bold
px-5
py-3
rounded-xl
hover:bg-[#c89d24]
transition
"
>
+ הוסף שירות
</button>

</div>

{newClient.services.length ===
0 ? (

<div className="bg-[#0b0b0b] border border-dashed border-[#292929] rounded-2xl p-8 text-center">

<p className="text-gray-500 mb-3">
עדיין לא נוספו שירותים
</p>

<button
type="button"
onClick={addService}
className="text-[#D4AF37] hover:underline"
>
+ הוסף שירות ראשון
</button>

</div>

) : (

<div className="space-y-3">

{newClient.services.map(
(service, index) => (

<div
key={service.id}
className="
bg-[#0b0b0b]
border
border-[#292929]
rounded-2xl
p-4
"
>

<div className="grid grid-cols-1 md:grid-cols-[1fr_180px_auto] gap-3 items-end">

{/* SERVICE */}

<div>

<label className="text-gray-500 text-xs block mb-2">
שירות {index + 1}
</label>

<select
value={
MAESTRO_SERVICES.includes(
service.name
)
? service.name
: service.name === ""
? ""
: "אחר"
}
onChange={(e) => {

const value =
e.target.value;

if (
value ===
"אחר"
) {
updateService(
service.id,
"name",
""
);
} else {
updateService(
service.id,
"name",
value
);
}
}}
className="
w-full
bg-[#111]
border
border-[#292929]
rounded-xl
p-3
text-white
outline-none
focus:border-[#D4AF37]
"
>

<option value="">
בחר שירות
</option>

{MAESTRO_SERVICES.map(
(item) => (
<option
key={item}
value={item}
>
{item}
</option>
)
)}

<option value="אחר">
אחר - כתיבה חופשית
</option>

</select>

{/* FREE TEXT */}

{!MAESTRO_SERVICES.includes(
service.name
) && (
<input
type="text"
value={
service.name
}
onChange={(e) =>
updateService(
service.id,
"name",
e.target.value
)
}
placeholder="כתוב כאן את השירות..."
className="
w-full
mt-2
bg-[#111]
border
border-[#D4AF37]/40
rounded-xl
p-3
text-white
outline-none
focus:border-[#D4AF37]
"
/>
)}

</div>

{/* AMOUNT */}

<div>

<label className="text-gray-500 text-xs block mb-2">
סכום ₪
</label>

<input
type="number"
min="0"
value={
service.amount
}
onChange={(e) =>
updateService(
service.id,
"amount",
e.target.value
)
}
placeholder="0"
className="
w-full
bg-[#111]
border
border-[#292929]
rounded-xl
p-3
text-white
outline-none
focus:border-[#D4AF37]
"
/>

</div>

{/* DELETE */}

<button
type="button"
onClick={() =>
removeService(
service.id
)
}
className="
h-[48px]
px-4
rounded-xl
border
border-red-500/30
text-red-400
hover:bg-red-500
hover:text-white
transition
"
>
🗑
</button>

</div>

</div>

)
)}

</div>

)}

</section>

{/* =========================================
PAYMENT
========================================= */}

<section>

<h3 className="text-[#D4AF37] font-bold mb-3">
תשלום
</h3>

<div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">

<div className="bg-[#0b0b0b] border border-[#292929] rounded-xl p-4">

<p className="text-gray-500 text-xs mb-1">
סה״כ שירותים
</p>

<p className="text-2xl font-bold text-[#D4AF37]">
₪
{totalAmount.toLocaleString(
"he-IL"
)}
</p>

</div>

<div>

<label className="text-gray-500 text-xs block mb-2">
שולם
</label>

<input
type="number"
min="0"
value={
newClient.paidAmount
}
onChange={(e) =>
setNewClient(
(current) => ({
...current,
paidAmount:
e.target.value,
})
)
}
className="
w-full
bg-[#0b0b0b]
border
border-[#292929]
rounded-xl
p-3
text-white
outline-none
focus:border-[#D4AF37]
"
/>

</div>

<div className="bg-[#0b0b0b] border border-[#292929] rounded-xl p-4">

<p className="text-gray-500 text-xs mb-1">
יתרה
</p>

<p
className={`
text-2xl
font-bold
${
remainingAmount > 0
? "text-red-400"
: "text-green-400"
}
`}
>
₪
{remainingAmount.toLocaleString(
"he-IL"
)}
</p>

</div>

<div>

<label className="text-gray-500 text-xs block mb-2">
אמצעי תשלום
</label>

<select
value={
newClient.paymentMethod
}
onChange={(e) =>
setNewClient(
(current) => ({
...current,
paymentMethod:
e.target.value,
})
)
}
className="
w-full
bg-[#0b0b0b]
border
border-[#292929]
rounded-xl
p-3
text-white
outline-none
focus:border-[#D4AF37]
"
>

<option value="">
בחר אמצעי
</option>

<option>
אשראי
</option>

<option>
העברה בנקאית
</option>

<option>
ביט
</option>

<option>
PayBox
</option>

<option>
מזומן
</option>

<option>
צ׳ק
</option>

<option>
אחר
</option>

</select>

</div>

</div>

</section>

{/* =========================================
NOTES
========================================= */}

<section>

<h3 className="text-[#D4AF37] font-bold mb-3">
הערות ללקוח
</h3>

<textarea
rows={4}
value={
newClient.notes
}
onChange={(e) =>
setNewClient(
(current) => ({
...current,
notes:
e.target.value,
})
)
}
placeholder="הערות, דרישות מיוחדות, מידע נוסף..."
className="
w-full
bg-[#0b0b0b]
border
border-[#292929]
rounded-xl
p-4
text-white
outline-none
focus:border-[#D4AF37]
resize-none
"
/>

</section>

</div>

{/* =========================================
SAVE FOOTER
========================================= */}

<div
className="
sticky
bottom-0
z-30
bg-[#111]
border-t
border-[#292929]
p-4
md:p-5
flex
flex-col
md:flex-row
gap-3
"
>

<button
type="button"
onClick={
saveNewClient
}
disabled={
savingClient
}
className="
flex-[2]
bg-[#D4AF37]
text-black
font-bold
py-4
rounded-xl
hover:bg-[#c89d24]
transition
disabled:opacity-50
disabled:cursor-not-allowed
"
>
{savingClient
? "⏳ שומר לקוח..."
: "💾 שמור לקוח"}
</button>

<button
type="button"
onClick={() =>
!savingClient &&
setShowNewClient(false)
}
disabled={
savingClient
}
className="
flex-1
border
border-[#292929]
text-gray-400
font-semibold
py-4
rounded-xl
hover:bg-[#1a1a1a]
hover:text-white
transition
"
>
ביטול
</button>

</div>

</div>

</div>

)}

{/* FOOTER */}

<div className="mt-8 text-center text-gray-600 text-sm">
Maestro Events Admin Dashboard
</div>

</main>
);
}