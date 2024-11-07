import crypto from "node:crypto";

const LETTERS = "1234567890ABCEDEFGHIJKLMNOPQRSTUVWXYZ";

export let nanoid = (length = 21) => {
  let id = "";
  let values = crypto.getRandomValues(new Uint8Array(length));
  for (let i = 0; i < length; i++) {
    id += LETTERS[(LETTERS.length - 1) & values[i]];
  }

  return id;
};

export const generateUsername = (email: string) => {
  // Split the email to get the username part
  const username = email.split("@")[0];

  // Split the username by common delimiters
  const parts = username.split(/[._-]/);

  // Capitalize the first letter of each part and join them with spaces
  return parts
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
};
