export const code = (prefix: string, index: number) =>
    `${prefix}-${String(index + 1).padStart(2, "0")}`;

export const monthOf = (date: Date) =>
    date.toISOString().slice(0, 7).replace("-", ".");
