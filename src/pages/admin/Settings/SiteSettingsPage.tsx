import React, { useEffect, useState } from 'react';
import { useAuth } from '../../../contexts/authContextValue';
import { useSiteSettings } from '../../../hooks/useSiteSettings';
import { updateSiteSettings } from '../../../services/siteSettingsApi';
import { storageUrl } from '../../../utils/storageUrl';
import { showConfirm } from '../../../utils/confirm';
import { Save, Upload, Edit, Plus, Trash2, X, Map, MapPin, Utensils, Camera, Compass, Bus, Bed } from 'lucide-react';
import { useFooterSocials } from '../../../hooks/useFooterSocials';
import {
  createFooterSocial,
  deleteFooterSocial,
  updateFooterSocial,
} from '../../../services/footerSocialsApi';
import type {
  FooterSocial,
  FooterSocialPayload,
  FooterSocialPlatform,
} from '../../../types/footerSocial';
import type { SiteFeature } from '../../../types/siteSettings';
import toast from 'react-hot-toast';

type TabKey = 'home' | 'footer';

const PAGE_OPTIONS = [
  { value: '/destinasi', label: 'Destinasi' },
  { value: '/akomodasi', label: 'Akomodasi' },
  { value: '/transportasi', label: 'Transportasi' },
  { value: '/kuliner', label: 'Kuliner' },
  { value: '/foto', label: 'Spot Foto' },
  { value: '/ulasan', label: 'Ulasan' },
];

const FEATURE_ICONS = ['Map', 'MapPin', 'Utensils', 'Camera', 'Compass', 'Bus', 'Bed'];

const ICON_COMPONENTS: Record<string, React.ComponentType<{ className?: string }>> = {
  Map, MapPin, Utensils, Camera, Compass, Bus, Bed,
};

const SOCIAL_PLATFORMS: FooterSocialPlatform[] = [
  'instagram', 'facebook', 'twitter', 'tiktok', 'youtube', 'threads', 'other',
];

interface FeatureFormState {
  title: string;
  body: string;
  icon: string;
}

const emptyFeature: FeatureFormState = { title: '', body: '', icon: 'Map' };

interface SocialFormState {
  platform: FooterSocialPlatform;
  label: string;
  url: string;
  order: string;
}

const emptySocialForm: SocialFormState = {
  platform: 'instagram',
  label: '',
  url: '',
  order: '0',
};

