// Direction and digits. Canvas shapes Persian and orders mixed Persian/Latin text itself when `direction` is set, so this only decides which direction to use.

/** Right-to-left when Arabic-script letters are at least as many as Latin ones. */
export const isRtl = (t: string) => {
  const ar = (t.match(/[؀-ۿ]/g) ?? []).length;
  const la = (t.match(/[A-Za-z]/g) ?? []).length;
  return ar >= la;
};

/** Persian digits for text the app makes itself (step numbers, counts); the article's own digits are never touched. */
export const faDigits = (s: string | number) => String(s).replace(/\d/g, (d) => '۰۱۲۳۴۵۶۷۸۹'[+d]);

/** Sentences, keeping their end marks; an abbreviation dot before a lower-case letter does not split. */
export function sentences(text: string): string[] {
  return (text.replace(/\s+/g, ' ').match(/[^.!?؟۔…]+(?:[.!?؟۔…]+(?=\s|$)|$)/g) ?? []).map((s) => s.trim()).filter(Boolean);
}
