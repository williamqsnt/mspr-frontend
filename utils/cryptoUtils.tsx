import crypto from 'crypto';

// Définir le type de la clé de chiffrement comme une constante
const encryptionKey: string = "12345678901234567890123456789012"; // clé de 32 octets pour AES-256

// Fonction de chiffrement avec typage
function encrypt(text: string): string {
    const cipher: crypto.Cipher = crypto.createCipheriv('aes-256-ecb', Buffer.from(encryptionKey), Buffer.alloc(0));
    let encrypted: Buffer = cipher.update(text);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return encrypted.toString('hex');
}

// Fonction de déchiffrement avec typage
function decrypt(encryptedText: string): string {
    const encryptedBuffer: Buffer = Buffer.from(encryptedText, 'hex');
    const decipher: crypto.Decipher = crypto.createDecipheriv('aes-256-ecb', Buffer.from(encryptionKey), Buffer.alloc(0));
    let decrypted: Buffer = decipher.update(encryptedBuffer);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
}

// Exporter les fonctions avec typage
export { encrypt, decrypt };
