import CryptoJS from "crypto-js";
import { AESContext } from "./AESContext";

const secretKey = "7gXh8WzK4rD2pR9t6LcYvBN1eQm3AZUs";
const iv = "eK9fG6pW4dMxV2sR";

export function AESProvider({ children }) {
  const key = CryptoJS.enc.Utf8.parse(secretKey);
  const ivBytes = CryptoJS.enc.Utf8.parse(iv);

  const encrypt = (plainText) => {
    const encrypted = CryptoJS.AES.encrypt(plainText, key, {
      iv: ivBytes,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7,
    });
    return encrypted.toString();
  };

  const decrypt = (cipherText) => {
    const decrypted = CryptoJS.AES.decrypt(cipherText, key, {
      iv: ivBytes,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7,
    });
    return decrypted.toString(CryptoJS.enc.Utf8);
  };

  return (
    <AESContext.Provider value={{ encrypt, decrypt }}>
      {children}
    </AESContext.Provider>
  )
}
