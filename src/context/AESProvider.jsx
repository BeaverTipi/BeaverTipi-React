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

  // ✅ 동적 IV를 이용한 암호화
  const encryptWithRandomIV = (plainText) => {
    const randomIv = CryptoJS.lib.WordArray.random(16);
    const encrypted = CryptoJS.AES.encrypt(plainText, key, {
      iv: randomIv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7,
    });

    return {
      iv: CryptoJS.enc.Base64.stringify(randomIv),
      encrypted: encrypted.toString(),
    };
  };

  // ✅ 동적 IV로 복호화
  const decryptWithIV = (cipherText, base64Iv) => {
    const ivFromServer = CryptoJS.enc.Base64.parse(base64Iv);
    const decrypted = CryptoJS.AES.decrypt(cipherText, key, {
      iv: ivFromServer,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7,
    });
    return decrypted.toString(CryptoJS.enc.Utf8);
  };

  const toUrlSafeBase64 = (str) => {
    return str
      .replace(/\+/g, "-") // + → -
      .replace(/\//g, "_") // / → _
      .replace(/=+$/, ""); // = 제거 (padding 제거)
  };
  const encodeURI = (encrypted) => {
    return toUrlSafeBase64(encrypted); //<--URL_safe
  };
  const fromUrlSafeBase64 = (str) => {
    let base64 = str.replace(/-/g, "+").replace(/_/g, "/");
    while (base64.length % 4) base64 += "=";
    return base64;
  };
  const decodeURI = (URIEncoded) => {
    return fromUrlSafeBase64(URIEncoded);
  };

  return (
    <AESContext.Provider
      value={{
        encrypt,
        decrypt,
        encryptWithRandomIV,
        decryptWithIV,
        encodeURI,
        decodeURI,
      }}
    >
      {children}
    </AESContext.Provider>
  );
}
