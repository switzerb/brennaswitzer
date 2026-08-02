export function Footer() {
  return (
    <footer className="border-t border-zinc-200 dark:border-zinc-800">
      <div className="max-w-6xl mx-auto px-8 py-8 flex flex-col sm:flex-row items-center justify-between gap-2 text-sm text-zinc-500 dark:text-zinc-500">
        <p>&copy; {new Date().getFullYear()} Brenna Switzer</p>
        <a
          href="mailto:hello@brennaswitzer.com"
          className="hover:text-accent transition-colors"
        >
          hello@brennaswitzer.com
        </a>
      </div>
    </footer>
  );
}
