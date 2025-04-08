export function generateToken(length: number = 6) {
  let token = "";

  for (let i = 0; i < length; i++) {
    const digit = Math.floor(Math.random() * 10);

    token += digit;
  }

  return token;
}
