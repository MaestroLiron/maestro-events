// ==========================================
// Maestro Events - Contract Helpers
// ==========================================

export type ContractVariables = {
  clientName?: string | null;
  clientPhone?: string | null;
  clientEmail?: string | null;
  eventType?: string | null;
  eventDate?: string | null;
  guests?: string | number | null;
  location?: string | null;

  serviceName?: string | null;

  totalAmount?: number | null;
  depositAmount?: number | null;
  remainingAmount?: number | null;

  notes?: string | null;
  additionalInfo?: string | null;

  // רשימת אלכוהול ומשקאות עבור בר אקטיבי
  alcoholList?: string | null;
};

/**
 * פורמט סכום כסף
 */
export function formatContractAmount(
  amount: number | null | undefined
): string {
  if (amount === null || amount === undefined || Number.isNaN(amount)) {
    return "0 ₪";
  }

  return `${amount.toLocaleString("he-IL")} ₪`;
}

/**
 * החלפת משתנים בתוך תוכן התבנית.
 *
 * לדוגמה:
 * {{clientName}}
 * {{eventDate}}
 * {{totalAmount}}
 * {{alcoholList}}
 */
export function replaceContractVariables(
  content: string,
  variables: ContractVariables
): string {
  if (!content) return "";

  const values: Record<string, string> = {
    clientName: variables.clientName ?? "",
    clientPhone: variables.clientPhone ?? "",
    clientEmail: variables.clientEmail ?? "",
    eventType: variables.eventType ?? "",
    eventDate: variables.eventDate ?? "",
    guests: variables.guests?.toString() ?? "",
    location: variables.location ?? "",

    serviceName: variables.serviceName ?? "",

    totalAmount: formatContractAmount(variables.totalAmount),
    depositAmount: formatContractAmount(variables.depositAmount),
    remainingAmount: formatContractAmount(variables.remainingAmount),

    notes: variables.notes ?? "",
    additionalInfo: variables.additionalInfo ?? "",

    // רשימת האלכוהול שהוזנה אצל הלקוח
    alcoholList: variables.alcoholList ?? "",
  };

  return content.replace(
    /\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g,
    (match, variableName: string) => {
      return Object.prototype.hasOwnProperty.call(values, variableName)
        ? values[variableName]
        : match;
    }
  );
}

/**
 * שירות עם תנאי חוזה משלו.
 */
export type ContractServiceSection = {
  serviceName: string;
  content: string;
};

/**
 * מרכיב חוזה אחד מתוך:
 *
 * 1. תנאים כלליים
 * 2. תנאים של כל שירות שהלקוח הזמין
 */
export function buildContractContent({
  generalContent,
  serviceSections,
  variables,
}: {
  generalContent?: string | null;
  serviceSections?: ContractServiceSection[];
  variables: ContractVariables;
}): string {
  const sections: string[] = [];

  // ==========================================
  // תנאים כלליים
  // ==========================================

  if (generalContent?.trim()) {
    const general = replaceContractVariables(
      generalContent.trim(),
      variables
    );

    sections.push(general);
  }

  // ==========================================
  // תנאים לפי שירות
  // ==========================================

  for (const section of serviceSections ?? []) {
    if (!section.content?.trim()) continue;

    const serviceVariables: ContractVariables = {
      ...variables,
      serviceName: section.serviceName,
    };

    const serviceContent = replaceContractVariables(
      section.content.trim(),
      serviceVariables
    );

    sections.push(
      `\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n` +
        `תנאים מיוחדים עבור השירות: ${section.serviceName}\n\n` +
        `${serviceContent}`
    );
  }

  return sections.join("\n\n");
}