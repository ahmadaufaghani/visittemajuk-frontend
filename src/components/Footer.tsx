import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Phone, Mail, Instagram, Facebook, Twitter, Youtube, Music2, AtSign } from 'lucide-react';
import { useFooterSocials } from '../hooks/useFooterSocials';
import { useSiteSettings } from '../hooks/useSiteSettings';

const FALLBACK_TAGLINE = 'Jelajahi keindahan alam Temajuk, destinasi wisata eksotis di ujung barat Indonesia.';
const FALLBACK_BRAND_TEXT = 'Visit Temajuk';
const FALLBACK_ADDRESS = 'Temajuk, Kecamatan Paloh, Kabupaten Sambas, Kalimantan Barat, Indonesia';
const FALLBACK_PHONE = '+62 8123 4567 890';
const FALLBACK_EMAIL = 'info@visittemajuk.id';

const platformIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  instagram: Instagram,
  facebook: Facebook,
  twitter: Twitter,
  youtube: Youtube,
  tiktok: Music2,
  threads: AtSign,
  other: AtSign,
};

const QuickLinks = [
  { to: '/', label: 'Beranda' },
  { to: '/destinasi', label: 'Destinasi' },
  { to: '/akomodasi', label: 'Akomodasi' },
  { to: '/transportasi', label: 'Transportasi' },
  { to: '/kuliner', label: 'Kuliner' },
  { to: '/foto', label: 'Spot Foto' },
  { to: '/ulasan', label: 'Ulasan' },
];

const Footer: React.FC = () => {
  const { socials, isLoading: isLoadingSocials } = useFooterSocials();
  const { settings } = useSiteSettings();
  const brand = settings['footer.brand'];
  const contact = settings['footer.contact'];

  const tagline = brand?.tagline?.trim() || FALLBACK_TAGLINE;
  const brandText = brand?.brand_text?.trim() || FALLBACK_BRAND_TEXT;
  const address = contact?.address?.trim() || FALLBACK_ADDRESS;
  const phone = contact?.phone?.trim() || FALLBACK_PHONE;
  const email = contact?.email?.trim() || FALLBACK_EMAIL;

  return (
    <footer className="bg-primary text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center mb-4">
              <MapPin className="h-6 w-6 text-accent" />
              <span className="ml-2 text-xl font-bold text-white font-heading">
                {brandText}
              </span>
            </div>
            <p className="text-gray-300 mb-4">{tagline}</p>

            {!isLoadingSocials && socials.length > 0 ? (
              <div className="flex space-x-4 flex-wrap gap-y-2">
                {socials.map((social) => {
                  const Icon = platformIcons[social.platform] ?? AtSign;
                  return (
                    <a
                      key={social.id}
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={social.label || social.platform}
                      className="text-gray-300 hover:text-accent transition-colors duration-200"
                    >
                      <Icon className="h-6 w-6" />
                    </a>
                  );
                })}
              </div>
            ) : (
              <div className="flex space-x-4" aria-hidden="true">
                <Instagram className="h-6 w-6 text-gray-400 opacity-50" />
                <Facebook className="h-6 w-6 text-gray-400 opacity-50" />
                <Twitter className="h-6 w-6 text-gray-400 opacity-50" />
              </div>
            )}
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4 text-accent">Tautan Cepat</h3>
            <ul className="space-y-2">
              {QuickLinks.map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="text-gray-300 hover:text-accent transition-colors duration-200"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4 text-accent">Kontak Kami</h3>
            <div className="space-y-3">
              <div className="flex items-start">
                <MapPin className="h-5 w-5 text-accent mr-2 mt-1" />
                <p className="text-gray-300">{address}</p>
              </div>
              <div className="flex items-center">
                <Phone className="h-5 w-5 text-accent mr-2" />
                <p className="text-gray-300">{phone}</p>
              </div>
              <div className="flex items-center">
                <Mail className="h-5 w-5 text-accent mr-2" />
                <p className="text-gray-300">{email}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-300">
          <p>&copy; {new Date().getFullYear()} Visit Temajuk. Hak Cipta Dilindungi.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;