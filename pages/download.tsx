import { useEffect } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import { Loader2 } from "lucide-react";

/** Redirection vers la page d'installation App Router (/install). */
export default function DownloadRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    void router.replace("/install");
  }, [router]);

  return (
    <>
      <Head>
        <title>Redirection…</title>
        <meta httpEquiv="refresh" content="0;url=/install" />
      </Head>
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" aria-hidden />
        <span className="sr-only">Redirection vers la page d&apos;installation…</span>
      </div>
    </>
  );
}
