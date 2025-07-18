// Utility functions for document handling

export function generateDigitalId(): string {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 10000);
  return `DOC-${timestamp}-${random}`;
}

export async function calculateHash(file: File): Promise<string> {
  try {
    const buffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return hashHex;
  } catch (error) {
    console.error('Error calculating hash:', error);
    return '';
  }
}