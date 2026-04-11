import { MessageCircle } from "lucide-react";

const WhatsAppButton = () => (
  <a
    href="https://wa.me/56900000000"
    target="_blank"
    rel="noopener noreferrer"
    className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-success rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
    aria-label="WhatsApp"
  >
    <MessageCircle className="h-6 w-6 text-success-foreground" />
  </a>
);

export default WhatsAppButton;
