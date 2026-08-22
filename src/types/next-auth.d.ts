import NextAuth from "next-auth";
import { UserRole, LoginPortal } from "./index";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      role: UserRole;
      portal?: LoginPortal;
      image?: string;
      practitionerId?: string;
      patientId?: string;
      organizationId?: string;
    };
  }

  interface User {
    id: string;
    email: string;
    name: string;
    role: UserRole;
    portal?: LoginPortal;
    image?: string;
    practitionerId?: string;
    patientId?: string;
    organizationId?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    role?: UserRole;
    portal?: LoginPortal;
    practitionerId?: string;
    patientId?: string;
    organizationId?: string;
  }
}
