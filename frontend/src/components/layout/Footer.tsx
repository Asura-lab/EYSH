import Link from "next/link";
import { GraduationCap, Facebook, Instagram, Twitter, Mail, Phone, MapPin } from "lucide-react";

interface FooterLink {
  label: string;
  href: string;
}

interface FooterLinks {
  product: FooterLink[];
  company: FooterLink[];
  support: FooterLink[];
}

const footerLinks: FooterLinks = {
  product: [
    { label: "Тест авах", href: "/test" },
    { label: "Roadmap", href: "/roadmap" },
    { label: "Менторууд", href: "/mentors" },
    { label: "Эхлэх", href: "/register" },
  ],
  company: [
    { label: "Бидний тухай", href: "/about" },
    { label: "Блог", href: "/blog" },
    { label: "Холбоо барих", href: "/contact" },
    { label: "Түншүүд", href: "/partners" },
  ],
  support: [
    { label: "Тусламж", href: "/help" },
    { label: "FAQ", href: "/faq" },
    { label: "Нууцлалын бодлого", href: "/privacy" },
    { label: "Үйлчилгээний нөхцөл", href: "/terms" },
  ],
};

export default function Footer(): JSX.Element {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                <GraduationCap className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-white">EYSH</span>
            </Link>
            <p className="text-gray-400 mb-6 max-w-sm">
              Элсэлтийн шалгалтанд бэлдэх хамгийн ухаалаг арга зам. AI технологид суурилсан хувийн сургалтын төлөвлөгөө.
            </p>
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-blue-600 transition">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-pink-600 transition">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-blue-400 transition">
                <Twitter className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-white font-semibold mb-4">Бүтээгдэхүүн</h4>
            <ul className="space-y-3">
              {footerLinks.product.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="hover:text-white transition">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Компани</h4>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="hover:text-white transition">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Холбоо барих</h4>
            <ul className="space-y-3">
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-blue-400" />
                <span>info@eysh.mn</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-blue-400" />
                <span>+976 9999-9999</span>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-blue-400 mt-1" />
                <span>Улаанбаатар хот, Сүхбаатар дүүрэг</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-500 text-sm">
            © 2026 EYSH. Бүх эрх хуулиар хамгаалагдсан.
          </p>
          <div className="flex gap-6 text-sm">
            <Link href="/privacy" className="hover:text-white transition">
              Нууцлал
            </Link>
            <Link href="/terms" className="hover:text-white transition">
              Нөхцөл
            </Link>
            <Link href="/cookies" className="hover:text-white transition">
              Cookies
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
