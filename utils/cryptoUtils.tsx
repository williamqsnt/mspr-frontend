import crypto from 'crypto';

const encryptionKey: string = "12345678901234567890123456789012"
const iv: string = "0123456789abcdef"

function encrypt(text: string): string {
    const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(encryptionKey), Buffer.from(iv));
    let encrypted = cipher.update(text);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return iv.toString() + ':' + encrypted.toString('hex');
}

function decrypt(text: string): string {
    const iv = Buffer.from('0123456789abcdef0123456789abcdef', 'hex'); // IV constant
    const encryptedText = Buffer.from(text, 'hex'); // Le texte est entièrement chiffré
    const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(encryptionKey, 'hex'), iv);
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
}

export { encrypt, decrypt };