import { Scissors, Instagram } from "lucide-react";

const Footer = () => (
  <footer className="border-t border-border py-12 bg-secondary/20">
    <div className="container mx-auto px-4">
      <div className="flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-2 font-heading font-bold">
          <Scissors className="h-5 w-5 text-primary" />
          <span>NeneStyle</span>
        </div>

        <div className="flex items-center gap-6 text-sm text-muted-foreground">
          <span>Lun–Vie 10–20h</span>
          <span>Sáb 10–19h</span>
          <a href="https://www.instagram.com/nenestyle10" target="_blank" rel="noopener noreferrer" className="hover:text-primary flex items-center gap-1">
            <Instagram className="h-4 w-4" /> @nenestyle10
          </a>
        </div>
      </div>
      <p className="text-center text-xs text-muted-foreground mt-8">© 2026 NeneStyle - Concepción, Chile</p>
    </div>
  </footer>
);

export default Footer;
