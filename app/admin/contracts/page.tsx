"use client";

import { useEffect, useMemo, useState } from "react";
import { buildContractContent } from "@/lib/contracts";

// ======================================================
// TYPES
// ======================================================

type ClientService = {
id?: number;
serviceName: string;
amount?: number | string | null;
};

type Client = {
id: number;
name: string;
phone?: string | null;
email?: string | null;
eventType?: string | null;
eventDate?: string | null;
guests?: number | string | null;
location?: string | null;

totalAmount?: number | string | null;
paidAmount?: number | string | null;
notes?: string | null;
additionalInfo?: string | null;

alcoholList?: string | null;

services?: ClientService[];
};

type ContractTemplate = {
id: number;
name: string;
description?: string | null;
content: string;
isActive: boolean;
serviceId?: number | null;
service?: {
id: number;
title: string;
} | null;
};

type Contract = {
id: number;
clientId: number;
templateId?: number | null;
serviceId?: number | null;

title: string;
content: string;
status: string;

totalAmount: number | null;
depositAmount: number | null;
remainingAmount: number | null;
depositPercent?: number | null;

publicToken?: string | null;

createdAt: string;
updatedAt?: string;

sentAt?: string | null;
signedAt?: string | null;

signatureData?: string | null;
marketingConsent?: boolean | null;

client?: {
id: number;
name: string;
phone?: string | null;
email?: string | null;
eventType?: string | null;
eventDate?: string | null;
guests?: number | string | null;
location?: string | null;
totalAmount?: number | string | null;
paidAmount?: number | string | null;
notes?: string | null;
additionalInfo?: string | null;
alcoholList?: string | null;
services?: ClientService[];
} | null;

template?: {
id: number;
name?: string;
description?: string | null;
} | null;

service?: {
id: number;
title: string;
} | null;
};

// ======================================================
// PAGE
// ======================================================

