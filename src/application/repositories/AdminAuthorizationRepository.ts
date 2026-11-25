export interface AdminAuthorizationRepository {
  isActiveAdmin(): Promise<boolean>;
}
