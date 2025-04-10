import { UserDocument } from "#/models/users";

export function generateToken(length: number = 6) {
  let token = "";

  for (let i = 0; i < length; i++) {
    const digit = Math.floor(Math.random() * 10);

    token += digit;
  }

  return token;
}

export function formatProfile(user: UserDocument) {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    verified: user.verified,
    avatar: user.avatar?.url,
    followers: user.followers.length,
    followings: user.followings.length,
  };
}
