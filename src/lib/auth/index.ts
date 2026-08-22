import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { UserRole } from "@/types";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
  portal: z.string().optional(),
});

const DEMO_USERS_MAP: Record<string, { pass: string; role: UserRole; portal: string; name: string; id: string }> = {
  "admin@metapharsic.com": { id: "demo-admin-id", pass: "admin123", role: "ADMIN", portal: "ADMIN_PORTAL", name: "System Administrator" },
  "physician@metapharsic.com": { id: "demo-physician-id", pass: "physician123", role: "PHYSICIAN", portal: "PHYSICIAN_PORTAL", name: "Dr. Sarah Johnson" },
  "nurse@metapharsic.com": { id: "demo-nurse-id", pass: "nurse123", role: "NURSE", portal: "CLINICAL_PORTAL", name: "Emily Rodriguez, RN" },
  "ma@metapharsic.com": { id: "demo-ma-id", pass: "ma123", role: "MEDICAL_ASSISTANT", portal: "CLINICAL_PORTAL", name: "Alex Vance, MA" },
  "frontdesk@metapharsic.com": { id: "demo-frontdesk-id", pass: "frontdesk123", role: "FRONT_DESK", portal: "RECEPTION_PORTAL", name: "Samantha Reed" },
  "patient@metapharsic.com": { id: "demo-patient-id", pass: "patient123", role: "PATIENT", portal: "PATIENT_PORTAL", name: "John Smith" },
};

function getPortalForRole(role: string): string {
  switch (role) {
    case "ADMIN":
      return "ADMIN_PORTAL";
    case "PHYSICIAN":
      return "PHYSICIAN_PORTAL";
    case "NURSE":
    case "MEDICAL_ASSISTANT":
      return "CLINICAL_PORTAL";
    case "FRONT_DESK":
      return "RECEPTION_PORTAL";
    case "PATIENT":
      return "PATIENT_PORTAL";
    default:
      return "STAFF";
  }
}

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
    maxAge: 8 * 60 * 60, // 8 hours
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        portal: { label: "Portal", type: "text" },
      },
      async authorize(credentials) {
        try {
          const validated = credentialsSchema.parse(credentials);

          let user = null;
          try {
            user = await db.user.findUnique({
              where: { email: validated.email },
            });
          } catch (dbErr) {
            console.warn("DB user lookup failed, falling back to demo credentials check", dbErr);
          }

          if (user && user.password && user.isActive) {
            const passwordMatch = await bcrypt.compare(validated.password, user.password);
            if (passwordMatch) {
              const portal = (validated.portal && validated.portal !== "STAFF") 
                ? validated.portal 
                : getPortalForRole(user.role);

              try {
                await db.user.update({
                  where: { id: user.id },
                  data: { lastPortalLogin: new Date() },
                });
              } catch (_) {}

              return {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role as UserRole,
                portal: portal,
                image: user.image,
                practitionerId: user.practitionerId,
                patientId: user.patientId,
                organizationId: user.organizationId,
              } as any;
            }
          }

          // Fallback demo user check if DB account not found or password match failed
          const demoUser = DEMO_USERS_MAP[validated.email.toLowerCase()];
          if (demoUser && demoUser.pass === validated.password) {
            return {
              id: demoUser.id,
              email: validated.email,
              name: demoUser.name,
              role: demoUser.role,
              portal: demoUser.portal,
              image: null,
            } as any;
          }

          return null;
        } catch (error) {
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = (user as any).id;
        token.role = (user as any).role;
        token.portal = (user as any).portal;
        token.practitionerId = (user as any).practitionerId;
        token.patientId = (user as any).patientId;
        token.organizationId = (user as any).organizationId;
      }

      // Handle session updates
      if (trigger === "update" && session) {
        token.name = session.name;
        token.image = session.image;
      }

      return token;
    },
    async session({ session, token }) {
      if (token) {
        (session.user as any) = {
          id: token.id as string,
          email: token.email as string,
          name: token.name as string,
          role: token.role as UserRole,
          portal: token.portal as any,
          image: (token.picture as string) || null,
        };
      }
      return session;
    },
  },
  events: {},
};
