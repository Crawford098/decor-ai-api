export interface JwtPayload {
  sub: number; // userId
  username: string;
  email: string;
  iat?: number; // issued at
  exp?: number; // expiration
}

export interface JwtRefreshPayload extends JwtPayload {
  tokenType: 'refresh';
}

export interface GoogleProfile {
  id: string;
  emails: { value: string; verified: boolean }[];
  name: {
    givenName: string;
    familyName: string;
  };
  photos?: { value: string }[];
  displayName: string;
}
