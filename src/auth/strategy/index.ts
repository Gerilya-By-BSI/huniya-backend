export * from './jwt.strategy';

export type JwtPayload = {
  user_id: string;
  user_type: 'admin' | 'user';
};