export default function ContractsPage() {
const [contracts, setContracts] = useState<Contract[]>([]);
const [clients, setClients] = useState<Client[]>([]);
const [contractTemplates, setContractTemplates] = useState<
ContractTemplate[]
>([]);

const [loading, setLoading] = useState(true);
const [loadingClients, setLoadingClients] = useState(true);
const [loadingTemplates, setLoadingTemplates] = useState(true);

const [error, setError] = useState("");
const [clientError, setClientError] = useState("");

const [showCreateModal, setShowCreateModal] = useState(false);
const [creating, setCreating] = useState(false);

const [selectedClientId, setSelectedClientId] = useState("");

const [title, setTitle] = useState("");
const [content, setContent] = useState("");

const [totalAmount, setTotalAmount] = useState("");

// =====================================================
// DEPOSIT
// =====================================================

const [hasDeposit, setHasDeposit] = useState(false);

const [depositMode, setDepositMode] = useState<
"percent" | "amount"
>("percent");

const [depositPercent, setDepositPercent] = useState("15");

const [depositAmountInput, setDepositAmountInput] =
useState("");

// =====================================================
// SELECTED CONTRACT
// =====================================================

const [selectedContract, setSelectedContract] =
useState<Contract | null>(null);

// =====================================================
// PREVIEW / EDIT
// =====================================================

const [createView, setCreateView] = useState<
"edit" | "preview"
>("preview");

// =====================================================
// SIGNED NOTIFICATION
// =====================================================

const [signedNotification, setSignedNotification] =
useState<number | null>(null);

// =====================================================
// NUMBER HELPERS
// =====================================================

function numericValue(
value: number | string | null | undefined
): number {
if (
value === null ||
value === undefined ||
value === ""
) {
return 0;
}

const number = Number(value);

return Number.isFinite(number) ? number : 0;
}

function money(
value: number | string | null | undefined
): string {
if (
value === null ||
value === undefined ||
value === ""
) {
return "-";
}

const number = Number(value);

if (!Number.isFinite(number)) {
return "-";
}

return `₪${number.toLocaleString("he-IL", {
maximumFractionDigits: 2,
})}`;
}

// =====================================================
// LOAD CONTRACTS
// =====================================================

async function loadContracts(showLoading = true) {
try {
if (showLoading) {
setLoading(true);
}

setError("");

const response = await fetch("/api/contracts", {
method: "GET",
cache: "no-store",
});

const responseText = await response.text();

let data: any = null;

if (responseText.trim()) {
try {
data = JSON.parse(responseText);
} catch {
data = {
error: responseText,
};
}
}

if (!response.ok) {
throw new Error(
data?.error ||
`שגיאה בטעינת החוזים (${response.status})`
);
}

const contractsData: Contract[] = Array.isArray(data)
? data
: Array.isArray(data?.contracts)
? data.contracts
: [];

setContracts((previousContracts) => {
for (const newContract of contractsData) {
const oldContract = previousContracts.find(
(item) => item.id === newContract.id
);

if (
oldContract &&
oldContract.status !== "SIGNED" &&
newContract.status === "SIGNED"
) {
setSignedNotification(newContract.id);
}
}

return contractsData;
});

setSelectedContract((currentSelected) => {
if (!currentSelected) {
return currentSelected;
}

const updatedContract = contractsData.find(
(item) => item.id === currentSelected.id
);

return updatedContract || currentSelected;
});
} catch (error) {
console.error("❌ Contracts load error:", error);

if (showLoading) {
setError(
error instanceof Error
? error.message
: "לא ניתן לטעון את החוזים"
);
}
} finally {
if (showLoading) {
setLoading(false);
}
}
}

// =====================================================
// LOAD CLIENTS
// =====================================================

async function loadClients() {
try {
setLoadingClients(true);
setClientError("");

const response = await fetch(
"/api/testimonials/clients",
{
method: "GET",
cache: "no-store",
}
);

const responseText = await response.text();

let data: any = null;

if (responseText.trim()) {
try {
data = JSON.parse(responseText);
} catch {
data = {
error: responseText,
};
}
}

if (!response.ok) {
throw new Error(
data?.error ||
`שגיאה בטעינת הלקוחות (${response.status})`
);
}

const clientsData: Client[] = Array.isArray(data)
? data
: Array.isArray(data?.clients)
? data.clients
: [];

setClients(clientsData);

if (clientsData.length === 0) {
setClientError("לא נמצאו לקוחות במערכת");
}
} catch (error) {
console.error("❌ Clients load error:", error);

setClients([]);

setClientError(
error instanceof Error
? error.message
: "לא ניתן לטעון את הלקוחות"
);
} finally {
setLoadingClients(false);
}
}

// =====================================================
// LOAD CONTRACT TEMPLATES
// =====================================================

async function loadContractTemplates() {
try {
setLoadingTemplates(true);

const response = await fetch(
"/api/contract-templates",
{
method: "GET",
cache: "no-store",
}
);

const responseText = await response.text();

let data: any = null;

if (responseText.trim()) {
try {
data = JSON.parse(responseText);
} catch {
data = {
error: responseText,
};
}
}

if (!response.ok) {
throw new Error(
data?.error ||
`שגיאה בטעינת תבניות החוזים (${response.status})`
);
}

const templatesData: ContractTemplate[] =
Array.isArray(data)
? data
: Array.isArray(data?.templates)
? data.templates
: [];

setContractTemplates(templatesData);
} catch (error) {
console.error(
"❌ Contract templates load error:",
error
);

setContractTemplates([]);
} finally {
setLoadingTemplates(false);
}
}

// =====================================================
// INITIAL LOAD
// =====================================================

useEffect(() => {
loadContracts();
loadClients();
loadContractTemplates();

const interval = setInterval(() => {
loadContracts(false);
}, 5000);

return () => {
clearInterval(interval);
};
}, []);

// =====================================================
// SELECTED CLIENT
// =====================================================

const selectedClient = useMemo(() => {
return clients.find(
(client) =>
String(client.id) === selectedClientId
);
}, [clients, selectedClientId]);

// =====================================================
// CALCULATED VALUES
// =====================================================

const total = numericValue(totalAmount);

const calculatedDeposit = useMemo(() => {
if (!hasDeposit || total <= 0) {
return 0;
}

let deposit = 0;

if (depositMode === "percent") {
const percent = numericValue(depositPercent);

deposit = Number(
(
total *
(Math.max(
0,
Math.min(100, percent)
) / 100)
).toFixed(2)
);
} else {
deposit = numericValue(
depositAmountInput
);
}

if (deposit < 0) {
deposit = 0;
}

if (deposit > total) {
deposit = total;
}

return deposit;
}, [
total,
hasDeposit,
depositMode,
depositPercent,
depositAmountInput,
]);

const calculatedRemaining = useMemo(() => {
if (total <= 0) {
return 0;
}

return Number(
Math.max(
total - calculatedDeposit,
0
).toFixed(2)
);
}, [total, calculatedDeposit]);

// =====================================================
// GENERATE CONTRACT FROM TEMPLATES
// =====================================================

function generateTemplateContractContent(
client: Client,
amount: number,
deposit: number,
remaining: number
): string {
const activeTemplates =
contractTemplates.filter(
(template) => template.isActive
);

const generalTemplate = activeTemplates
.filter(
(template) => !template.serviceId
)
.sort(
(a, b) => b.id - a.id
)[0];

const serviceSections: {
serviceName: string;
content: string;
}[] = [];

for (
const clientService of client.services ?? []
) {
const serviceName =
clientService.serviceName?.trim();

if (!serviceName) {
continue;
}

const serviceTemplate =
activeTemplates
.filter(
(template) =>
template.serviceId &&
template.service?.title?.trim() ===
serviceName
)
.sort(
(a, b) => b.id - a.id
)[0];

if (serviceTemplate) {
serviceSections.push({
serviceName,
content: serviceTemplate.content,
});
}
}

return buildContractContent({
generalContent:
generalTemplate?.content || "",

serviceSections,

variables: {
clientName: client.name,
clientPhone: client.phone,
clientEmail: client.email,
eventType: client.eventType,
eventDate: client.eventDate,
guests: client.guests,
location: client.location,

totalAmount: amount,
depositAmount: deposit,
remainingAmount: remaining,

notes: client.notes,
additionalInfo:
client.additionalInfo,

alcoholList:
client.alcoholList,
},
});
}

// =====================================================
// UPDATE CONTENT FROM TEMPLATES
// =====================================================

useEffect(() => {
if (!selectedClient) {
return;
}

if (loadingTemplates) {
return;
}

const generated =
generateTemplateContractContent(
selectedClient,
total,
calculatedDeposit,
calculatedRemaining
);

setContent(generated);
}, [
selectedClient,
total,
calculatedDeposit,
calculatedRemaining,
loadingTemplates,
contractTemplates,
]);

// =====================================================
// RESET
// =====================================================

function resetCreateForm() {
setSelectedClientId("");
setTitle("");
setContent("");

setTotalAmount("");

setHasDeposit(false);
setDepositMode("percent");
setDepositPercent("15");
setDepositAmountInput("");

setClientError("");

setCreateView("preview");
}

// =====================================================
// OPEN CREATE
// =====================================================

function openCreateModal() {
resetCreateForm();

loadClients();
loadContractTemplates();

setShowCreateModal(true);
}

// =====================================================
// CLIENT CHANGE
// =====================================================

function handleClientChange(
clientId: string
) {
setSelectedClientId(clientId);

const client = clients.find(
(item) =>
String(item.id) === clientId
);

if (!client) {
setTitle("");
setContent("");
setTotalAmount("");
setDepositAmountInput("");
setHasDeposit(false);

return;
}

const clientTotal =
numericValue(client.totalAmount);

const clientPaid =
numericValue(client.paidAmount);

if (clientTotal > 0) {
setTotalAmount(
String(clientTotal)
);
} else {
setTotalAmount("");
}

if (clientPaid > 0) {
setHasDeposit(true);
setDepositMode("amount");

setDepositAmountInput(
String(clientPaid)
);
} else {
setHasDeposit(false);
setDepositMode("percent");
setDepositAmountInput("");
}

setTitle(
`הסכם שירות — ${client.name}`
);

setCreateView("preview");
}

// =====================================================
// CREATE CONTRACT
// =====================================================

async function createContract() {
if (creating) {
return;
}

try {
if (!selectedClientId) {
alert("חובה לבחור לקוח");
return;
}

if (!title.trim()) {
alert("חובה להזין כותרת לחוזה");
return;
}

if (!content.trim()) {
alert(
"תוכן החוזה חסר. ודא שקיימת לפחות תבנית חוזה כללית פעילה."
);
return;
}

const totalValue =
totalAmount.trim() === ""
? null
: numericValue(totalAmount);

if (
totalValue !== null &&
(!Number.isFinite(totalValue) ||
totalValue < 0)
) {
alert("סכום העסקה לא תקין");
return;
}

let depositValue:
| number
| null = null;

let depositPercentValue:
| number
| null = null;

if (
totalValue !== null &&
totalValue > 0 &&
hasDeposit
) {
if (depositMode === "percent") {
const percent =
numericValue(
depositPercent
);

if (
percent < 0 ||
percent > 100
) {
alert(
"אחוז המקדמה חייב להיות בין 0 ל־100"
);
return;
}

depositPercentValue =
percent;

depositValue = Number(
(
totalValue *
(percent / 100)
).toFixed(2)
);
} else {
const amount =
numericValue(
depositAmountInput
);

if (amount < 0) {
alert(
"סכום המקדמה לא תקין"
);
return;
}

if (amount > totalValue) {
alert(
"המקדמה לא יכולה להיות גבוהה מסכום העסקה"
);
return;
}

depositValue = amount;

depositPercentValue =
totalValue > 0
? Number(
(
(amount /
totalValue) *
100
).toFixed(2)
)
: 0;
}
} else if (
totalValue !== null
) {
depositValue = 0;
depositPercentValue = 0;
}

const payload = {
clientId:
Number(selectedClientId),

title: title.trim(),

content: content.trim(),

totalAmount: totalValue,
depositAmount:
depositValue,

depositPercent:
depositPercentValue,
};

setCreating(true);

const response = await fetch(
"/api/contracts",
{
method: "POST",
headers: {
"Content-Type":
"application/json",
Accept:
"application/json",
},
body: JSON.stringify(
payload
),
}
);

const responseText =
await response.text();

let data: any = null;

if (responseText.trim()) {
try {
data =
JSON.parse(
responseText
);
} catch {
data = {
error:
responseText,
};
}
}

if (!response.ok) {
throw new Error(
data?.error ||
data?.message ||
`שגיאה ביצירת החוזה (${response.status})`
);
}

const createdContract =
data?.contract ||
data;

if (
!createdContract ||
!createdContract.id
) {
throw new Error(
"השרת לא החזיר את החוזה שנוצר."
);
}

setContracts((prev) => [
createdContract,
...prev,
]);

setShowCreateModal(false);

resetCreateForm();

setSelectedContract(
createdContract
);

alert(
"החוזה נוצר ונשמר בהצלחה ✅"
);
} catch (error) {
console.error(
"❌ Create contract error:",
error
);

alert(
error instanceof Error
? error.message
: "שגיאה ביצירת החוזה"
);
} finally {
setCreating(false);
}
}

// =====================================================
// STATUS
// =====================================================

function getStatusLabel(
status: string
) {
switch (status) {
case "DRAFT":
return "טיוטה";

case "SENT":
return "נשלח";

case "SIGNED":
return "נחתם";

case "CANCELLED":
return "בוטל";

default:
return status || "טיוטה";
}
}

// =====================================================
// STATUS CLASS
// =====================================================

function getStatusClass(
status: string
) {
switch (status) {
case "SIGNED":
return "bg-green-900/40 text-green-400 border border-green-700";

case "SENT":
return "bg-blue-900/40 text-blue-400 border border-blue-700";

case "CANCELLED":
return "bg-red-900/40 text-red-400 border border-red-700";

default:
return "bg-gray-800 text-gray-300 border border-gray-700";
}
}

// =====================================================
// PUBLIC URL
// =====================================================

function getPublicContractUrl(
contract: Contract
) {
if (
typeof window ===
"undefined" ||
!contract.publicToken
) {
return "";
}

return `${window.location.origin}/admin/contracts/${contract.publicToken}`;
}

// =====================================================
// WHATSAPP
// =====================================================

function sendContractWhatsApp(
contract: Contract
) {
const phone =
contract.client?.phone;

if (!phone) {
alert(
"ללקוח אין מספר טלפון"
);
return;
}

let cleanPhone =
String(phone).replace(
/[^0-9]/g,
""
);

if (!cleanPhone) {
alert(
"מספר הטלפון של הלקוח לא תקין"
);
return;
}

if (
cleanPhone.startsWith(
"0"
)
) {
cleanPhone =
"972" +
cleanPhone.slice(1);
}

const url =
getPublicContractUrl(
contract
);

if (!url) {
alert(
"אין עדיין קישור ציבורי לחוזה"
);
return;
}

const message =
`שלום ${
contract.client
?.name || ""
} 👋

מצורף החוזה שלך עבור השירות ב־Maestro Events.

סכום העסקה:
${money(
contract.totalAmount
)}

מקדמה:
${money(
contract.depositAmount
)}

יתרה:
${money(
contract.remainingAmount
)}

ניתן לצפות בחוזה ולחתום בקישור:

${url}

תודה,
Maestro Events`;

const whatsappUrl =
`https://wa.me/${cleanPhone}?text=` +
encodeURIComponent(
message
);

window.open(
whatsappUrl,
"_blank",
"noopener,noreferrer"
);
}

// =====================================================
// COPY LINK
// =====================================================

async function copyContractLink(
contract: Contract
) {
const url =
getPublicContractUrl(
contract
);

if (!url) {
alert(
"אין קישור ציבורי לחוזה"
);
return;
}

try {
await navigator.clipboard.writeText(
url
);

alert(
"קישור החוזה הועתק ✅"
);
} catch {
alert(
"לא ניתן להעתיק את הקישור"
);
}
}

// =====================================================
// PRINT
// =====================================================

function printContract() {
if (!selectedContract) {
return;
}

window.print();
}

// =====================================================
// CONTRACT PREVIEW
// =====================================================

function ContractPreview({
client,
titleValue,
contentValue,
amount,
deposit,
remaining,
signatureData,
signedAt,
marketingConsent,
}: {
client?: Client | null;
titleValue: string;
contentValue: string;
amount: number;
deposit: number;
remaining: number;
signatureData?: string | null;
signedAt?: string | null;
marketingConsent?: boolean | null;
}) {
return (
<div
dir="rtl"
className="
contract-paper
bg-white
text-[#171717]
min-h-[900px]
rounded-sm
shadow-2xl
p-7
md:p-12
relative
"
>
{/* TOP DECORATION */}

<div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent" />

{/* LOGO / BRAND */}

<div className="text-center pt-4 pb-8 border-b-2 border-[#D4AF37]/40">
<div className="text-4xl font-black tracking-[0.12em] text-[#171717]">
MAESTRO
</div>

<div className="text-[#D4AF37] font-bold tracking-[0.35em] text-sm mt-1">
EVENTS
</div>

<div className="w-20 h-[2px] bg-[#D4AF37] mx-auto mt-4" />

<h1 className="text-2xl md:text-3xl font-bold mt-6">
{titleValue ||
"הסכם שירות"}
</h1>

<p className="text-gray-500 text-sm mt-2">
הסכם שירות
</p>
</div>

{/* INTRO */}

<div className="mt-8 text-center">
<p className="text-gray-600 leading-7">
הסכם זה נערך בין
<strong className="text-black">
{" "}
Maestro Events
</strong>{" "}
לבין הלקוח המפורט להלן.
</p>
</div>

{/* CLIENT + EVENT */}

<div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-8">
{/* CLIENT */}

<div className="border border-gray-200 rounded-xl overflow-hidden">
<div className="bg-[#171717] text-white px-5 py-3 font-bold">
פרטי הלקוח
</div>

<div className="p-5 space-y-3">
<InfoRow
label="שם מלא"
value={
client?.name ||
"לא צוין"
}
/>

<InfoRow
label="טלפון"
value={
client?.phone ||
"לא צוין"
}
/>

<InfoRow
label="אימייל"
value={
client?.email ||
"לא צוין"
}
/>
</div>
</div>

{/* EVENT */}

<div className="border border-gray-200 rounded-xl overflow-hidden">
<div className="bg-[#171717] text-white px-5 py-3 font-bold">
פרטי האירוע
</div>

<div className="p-5 space-y-3">
<InfoRow
label="סוג האירוע"
value={
client?.eventType ||
"לא צוין"
}
/>

<InfoRow
label="תאריך"
value={
client?.eventDate ||
"לא צוין"
}
/>

<InfoRow
label="מוזמנים"
value={
client?.guests
? String(
client.guests
)
: "לא צוין"
}
/>

<InfoRow
label="מיקום"
value={
client?.location ||
"לא צוין"
}
/>
</div>
</div>
</div>

{/* SERVICES */}

{client?.services &&
client.services.length >
0 && (
<div className="mt-7">
<div className="bg-[#171717] text-white px-5 py-3 font-bold rounded-t-xl">
השירותים שנבחרו
</div>

<div className="border border-gray-200 border-t-0 rounded-b-xl p-5">
<div className="space-y-3">
{client.services.map(
(
service,
index
) => (
<div
key={
service.id ??
`${service.serviceName}-${index}`
}
className="flex items-center justify-between gap-4 border-b border-gray-100 pb-3 last:border-0 last:pb-0"
>
<span className="font-bold">
{
service.serviceName
}
</span>

{service.amount !==
undefined &&
service.amount !==
null && (
<span className="text-gray-600">
{money(
service.amount
)}
</span>
)}
</div>
)
)}
</div>
</div>
</div>
)}

{/* ALCOHOL LIST */}

{client?.alcoholList &&
client.alcoholList.trim() && (
<div className="mt-7">
<div className="bg-[#171717] text-white px-5 py-3 font-bold rounded-t-xl">
רשימת אלכוהול ומשקאות
</div>

<div className="border border-gray-200 border-t-0 rounded-b-xl p-5">
<div className="whitespace-pre-wrap text-gray-700 leading-8">
{
client.alcoholList
}
</div>
</div>
</div>
)}

{/* FINANCIAL */}

<div className="mt-7">
<div className="bg-[#171717] text-white px-5 py-3 font-bold rounded-t-xl">
פרטי העסקה
</div>

<div className="border border-gray-200 border-t-0 rounded-b-xl grid grid-cols-3">
<div className="p-5 text-center border-l border-gray-200">
<div className="text-gray-500 text-sm">
סכום העסקה
</div>

<div className="text-xl font-bold mt-2">
{money(
amount > 0
? amount
: null
)}
</div>
</div>

<div className="p-5 text-center border-l border-gray-200">
<div className="text-gray-500 text-sm">
מקדמה
</div>

<div className="text-xl font-bold text-green-600 mt-2">
{money(
deposit
)}
</div>
</div>

<div className="p-5 text-center">
<div className="text-gray-500 text-sm">
יתרה
</div>

<div className="text-xl font-bold text-orange-600 mt-2">
{money(
remaining
)}
</div>
</div>
</div>
</div>

{/* NOTES */}

{(client?.notes ||
client?.additionalInfo) && (
<div className="mt-7 grid grid-cols-1 md:grid-cols-2 gap-5">
<div className="border border-gray-200 rounded-xl p-5">
<h3 className="font-bold mb-3">
הערות
</h3>

<p className="text-gray-600 whitespace-pre-wrap leading-7">
{client?.notes ||
"אין הערות"}
</p>
</div>

<div className="border border-gray-200 rounded-xl p-5">
<h3 className="font-bold mb-3">
מידע נוסף
</h3>

<p className="text-gray-600 whitespace-pre-wrap leading-7">
{client?.additionalInfo ||
"אין מידע נוסף"}
</p>
</div>
</div>
)}

{/* CONTRACT CONTENT */}

<div className="mt-8">
<div className="bg-[#171717] text-white px-5 py-3 font-bold rounded-t-xl">
תנאי ההתקשרות
</div>

<div className="border border-gray-200 border-t-0 rounded-b-xl p-6">
{contentValue ? (
<div className="whitespace-pre-wrap text-gray-700 leading-8">
{contentValue}
</div>
) : (
<div className="text-gray-400">
אין תוכן חוזה להצגה
</div>
)}
</div>
</div>

{/* SIGNATURE */}

<div className="mt-12 pt-8 border-t-2 border-[#D4AF37]/40">
<div className="grid grid-cols-1 md:grid-cols-2 gap-12">
{/* CLIENT SIGNATURE */}

<div>
<h3 className="font-bold text-lg mb-5">
חתימת הלקוח
</h3>

{signatureData ? (
<div className="border border-gray-200 rounded-xl p-4 bg-white min-h-[160px] flex items-center justify-center">
<img
src={
signatureData
}
alt="חתימת הלקוח"
className="max-w-full max-h-[140px] object-contain"
/>
</div>
) : (
<div className="border-b-2 border-gray-400 h-24 flex items-end pb-2 text-sm text-gray-400">
חתימה
</div>
)}

<div className="mt-3 text-sm text-gray-600">
{client?.name ||
"שם הלקוח"}
</div>

{signedAt && (
<div className="text-xs text-gray-500 mt-2">
נחתם בתאריך:{" "}
{new Date(
signedAt
).toLocaleString(
"he-IL"
)}
</div>
)}
</div>

{/* COMPANY */}

<div>
<h3 className="font-bold text-lg mb-5">
Maestro Events
</h3>

<div className="border-b-2 border-gray-400 h-24 flex items-end pb-2 text-sm text-gray-400">
חתימת העסק
</div>

<div className="mt-3 text-sm text-gray-600">
Maestro Events
</div>
</div>
</div>
</div>

{/* MARKETING */}

{signatureData && (
<div className="mt-8 pt-5 border-t border-gray-200 text-sm">
<span className="font-bold">
אישור דיוור שיווקי:
</span>{" "}
{marketingConsent ? (
<span className="text-green-600 font-bold">
הלקוח אישר
</span>
) : (
<span className="text-gray-500">
הלקוח לא אישר
</span>
)}
</div>
)}

{/* FOOTER */}

<div className="mt-12 pt-6 border-t border-gray-200 text-center">
<div className="text-[#D4AF37] font-bold tracking-[0.25em]">
MAESTRO EVENTS
</div>

<div className="text-xs text-gray-400 mt-2">
הסכם שירות
</div>
</div>
</div>
);
}

// =====================================================
// RENDER
// =====================================================

return (
<div
dir="rtl"
className="min-h-screen bg-[#0b0b0b] text-white p-6 pt-30"
>
<div className="max-w-[1500px] mx-auto">

{/* HEADER */}

<div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
<div>
<h1 className="text-3xl font-bold text-[#D4AF37]">
ניהול חוזים
</h1>

<p className="text-gray-400 mt-2">
יצירה, ניהול ומעקב אחר חוזי לקוחות
</p>
</div>

<div className="flex flex-wrap items-center gap-3">
<button
onClick={() => {
window.location.href =
"/admin/contract-templates";
}}
className="bg-[#1d1d1d] border border-[#D4AF37]/50 text-[#D4AF37] px-5 py-3 rounded-xl font-bold hover:bg-[#D4AF37] hover:text-black transition"
>
⚙️ תבניות חוזה
</button>

<button
onClick={
openCreateModal
}
className="bg-[#D4AF37] text-black px-6 py-3 rounded-xl font-bold hover:opacity-90 transition"
>
+ חוזה חדש
</button>
</div>
</div>

{/* SIGNED NOTIFICATION */}

{signedNotification && (
<div className="mb-6 bg-green-900/30 border border-green-600 rounded-2xl p-5">
<div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
<div className="flex items-center gap-4">
<div className="w-14 h-14 rounded-full bg-green-600 flex items-center justify-center text-2xl">
✓
</div>

<div>
<div className="text-xl font-bold text-green-400">
הלקוח חתם על החוזה!
</div>

<div className="text-gray-300 text-sm mt-1">
החוזה נשמר במערכת וכעת ניתן לצפות בגרסה החתומה.
</div>
</div>
</div>

<div className="flex gap-3">
<button
onClick={() => {
const contract =
contracts.find(
(item) =>
item.id ===
signedNotification
);

if (contract) {
setSelectedContract(
contract
);
}

setSignedNotification(
null
);
}}
className="bg-green-600 hover:bg-green-500 text-white px-5 py-3 rounded-xl font-bold"
>
📄 הצג חוזה חתום
</button>

<button
onClick={() =>
setSignedNotification(
null
)
}
className="bg-gray-800 hover:bg-gray-700 px-4 py-3 rounded-xl"
>
×
</button>
</div>
</div>
</div>
)}

{/* ERROR */}

{!loading &&
error && (
<div className="bg-red-900/30 border border-red-500 text-red-300 p-4 rounded-xl mb-6">
<div className="font-bold mb-1">
שגיאה:
</div>

<div>
{error}
</div>
</div>
)}

{/* LOADING */}

{loading && (
<div className="bg-[#151515] border border-gray-800 rounded-xl p-10 text-center text-gray-400">
טוען חוזים...
</div>
)}

{/* EMPTY */}

{!loading &&
!error &&
contracts.length === 0 && (
<div className="bg-[#151515] border border-gray-800 rounded-2xl p-12 text-center">
<div className="text-6xl mb-5">
📄
</div>

<h2 className="text-2xl font-bold mb-3">
עדיין אין חוזים
</h2>

<p className="text-gray-400 mb-6">
צור חוזה ראשון ללקוח.
</p>

<button
onClick={
openCreateModal
}
className="bg-[#D4AF37] text-black px-7 py-3 rounded-xl font-bold"
>
+ צור חוזה ראשון
</button>
</div>
)}

{/* TABLE */}

{!loading &&
contracts.length > 0 && (
<div className="bg-[#151515] rounded-2xl border border-gray-800 overflow-hidden">
<div className="overflow-x-auto">
<table className="w-full">
<thead className="bg-[#1d1d1d]">
<tr>
<th className="p-4 text-right">
לקוח
</th>

<th className="p-4 text-right">
חוזה
</th>

<th className="p-4 text-right">
סכום
</th>

<th className="p-4 text-right">
מקדמה
</th>

<th className="p-4 text-right">
יתרה
</th>

<th className="p-4 text-right">
סטטוס
</th>

<th className="p-4 text-right">
פעולות
</th>
</tr>
</thead>

<tbody>
{contracts.map(
(contract) => (
<tr
key={
contract.id
}
className="border-t border-gray-800 hover:bg-[#1b1b1b]"
>
<td className="p-4">
<div className="font-bold">
{contract
.client
?.name ||
"ללא לקוח"}
</div>

{contract
.client
?.phone && (
<div className="text-sm text-gray-500">
{
contract
.client
.phone
}
</div>
)}
</td>

<td className="p-4">
{
contract.title
}
</td>

<td className="p-4">
{money(
contract.totalAmount
)}
</td>

<td className="p-4 text-green-400">
{money(
contract.depositAmount
)}
</td>

<td className="p-4 text-orange-300">
{money(
contract.remainingAmount
)}
</td>

<td className="p-4">
<span
className={`px-3 py-1 rounded-full text-sm ${getStatusClass(
contract.status
)}`}
>
{getStatusLabel(
contract.status
)}
</span>
</td>

<td className="p-4">
<div className="flex flex-wrap gap-3">
<button
onClick={() =>
setSelectedContract(
contract
)
}
className="text-[#D4AF37] hover:underline font-bold"
>
👁️ תצוגה
</button>

{contract.publicToken && (
<button
onClick={() =>
sendContractWhatsApp(
contract
)
}
className="text-green-400 hover:underline font-bold"
>
WhatsApp
</button>
)}
</div>
</td>
</tr>
)
)}
</tbody>
</table>
</div>
</div>
)}
</div>

{/* ================================================= */}
{/* CREATE MODAL */}
{/* ================================================= */}

{showCreateModal && (
<div className="fixed inset-0 z-[9999] bg-black/85 backdrop-blur-sm flex items-center justify-center p-3 md:p-6">
<div className="w-full max-w-[1450px] bg-[#101010] border border-gray-700 rounded-2xl shadow-2xl overflow-hidden max-h-[96vh]">

{/* HEADER */}

<div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 px-6 py-5 border-b border-gray-800">
<div>
<h2 className="text-2xl font-bold text-[#D4AF37]">
יצירת חוזה חדש
</h2>

<p className="text-gray-400 text-sm mt-1">
החוזה נבנה אוטומטית מהתבניות שהוגדרו במערכת
</p>
</div>

<div className="flex items-center gap-3">
<div className="bg-[#1b1b1b] border border-gray-700 rounded-xl p-1 flex">
<button
onClick={() =>
setCreateView(
"edit"
)
}
className={`px-4 py-2 rounded-lg font-bold text-sm ${
createView ===
"edit"
? "bg-[#D4AF37] text-black"
: "text-gray-400"
}`}
>
✏️ עריכה
</button>

<button
onClick={() =>
setCreateView(
"preview"
)
}
className={`px-4 py-2 rounded-lg font-bold text-sm ${
createView ===
"preview"
? "bg-[#D4AF37] text-black"
: "text-gray-400"
}`}
>
👁️ תצוגה מקדימה
</button>
</div>

<button
onClick={() =>
setShowCreateModal(
false
)
}
className="w-10 h-10 rounded-full bg-gray-800 hover:bg-red-600 transition text-xl"
>
×
</button>
</div>
</div>

{/* CONTENT */}

<div className="p-5 md:p-7 overflow-y-auto max-h-[82vh]">
<div className="grid grid-cols-1 xl:grid-cols-[420px_1fr] gap-7">

{/* LEFT */}

<div className="space-y-5">

{/* CLIENT */}

<div>
<label className="block text-sm font-bold mb-2">
לקוח *
</label>

<select
value={
selectedClientId
}
onChange={(e) =>
handleClientChange(
e.target
.value
)
}
className="w-full bg-[#181818] border border-gray-600 rounded-xl px-4 py-3 outline-none focus:border-[#D4AF37]"
>
<option value="">
{loadingClients
? "טוען לקוחות..."
: "בחר לקוח"}
</option>

{!loadingClients &&
clients.map(
(
client
) => (
<option
key={
client.id
}
value={
client.id
}
>
{
client.name
}

{client.phone
? ` — ${client.phone}`
: ""}
</option>
)
)}
</select>

{clientError && (
<div className="text-yellow-400 text-sm mt-2">
{
clientError
}
</div>
)}
</div>

{/* CLIENT INFO */}

{selectedClient && (
<div className="bg-[#181818] border border-gray-700 rounded-xl p-5">
<h3 className="text-[#D4AF37] font-bold mb-4">
פרטי הלקוח
</h3>

<div className="grid grid-cols-2 gap-4 text-sm">
<InfoBox
label="שם"
value={
selectedClient.name
}
/>

<InfoBox
label="טלפון"
value={
selectedClient.phone ||
"-"
}
/>

<InfoBox
label="אירוע"
value={
selectedClient.eventType ||
"-"
}
/>

<InfoBox
label="תאריך"
value={
selectedClient.eventDate ||
"-"
}
/>

<InfoBox
label="מוזמנים"
value={
selectedClient.guests
? String(
selectedClient.guests
)
: "-"
}
/>

<InfoBox
label="מיקום"
value={
selectedClient.location ||
"-"
}
/>
</div>

{/* ALCOHOL INFO */}

{selectedClient.alcoholList &&
selectedClient.alcoholList.trim() && (
<div className="mt-5 pt-5 border-t border-gray-700">
<div className="text-sm text-gray-400 mb-2">
רשימת אלכוהול ומשקאות
</div>

<div className="bg-[#111] border border-gray-700 rounded-lg px-3 py-3 text-sm text-gray-200 whitespace-pre-wrap leading-6">
{
selectedClient.alcoholList
}
</div>
</div>
)}

{/* SERVICES */}

{selectedClient.services &&
selectedClient.services.length >
0 && (
<div className="mt-5 pt-5 border-t border-gray-700">
<div className="text-sm text-gray-400 mb-3">
שירותים בחוזה
</div>

<div className="space-y-2">
{selectedClient.services.map(
(
service,
index
) => (
<div
key={
service.id ??
`${service.serviceName}-${index}`
}
className="flex items-center justify-between bg-[#111] rounded-lg px-3 py-2"
>
<span className="font-bold text-sm">
{
service.serviceName
}
</span>

{service.amount !==
undefined &&
service.amount !==
null && (
<span className="text-gray-400 text-sm">
{money(
service.amount
)}
</span>
)}
</div>
)
)}
</div>
</div>
)}
</div>
)}

{/* TEMPLATE STATUS */}

{selectedClient && (
<div className="border border-gray-700 rounded-xl p-4 bg-[#151515]">
<div className="font-bold mb-2">
תבניות חוזה
</div>

{loadingTemplates ? (
<div className="text-gray-400 text-sm">
טוען תבניות...
</div>
) : contractTemplates.length ===
0 ? (
<div className="text-yellow-400 text-sm">
לא נמצאו תבניות חוזה. עבור ל"ניהול תבניות חוזים" וצור לפחות תבנית כללית פעילה.
</div>
) : (
<div className="text-green-400 text-sm">
✓ נטענו{" "}
{
contractTemplates.filter(
(
template
) =>
template.isActive
).length
}{" "}
תבניות פעילות
</div>
)}
</div>
)}

{/* TITLE */}

<div>
<label className="block text-sm font-bold mb-2">
כותרת החוזה *
</label>

<input
value={
title
}
onChange={(e) =>
setTitle(
e.target
.value
)
}
placeholder="הסכם שירות"
className="w-full bg-[#181818] border border-gray-600 rounded-xl px-4 py-3 outline-none focus:border-[#D4AF37]"
/>
</div>

{/* TOTAL */}

<div>
<label className="block text-sm font-bold mb-2">
סכום העסקה
</label>

<div className="relative">
<input
type="number"
min="0"
value={
totalAmount
}
onChange={(
e
) =>
setTotalAmount(
e.target
.value
)
}
placeholder="0"
className="w-full bg-[#181818] border border-gray-600 rounded-xl px-4 py-3 pl-12 outline-none focus:border-[#D4AF37]"
/>

<span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
₪
</span>
</div>
</div>

{/* DEPOSIT */}

<div className="border border-gray-700 rounded-xl p-4 bg-[#151515]">
<div className="flex items-center justify-between gap-3">
<div>
<div className="font-bold">
מקדמה
</div>

<div className="text-xs text-gray-500 mt-1">
האם התקבלה מקדמה?
</div>
</div>

<button
type="button"
onClick={() =>
setHasDeposit(
(
value
) =>
!value
)
}
className={`px-5 py-2 rounded-lg font-bold ${
hasDeposit
? "bg-green-600 text-white"
: "bg-gray-700 text-gray-300"
}`}
>
{hasDeposit
? "✓ התקבלה"
: "לא התקבלה"}
</button>
</div>

{hasDeposit && (
<div className="mt-4 pt-4 border-t border-gray-700">
<div className="flex gap-2 mb-4">
<button
type="button"
onClick={() =>
setDepositMode(
"percent"
)
}
className={`flex-1 py-2 rounded-lg font-bold ${
depositMode ===
"percent"
? "bg-[#D4AF37] text-black"
: "bg-gray-800 text-gray-300"
}`}
>
לפי אחוז
</button>

<button
type="button"
onClick={() =>
setDepositMode(
"amount"
)
}
className={`flex-1 py-2 rounded-lg font-bold ${
depositMode ===
"amount"
? "bg-[#D4AF37] text-black"
: "bg-gray-800 text-gray-300"
}`}
>
סכום
</button>
</div>

{depositMode ===
"percent" && (
<select
value={
depositPercent
}
onChange={(
e
) =>
setDepositPercent(
e.target
.value
)
}
className="w-full bg-[#181818] border border-gray-600 rounded-xl px-4 py-3"
>
<option value="10">
10%
</option>

<option value="15">
15%
</option>

<option value="20">
20%
</option>

<option value="25">
25%
</option>

<option value="30">
30%
</option>

<option value="40">
40%
</option>

<option value="50">
50%
</option>

<option value="70">
70%
</option>
</select>
)}

{depositMode ===
"amount" && (
<div className="relative">
<input
type="number"
min="0"
value={
depositAmountInput
}
onChange={(
e
) =>
setDepositAmountInput(
e.target
.value
)
}
placeholder="לדוגמה: 1500"
className="w-full bg-[#181818] border border-gray-600 rounded-xl px-4 py-3 pl-12 outline-none focus:border-[#D4AF37]"
/>

<span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
₪
</span>
</div>
)}

{/* SUMMARY */}

<div className="grid grid-cols-3 gap-2 mt-4">
<div className="bg-[#1b1b1b] rounded-lg p-3">
<div className="text-xs text-gray-500">
עסקה
</div>

<div className="font-bold mt-1">
{money(
total >
0
? total
: null
)}
</div>
</div>

<div className="bg-green-900/20 border border-green-800 rounded-lg p-3">
<div className="text-xs text-gray-500">
מקדמה
</div>

<div className="font-bold text-green-400 mt-1">
{money(
calculatedDeposit
)}
</div>
</div>

<div className="bg-orange-900/20 border border-orange-800 rounded-lg p-3">
<div className="text-xs text-gray-500">
יתרה
</div>

<div className="font-bold text-orange-300 mt-1">
{money(
calculatedRemaining
)}
</div>
</div>
</div>
</div>
)}
</div>

{/* CONTENT EDITOR */}

<div>
<label className="block text-sm font-bold mb-2">
תוכן החוזה
</label>

<textarea
value={
content
}
onChange={(
e
) =>
setContent(
e.target
.value
)
}
className="w-full h-[350px] resize-none bg-[#181818] border border-gray-600 rounded-xl px-4 py-4 outline-none focus:border-[#D4AF37] leading-7"
/>

<div className="text-xs text-gray-500 mt-2">
התוכן נבנה אוטומטית מהתבניות. ניתן לערוך אותו לפני השמירה.
</div>
</div>
</div>

{/* RIGHT - PREVIEW */}

<div className="min-w-0">
<div className="sticky top-0">
<div className="flex items-center justify-between mb-3">
<div>
<div className="text-sm text-gray-400">
תצוגה מקדימה
</div>

<div className="font-bold text-[#D4AF37]">
כך ייראה החוזה
</div>
</div>

<div className="text-xs text-gray-500">
A4
</div>
</div>

<div className="bg-[#202020] border border-gray-700 rounded-2xl p-3 md:p-5 max-h-[70vh] overflow-y-auto">
{selectedClient ? (
<ContractPreview
client={
selectedClient
}
titleValue={
title
}
contentValue={
content
}
amount={
total
}
deposit={
calculatedDeposit
}
remaining={
calculatedRemaining
}
/>
) : (
<div className="min-h-[700px] flex items-center justify-center text-center">
<div>
<div className="text-6xl mb-5">
📄
</div>

<h3 className="text-xl font-bold">
בחר לקוח
</h3>

<p className="text-gray-500 mt-2">
לאחר בחירת לקוח תופיע כאן תצוגה מקדימה של החוזה.
</p>
</div>
</div>
)}
</div>
</div>
</div>
</div>

{/* FOOTER */}

<div className="flex flex-col-reverse md:flex-row items-center justify-between gap-4 mt-7 pt-5 border-t border-gray-800">
<button
type="button"
onClick={() =>
setShowCreateModal(
false
)
}
className="w-full md:w-auto px-6 py-3 rounded-xl bg-gray-800 hover:bg-gray-700 font-bold"
>
ביטול
</button>

<button
type="button"
disabled={
creating ||
loadingTemplates
}
onClick={
createContract
}
className="w-full md:w-auto px-8 py-3 rounded-xl bg-[#D4AF37] text-black font-bold hover:opacity-90 disabled:opacity-50"
>
{creating
? "יוצר חוזה..."
: "✓ צור ושמור חוזה"}
</button>
</div>
</div>
</div>
</div>
)}

{/* ================================================= */}
{/* CONTRACT VIEW */}
{/* ================================================= */}

{selectedContract && (
<div className="print-root fixed inset-0 z-[9998] bg-black/85 backdrop-blur-sm flex items-center justify-center p-3 md:p-6">

<div className="print-modal w-full max-w-[1100px] max-h-[95vh] bg-[#111] border border-gray-700 rounded-2xl shadow-2xl overflow-hidden">

{/* HEADER */}

<div className="no-print flex flex-col md:flex-row md:items-center md:justify-between gap-4 px-6 py-4 border-b border-gray-800">
<div>
<h2 className="text-xl font-bold text-[#D4AF37]">
{
selectedContract.title
}
</h2>

<div className="text-sm text-gray-400 mt-1">
{selectedContract
.client
?.name ||
"ללא לקוח"}
</div>
</div>

<button
onClick={() =>
setSelectedContract(
null
)
}
className="w-10 h-10 rounded-full bg-gray-800 hover:bg-red-600 text-xl"
>
×
</button>
</div>

{/* ACTIONS */}

<div className="no-print px-6 py-4 border-b border-gray-800 flex flex-wrap gap-3">
<button
onClick={
printContract
}
className="px-4 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 font-bold"
>
🖨️ הדפס / שמור PDF
</button>

{selectedContract.status ===
"SIGNED" && (
<button
onClick={
printContract
}
className="px-4 py-2 rounded-xl bg-green-700 hover:bg-green-600 text-white font-bold"
>
📄 חוזה חתום
</button>
)}

<button
onClick={() =>
sendContractWhatsApp(
selectedContract
)
}
className="px-4 py-2 rounded-xl bg-green-600 hover:bg-green-500 text-white font-bold"
>
📱 WhatsApp
</button>

<button
onClick={() =>
copyContractLink(
selectedContract
)
}
className="px-4 py-2 rounded-xl bg-blue-700 hover:bg-blue-600 text-white font-bold"
>
🔗 העתק קישור
</button>
</div>

{/* STATUS */}

<div className="no-print px-6 pt-5">
<div className="flex flex-wrap items-center gap-3">
<span
className={`px-4 py-2 rounded-full text-sm font-bold ${getStatusClass(
selectedContract.status
)}`}
>
סטטוס:{" "}
{getStatusLabel(
selectedContract.status
)}
</span>

{selectedContract.status ===
"SIGNED" && (
<span className="px-4 py-2 rounded-full text-sm font-bold bg-green-900/30 text-green-400 border border-green-700">
✓ חתימת לקוח התקבלה
</span>
)}
</div>
</div>

{/* SIGNED */}

{selectedContract.status ===
"SIGNED" && (
<div className="no-print mx-6 mt-5 bg-green-900/20 border border-green-700 rounded-2xl p-5">
<div className="flex items-center gap-3">
<div className="w-12 h-12 rounded-full bg-green-600 flex items-center justify-center text-xl">
✓
</div>

<div>
<h3 className="text-xl font-bold text-green-400">
החוזה נחתם בהצלחה
</h3>

{selectedContract.signedAt && (
<p className="text-gray-400 text-sm mt-1">
נחתם בתאריך:{" "}
{new Date(
selectedContract.signedAt
).toLocaleString(
"he-IL"
)}
</p>
)}
</div>
</div>
</div>
)}

{/* PREVIEW */}

<div className="print-scroll p-4 md:p-6 overflow-y-auto max-h-[72vh]">
<ContractPreview
client={
selectedContract.client
? {
id:
selectedContract
.client
.id,

name:
selectedContract
.client
.name,

phone:
selectedContract
.client
.phone,

email:
selectedContract
.client
.email,

eventType:
selectedContract
.client
.eventType,

eventDate:
selectedContract
.client
.eventDate,

guests:
selectedContract
.client
.guests,

location:
selectedContract
.client
.location,

totalAmount:
selectedContract
.client
.totalAmount,

paidAmount:
selectedContract
.client
.paidAmount,

notes:
selectedContract
.client
.notes,

additionalInfo:
selectedContract
.client
.additionalInfo,

alcoholList:
selectedContract
.client
.alcoholList,

services:
selectedContract
.client
.services,
}
: null
}
titleValue={
selectedContract.title
}
contentValue={
selectedContract.content
}
amount={numericValue(
selectedContract.totalAmount
)}
deposit={numericValue(
selectedContract.depositAmount
)}
remaining={numericValue(
selectedContract.remainingAmount
)}
signatureData={
selectedContract.signatureData
}
signedAt={
selectedContract.signedAt
}
marketingConsent={
selectedContract.marketingConsent
}
/>
</div>
</div>
</div>
)}

{/* ================================================= */}
{/* PRINT CSS */}
{/* ================================================= */}

<style jsx global>{`
@media print {
@page {
size: A4;
margin: 12mm;
}

html,
body {
background: #ffffff !important;
color: #111111 !important;
width: auto !important;
height: auto !important;
min-height: 0 !important;
overflow: visible !important;
margin: 0 !important;
padding: 0 !important;
}

/*
* מסתירים את כל האתר בזמן הדפסה.
* רק .print-root והחוזה שבתוכו יוצגו.
*/

body * {
visibility: hidden !important;
}

.print-root,
.print-root * {
visibility: visible !important;
}

.no-print {
display: none !important;
}

/*
* מבטלים את כל מבנה ה-modal
*/

.print-root {
position: static !important;
inset: auto !important;
display: block !important;
width: auto !important;
max-width: none !important;
height: auto !important;
max-height: none !important;
min-height: 0 !important;
margin: 0 !important;
padding: 0 !important;
background: #ffffff !important;
overflow: visible !important;
border: 0 !important;
box-shadow: none !important;
backdrop-filter: none !important;
}

.print-modal {
position: static !important;
inset: auto !important;
display: block !important;
width: auto !important;
max-width: none !important;
height: auto !important;
max-height: none !important;
min-height: 0 !important;
margin: 0 !important;
padding: 0 !important;
background: #ffffff !important;
overflow: visible !important;
border: 0 !important;
border-radius: 0 !important;
box-shadow: none !important;
}

/*
* מבטלים את אזור הגלילה
*/

.print-scroll {
position: static !important;
display: block !important;
width: auto !important;
max-width: none !important;
height: auto !important;
max-height: none !important;
min-height: 0 !important;
margin: 0 !important;
padding: 0 !important;
overflow: visible !important;
background: #ffffff !important;
border: 0 !important;
}

/*
* דף החוזה
*/

.contract-paper {
position: static !important;
display: block !important;
width: auto !important;
max-width: none !important;
min-width: 0 !important;
height: auto !important;
min-height: 0 !important;
max-height: none !important;
margin: 0 !important;
padding: 0 !important;
overflow: visible !important;
background: #ffffff !important;
color: #111111 !important;
border: 0 !important;
border-radius: 0 !important;
box-shadow: none !important;
}

/*
* מונע clipping מכל הילדים
*/

.contract-paper,
.contract-paper *,
.print-root,
.print-root * {
max-height: none !important;
overflow: visible !important;
}

/*
* צבעים מתאימים להדפסה
*/

.contract-paper .bg-\$begin:math:display$\\\\\#171717\\$end:math:display$,
.contract-paper .bg-\$begin:math:display$\\\\\#111\\$end:math:display$,
.contract-paper .bg-\$begin:math:display$\\\\\#151515\\$end:math:display$,
.contract-paper .bg-\$begin:math:display$\\\\\#101010\\$end:math:display$ {
background: #ffffff !important;
color: #111111 !important;
}

.contract-paper .text-white {
color: #111111 !important;
}

.contract-paper .text-gray-300,
.contract-paper .text-gray-400,
.contract-paper .text-gray-500,
.contract-paper .text-gray-600,
.contract-paper .text-gray-700 {
color: #333333 !important;
}

/*
* מאפשרים לתוכן ארוך לעבור לעמוד הבא.
*/

.contract-paper
.whitespace-pre-wrap {
white-space: pre-wrap !important;
overflow-wrap: anywhere !important;
word-break: normal !important;
}

/*
* לא לשבור כרטיסים קטנים באמצע.
*/

.contract-paper
> div {
break-inside: auto;
page-break-inside: auto;
}

.contract-paper
.border {
break-inside: avoid;
page-break-inside: avoid;
}

/*
* אזור תנאי ההתקשרות חייב להיות מסוגל
* להתפצל לעמודים אם הוא ארוך.
*/

.contract-paper
.border-gray-200 {
break-inside: auto !important;
page-break-inside: auto !important;
}

/*
* חתימות עדיף להשאיר יחד.
*/

.contract-paper
img {
max-width: 100% !important;
max-height: 140px !important;
object-fit: contain !important;
}

/*
* לינקים לא יודפסו עם כתובת URL לידם.
*/

.contract-paper a {
text-decoration: none !important;
}

/*
* מבטלים sticky/fixed בזמן הדפסה.
*/

* {
position: static !important;
}

/*
* אבל החוזה עצמו נשאר רגיל וזורם
* על פני מספר עמודי A4.
*/

.contract-paper {
page-break-after: auto !important;
break-after: auto !important;
}
}
`}</style>
</div>
);
}

// ======================================================
// INFO ROW
// ======================================================

function InfoRow({
label,
value,
}: {
label: string;
value: string;
}) {
return (
<div className="flex items-start justify-between gap-4 border-b border-gray-100 pb-2 last:border-0">
<span className="text-gray-500 text-sm">
{label}
</span>

<span className="font-bold text-right">
{value}
</span>
</div>
);
}

// ======================================================
// INFO BOX
// ======================================================

function InfoBox({
label,
value,
}: {
label: string;
value: string;
}) {
return (
<div>
<div className="text-gray-500 text-xs">
{label}
</div>

<div className="font-bold mt-1">
{value}
</div>
</div>
);
}