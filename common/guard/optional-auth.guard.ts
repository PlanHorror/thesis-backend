import { Injectable } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";

/**
 * Optional JWT auth guard. Does not throw when no token or invalid token.
 * Sets req.user when authenticated, undefined otherwise.
 * Use for endpoints that work for both authenticated and unauthenticated users.
 */
@Injectable()
export class OptionalAuthGuard extends AuthGuard("accessToken") {
  handleRequest<TUser>(err: Error | null, user: TUser | null): TUser | null {
    return user ?? null;
  }
}
