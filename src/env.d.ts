/// <reference types="astro/client" />

type D1Like = {
  prepare: (query: string) => {
    bind: (...values: unknown[]) => { all: () => Promise<unknown[]> };
    all: () => Promise<unknown[]>;
  };
};

declare namespace App {
  interface Locals {
    runtime: {
      env: {
        SUPABASE_URL: string;
        SUPABASE_ANON_KEY: string;
        SEO_DB: D1Like;
      };
    };
    user: { email?: string } | null;
  }
}
