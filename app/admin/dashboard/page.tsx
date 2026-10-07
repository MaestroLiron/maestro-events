"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

// ==========================================
// TYPES
// ==========================================

type ClientService = {
id?: number;
serviceName: string;
amount: number;
};

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

services?: ClientService[];

createdAt?: string;
updatedAt?: string;
};

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

type ServiceStatistic = {
name: string;
count: number;
revenue: number;
};

type MonthlyStatistic = {
key: string;
label: string;
revenue: number;
paid: number;
services: number;
clients: number;
};

// ==========================================
// HELPERS
// ==========================================

const formatMoney = (value: number) => {
return `₪${Number(value || 0).toLocaleString("he-IL")}`;
};

const parseDate = (value: string | null | undefined) => {
if (!value) return null;

const date = new Date(value);

if (Number.isNaN(date.getTime())) {
return null;
}

return date;
};

// ==========================================
// DASHBOARD
// ==========================================

export default function AdminDashboard() {
const router = useRouter();

const [clientsCount, setClientsCount] = useState(0);
const [leadsCount, setLeadsCount] = useState(0);

const [clients, setClients] = useState<Client[]>([]);

const [loggingOut, setLoggingOut] = useState(false);

const [statisticsPeriod, setStatisticsPeriod] = useState<
"month" | "sixMonths" | "year" | "all"
>("month");

// ==========================================
// טעינת לקוחות
// ==========================================

useEffect(() => {
const loadClients = async () => {
try {
const response = await fetch("/api/testimonials/clients", {
cache: "no-store",
});

if (!response.ok) {
throw new Error("Failed to load clients");
}

const data: Client[] = await response.json();

setClients(data);
setClientsCount(data.length);
} catch (error) {
console.error("שגיאה בטעינת הלקוחות:", error);
}
};

loadClients();
}, []);

// ==========================================
// טעינת לידים
// ==========================================

useEffect(() => {
const loadLeads = async () => {
try {
const response = await fetch("/api/leads", {
cache: "no-store",
});

if (!response.ok) {
throw new Error("Failed to load leads");
}

const data: Lead[] = await response.json();

setLeadsCount(data.length);
} catch (error) {
console.error("שגיאה בטעינת הלידים:", error);
}
};

loadLeads();
}, []);

// ==========================================
// התנתקות
// ==========================================

const handleLogout = async () => {
try {
setLoggingOut(true);

const response = await fetch("/api/admin/logout", {
method: "POST",
});

if (!response.ok) {
throw new Error("Logout failed");
}

router.push("/admin");
router.refresh();
} catch (error) {
console.error("שגיאה בהתנתקות:", error);
setLoggingOut(false);
}
};

// ==========================================
// סטטיסטיקות כספיות
// ==========================================

const financialStats = useMemo(() => {
const totalSales = clients.reduce(
(sum, client) => sum + Number(client.totalAmount || 0),
0
);

const totalPaid = clients.reduce(
(sum, client) => sum + Number(client.paidAmount || 0),
0
);

const totalBalance = Math.max(0, totalSales - totalPaid);

return {
totalSales,
totalPaid,
totalBalance,
};
}, [clients]);

// ==========================================
// מספר אירועים
// ==========================================

const eventsCount = useMemo(() => {
return clients.filter((client) => Boolean(client.eventDate)).length;
}, [clients]);

// ==========================================
// סטטיסטיקות שירותים
// ==========================================

const serviceStatistics = useMemo<ServiceStatistic[]>(() => {
const statistics = new Map<
string,
{
count: number;
revenue: number;
}
>();

clients.forEach((client) => {
if (!Array.isArray(client.services)) {
return;
}

client.services.forEach((service) => {
const name = service.serviceName?.trim();

if (!name) return;

const amount = Number(service.amount) || 0;
const existing = statistics.get(name);

if (existing) {
existing.count += 1;
existing.revenue += amount;
} else {
statistics.set(name, {
count: 1,
revenue: amount,
});
}
});
});

return Array.from(statistics.entries())
.map(([name, data]) => ({
name,
count: data.count,
revenue: data.revenue,
}))
.sort((a, b) => {
if (b.count !== a.count) {
return b.count - a.count;
}

return b.revenue - a.revenue;
});
}, [clients]);

// ==========================================
// סה"כ שירותים שנמכרו
// ==========================================

const totalServicesSold = useMemo(() => {
return clients.reduce((sum, client) => {
if (!Array.isArray(client.services)) {
return sum;
}

return (
sum +
client.services.filter(
(service) => service.serviceName?.trim()
).length
);
}, 0);
}, [clients]);

// ==========================================
// השירות הכי נמכר
// ==========================================

const topService = serviceStatistics[0] || null;

// ==========================================
// השירות שהכניס הכי הרבה
// ==========================================

const topRevenueService = useMemo(() => {
if (serviceStatistics.length === 0) {
return null;
}

return [...serviceStatistics].sort(
(a, b) => b.revenue - a.revenue
)[0];
}, [serviceStatistics]);

// ==========================================
// תאריך בסיס לסטטיסטיקה
// ==========================================

const getClientDate = (client: Client) => {
return (
parseDate(client.eventDate) ||
parseDate(client.createdAt) ||
parseDate(client.updatedAt)
);
};

// ==========================================
// תאריך נוכחי
// ==========================================

const now = new Date();

// ==========================================
// בדיקה האם לקוח נמצא בתקופה
// ==========================================

const isClientInPeriod = (
client: Client,
period: "month" | "sixMonths" | "year" | "all"
) => {
if (period === "all") {
return true;
}

const date = getClientDate(client);

if (!date) {
return false;
}

const currentYear = now.getFullYear();
const currentMonth = now.getMonth();

if (period === "month") {
return (
date.getFullYear() === currentYear &&
date.getMonth() === currentMonth
);
}

if (period === "sixMonths") {
const start = new Date(
currentYear,
currentMonth - 5,
1
);

return date >= start;
}

if (period === "year") {
const start = new Date(
currentYear,
0,
1
);

return date >= start;
}

return true;
};

// ==========================================
// סטטיסטיקה לפי תקופה
// ==========================================

const periodStatistics = useMemo(() => {
const filteredClients = clients.filter((client) =>
isClientInPeriod(client, statisticsPeriod)
);

const sales = filteredClients.reduce(
(sum, client) =>
sum + Number(client.totalAmount || 0),
0
);

const paid = filteredClients.reduce(
(sum, client) =>
sum + Number(client.paidAmount || 0),
0
);

const services = filteredClients.reduce(
(sum, client) => {
if (!Array.isArray(client.services)) {
return sum;
}

return (
sum +
client.services.filter(
(service) => service.serviceName?.trim()
).length
);
},
0
);

return {
clients: filteredClients.length,
sales,
paid,
balance: Math.max(0, sales - paid),
services,
};
}, [clients, statisticsPeriod]);

// ==========================================
// סטטיסטיקה חודשית
// ==========================================

const monthlyStatistics = useMemo<MonthlyStatistic[]>(() => {
const months: MonthlyStatistic[] = [];

for (let i = 11; i >= 0; i--) {
const date = new Date(
now.getFullYear(),
now.getMonth() - i,
1
);

const year = date.getFullYear();
const month = date.getMonth();

const key = `${year}-${String(
month + 1
).padStart(2, "0")}`;

const label = date.toLocaleDateString(
"he-IL",
{
month: "short",
year: "numeric",
}
);

months.push({
key,
label,
revenue: 0,
paid: 0,
services: 0,
clients: 0,
});
}

clients.forEach((client) => {
const date = getClientDate(client);

if (!date) return;

const year = date.getFullYear();
const month = date.getMonth();

const key = `${year}-${String(
month + 1
).padStart(2, "0")}`;

const target = months.find(
(item) => item.key === key
);

if (!target) return;

target.revenue += Number(
client.totalAmount || 0
);

target.paid += Number(
client.paidAmount || 0
);

target.clients += 1;

if (Array.isArray(client.services)) {
target.services +=
client.services.filter(
(service) =>
service.serviceName?.trim()
).length;
}
});

return months;
}, [clients]);

// ==========================================
// חודש מקסימלי
// ==========================================

const maxMonthlyRevenue = useMemo(() => {
return Math.max(
1,
...monthlyStatistics.map(
(month) => month.revenue
)
);
}, [monthlyStatistics]);

// ==========================================
// מכירות 6 חודשים
// ==========================================

const sixMonthsSales = useMemo(() => {
return clients
.filter((client) =>
isClientInPeriod(client, "sixMonths")
)
.reduce(
(sum, client) =>
sum + Number(client.totalAmount || 0),
0
);
}, [clients]);

// ==========================================
// מכירות השנה
// ==========================================

const yearlySales = useMemo(() => {
return clients
.filter((client) =>
isClientInPeriod(client, "year")
)
.reduce(
(sum, client) =>
sum + Number(client.totalAmount || 0),
0
);
}, [clients]);

// ==========================================
// מכירות החודש
// ==========================================

const currentMonthSales = useMemo(() => {
return clients
.filter((client) =>
isClientInPeriod(client, "month")
)
.reduce(
(sum, client) =>
sum + Number(client.totalAmount || 0),
0
);
}, [clients]);

// ==========================================
// אחוז שירות
// ==========================================

const serviceTotalCount = useMemo(() => {
return serviceStatistics.reduce(
(sum, service) =>
sum + service.count,
0
);
}, [serviceStatistics]);

const servicesWithPercent = useMemo(() => {
return serviceStatistics.map(
(service) => ({
...service,
percentage:
serviceTotalCount > 0
? Math.round(
(service.count /
serviceTotalCount) *
100
)
: 0,
})
);
}, [
serviceStatistics,
serviceTotalCount,
]);

// ==========================================
// אירועים
// ==========================================

const calendarEvents = useMemo(() => {
return clients
.filter((client) =>
Boolean(client.eventDate)
)
.sort((a, b) => {
const dateA = parseDate(
a.eventDate
);

const dateB = parseDate(
b.eventDate
);

if (!dateA && !dateB) return 0;
if (!dateA) return 1;
if (!dateB) return -1;

return (
dateA.getTime() -
dateB.getTime()
);
});
}, [clients]);

// ==========================================
// RETURN
// ==========================================

return (
<main
className="
min-h-screen
bg-[#090909]
text-white
p-6
md:p-10
pt-24
md:pt-28
"
dir="rtl"
>

{/* ==========================================
כותרת
========================================== */}

<div
className="
mb-10
flex
flex-col
md:flex-row
md:items-start
md:justify-between
gap-6
"
>
<div>
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
mb-3
"
>
ברוכים הבאים לדאשבורד
</h1>

<p className="text-gray-400 text-lg">
מכאן תוכלו לנהל את כל האתר,
הלקוחות, האירועים והעסק במקום אחד.
</p>
</div>

<button
onClick={handleLogout}
disabled={loggingOut}
className="
group
shrink-0
flex
items-center
justify-center
gap-2
rounded-xl
border
border-red-500/40
bg-red-500/10
px-6
py-3
text-red-400
font-semibold
transition-all
duration-300
hover:bg-red-500
hover:text-white
hover:border-red-500
hover:shadow-[0_0_25px_rgba(239,68,68,0.35)]
active:scale-95
disabled:opacity-50
disabled:cursor-not-allowed
"
>
<span className="text-lg">
↪
</span>

<span>
{loggingOut
? "מתנתק..."
: "התנתקות"}
</span>
</button>
</div>

{/* ==========================================
סטטיסטיקות ראשיות
========================================== */}

<div
className="
grid
grid-cols-1
sm:grid-cols-2
lg:grid-cols-3
xl:grid-cols-6
gap-5
mb-10
"
>

{/* לקוחות */}

<Link
href="/admin/clients"
className="
bg-[#111]
border
border-[#292929]
rounded-2xl
p-6
hover:border-[#D4AF37]
hover:bg-[#151515]
transition
"
>
<p className="text-gray-400 mb-3">
👥 לקוחות
</p>

<p className="text-4xl font-bold text-[#D4AF37]">
{clientsCount}
</p>

<p className="text-gray-500 text-sm mt-2">
לקוחות במערכת
</p>
</Link>

{/* אירועים */}

<Link
href="/admin/calendar"
className="
bg-[#111]
border
border-[#292929]
rounded-2xl
p-6
hover:border-[#D4AF37]
hover:bg-[#151515]
transition
"
>
<p className="text-gray-400 mb-3">
🎉 אירועים
</p>

<p className="text-4xl font-bold text-[#D4AF37]">
{eventsCount}
</p>

<p className="text-gray-500 text-sm mt-2">
אירועים עם תאריך
</p>
</Link>

{/* עסקאות */}

<div
className="
bg-[#111]
border
border-[#292929]
rounded-2xl
p-6
"
>
<p className="text-gray-400 mb-3">
💰 עסקאות
</p>

<p className="text-3xl font-bold text-[#D4AF37]">
{formatMoney(
financialStats.totalSales
)}
</p>

<p className="text-gray-500 text-sm mt-2">
שווי העסקאות
</p>
</div>

{/* שולם */}

<div
className="
bg-[#111]
border
border-[#292929]
rounded-2xl
p-6
"
>
<p className="text-gray-400 mb-3">
💵 שולם
</p>

<p className="text-3xl font-bold text-green-400">
{formatMoney(
financialStats.totalPaid
)}
</p>

<p className="text-gray-500 text-sm mt-2">
סה״כ התקבל מהלקוחות
</p>
</div>

{/* יתרה */}

<Link
href="/admin/clients"
className="
bg-[#111]
border
border-[#292929]
rounded-2xl
p-6
hover:border-orange-400
hover:bg-[#151515]
transition
"
>
<p className="text-gray-400 mb-3">
🧾 יתרה
</p>

<p className="text-3xl font-bold text-orange-400">
{formatMoney(
financialStats.totalBalance
)}
</p>

<p className="text-gray-500 text-sm mt-2">
נותר לגבייה
</p>
</Link>

{/* שירותים */}

<Link
href="/admin/services"
className="
bg-[#111]
border
border-[#292929]
rounded-2xl
p-6
hover:border-[#D4AF37]
hover:bg-[#151515]
transition
"
>
<p className="text-gray-400 mb-3">
🛠️ שירותים
</p>

<p className="text-4xl font-bold text-[#D4AF37]">
{totalServicesSold}
</p>

<p className="text-gray-500 text-sm mt-2">
שירותים שנמכרו
</p>
</Link>
</div>

{/* ==========================================
מרכז הסטטיסטיקה
========================================== */}

<section
className="
bg-[#111]
border
border-[#292929]
rounded-3xl
overflow-hidden
mb-12
"
>

<div
className="
p-6
md:p-8
border-b
border-[#292929]
"
>
<div
className="
flex
flex-col
lg:flex-row
lg:items-center
lg:justify-between
gap-6
"
>

<div>
<p className="text-[#D4AF37] text-sm mb-2">
📊 MAESTRO ANALYTICS
</p>

<h2 className="text-3xl font-bold">
סטטיסטיקת מכירות
</h2>

<p className="text-gray-500 mt-2">
מעקב אחר המכירות, השירותים
וההכנסות של העסק.
</p>
</div>

<div
className="
flex
flex-wrap
gap-2
bg-[#090909]
p-2
rounded-2xl
border
border-[#292929]
"
>

{[
{
value: "month" as const,
label: "החודש",
},
{
value: "sixMonths" as const,
label: "6 חודשים",
},
{
value: "year" as const,
label: "השנה",
},
{
value: "all" as const,
label: "הכל",
},
].map((item) => (
<button
key={item.value}
onClick={() =>
setStatisticsPeriod(
item.value
)
}
className={`
px-4
py-2
rounded-xl
text-sm
font-semibold
transition
${
statisticsPeriod ===
item.value
? "bg-[#D4AF37] text-black"
: "text-gray-400 hover:text-white"
}
`}
>
{item.label}
</button>
))}
</div>
</div>
</div>

{/* כרטיסי תקופה */}

<div
className="
grid
grid-cols-1
sm:grid-cols-2
lg:grid-cols-4
gap-4
p-6
md:p-8
"
>

<div
className="
bg-[#090909]
border
border-[#292929]
rounded-2xl
p-6
"
>
<p className="text-gray-500 text-sm mb-3">
💰 מכירות בתקופה
</p>

<p className="text-3xl font-bold text-[#D4AF37]">
{formatMoney(
periodStatistics.sales
)}
</p>

<p className="text-gray-600 text-sm mt-2">
שווי העסקאות
</p>
</div>

<div
className="
bg-[#090909]
border
border-[#292929]
rounded-2xl
p-6
"
>
<p className="text-gray-500 text-sm mb-3">
💵 התקבל
</p>

<p className="text-3xl font-bold text-green-400">
{formatMoney(
periodStatistics.paid
)}
</p>

<p className="text-gray-600 text-sm mt-2">
כסף שהתקבל בפועל
</p>
</div>

<div
className="
bg-[#090909]
border
border-[#292929]
rounded-2xl
p-6
"
>
<p className="text-gray-500 text-sm mb-3">
👥 לקוחות
</p>

<p className="text-3xl font-bold text-white">
{periodStatistics.clients}
</p>

<p className="text-gray-600 text-sm mt-2">
לקוחות בתקופה
</p>
</div>

<div
className="
bg-[#090909]
border
border-[#292929]
rounded-2xl
p-6
"
>
<p className="text-gray-500 text-sm mb-3">
🛠️ שירותים
</p>

<p className="text-3xl font-bold text-[#D4AF37]">
{periodStatistics.services}
</p>

<p className="text-gray-600 text-sm mt-2">
שירותים שנמכרו
</p>
</div>
</div>

{/* ==========================================
4 עיגולי סיכום
========================================== */}

<div
className="
grid
grid-cols-2
lg:grid-cols-4
gap-6
px-6
md:px-8
pb-8
"
>

{/* חודש */}

<div
className="
bg-[#090909]
border
border-[#292929]
rounded-3xl
p-6
flex
flex-col
items-center
text-center
"
>
<div
className="
w-36
h-36
rounded-full
border-[10px]
border-[#D4AF37]/20
border-t-[#D4AF37]
border-r-[#D4AF37]
flex
items-center
justify-center
mb-5
"
>
<div>
<p className="text-2xl font-bold text-[#D4AF37]">
{formatMoney(
currentMonthSales
)}
</p>

<p className="text-gray-600 text-xs mt-1">
החודש
</p>
</div>
</div>

<h3 className="font-bold">
מכירות החודש
</h3>
</div>

{/* 6 חודשים */}

<div
className="
bg-[#090909]
border
border-[#292929]
rounded-3xl
p-6
flex
flex-col
items-center
text-center
"
>
<div
className="
w-36
h-36
rounded-full
border-[10px]
border-green-400/20
border-t-green-400
border-r-green-400
flex
items-center
justify-center
mb-5
"
>
<div>
<p className="text-2xl font-bold text-green-400">
{formatMoney(
sixMonthsSales
)}
</p>

<p className="text-gray-600 text-xs mt-1">
6 חודשים
</p>
</div>
</div>

<h3 className="font-bold">
מכירות 6 חודשים
</h3>
</div>

{/* שנה */}

<div
className="
bg-[#090909]
border
border-[#292929]
rounded-3xl
p-6
flex
flex-col
items-center
text-center
"
>
<div
className="
w-36
h-36
rounded-full
border-[10px]
border-blue-400/20
border-t-blue-400
border-r-blue-400
flex
items-center
justify-center
mb-5
"
>
<div>
<p className="text-2xl font-bold text-blue-400">
{formatMoney(
yearlySales
)}
</p>

<p className="text-gray-600 text-xs mt-1">
השנה
</p>
</div>
</div>

<h3 className="font-bold">
מכירות השנה
</h3>
</div>

{/* הכל */}

<div
className="
bg-[#090909]
border
border-[#D4AF37]/30
rounded-3xl
p-6
flex
flex-col
items-center
text-center
"
>
<div
className="
w-36
h-36
rounded-full
border-[10px]
border-[#D4AF37]/20
border-t-[#D4AF37]
border-r-[#D4AF37]
border-b-[#D4AF37]
flex
items-center
justify-center
mb-5
"
>
<div>
<p className="text-2xl font-bold text-[#D4AF37]">
{formatMoney(
financialStats.totalSales
)}
</p>

<p className="text-gray-600 text-xs mt-1">
כל הזמנים
</p>
</div>
</div>

<h3 className="font-bold">
סך כל המכירות
</h3>
</div>
</div>

{/* ==========================================
גרף מכירות חודשי
========================================== */}

<div
className="
mx-6
md:mx-8
mb-8
bg-[#090909]
border
border-[#292929]
rounded-3xl
p-6
"
>
<div className="mb-6">
<h3 className="text-xl font-bold">
📈 מכירות לפי חודש
</h3>

<p className="text-gray-500 text-sm mt-2">
ביצועי המכירות ב־12 החודשים האחרונים.
</p>
</div>

<div
className="
flex
items-end
gap-2
md:gap-4
h-64
overflow-x-auto
pb-2
"
>
{monthlyStatistics.map(
(month) => {
const height =
month.revenue > 0
? Math.max(
8,
(month.revenue /
maxMonthlyRevenue) *
100
)
: 4;

return (
<div
key={month.key}
className="
min-w-[55px]
md:min-w-[70px]
h-full
flex
flex-col
justify-end
items-center
gap-2
"
>
<div
className="
text-[10px]
md:text-xs
text-gray-500
text-center
whitespace-nowrap
"
>
{formatMoney(
month.revenue
)}
</div>

<div
className="
w-8
md:w-10
rounded-t-xl
bg-[#D4AF37]
transition-all
duration-500
hover:bg-[#e5c451]
"
style={{
height: `${height}%`,
}}
title={`${month.label}: ${formatMoney(
month.revenue
)}`}
/>

<div
className="
text-[10px]
md:text-xs
text-gray-500
whitespace-nowrap
"
>
{month.label}
</div>
</div>
);
}
)}
</div>
</div>

{/* ==========================================
שירותים - עיגולים
========================================== */}

<div
className="
px-6
md:px-8
pb-8
"
>
<div className="mb-6">
<h3 className="text-2xl font-bold">
🛠️ מכירות לפי שירות
</h3>

<p className="text-gray-500 mt-2">
התפלגות המכירות בין השירותים השונים.
</p>
</div>

{servicesWithPercent.length === 0 ? (
<div
className="
bg-[#090909]
border
border-[#292929]
rounded-2xl
p-10
text-center
"
>
<div className="text-5xl mb-4">
🛠️
</div>

<p className="text-gray-400">
עדיין אין נתוני שירותים.
</p>
</div>
) : (
<div
className="
grid
grid-cols-2
sm:grid-cols-3
lg:grid-cols-4
xl:grid-cols-6
gap-5
"
>
{servicesWithPercent
.slice(0, 12)
.map((service) => {
const radius = 46;

const circumference =
2 * Math.PI * radius;

const dash =
(service.percentage /
100) *
circumference;

return (
<Link
key={service.name}
href="/admin/services"
className="
bg-[#090909]
border
border-[#292929]
rounded-2xl
p-5
text-center
hover:border-[#D4AF37]/50
transition
"
>
<div
className="
relative
w-32
h-32
mx-auto
mb-4
"
>
<svg
width="128"
height="128"
viewBox="0 0 128 128"
className="-rotate-90"
>
<circle
cx="64"
cy="64"
r={radius}
fill="none"
stroke="currentColor"
strokeWidth="10"
className="text-[#292929]"
/>

<circle
cx="64"
cy="64"
r={radius}
fill="none"
stroke="currentColor"
strokeWidth="10"
strokeLinecap="round"
className="text-[#D4AF37]"
strokeDasharray={`${dash} ${circumference}`}
/>
</svg>

<div
className="
absolute
inset-0
flex
flex-col
items-center
justify-center
"
>
<span className="text-2xl font-bold text-[#D4AF37]">
{service.count}
</span>

<span className="text-[10px] text-gray-500">
מכירות
</span>
</div>
</div>

<p
className="
font-bold
text-sm
min-h-[40px]
flex
items-center
justify-center
"
>
{service.name}
</p>

<p className="text-[#D4AF37] font-bold mt-2">
{formatMoney(
service.revenue
)}
</p>

<p className="text-gray-600 text-xs mt-1">
{service.percentage}%
מכלל השירותים
</p>
</Link>
);
})}
</div>
)}
</div>
</section>

{/* ==========================================
שירות מוביל + ביצועי שירותים
========================================== */}

<section
className="
grid
grid-cols-1
lg:grid-cols-3
gap-6
mb-12
"
>

{/* השירות המוביל */}

<div
className="
bg-[#111]
border
border-[#D4AF37]/30
rounded-2xl
p-7
relative
overflow-hidden
"
>
<div
className="
absolute
-top-20
-left-20
w-40
h-40
bg-[#D4AF37]/10
rounded-full
blur-3xl
"
/>

<div className="relative">
<p className="text-[#D4AF37] text-sm mb-3">
🏆 השירות המוביל
</p>

{topService ? (
<>
<h2 className="text-3xl font-bold mb-3">
{topService.name}
</h2>

<div className="flex flex-wrap gap-6">

<div>
<p className="text-gray-500 text-sm">
נמכר
</p>

<p className="text-xl font-bold">
{topService.count} פעמים
</p>
</div>

<div>
<p className="text-gray-500 text-sm">
הכנסה
</p>

<p className="text-xl font-bold text-[#D4AF37]">
{formatMoney(
topService.revenue
)}
</p>
</div>
</div>

{topRevenueService && (
<div className="mt-6 pt-6 border-t border-[#292929]">
<p className="text-gray-500 text-sm">
💰 השירות שהכניס הכי הרבה
</p>

<p className="font-bold mt-1">
{topRevenueService.name}
</p>

<p className="text-[#D4AF37] mt-1">
{formatMoney(
topRevenueService.revenue
)}
</p>
</div>
)}
</>
) : (
<>
<h2 className="text-2xl font-bold mb-2">
עדיין אין נתונים
</h2>

<p className="text-gray-500">
לאחר שתוסיף שירותים ללקוחות,
הסטטיסטיקה תופיע כאן.
</p>
</>
)}
</div>
</div>

{/* ביצועי השירותים */}

<div
className="
lg:col-span-2
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
<h2 className="text-2xl font-bold">
📊 ביצועי השירותים
</h2>

<p className="text-gray-500 mt-2">
כמה פעמים כל שירות נמכר וכמה הכנסה הוא יצר.
</p>
</div>

{serviceStatistics.length === 0 ? (
<div className="p-10 text-center">
<div className="text-4xl mb-3">
🛠️
</div>

<p className="text-gray-400">
עדיין אין שירותים שנמכרו.
</p>

<p className="text-gray-600 text-sm mt-2">
הוסף שירותים מתוך ניהול הלקוחות.
</p>
</div>
) : (
<div className="divide-y divide-[#292929]">
{serviceStatistics
.slice(0, 8)
.map((service, index) => (
<Link
key={service.name}
href="/admin/services"
className="
p-5
flex
flex-col
sm:flex-row
sm:items-center
gap-4
hover:bg-[#151515]
transition
"
>
<div
className="
w-10
h-10
rounded-xl
bg-[#D4AF37]/10
border
border-[#D4AF37]/30
flex
items-center
justify-center
text-[#D4AF37]
font-bold
shrink-0
"
>
{index + 1}
</div>

<div className="flex-1">
<p className="font-bold">
{service.name}
</p>

<p className="text-gray-500 text-sm mt-1">
{service.count} הזמנות
</p>
</div>

<div className="text-left">
<p className="text-[#D4AF37] font-bold">
{formatMoney(
service.revenue
)}
</p>

<p className="text-gray-600 text-xs mt-1">
הכנסה
</p>
</div>
</Link>
))}
</div>
)}
</div>
</section>

{/* ==========================================
לידים
========================================== */}

<div
className="
grid
grid-cols-1
md:grid-cols-2
gap-5
mb-12
"
>
<Link
href="/admin/leads"
className="
bg-[#111]
border
border-[#292929]
rounded-2xl
p-6
hover:border-[#D4AF37]
hover:bg-[#151515]
transition
"
>
<p className="text-gray-400 mb-3">
📞 לידים
</p>

<p className="text-4xl font-bold text-[#D4AF37]">
{leadsCount}
</p>

<p className="text-gray-500 text-sm mt-2">
פניות שהתקבלו מהאתר
</p>

<p className="text-[#D4AF37] text-sm mt-4">
מעבר לניהול לידים ←
</p>
</Link>

<Link
href="/admin/clients"
className="
bg-[#111]
border
border-[#292929]
rounded-2xl
p-6
hover:border-[#D4AF37]
hover:bg-[#151515]
transition
"
>
<p className="text-gray-400 mb-3">
📈 ממוצע עסקה
</p>

<p className="text-4xl font-bold text-[#D4AF37]">
{clientsCount > 0
? formatMoney(
financialStats.totalSales /
clientsCount
)
: "₪0"}
</p>

<p className="text-gray-500 text-sm mt-2">
ממוצע שווי עסקה ללקוח
</p>
</Link>
</div>

{/* ==========================================
יומן אירועים
========================================== */}

<section
className="
bg-[#111]
border
border-[#292929]
rounded-2xl
overflow-hidden
mb-12
"
>
<div
className="
p-6
border-b
border-[#292929]
flex
flex-col
md:flex-row
md:items-center
md:justify-between
gap-4
"
>
<div>
<div className="flex items-center gap-3">
<span className="text-3xl">
📅
</span>

<h2 className="text-2xl font-bold">
יומן אירועים
</h2>
</div>

<p className="text-gray-500 mt-2">
האירועים הקרובים של הלקוחות במערכת
</p>
</div>

<Link
href="/admin/calendar"
className="
inline-flex
items-center
justify-center
border
border-[#D4AF37]
text-[#D4AF37]
px-6
py-3
rounded-xl
hover:bg-[#D4AF37]
hover:text-black
transition
font-semibold
"
>
פתיחת היומן המלא →
</Link>
</div>

{calendarEvents.length === 0 ? (
<div className="p-12 text-center">
<div className="text-5xl mb-4">
📅
</div>

<h3 className="text-xl font-bold mb-2">
אין אירועים ביומן
</h3>

<p className="text-gray-500">
כאשר ללקוח יהיה תאריך אירוע,
הוא יוצג כאן.
</p>
</div>
) : (
<div className="divide-y divide-[#292929]">
{calendarEvents
.slice(0, 5)
.map((client) => {
const eventDate =
parseDate(
client.eventDate
);

return (
<Link
key={client.id}
href={`/admin/clients`}
className="
block
p-5
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
md:justify-between
gap-4
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
w-14
h-14
rounded-xl
bg-[#D4AF37]/10
border
border-[#D4AF37]/30
flex
flex-col
items-center
justify-center
shrink-0
"
>
<span className="text-[#D4AF37] text-xs">
תאריך
</span>

<span className="font-bold text-sm">
{eventDate
? eventDate.toLocaleDateString(
"he-IL",
{
day: "2-digit",
month: "2-digit",
}
)
: "—"}
</span>
</div>

<div>
<h3 className="font-bold text-lg">
{client.name}
</h3>

<p className="text-gray-400 text-sm mt-1">
{client.eventType ||
"אירוע"}
</p>
</div>
</div>

<div
className="
flex
flex-wrap
gap-4
text-sm
"
>
<span className="text-gray-400">
📅{" "}
{eventDate
? eventDate.toLocaleDateString(
"he-IL"
)
: "—"}
</span>

{client.location && (
<span className="text-gray-400">
📍 {client.location}
</span>
)}

{client.guests && (
<span className="text-gray-400">
👥 {client.guests}
</span>
)}

<span className="text-[#D4AF37]">
{client.status}
</span>
</div>
</div>
</Link>
);
})}
</div>
)}

{calendarEvents.length > 5 && (
<div
className="
p-5
border-t
border-[#292929]
text-center
"
>
<Link
href="/admin/calendar"
className="
text-[#D4AF37]
hover:underline
"
>
הצג את כל{" "}
{calendarEvents.length}{" "}
האירועים →
</Link>
</div>
)}
</section>

{/* ==========================================
ניהול האתר
========================================== */}

<div className="mb-6">
<h2 className="text-2xl font-bold">
ניהול האתר
</h2>

<p className="text-gray-500 mt-2">
ניהול התוכן והמערכת של Maestro Events
</p>
</div>

<div
className="
grid
grid-cols-1
md:grid-cols-2
lg:grid-cols-3
gap-6
"
>

{/* תיק עבודות */}

<Link
href="/admin/portfolio"
className="
bg-[#111]
border
border-[#292929]
hover:border-[#D4AF37]
rounded-2xl
p-7
transition
block
"
>
<div className="text-4xl mb-5">
🖼️
</div>

<h3 className="text-xl font-bold mb-2">
תיק עבודות
</h3>

<p className="text-gray-400 mb-5">
הוספה, מחיקה וניהול של תמונות וקטגוריות.
</p>

<div
className="
w-full
text-center
border
border-[#D4AF37]
text-[#D4AF37]
py-3
rounded-xl
hover:bg-[#D4AF37]
hover:text-black
transition
"
>
ניהול תיק עבודות
</div>
</Link>

{/* שירותים */}

<Link
href="/admin/services"
className="
bg-[#111]
border
border-[#292929]
hover:border-[#D4AF37]
rounded-2xl
p-7
transition
block
"
>
<div className="text-4xl mb-5">
🛠️
</div>

<h3 className="text-xl font-bold mb-2">
שירותים
</h3>

<p className="text-gray-400 mb-5">
שינוי שמות, תיאורים, תמונות וסדר השירותים.
</p>

<div
className="
w-full
text-center
border
border-[#D4AF37]
text-[#D4AF37]
py-3
rounded-xl
hover:bg-[#D4AF37]
hover:text-black
transition
"
>
ניהול שירותים
</div>
</Link>

{/* המלצות */}

<div
className="
bg-[#111]
border
border-[#292929]
hover:border-[#D4AF37]
rounded-2xl
p-7
transition
"
>
<div className="text-4xl mb-5">
⭐
</div>

<h3 className="text-xl font-bold mb-2">
המלצות
</h3>

<p className="text-gray-400 mb-5">
הוספה, עריכה ומחיקה של המלצות לקוחות.
</p>

<Link
href="/admin/testimonials"
className="
block
w-full
text-center
border
border-[#D4AF37]
text-[#D4AF37]
py-3
rounded-xl
hover:bg-[#D4AF37]
hover:text-black
transition
"
>
ניהול המלצות
</Link>
</div>

{/* גלריות */}

<div
className="
bg-[#111]
border
border-[#292929]
hover:border-[#D4AF37]
rounded-2xl
p-7
transition
"
>
<div className="text-4xl mb-5">
📸
</div>

<h3 className="text-xl font-bold mb-2">
גלריות לקוחות
</h3>

<p className="text-gray-400 mb-5">
יצירה וניהול של גלריות פרטיות ללקוחות.
</p>

<Link
href="/admin/galleries"
className="
block
w-full
text-center
border
border-[#D4AF37]
text-[#D4AF37]
py-3
rounded-xl
hover:bg-[#D4AF37]
hover:text-black
transition
"
>
ניהול גלריות
</Link>
</div>

{/* לקוחות */}

<div
className="
bg-[#111]
border
border-[#292929]
hover:border-[#D4AF37]
rounded-2xl
p-7
transition
"
>
<div className="text-4xl mb-5">
👥
</div>

<h3 className="text-xl font-bold mb-2">
לקוחות
</h3>

<p className="text-gray-400 mb-5">
ניהול לקוחות, פרטי אירוע,
שירותים והיסטוריית הזמנות.
</p>

<Link
href="/admin/clients"
className="
block
w-full
text-center
border
border-[#D4AF37]
text-[#D4AF37]
py-3
rounded-xl
hover:bg-[#D4AF37]
hover:text-black
transition
"
>
ניהול לקוחות
</Link>
</div>

{/* חוזים */}

<div
className="
bg-[#111]
border
border-[#292929]
hover:border-[#D4AF37]
rounded-2xl
p-7
transition
"
>
<div className="text-4xl mb-5">
📄
</div>

<h3 className="text-xl font-bold mb-2">
חוזים וחתימות
</h3>

<p className="text-gray-400 mb-5">
יצירת חוזים, שליחה ללקוחות,
חתימה דיגיטלית ושמירת החוזים החתומים.
</p>

<Link
href="/admin/contracts"
className="
block
w-full
text-center
border
border-[#D4AF37]
text-[#D4AF37]
py-3
rounded-xl
hover:bg-[#D4AF37]
hover:text-black
transition
"
>
ניהול חוזים
</Link>
</div>

{/* קבלות */}

<div
className="
bg-[#111]
border
border-[#292929]
hover:border-[#D4AF37]
rounded-2xl
p-7
transition
"
>
<div className="text-4xl mb-5">
🧾
</div>

<h3 className="text-xl font-bold mb-2">
קבלות
</h3>

<p className="text-gray-400 mb-5">
יצירה, שמירה וניהול של קבלות ללקוחות.
</p>

<Link
href="/admin/receipts"
className="
block
w-full
text-center
border
border-[#D4AF37]
text-[#D4AF37]
py-3
rounded-xl
hover:bg-[#D4AF37]
hover:text-black
transition
"
>
ניהול קבלות
</Link>
</div>

{/* הצעות מחיר */}

<div
className="
bg-[#111]
border
border-[#292929]
hover:border-[#D4AF37]
rounded-2xl
p-7
transition
"
>
<div className="text-4xl mb-5">
💰
</div>

<h3 className="text-xl font-bold mb-2">
הצעות מחיר
</h3>

<p className="text-gray-400 mb-5">
יצירה, שמירה ושליחה של הצעות מחיר ללקוחות.
</p>

<Link
href="/admin/quotes"
className="
block
w-full
text-center
border
border-[#D4AF37]
text-[#D4AF37]
py-3
rounded-xl
hover:bg-[#D4AF37]
hover:text-black
transition
"
>
ניהול הצעות מחיר
</Link>
</div>

{/* פניות */}

<Link
href="/admin/leads"
className="
block
bg-[#111]
border
border-[#292929]
hover:border-[#D4AF37]
rounded-2xl
p-7
transition
cursor-pointer
"
>
<div className="text-4xl mb-5">
📞
</div>

<h3 className="text-xl font-bold mb-2">
פניות מהאתר
</h3>

<p className="text-gray-400 mb-5">
צפייה בפניות והצעות מחיר שנשלחו דרך האתר.
</p>

<div
className="
w-full
text-center
border
border-[#D4AF37]
text-[#D4AF37]
py-3
rounded-xl
hover:bg-[#D4AF37]
hover:text-black
transition
"
>
צפייה בפניות ({leadsCount})
</div>
</Link>

{/* הגדרות */}

<div
className="
bg-[#111]
border
border-[#292929]
hover:border-[#D4AF37]
rounded-2xl
p-7
transition
"
>
<div className="text-4xl mb-5">
⚙️
</div>

<h3 className="text-xl font-bold mb-2">
הגדרות האתר
</h3>

<p className="text-gray-400 mb-5">
ניהול הגדרות ותוכן כללי של האתר.
</p>

<Link
href="/admin/settings"
className="
block
w-full
text-center
border
border-[#D4AF37]
text-[#D4AF37]
py-3
rounded-xl
hover:bg-[#D4AF37]
hover:text-black
transition
"
>
הגדרות
</Link>
</div>
</div>

{/* ==========================================
פעולות מהירות
========================================== */}

<div className="mt-12">
<h2 className="text-2xl font-bold mb-6">
פעולות מהירות
</h2>

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
grid
grid-cols-1
md:grid-cols-2
lg:grid-cols-3
xl:grid-cols-6
gap-4
"
>

{/* לקוח חדש */}

<Link
href="/admin/clients"
className="
block
text-center
bg-[#D4AF37]
text-black
font-semibold
py-4
rounded-xl
hover:bg-[#c89d24]
transition
"
>
+ לקוח חדש
</Link>

{/* יומן */}

<Link
href="/admin/calendar"
className="
block
text-center
border
border-[#D4AF37]
text-[#D4AF37]
font-semibold
py-4
rounded-xl
hover:bg-[#D4AF37]
hover:text-black
transition
"
>
📅 יומן אירועים
</Link>

{/* תיק עבודות */}

<Link
href="/admin/portfolio"
className="
block
text-center
border
border-[#D4AF37]
text-[#D4AF37]
font-semibold
py-4
rounded-xl
hover:bg-[#D4AF37]
hover:text-black
transition
"
>
🖼️ תיק עבודות
</Link>

{/* שירותים */}

<Link
href="/admin/services"
className="
block
text-center
border
border-[#D4AF37]
text-[#D4AF37]
font-semibold
py-4
rounded-xl
hover:bg-[#D4AF37]
hover:text-black
transition
"
>
🛠️ שירות חדש
</Link>

{/* חוזים */}

<Link
href="/admin/contracts"
className="
block
text-center
border
border-[#D4AF37]
text-[#D4AF37]
font-semibold
py-4
rounded-xl
hover:bg-[#D4AF37]
hover:text-black
transition
"
>
📄 חוזים
</Link>

{/* הצעת מחיר */}

<Link
href="/admin/quotes"
className="
block
text-center
border
border-[#D4AF37]
text-[#D4AF37]
font-semibold
py-4
rounded-xl
hover:bg-[#D4AF37]
hover:text-black
transition
"
>
💰 הצעת מחיר
</Link>
</div>
</div>
</div>

{/* ==========================================
תחתית
========================================== */}

<div className="mt-8 text-center text-gray-600 text-sm">
Maestro Events Admin Dashboard
</div>
</main>
);
}