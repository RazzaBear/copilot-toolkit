import { Link } from "react-router-dom";
import { PageHeader } from "../components/PageHeader";

export function NotFoundPage() {
  return (
    <>
      <PageHeader
        title="Page not found"
        description="The requested route is not part of the React migration scaffold."
      />
      <section className="mx-auto max-w-7xl px-4 py-8 md:px-6">
        <Link
          to="/"
          className="inline-flex h-10 items-center border border-accent bg-accent px-4 text-sm font-medium text-white"
        >
          Return home
        </Link>
      </section>
    </>
  );
}
