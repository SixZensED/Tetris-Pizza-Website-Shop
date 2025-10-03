declare module "@sit-sandbox/thai-bad-words" {
  export function scanBadWords(text: string): Promise<void> | void;
  export function addBadWords(words: string[]): void;
}
