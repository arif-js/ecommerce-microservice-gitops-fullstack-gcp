import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { createClerkClient } from '@clerk/clerk-sdk-node';

@Injectable()
export class ClerkGuard implements CanActivate {
    private clerkClient = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const authHeader = request.headers.authorization;

        if (!authHeader) {
            throw new UnauthorizedException('No authorization header found');
        }

        const token = authHeader.split(' ')[1];
        if (!token) {
            throw new UnauthorizedException('Token missing');
        }

        try {
            const decodedToken = await this.clerkClient.verifyToken(token);
            request.user = decodedToken;
            return true;
        } catch (err) {
            throw new UnauthorizedException('Invalid token');
        }
    }
}
