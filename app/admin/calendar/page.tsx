"use client";

import { useEffect, useMemo, useState } from "react";

type Client = {
id: number;
name: string;
phone: string;
email: string | null;
eventType: string | null;
eventDate: string | null;
guests: string | null;
location: string | null;
status: string;
totalAmount: number | null;
paidAmount: number | null;
notes: string | null;
additionalInfo: string | null;
addedToCalendar: boolean;
};

const PAYMENT_REMINDER_STORAGE_KEY =
"maestro_payment_reminder_last";

const TWO_DAYS_IN_MS =
2 * 24 * 60 * 60 * 1000;

export default function CalendarPage() {
const [clients, setClients] = useState<Client[]>([]);
const [loading, setLoading] = useState(true);

const [currentMonth, setCurrentMonth] =
useState(new Date());

const [selectedDate, setSelectedDate] =
useState<Date | null>(null);

const [transactionClient, setTransactionClient] =
useState<Client | null>(null);

const [paymentAmount, setPaymentAmount] =
useState("");

const [savingPayment, setSavingPayment] =
useState(false);

const [paymentReminderDue, setPaymentReminderDue] =
useState(false);

const [showPaymentReminders, setShowPaymentReminders] =
useState(true);

// ==========================================
// טעינת לקוחות
// ==========================================

useEffect(() => {
loadClients();
}, []);

const loadClients = async () => {
try {
setLoading(true);

const response = await fetch(
"/api/testimonials/clients",
{
cache: "no-store",
}
);

const data = await response.json();

if (!response.ok) {
throw new Error(
data.error || "שגיאה בטעינת הלקוחות"
);
}

setClients(data);
} catch (error) {
console.error(
"שגיאה בטעינת היומן:",
error
);
} finally {
setLoading(false);
}
};

// ==========================================
// אירועים
// ==========================================

const events = clients
.filter((client) => client.eventDate)
.sort((a, b) => {
return (
new Date(a.eventDate!).getTime() -
new Date(b.eventDate!).getTime()
);
});

// ==========================================
// פונקציות תאריך
// ==========================================

const startOfDay = (date: Date) => {
const result = new Date(date);

result.setHours(0, 0, 0, 0);

return result;
};

const isSameDay = (
a: Date,
b: Date
) => {
return (
a.getFullYear() === b.getFullYear() &&
a.getMonth() === b.getMonth() &&
a.getDate() === b.getDate()
);
};

const getEventDate = (
event: Client
) => {
return new Date(event.eventDate!);
};

const getEventsForDate = (
date: Date
) => {
return events.filter((event) =>
isSameDay(
getEventDate(event),
date
)
);
};

// ==========================================
// היום
// ==========================================

const today = new Date();

// ==========================================
// יתרה לתשלום
// ==========================================

const getBalance = (
client: Client
) => {
return Math.max(
0,
Number(
client.totalAmount || 0
) -
Number(
client.paidAmount || 0
)
);
};

// ==========================================
// אירועים שהסתיימו ועדיין חייבים כסף
// ==========================================

const overduePaymentEvents = useMemo(() => {
const todayStart =
startOfDay(new Date());

return events.filter((event) => {
if (!event.eventDate) {
return false;
}

const eventDate =
startOfDay(
getEventDate(event)
);

const balance =
getBalance(event);

const totalAmount =
Number(
event.totalAmount || 0
);

return (
eventDate < todayStart &&
totalAmount > 0 &&
balance > 0
);
});
}, [clients]);

// ==========================================
// בדיקת תזכורת כל יומיים
// ==========================================

useEffect(() => {
if (
loading ||
overduePaymentEvents.length === 0
) {
setPaymentReminderDue(false);
return;
}

try {
const lastReminder =
localStorage.getItem(
PAYMENT_REMINDER_STORAGE_KEY
);

if (!lastReminder) {
setPaymentReminderDue(true);
return;
}

const lastReminderTime =
Number(lastReminder);

if (
!Number.isFinite(
lastReminderTime
)
) {
setPaymentReminderDue(true);
return;
}

const timePassed =
Date.now() -
lastReminderTime;

if (
timePassed >=
TWO_DAYS_IN_MS
) {
setPaymentReminderDue(true);
} else {
setPaymentReminderDue(false);
}
} catch (error) {
console.error(
"שגיאה בבדיקת תזכורת התשלום:",
error
);

setPaymentReminderDue(true);
}
}, [
loading,
overduePaymentEvents.length,
]);

// ==========================================
// התרעה
// ==========================================

useEffect(() => {
if (
!paymentReminderDue ||
overduePaymentEvents.length === 0
) {
return;
}

const totalOutstanding =
overduePaymentEvents.reduce(
(sum, event) =>
sum + getBalance(event),
0
);

const eventCount =
overduePaymentEvents.length;

const message =
eventCount === 1
? `יש אירוע שהסתיים ועדיין לא שולם במלואו.\nנשאר לתשלום: ₪${totalOutstanding.toLocaleString(
"he-IL"
)}`
: `יש ${eventCount} אירועים שהסתיימו ועדיין ממתינים לתשלום.\nסך כל היתרות: ₪${totalOutstanding.toLocaleString(
"he-IL"
)}`;

alert(
`🔔 תזכורת לתשלום\n\n${message}`
);

try {
localStorage.setItem(
PAYMENT_REMINDER_STORAGE_KEY,
Date.now().toString()
);
} catch (error) {
console.error(
"שגיאה בשמירת זמן התזכורת:",
error
);
}
}, [
paymentReminderDue,
overduePaymentEvents,
]);

// ==========================================
// סימון שהתזכורת טופלה
// ==========================================

const dismissPaymentReminder = () => {
try {
localStorage.setItem(
PAYMENT_REMINDER_STORAGE_KEY,
Date.now().toString()
);
} catch (error) {
console.error(
"שגיאה בשמירת התזכורת:",
error
);
}

setPaymentReminderDue(false);
setShowPaymentReminders(false);
};

// ==========================================
// פתיחת פרטי עסקה
// ==========================================

const openTransactionDetails = (
client: Client
) => {
setTransactionClient(client);

setPaymentAmount("");

document.body.style.overflow =
"hidden";
};

// ==========================================
// סגירת פרטי עסקה
// ==========================================

const closeTransactionDetails =
() => {
setTransactionClient(null);

setPaymentAmount("");

document.body.style.overflow =
"";
};

// ==========================================
// קבלת תשלום
// ==========================================

const receivePayment = async () => {
if (!transactionClient) {
return;
}

const amount =
Number(paymentAmount);

if (
!Number.isFinite(amount) ||
amount <= 0
) {
alert(
"יש להזין סכום תשלום תקין."
);

return;
}

const totalAmount =
Number(
transactionClient.totalAmount ||
0
);

const currentPaid =
Number(
transactionClient.paidAmount ||
0
);

const currentBalance =
Math.max(
0,
totalAmount -
currentPaid
);

if (amount > currentBalance) {
alert(
`הסכום שהוזן גדול מהיתרה לתשלום.\nהיתרה הנוכחית היא ₪${currentBalance.toLocaleString(
"he-IL"
)}`
);

return;
}

const newPaidAmount =
currentPaid + amount;

const newBalance =
Math.max(
0,
totalAmount -
newPaidAmount
);

const newStatus =
newBalance === 0 &&
totalAmount > 0
? "בוצע"
: "ממתין לתשלום";

try {
setSavingPayment(true);

const response =
await fetch(
"/api/testimonials/clients",
{
method: "PUT",
headers: {
"Content-Type":
"application/json",
},
body: JSON.stringify({
...transactionClient,

id: transactionClient.id,

paidAmount:
newPaidAmount,

status:
newStatus,
}),
}
);

const data =
await response.json();

if (!response.ok) {
throw new Error(
data.error ||
"שגיאה בעדכון התשלום"
);
}

// עדכון רשימת הלקוחות
setClients((prev) =>
prev.map((client) =>
client.id === data.id
? data
: client
)
);

// עדכון החלון
setTransactionClient(data);

setPaymentAmount("");

if (newBalance === 0) {
alert(
"התשלום המלא התקבל. האירוע סומן כבוצע ✅"
);
} else {
alert(
`התשלום התקבל בהצלחה.\nנשאר לתשלום: ₪${newBalance.toLocaleString(
"he-IL"
)}`
);
}
} catch (error) {
console.error(
"שגיאה בקבלת תשלום:",
error
);

alert(
error instanceof Error
? error.message
: "שגיאה בשמירת התשלום"
);
} finally {
setSavingPayment(false);
}
};

// ==========================================
// הפקת קבלה
// ==========================================

const generateReceipt = () => {
alert(
"מערכת הקבלות תתחבר לכאן בהמשך."
);
};

// ==========================================
// סטטוס צבע
// ==========================================

const getStatusClass = (
client: Client
) => {
const balance =
getBalance(client);

if (
Number(
client.totalAmount || 0
) > 0 &&
balance === 0
) {
return `
border-green-500/50
bg-green-500/10
text-green-400
`;
}

return `
border-[#D4AF37]/50
bg-[#D4AF37]/10
text-[#D4AF37]
`;
};

// ==========================================
// ימי החודש
// ==========================================

const calendarDays = useMemo(() => {
const year =
currentMonth.getFullYear();

const month =
currentMonth.getMonth();

const firstDay = new Date(
year,
month,
1
);

const firstDayOfWeek =
firstDay.getDay();

const daysInMonth =
new Date(
year,
month + 1,
0
).getDate();

const days: (Date | null)[] = [];

for (
let i = 0;
i < firstDayOfWeek;
i++
) {
days.push(null);
}

for (
let day = 1;
day <= daysInMonth;
day++
) {
days.push(
new Date(
year,
month,
day
)
);
}

return days;
}, [currentMonth]);

// ==========================================
// מעבר חודש
// ==========================================

const previousMonth = () => {
setCurrentMonth(
new Date(
currentMonth.getFullYear(),
currentMonth.getMonth() - 1,
1
)
);
};

const nextMonth = () => {
setCurrentMonth(
new Date(
currentMonth.getFullYear(),
currentMonth.getMonth() + 1,
1
)
);
};

// ==========================================
// שם החודש
// ==========================================

const monthName =
currentMonth.toLocaleDateString(
"he-IL",
{
month: "long",
year: "numeric",
}
);

// ==========================================
// אירועים השבוע
// ==========================================

const weekEvents = useMemo(() => {
const now =
startOfDay(new Date());

const dayOfWeek =
now.getDay();

const start =
new Date(now);

start.setDate(
now.getDate() - dayOfWeek
);

const end =
new Date(start);

end.setDate(
start.getDate() + 6
);

end.setHours(
23,
59,
59,
999
);

return events.filter(
(event) => {
const eventDate =
getEventDate(event);

return (
eventDate >= start &&
eventDate <= end
);
}
);
}, [events]);

// ==========================================
// אירועים של התאריך שנבחר
// ==========================================

const selectedEvents =
selectedDate
? getEventsForDate(
selectedDate
)
: [];

// ==========================================
// תצוגה
// ==========================================

return (
<main
dir="rtl"
className="
min-h-screen
bg-[#090909]
text-white
p-6
md:p-10
pt-24
md:pt-28
"
>
{/* ==========================================
כותרת
========================================== */}

<div className="mb-10">
<p
className="
text-[#D4AF37]
tracking-[0.35em]
text-sm
mb-3
"
>
MAESTRO EVENTS
</p>

<h1
className="
text-4xl
md:text-5xl
font-bold
"
>
יומן אירועים
</h1>

<p
className="
text-gray-400
mt-3
text-lg
"
>
כאן יוצגו כל האירועים שנוספו ליומן.
</p>
</div>

{/* ==========================================
תזכורות לתשלום
========================================== */}

{overduePaymentEvents.length >
0 &&
showPaymentReminders && (
<div
className="
mb-8
bg-gradient-to-l
from-[#241f0c]
to-[#151515]
border
border-[#D4AF37]
rounded-3xl
overflow-hidden
shadow-[0_0_35px_rgba(212,175,55,0.10)]
"
>
<div
className="
p-6
md:p-7
"
>
<div
className="
flex
flex-col
md:flex-row
md:items-center
md:justify-between
gap-5
"
>
<div>
<div
className="
flex
items-center
gap-3
mb-2
"
>
<span className="text-3xl">
🔔
</span>

<h2
className="
text-2xl
md:text-3xl
font-bold
text-[#D4AF37]
"
>
תזכורות לתשלום
</h2>
</div>

<p className="text-gray-400">
נמצאו{" "}
<span className="text-white font-bold">
{
overduePaymentEvents.length
}
</span>{" "}
אירועים שהסתיימו ועדיין
קיימת בהם יתרה לתשלום.
</p>
</div>

<button
onClick={
dismissPaymentReminder
}
className="
bg-[#181818]
border
border-[#444]
text-gray-300
px-4
py-2
rounded-xl
hover:border-[#D4AF37]
hover:text-[#D4AF37]
transition
"
>
הסתר תזכורת
</button>
</div>

<div
className="
mt-6
grid
grid-cols-1
md:grid-cols-2
xl:grid-cols-3
gap-4
"
>
{overduePaymentEvents.map(
(event) => {
const balance =
getBalance(event);

const eventDate =
getEventDate(
event
);

return (
<button
key={event.id}
onClick={() =>
openTransactionDetails(
event
)
}
className="
text-right
bg-[#111]
border
border-[#3b3520]
rounded-2xl
p-5
hover:border-[#D4AF37]
hover:bg-[#181818]
transition
"
>
<div
className="
flex
items-start
justify-between
gap-3
"
>
<div>
<h3
className="
font-bold
text-lg
"
>
{event.name}
</h3>

<p
className="
text-gray-500
text-sm
mt-1
"
>
{event.eventType ||
"אירוע"}
</p>
</div>

<span className="text-xl">
⚠️
</span>
</div>

<div
className="
mt-4
grid
grid-cols-2
gap-3
"
>
<div>
<p
className="
text-gray-500
text-xs
"
>
תאריך האירוע
</p>

<p className="mt-1 text-sm">
{eventDate.toLocaleDateString(
"he-IL"
)}
</p>
</div>

<div>
<p
className="
text-gray-500
text-xs
"
>
נותר לתשלום
</p>

<p
className="
mt-1
font-bold
text-[#D4AF37]
"
>
₪
{balance.toLocaleString(
"he-IL"
)}
</p>
</div>
</div>

<div
className="
mt-4
text-center
text-sm
text-[#D4AF37]
font-bold
"
>
💰 פתח פרטי עסקה ←
</div>
</button>
);
}
)}
</div>
</div>
</div>
)}

{/* ==========================================
סטטיסטיקה
========================================== */}

<div
className="
grid
grid-cols-1
md:grid-cols-4
gap-5
mb-8
"
>
<div
className="
bg-[#111]
border
border-[#292929]
rounded-2xl
p-6
"
>
<p className="text-gray-400 mb-2">
סך האירועים
</p>

<p
className="
text-4xl
font-bold
text-[#D4AF37]
"
>
{events.length}
</p>
</div>

<div
className="
bg-[#111]
border
border-[#292929]
rounded-2xl
p-6
"
>
<p className="text-gray-400 mb-2">
אירועים קרובים
</p>

<p
className="
text-4xl
font-bold
text-[#D4AF37]
"
>
{
events.filter(
(event) => {
const date =
startOfDay(
getEventDate(
event
)
);

return (
date >=
startOfDay(
today
)
);
}
).length
}
</p>
</div>

<div
className="
bg-[#111]
border
border-[#292929]
rounded-2xl
p-6
"
>
<p className="text-gray-400 mb-2">
אירועים השבוע
</p>

<p
className="
text-4xl
font-bold
text-[#D4AF37]
"
>
{weekEvents.length}
</p>
</div>

<div
className="
bg-[#111]
border
border-red-900/50
rounded-2xl
p-6
"
>
<p className="text-gray-400 mb-2">
ממתינים לתשלום
</p>

<p
className="
text-4xl
font-bold
text-red-400
"
>
{
overduePaymentEvents.length
}
</p>
</div>
</div>

{/* ==========================================
לוח שנה + אירועים השבוע
========================================== */}

<div
className="
grid
grid-cols-1
lg:grid-cols-[360px_1fr]
gap-6
mb-8
"
>
{/* לוח שנה */}

<div
className="
bg-[#111]
border
border-[#292929]
rounded-2xl
p-6
"
>
<div
className="
flex
items-center
justify-between
mb-6
"
>
<button
onClick={nextMonth}
className="
w-10
h-10
rounded-xl
bg-[#181818]
border
border-[#333]
text-gray-300
hover:border-[#D4AF37]
hover:text-[#D4AF37]
transition
"
>
→
</button>

<h2
className="
text-xl
font-bold
capitalize
"
>
{monthName}
</h2>

<button
onClick={
previousMonth
}
className="
w-10
h-10
rounded-xl
bg-[#181818]
border
border-[#333]
text-gray-300
hover:border-[#D4AF37]
hover:text-[#D4AF37]
transition
"
>
←
</button>
</div>

<div
className="
grid
grid-cols-7
gap-1
mb-2
"
>
{[
"א",
"ב",
"ג",
"ד",
"ה",
"ו",
"ש",
].map((day) => (
<div
key={day}
className="
text-center
text-xs
text-gray-500
font-bold
py-2
"
>
{day}
</div>
))}
</div>

<div
className="
grid
grid-cols-7
gap-1
"
>
{calendarDays.map(
(
date,
index
) => {
if (!date) {
return (
<div
key={`empty-${index}`}
className="h-11"
/>
);
}

const dayEvents =
getEventsForDate(
date
);

const hasEvents =
dayEvents.length >
0;

const isToday =
isSameDay(
date,
today
);

const isSelected =
selectedDate &&
isSameDay(
date,
selectedDate
);

return (
<button
key={date.toISOString()}
onClick={() =>
setSelectedDate(
date
)
}
className={`
relative
h-11
rounded-xl
flex
items-center
justify-center
transition
text-sm
${
isSelected
? "bg-[#D4AF37] text-black font-bold"
: isToday
? "border border-[#D4AF37] text-[#D4AF37]"
: "text-gray-300 hover:bg-[#1b1b1b]"
}
`}
>
{date.getDate()}

{hasEvents && (
<span
className={`
absolute
bottom-1
w-1.5
h-1.5
rounded-full
${
isSelected
? "bg-black"
: "bg-[#D4AF37]"
}
`}
/>
)}
</button>
);
}
)}
</div>

<div
className="
flex
items-center
gap-2
mt-6
text-xs
text-gray-500
"
>
<span
className="
w-2
h-2
rounded-full
bg-[#D4AF37]
"
/>

<span>
יש אירוע בתאריך
</span>
</div>
</div>

{/* אירועים השבוע */}

<div
className="
bg-[#111]
border
border-[#292929]
rounded-2xl
overflow-hidden
"
>
<div
className="
p-6
border-b
border-[#292929]
"
>
<div
className="
flex
items-center
justify-between
gap-4
"
>
<div>
<h2
className="
text-2xl
font-bold
"
>
📌 אירועים השבוע
</h2>

<p
className="
text-gray-500
mt-1
"
>
כל האירועים המתוכננים לשבוע הנוכחי
</p>
</div>

<div
className="
bg-[#181818]
border
border-[#333]
rounded-xl
px-4
py-2
text-[#D4AF37]
font-bold
"
>
{weekEvents.length}
</div>
</div>
</div>

{weekEvents.length === 0 ? (
<div
className="
p-12
text-center
text-gray-500
"
>
<div className="text-4xl mb-3">
🎉
</div>

<p>
אין אירועים השבוע
</p>
</div>
) : (
<div
className="
divide-y
divide-[#292929]
"
>
{weekEvents.map(
(event) => {
const eventDate =
getEventDate(
event
);

const eventIsToday =
isSameDay(
eventDate,
today
);

return (
<button
key={event.id}
onClick={() =>
setSelectedDate(
eventDate
)
}
className="
w-full
text-right
p-5
hover:bg-[#151515]
transition
"
>
<div
className="
flex
items-center
gap-4
"
>
<div
className="
min-w-[70px]
text-center
bg-[#181818]
border
border-[#333]
rounded-xl
p-3
"
>
<p
className="
text-xs
text-gray-500
"
>
{eventDate.toLocaleDateString(
"he-IL",
{
weekday:
"short",
}
)}
</p>

<p
className="
text-2xl
font-bold
text-[#D4AF37]
"
>
{eventDate.getDate()}
</p>
</div>

<div className="flex-1">
<div
className="
flex
items-center
gap-3
flex-wrap
"
>
<h3
className="
font-bold
text-lg
"
>
{event.name}
</h3>

{eventIsToday && (
<span
className="
text-xs
bg-[#D4AF37]
text-black
px-2
py-1
rounded-full
font-bold
"
>
היום
</span>
)}
</div>

<p
className="
text-gray-400
text-sm
mt-1
"
>
{event.eventType ||
"אירוע"}
{" · "}
{event.location ||
"מיקום לא הוגדר"}
</p>
</div>

<div
className="
text-gray-500
text-xl
"
>
←
</div>
</div>
</button>
);
}
)}
</div>
)}
</div>
</div>

{/* ==========================================
תאריך שנבחר
========================================== */}

{selectedDate && (
<div
className="
bg-[#111]
border
border-[#D4AF37]
rounded-2xl
overflow-hidden
mb-8
"
>
<div
className="
p-6
border-b
border-[#292929]
flex
items-center
justify-between
"
>
<div>
<p
className="
text-[#D4AF37]
text-sm
mb-1
"
>
תאריך נבחר
</p>

<h2
className="
text-2xl
font-bold
"
>
{selectedDate.toLocaleDateString(
"he-IL",
{
weekday:
"long",
day: "numeric",
month: "long",
year: "numeric",
}
)}
</h2>
</div>

<button
onClick={() =>
setSelectedDate(null)
}
className="
text-gray-500
hover:text-white
text-xl
"
>
✕
</button>
</div>

{selectedEvents.length ===
0 ? (
<div
className="
p-10
text-center
text-gray-500
"
>
אין אירועים בתאריך הזה
</div>
) : (
<div
className="
divide-y
divide-[#292929]
"
>
{selectedEvents.map(
(event) => (
<div
key={event.id}
className="
p-6
hover:bg-[#151515]
transition
"
>
<div
className="
flex
flex-col
md:flex-row
md:items-center
gap-5
"
>
<div className="flex-1">
<h3
className="
text-xl
font-bold
"
>
{event.name}
</h3>

<p
className="
text-gray-400
mt-2
"
>
📞 {event.phone}
</p>
</div>

<div
className="
grid
grid-cols-2
md:grid-cols-3
gap-5
text-sm
"
>
<div>
<p className="text-gray-500 mb-1">
סוג אירוע
</p>

<p>
{event.eventType ||
"—"}
</p>
</div>

<div>
<p className="text-gray-500 mb-1">
מקום
</p>

<p>
{event.location ||
"—"}
</p>
</div>

<div>
<p className="text-gray-500 mb-1">
מוזמנים
</p>

<p>
{event.guests ||
"—"}
</p>
</div>
</div>

<button
onClick={() =>
openTransactionDetails(
event
)
}
className="
bg-[#D4AF37]
text-black
font-semibold
px-5
py-3
rounded-xl
hover:bg-[#c89d24]
transition
whitespace-nowrap
"
>
💰 פרטי העסקה
</button>
</div>
</div>
)
)}
</div>
)}
</div>
)}

{/* ==========================================
כל האירועים
========================================== */}

<div
className="
bg-[#111]
border
border-[#292929]
rounded-2xl
overflow-hidden
"
>
<div
className="
p-6
border-b
border-[#292929]
"
>
<h2
className="
text-2xl
font-bold
"
>
כל האירועים
</h2>

<p
className="
text-gray-500
mt-1
"
>
אירועים עם תאריך שהוגדר ללקוח
</p>
</div>

{loading && (
<div
className="
p-16
text-center
"
>
<div
className="
text-4xl
mb-4
"
>
⏳
</div>

<p className="text-gray-400">
טוען את היומן...
</p>
</div>
)}

{!loading &&
events.length === 0 && (
<div
className="
p-16
text-center
"
>
<div
className="
text-6xl
mb-5
"
>
📅
</div>

<h3
className="
text-xl
font-bold
mb-2
"
>
אין אירועים ביומן
</h3>

<p className="text-gray-500">
כאשר נוסיף לקוח ליומן,
האירוע שלו יופיע כאן.
</p>
</div>
)}

{!loading &&
events.length > 0 && (
<div
className="
divide-y
divide-[#292929]
"
>
{events.map(
(event) => {
const balance =
getBalance(event);

const eventHasOverduePayment =
event.eventDate &&
startOfDay(
getEventDate(
event
)
) <
startOfDay(
new Date()
) &&
Number(
event.totalAmount ||
0
) > 0 &&
balance > 0;

return (
<div
key={event.id}
className="
p-6
hover:bg-[#151515]
transition
"
>
<div
className="
flex
flex-col
lg:flex-row
lg:items-center
gap-6
"
>
<div
className="
min-w-[150px]
bg-[#181818]
border
border-[#333]
rounded-xl
p-4
text-center
"
>
<p
className="
text-[#D4AF37]
text-sm
"
>
תאריך האירוע
</p>

<p
className="
text-xl
font-bold
mt-2
"
>
{event.eventDate}
</p>
</div>

<div className="flex-1">
<div
className="
flex
items-center
gap-3
flex-wrap
"
>
<h3
className="
text-xl
font-bold
"
>
{event.name}
</h3>

{eventHasOverduePayment && (
<span
className="
bg-red-500/10
border
border-red-500/40
text-red-400
px-3
py-1
rounded-full
text-xs
font-bold
"
>
🔔 תשלום חסר
</span>
)}
</div>

<p
className="
text-gray-400
mt-2
"
>
📞 {event.phone}
</p>
</div>

<div
className="
grid
grid-cols-2
md:grid-cols-3
gap-5
text-sm
"
>
<div>
<p className="text-gray-500 mb-1">
סוג אירוע
</p>

<p>
{event.eventType ||
"—"}
</p>
</div>

<div>
<p className="text-gray-500 mb-1">
מקום
</p>

<p>
{event.location ||
"—"}
</p>
</div>

<div>
<p className="text-gray-500 mb-1">
מוזמנים
</p>

<p>
{event.guests ||
"—"}
</p>
</div>
</div>

<div className="min-w-[130px]">
<span
className={`
inline-block
border
px-4
py-2
rounded-xl
text-sm
${getStatusClass(
event
)}
`}
>
{getBalance(
event
) === 0 &&
Number(
event.totalAmount ||
0
) > 0
? "בוצע"
: "ממתין לתשלום"}
</span>

{balance > 0 &&
Number(
event.totalAmount ||
0
) > 0 && (
<p
className="
text-[#D4AF37]
text-xs
mt-2
"
>
יתרה: ₪
{balance.toLocaleString(
"he-IL"
)}
</p>
)}
</div>

<button
onClick={() =>
openTransactionDetails(
event
)
}
className="
bg-[#D4AF37]
text-black
font-semibold
px-5
py-3
rounded-xl
hover:bg-[#c89d24]
transition
whitespace-nowrap
"
>
💰 פרטי העסקה
</button>
</div>
</div>
);
}
)}
</div>
)}
</div>

{/* ==========================================
חלון פרטי העסקה
========================================== */}

{transactionClient && (
<div
className="
fixed
inset-0
z-[100]
bg-black/80
backdrop-blur-sm
flex
items-start
justify-center
p-4
pt-32
md:pt-36
overflow-y-auto
"
onClick={
closeTransactionDetails
}
>
<div
className="
w-[95vw]
max-w-[1400px]
bg-[#111]
border
border-[#D4AF37]
rounded-3xl
shadow-[0_0_60px_rgba(212,175,55,0.18)]
overflow-hidden
mb-10
"
onClick={(e) =>
e.stopPropagation()
}
>
{/* ==========================================
כותרת החלון
========================================== */}

<div
className="
px-6
md:px-8
py-5
border-b
border-[#292929]
flex
items-center
justify-between
"
>
<div>
<p
className="
text-[#D4AF37]
text-xs
tracking-widest
mb-1
"
>
MAESTRO EVENTS
</p>

<h2
className="
text-2xl
md:text-3xl
font-bold
"
>
💰 פרטי העסקה
</h2>

<p
className="
text-gray-400
mt-1
"
>
{transactionClient.name}
</p>
</div>

<button
onClick={
closeTransactionDetails
}
className="
w-10
h-10
rounded-xl
bg-[#181818]
border
border-[#333]
text-gray-400
hover:text-white
hover:border-[#D4AF37]
transition
text-xl
"
>
✕
</button>
</div>

{/* ==========================================
תוכן - שתי עמודות רחבות
========================================== */}

<div
className="
p-5
md:p-7
grid
grid-cols-1
lg:grid-cols-[1.35fr_0.65fr]
gap-6
"
>
{/* ==========================================
צד ימין - עסקה
========================================== */}

<div>
{/* סכומים */}

<div
className="
grid
grid-cols-3
gap-3
"
>
<div
className="
bg-[#181818]
border
border-[#333]
rounded-2xl
p-4
"
>
<p
className="
text-gray-500
text-xs
mb-2
"
>
סכום העסקה
</p>

<p
className="
text-xl
font-bold
"
>
₪
{Number(
transactionClient.totalAmount ||
0
).toLocaleString(
"he-IL"
)}
</p>
</div>

<div
className="
bg-[#181818]
border
border-green-900/60
rounded-2xl
p-4
"
>
<p
className="
text-gray-500
text-xs
mb-2
"
>
שולם
</p>

<p
className="
text-xl
font-bold
text-green-400
"
>
₪
{Number(
transactionClient.paidAmount ||
0
).toLocaleString(
"he-IL"
)}
</p>
</div>

<div
className="
bg-[#181818]
border
border-[#D4AF37]/50
rounded-2xl
p-4
"
>
<p
className="
text-gray-500
text-xs
mb-2
"
>
יתרה
</p>

<p
className="
text-xl
font-bold
text-[#D4AF37]
"
>
₪
{getBalance(
transactionClient
).toLocaleString(
"he-IL"
)}
</p>
</div>
</div>

{/* סטטוס */}

<div
className={`
mt-4
rounded-2xl
border
p-5
text-center
${getStatusClass(
transactionClient
)}
`}
>
<div className="text-3xl mb-2">
{getBalance(
transactionClient
) === 0 &&
Number(
transactionClient.totalAmount ||
0
) > 0
? "✅"
: "⏳"}
</div>

<p className="font-bold text-lg">
{getBalance(
transactionClient
) === 0 &&
Number(
transactionClient.totalAmount ||
0
) > 0
? "בוצע"
: "ממתין לתשלום"}
</p>

{getBalance(
transactionClient
) > 0 && (
<p className="text-sm mt-1">
נשאר לתשלום ₪
{getBalance(
transactionClient
).toLocaleString(
"he-IL"
)}
</p>
)}
</div>

{/* תזכורת לתשלום בתוך העסקה */}

{transactionClient.eventDate &&
startOfDay(
getEventDate(
transactionClient
)
) <
startOfDay(
new Date()
) &&
getBalance(
transactionClient
) > 0 && (
<div
className="
mt-4
bg-red-500/10
border
border-red-500/40
rounded-2xl
p-5
"
>
<div
className="
flex
items-center
gap-3
"
>
<span className="text-2xl">
🔔
</span>

<div>
<p
className="
font-bold
text-red-400
"
>
האירוע הסתיים ועדיין
קיים חוב
</p>

<p
className="
text-sm
text-gray-400
mt-1
"
>
נשאר לתשלום ₪
{getBalance(
transactionClient
).toLocaleString(
"he-IL"
)}
</p>
</div>
</div>
</div>
)}

{/* קבלת תשלום */}

<div
className="
mt-4
bg-[#181818]
border
border-[#D4AF37]
rounded-2xl
p-5
"
>
<div
className="
flex
items-center
justify-between
mb-3
"
>
<h3
className="
text-lg
font-bold
text-[#D4AF37]
"
>
💳 קבלת תשלום
</h3>

<span className="text-xs text-gray-500">
הזן את הסכום שהתקבל עכשיו
</span>
</div>

<div
className="
flex
flex-col
sm:flex-row
gap-3
"
>
<input
type="number"
min="0"
step="0.01"
value={
paymentAmount
}
onChange={(e) =>
setPaymentAmount(
e.target.value
)
}
placeholder="סכום התשלום"
disabled={
savingPayment ||
getBalance(
transactionClient
) === 0
}
className="
flex-1
bg-[#101010]
border
border-[#333]
rounded-xl
px-4
py-3
text-white
outline-none
focus:border-[#D4AF37]
disabled:opacity-50
"
/>

<button
onClick={
receivePayment
}
disabled={
savingPayment ||
getBalance(
transactionClient
) === 0
}
className="
bg-[#D4AF37]
text-black
font-bold
px-6
py-3
rounded-xl
hover:bg-[#c89d24]
transition
disabled:opacity-40
disabled:cursor-not-allowed
whitespace-nowrap
"
>
{savingPayment
? "שומר..."
: "💰 קבל תשלום"}
</button>
</div>

{getBalance(
transactionClient
) === 0 &&
Number(
transactionClient.totalAmount ||
0
) > 0 && (
<p
className="
text-green-400
text-sm
mt-3
"
>
✓ כל העסקה שולמה
</p>
)}
</div>

{/* קבלה */}

<button
onClick={
generateReceipt
}
className="
w-full
mt-4
bg-[#181818]
border
border-[#D4AF37]
text-[#D4AF37]
font-bold
py-3
rounded-xl
hover:bg-[#D4AF37]
hover:text-black
transition
"
>
🧾 הפק קבלה
</button>
</div>

{/* ==========================================
צד שמאל - פרטי האירוע
========================================== */}

<div
className="
bg-[#181818]
border
border-[#333]
rounded-2xl
p-5
"
>
<h3
className="
text-lg
font-bold
text-[#D4AF37]
mb-5
"
>
📋 פרטי האירוע
</h3>

<div
className="
grid
grid-cols-2
gap-x-6
gap-y-5
"
>
<div>
<p className="text-gray-500 text-xs">
לקוח
</p>

<p className="mt-1 font-semibold">
{transactionClient.name}
</p>
</div>

<div>
<p className="text-gray-500 text-xs">
טלפון
</p>

<p className="mt-1">
{transactionClient.phone}
</p>
</div>

<div>
<p className="text-gray-500 text-xs">
סוג אירוע
</p>

<p className="mt-1">
{transactionClient.eventType ||
"—"}
</p>
</div>

<div>
<p className="text-gray-500 text-xs">
תאריך
</p>

<p className="mt-1">
{transactionClient.eventDate ||
"—"}
</p>
</div>

<div>
<p className="text-gray-500 text-xs">
מקום
</p>

<p className="mt-1">
{transactionClient.location ||
"—"}
</p>
</div>

<div>
<p className="text-gray-500 text-xs">
מוזמנים
</p>

<p className="mt-1">
{transactionClient.guests ||
"—"}
</p>
</div>

{transactionClient.email && (
<div className="col-span-2">
<p className="text-gray-500 text-xs">
אימייל
</p>

<p className="mt-1">
{transactionClient.email}
</p>
</div>
)}
</div>

{/* הערות */}

{transactionClient.notes && (
<div className="mt-6">
<p
className="
text-[#D4AF37]
text-sm
font-bold
mb-2
"
>
📝 הערות
</p>

<p
className="
text-gray-300
whitespace-pre-wrap
leading-6
text-sm
"
>
{
transactionClient.notes
}
</p>
</div>
)}

{/* מידע נוסף */}

{transactionClient.additionalInfo && (
<div className="mt-6">
<p
className="
text-[#D4AF37]
text-sm
font-bold
mb-2
"
>
ℹ️ מידע נוסף
</p>

<p
className="
text-gray-300
whitespace-pre-wrap
leading-6
text-sm
"
>
{
transactionClient.additionalInfo
}
</p>
</div>
)}
</div>
</div>

{/* ==========================================
סגירה
========================================== */}

<div
className="
px-5
md:px-7
pb-6
"
>
<button
onClick={
closeTransactionDetails
}
className="
w-full
bg-[#D4AF37]
text-black
font-bold
py-3
rounded-xl
hover:bg-[#c89d24]
transition
"
>
סגירת פרטי העסקה
</button>
</div>
</div>
</div>
)}

{/* ==========================================
תחתית
========================================== */}

<div
className="
mt-6
text-center
text-gray-600
text-sm
"
>
Maestro Events — יומן אירועים
</div>
</main>
);
}