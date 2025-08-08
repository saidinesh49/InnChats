// utils/hashService.js
import CryptoJS from "crypto-js";
import { asyncHandler } from "./asyncHandler.js";

const secretKey = "ThisCanAlsoBeAKey";

const encryptData = asyncHandler(async (usersIds) => {
  if (!(usersIds[0] && usersIds[1])) {
    throw new Error("Both userId's required to get chatId via encryption");
  }
  usersIds.sort();
  let data = usersIds[0] + "(_)" + usersIds[1];
  const jsonData = JSON.stringify(data);
  const encryptedData = CryptoJS.AES.encrypt(jsonData, secretKey).toString(); // ✅ fixed line
  return encryptedData;
});

const decryptData = (roomId) => {
  const bytes = CryptoJS.AES.decrypt(roomId, secretKey);
  const decryptedData = bytes.toString(CryptoJS.enc.Utf8);
  return JSON.parse(decryptedData);
};

export { encryptData, decryptData };