const SiteSettingsPage: React.FC = () => {
  const { token } = useAuth();
  const { settings, reload, isLoading } = useSiteSettings();
  const { socials, reload: reloadSocials, isLoading: isLoadingSocials } = useFooterSocials();
  const [activeTab, setActiveTab] = useState<TabKey>('home');
  const [isSaving, setIsSaving] = useState(false);

  // Home fields
  const [heroTitle, setHeroTitle] = useState('');
  const [heroSubtitle, setHeroSubtitle] = useState('');
  const [heroButtonText, setHeroButtonText] = useState('');
  const [heroButtonLink, setHeroButtonLink] = useState('/destinasi');
  const [heroImageFile, setHeroImageFile] = useState<File | null>(null);

  const [introTitle, setIntroTitle] = useState('');
  const [introBody, setIntroBody] = useState('');
  const [introImageFile, setIntroImageFile] = useState<File | null>(null);

  const [features, setFeatures] = useState<SiteFeature[]>([]);
  const [featureIndex, setFeatureIndex] = useState<number | null>(null);
  const [featureForm, setFeatureForm] = useState<FeatureFormState>(emptyFeature);
  const [isFeatureFormOpen, setIsFeatureFormOpen] = useState(false);
  const [featuresSectionTitle, setFeaturesSectionTitle] = useState('');

  const [ctaTitle, setCtaTitle] = useState('');
  const [ctaBody, setCtaBody] = useState('');
  const [ctaButtonText, setCtaButtonText] = useState('');
  const [ctaButtonLink, setCtaButtonLink] = useState('/transportasi');
  const [ctaImageFile, setCtaImageFile] = useState<File | null>(null);

  // Footer fields
  const [brandText, setBrandText] = useState('');
  const [brandTagline, setBrandTagline] = useState('');
  const [contactAddress, setContactAddress] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactEmail, setContactEmail] = useState('');

  // Social form
  const [socialForm, setSocialForm] = useState<SocialFormState>(emptySocialForm);
  const [editingSocialId, setEditingSocialId] = useState<number | null>(null);
  const [isSocialFormOpen, setIsSocialFormOpen] = useState(false);
  const [socialFormError, setSocialFormError] = useState<string | null>(null);

  useEffect(() => {
    setHeroTitle(settings['home.hero']?.title ?? '');
    setHeroSubtitle(settings['home.hero']?.subtitle ?? '');
    setHeroButtonText(settings['home.hero']?.button_text ?? '');
    setHeroButtonLink(settings['home.hero']?.button_link ?? '/destinasi');
    setHeroImageFile(null);

    setIntroTitle(settings['home.intro']?.title ?? '');
    setIntroBody(settings['home.intro']?.body ?? '');
    setIntroImageFile(null);

    setFeatures(settings['home.features'] ?? []);
    setFeaturesSectionTitle(settings['home.section_titles']?.features ?? '');

    const cta = settings['home.transport_cta'];
    setCtaTitle(cta?.title ?? '');
    setCtaBody(cta?.body ?? '');
    setCtaButtonText(cta?.button_text ?? '');
    setCtaButtonLink(cta?.button_link ?? '/transportasi');
    setCtaImageFile(null);

    setBrandText(settings['footer.brand']?.brand_text ?? '');
    setBrandTagline(settings['footer.brand']?.tagline ?? '');
    setContactAddress(settings['footer.contact']?.address ?? '');
    setContactPhone(settings['footer.contact']?.phone ?? '');
    setContactEmail(settings['footer.contact']?.email ?? '');
  }, [settings]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!token) {
      toast.error('Sesi admin tidak valid.');
      return;
    }

    setIsSaving(true);
    try {
      const payload: Record<string, unknown> = {
        'home.hero': {
          title: heroTitle.trim(),
          subtitle: heroSubtitle.trim() || undefined,
          button_text: heroButtonText.trim() || undefined,
          button_link: heroButtonLink.trim() || undefined,
          ...(heroImageFile ? { image: heroImageFile } : {}),
        },
        'home.intro': {
          title: introTitle.trim(),
          body: introBody.trim(),
          ...(introImageFile ? { image: introImageFile } : {}),
        },
        'home.features': features,
        'home.transport_cta': {
          title: ctaTitle.trim() || undefined,
          body: ctaBody.trim() || undefined,
          button_text: ctaButtonText.trim() || undefined,
          button_link: ctaButtonLink.trim() || undefined,
          ...(ctaImageFile ? { image: ctaImageFile } : {}),
        },
        'home.section_titles': {
          ...(settings['home.section_titles'] ?? {}),
          features: featuresSectionTitle.trim() || undefined,
        },
        'footer.brand': {
          brand_text: brandText.trim() || undefined,
          tagline: brandTagline.trim() || undefined,
        },
        'footer.contact': {
          address: contactAddress.trim() || undefined,
          phone: contactPhone.trim() || undefined,
          email: contactEmail.trim() || undefined,
        },
      };

      await updateSiteSettings(payload, token);
      toast.success('Pengaturan berhasil diperbarui.');
      await reload();
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : 'Pengaturan belum dapat disimpan.';
      toast.error(message);
    } finally {
      setIsSaving(false);
    }
  };

  const heroImagePreview = heroImageFile
    ? URL.createObjectURL(heroImageFile)
    : storageUrl(settings['home.hero']?.image);

  const introImagePreview = introImageFile
    ? URL.createObjectURL(introImageFile)
    : storageUrl(settings['home.intro']?.image);

  const ctaImagePreview = ctaImageFile
    ? URL.createObjectURL(ctaImageFile)
    : storageUrl(settings['home.transport_cta']?.image);

  // --- Feature CRUD ---
  const openFeatureForm = (index: number | null) => {
    if (index !== null) {
      const f = features[index];
      setFeatureForm({ title: f.title, body: f.body, icon: f.icon });
    } else {
      setFeatureForm(emptyFeature);
    }
    setFeatureIndex(index);
    setIsFeatureFormOpen(true);
  };

  const saveFeature = () => {
    if (!featureForm.title.trim()) {
      toast.error('Judul keunggulan wajib diisi.');
      return;
    }
    const newFeature: SiteFeature = {
      title: featureForm.title.trim(),
      body: featureForm.body.trim(),
      icon: featureForm.icon,
    };
    if (featureIndex !== null) {
      const updated = [...features];
      updated[featureIndex] = newFeature;
      setFeatures(updated);
    } else {
      setFeatures([...features, newFeature]);
    }
    setIsFeatureFormOpen(false);
    setFeatureIndex(null);
    setFeatureForm(emptyFeature);
  };

  const deleteFeature = (index: number) => {
    showConfirm({
      title: 'Hapus Keunggulan',
      message: 'Hapus keunggulan ini?',
      onConfirm: () => {
        setFeatures(features.filter((_, i) => i !== index));
      },
    });
  };

  // --- Social CRUD ---
  const openSocialForm = (social: FooterSocial | null) => {
    if (social) {
      setEditingSocialId(social.id);
      setSocialForm({
        platform: social.platform,
        label: social.label ?? '',
        url: social.url,
        order: String(social.order ?? 0),
      });
    } else {
      setEditingSocialId(null);
      setSocialForm(emptySocialForm);
    }
    setSocialFormError(null);
    setIsSocialFormOpen(true);
  };

  const handleSocialSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!token) return;
    if (!socialForm.url.trim()) {
      setSocialFormError('URL wajib diisi.');
      return;
    }

    const payload: FooterSocialPayload = {
      platform: socialForm.platform,
      label: socialForm.label.trim() || null,
      url: socialForm.url.trim(),
      order: Number(socialForm.order) || 0,
    };

    try {
      if (editingSocialId !== null) {
        await updateFooterSocial(editingSocialId, payload, token);
        toast.success('Media sosial berhasil diperbarui.');
      } else {
        await createFooterSocial(payload, token);
        toast.success('Media sosial berhasil ditambahkan.');
      }
      await reloadSocials();
      setIsSocialFormOpen(false);
      setEditingSocialId(null);
      setSocialForm(emptySocialForm);
    } catch (caught) {
      const msg = caught instanceof Error ? caught.message : 'Gagal menyimpan.';
      setSocialFormError(msg);
    }
  };

  const handleSocialDelete = async (id: number) => {
    if (!token) return;
    showConfirm({
      title: 'Hapus Media Sosial',
      message: 'Hapus tautan media sosial ini?',
      onConfirm: async () => {
        try {
          await deleteFooterSocial(id, token);
          toast.success('Media sosial berhasil dihapus.');
          await reloadSocials();
        } catch (caught) {
          toast.error(caught instanceof Error ? caught.message : 'Gagal menghapus.');
        }
      },
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Beranda & Footer</h1>
        <div className="inline-flex bg-white rounded-md shadow-sm border border-gray-200 p-1">
          {(['home', 'footer'] as TabKey[]).map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => setActiveTab(key)}
              className={`px-4 py-1.5 text-sm font-medium rounded ${
                activeTab === key ? 'bg-primary text-white' : 'text-gray-700'
              }`}
            >
              {key === 'home' ? 'Beranda' : 'Footer & Media Sosial'}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="bg-white rounded-lg shadow-sm p-8 text-center">
          <p className="text-gray-500">Memuat pengaturan...</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          {activeTab === 'home' ? (
            <>
              {/* Hero Section */}
              <section className="bg-white rounded-lg shadow-sm p-6 space-y-6">
                <h2 className="text-lg font-semibold text-gray-800">Hero Beranda</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Judul Hero</label>
                    <input type="text" value={heroTitle} onChange={(e) => setHeroTitle(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Subjudul</label>
                    <input type="text" value={heroSubtitle} onChange={(e) => setHeroSubtitle(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Teks Tombol</label>
                    <input type="text" value={heroButtonText} onChange={(e) => setHeroButtonText(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tautan Tombol</label>
                    <select value={heroButtonLink} onChange={(e) => setHeroButtonLink(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent">
                      {PAGE_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Gambar Hero</label>
                  <div className="flex flex-col md:flex-row md:items-center gap-4">
                    <img src={heroImagePreview} alt="Pratinjau hero"
                      className="h-32 w-full md:w-56 object-cover rounded border border-gray-200" />
                    <label className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md cursor-pointer transition-colors">
                      <Upload className="h-4 w-4" />
                      <span>{heroImageFile ? 'Ganti gambar' : 'Unggah gambar'}</span>
                      <input type="file" accept="image/jpeg,image/webp" className="hidden"
                        onChange={(e) => setHeroImageFile(e.target.files?.[0] ?? null)} />
                    </label>
                    <p className="text-xs text-gray-500">Maks 1 MB. Format: JPG, JPEG, WebP.</p>
                  </div>
                </div>
              </section>

              {/* Intro Section */}
              <section className="bg-white rounded-lg shadow-sm p-6 space-y-4">
                <h2 className="text-lg font-semibold text-gray-800">Tentang (Intro)</h2>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Judul</label>
                  <input type="text" value={introTitle} onChange={(e) => setIntroTitle(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Isi</label>
                  <textarea value={introBody} onChange={(e) => setIntroBody(e.target.value)} rows={5}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Gambar Pendukung</label>
                  <div className="flex flex-col md:flex-row md:items-center gap-4">
                    <img src={introImagePreview} alt="Pratinjau intro"
                      className="h-32 w-full md:w-56 object-cover rounded border border-gray-200" />
                    <label className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md cursor-pointer transition-colors">
                      <Upload className="h-4 w-4" />
                      <span>{introImageFile ? 'Ganti gambar' : 'Unggah gambar'}</span>
                      <input type="file" accept="image/jpeg,image/webp" className="hidden"
                        onChange={(e) => setIntroImageFile(e.target.files?.[0] ?? null)} />
                    </label>
                    <p className="text-xs text-gray-500">Maks 1 MB. Format: JPG, JPEG, WebP.</p>
                  </div>
                </div>
              </section>

              {/* Features Section - CRUD */}
              <section className="bg-white rounded-lg shadow-sm p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-800">Keunggulan Temajuk</h2>
                  <button type="button" onClick={() => openFeatureForm(null)}
                    className="inline-flex items-center bg-primary hover:bg-primary-dark text-white px-3 py-1.5 text-sm rounded-md transition-colors">
                    <Plus className="h-4 w-4 mr-1" /> Tambah Keunggulan
                  </button>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Judul Bagian</label>
                  <input type="text" value={featuresSectionTitle}
                    onChange={(e) => setFeaturesSectionTitle(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent" />
                </div>

                {features.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">Belum ada keunggulan. Klik "Tambah Keunggulan" untuk menambahkan.</p>
                ) : (
                  <div className="divide-y divide-gray-200">
                    {features.map((feature, index) => (
                      <div key={index} className="flex items-start gap-4 py-3">
                        <div className="flex-1">
                          <p className="font-medium text-gray-800">{feature.title}</p>
                          <p className="text-sm text-gray-600 line-clamp-2">{feature.body}</p>
                          {(() => {
                            const BadgeIcon = ICON_COMPONENTS[feature.icon];
                            return BadgeIcon ? (
                              <span className="inline-flex items-center gap-1 mt-1 text-xs bg-gray-100 px-2 py-0.5 rounded">
                                <BadgeIcon className="h-3 w-3" /> {feature.icon}
                              </span>
                            ) : (
                              <span className="inline-block mt-1 text-xs bg-gray-100 px-2 py-0.5 rounded">{feature.icon}</span>
                            );
                          })()}
                        </div>
                        <div className="flex gap-2 shrink-0">
                          <button type="button" onClick={() => openFeatureForm(index)}
                            className="text-primary hover:text-primary-dark"><Edit className="h-4 w-4" /></button>
                          <button type="button" onClick={() => deleteFeature(index)}
                            className="text-red-600 hover:text-red-800"><Trash2 className="h-4 w-4" /></button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>

              {/* Transport CTA Section */}
              <section className="bg-white rounded-lg shadow-sm p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-800">Call to Action</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Judul</label>
                    <input type="text" value={ctaTitle} onChange={(e) => setCtaTitle(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Teks Tombol</label>
                    <input type="text" value={ctaButtonText} onChange={(e) => setCtaButtonText(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tautan Tombol</label>
                    <select value={ctaButtonLink} onChange={(e) => setCtaButtonLink(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent">
                      {PAGE_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Isi</label>
                    <textarea value={ctaBody} onChange={(e) => setCtaBody(e.target.value)} rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Gambar</label>
                  <div className="flex flex-col md:flex-row md:items-center gap-4">
                    <img src={ctaImagePreview} alt="Pratinjau CTA"
                      className="h-32 w-full md:w-56 object-cover rounded border border-gray-200" />
                    <label className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md cursor-pointer transition-colors">
                      <Upload className="h-4 w-4" />
                      <span>{ctaImageFile ? 'Ganti gambar' : 'Unggah gambar'}</span>
                      <input type="file" accept="image/jpeg,image/webp" className="hidden"
                        onChange={(e) => setCtaImageFile(e.target.files?.[0] ?? null)} />
                    </label>
                    <p className="text-xs text-gray-500">Maks 1 MB. Format: JPG, JPEG, WebP.</p>
                  </div>
                </div>
              </section>
            </>
          ) : (
            <>
              {/* Footer Brand */}
              <section className="bg-white rounded-lg shadow-sm p-6 space-y-4">
                <h2 className="text-lg font-semibold text-gray-800">Brand Footer</h2>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nama Brand</label>
                  <input type="text" value={brandText} onChange={(e) => setBrandText(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tagline</label>
                  <textarea value={brandTagline} onChange={(e) => setBrandTagline(e.target.value)} rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent" />
                </div>
              </section>

              {/* Contact */}
              <section className="bg-white rounded-lg shadow-sm p-6 space-y-4">
                <h2 className="text-lg font-semibold text-gray-800">Kontak</h2>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Alamat</label>
                  <textarea value={contactAddress} onChange={(e) => setContactAddress(e.target.value)} rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Telepon</label>
                    <input type="text" value={contactPhone} onChange={(e) => setContactPhone(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input type="email" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent" />
                  </div>
                </div>
              </section>

              {/* Media Sosial Footer - Inline CRUD */}
              <section className="bg-white rounded-lg shadow-sm p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-800">Media Sosial Footer</h2>
                  <button type="button" onClick={() => openSocialForm(null)}
                    className="inline-flex items-center bg-primary hover:bg-primary-dark text-white px-3 py-1.5 text-sm rounded-md transition-colors">
                    <Plus className="h-4 w-4 mr-1" /> Tambah Tautan
                  </button>
                </div>

                {isLoadingSocials ? (
                  <p className="text-gray-500 text-center py-4">Memuat media sosial...</p>
                ) : socials.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">Belum ada tautan media sosial.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Platform</th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Label</th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">URL</th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Urutan</th>
                          <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase">Aksi</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {socials.map((s) => (
                          <tr key={s.id}>
                            <td className="px-3 py-2 text-sm font-medium text-gray-800">{s.platform}</td>
                            <td className="px-3 py-2 text-sm text-gray-700">{s.label || '-'}</td>
                            <td className="px-3 py-2 text-sm text-gray-700 max-w-[200px] truncate">
                              <a href={s.url} target="_blank" rel="noopener noreferrer"
                                className="text-primary hover:underline">{s.url}</a>
                            </td>
                            <td className="px-3 py-2 text-sm text-gray-700">{s.order}</td>
                            <td className="px-3 py-2 text-sm text-right">
                              <button type="button" onClick={() => openSocialForm(s)}
                                className="text-primary hover:text-primary-dark mr-2"><Edit className="h-4 w-4 inline" /> Edit</button>
                              <button type="button" onClick={() => handleSocialDelete(s.id)}
                                className="text-red-600 hover:text-red-800"><Trash2 className="h-4 w-4 inline" /> Hapus</button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>
            </>
          )}

          <div className="flex justify-end">
            <button type="submit" disabled={isSaving}
              className="inline-flex items-center bg-primary hover:bg-primary-dark text-white font-medium px-6 py-2 rounded-md transition-colors duration-200 disabled:opacity-60 disabled:cursor-not-allowed">
              <Save className="h-4 w-4 mr-2" />
              {isSaving ? 'Menyimpan...' : 'Simpan Pengaturan'}
            </button>
          </div>
        </form>
      )}

      {/* Feature Form Modal */}
      {isFeatureFormOpen && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 px-4" role="dialog" aria-modal="true">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800">
                {featureIndex !== null ? 'Edit Keunggulan' : 'Tambah Keunggulan'}
              </h3>
              <button type="button" onClick={() => setIsFeatureFormOpen(false)} aria-label="Tutup">
                <X className="h-5 w-5 text-gray-400 hover:text-gray-600" />
              </button>
            </div>
            <div className="px-6 py-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Judul</label>
                <input type="text" value={featureForm.title}
                  onChange={(e) => setFeatureForm({ ...featureForm, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi</label>
                <textarea value={featureForm.body}
                  onChange={(e) => setFeatureForm({ ...featureForm, body: e.target.value })} rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Ikon</label>
                <div className="grid grid-cols-7 gap-2">
                  {FEATURE_ICONS.map((iconName) => {
                    const Icon = ICON_COMPONENTS[iconName];
                    const isSelected = featureForm.icon === iconName;
                    return (
                      <button
                        key={iconName}
                        type="button"
                        onClick={() => setFeatureForm({ ...featureForm, icon: iconName })}
                        className={`flex items-center justify-center p-3 rounded-lg border-2 transition-all ${
                          isSelected
                            ? 'border-primary bg-primary/10 text-primary'
                            : 'border-gray-200 text-gray-500 hover:border-gray-300 hover:bg-gray-50'
                        }`}
                        title={iconName}
                      >
                        {Icon ? <Icon className="h-5 w-5" /> : <span className="text-xs">{iconName}</span>}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div className="flex justify-end gap-3">
                <button type="button" onClick={() => setIsFeatureFormOpen(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50">Batal</button>
                <button type="button" onClick={saveFeature}
                  className="px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-md">Simpan</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Social Form Modal */}
      {isSocialFormOpen && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 px-4" role="dialog" aria-modal="true">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800">
                {editingSocialId !== null ? 'Edit Media Sosial' : 'Tambah Media Sosial'}
              </h3>
              <button type="button" onClick={() => setIsSocialFormOpen(false)} aria-label="Tutup">
                <X className="h-5 w-5 text-gray-400 hover:text-gray-600" />
              </button>
            </div>
            <form onSubmit={handleSocialSubmit} className="px-6 py-5 space-y-4">
              {socialFormError && (
                <div className="bg-red-50 border border-red-200 rounded-md p-3">
                  <p className="text-sm text-red-700">{socialFormError}</p>
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Platform</label>
                <select value={socialForm.platform}
                  onChange={(e) => setSocialForm({ ...socialForm, platform: e.target.value as FooterSocialPlatform })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent">
                  {SOCIAL_PLATFORMS.map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Label (opsional)</label>
                <input type="text" value={socialForm.label}
                  onChange={(e) => setSocialForm({ ...socialForm, label: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="cth: IG Visit Temajuk" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">URL</label>
                <input type="url" value={socialForm.url}
                  onChange={(e) => setSocialForm({ ...socialForm, url: e.target.value })} required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="https://instagram.com/visit.temajuk" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Urutan</label>
                <input type="number" min="0" value={socialForm.order}
                  onChange={(e) => setSocialForm({ ...socialForm, order: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent" />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setIsSocialFormOpen(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50">Batal</button>
                <button type="submit"
                  className="px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-md">Simpan</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SiteSettingsPage;
