/// <reference path="../.astro/types.d.ts" />

declare namespace App {
  interface Locals {
    session: {
      id: string;
      customerId: string;
      expiresAt: Date;
    } | null;
    customer: {
      id: string;
      email: string;
    } | null;
  }
}
