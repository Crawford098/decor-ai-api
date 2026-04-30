import { Profile } from '../../../entities/profile.entity';

/**
 * Shape of `req.user` after JwtStrategy.validate().
 * Use this type for @CurrentUser() parameters instead of the User entity.
 */
export interface AuthenticatedUser {
  userId: number;
  username: string;
  email: string;
  profile: Profile;
}
