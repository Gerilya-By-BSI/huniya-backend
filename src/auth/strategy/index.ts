export * from './jwt.strategy';

export type JwtPayload = {
  user_id: string;
  email: string;
  role: string;
};
