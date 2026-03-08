import AdminLayout from "@/Layouts/AdminLayout";
import { useState } from "react";
import { router } from "@inertiajs/react";

interface SettingsData {
  company_name: string;
  tagline: string;
  description: string;
  phone: string;
  fax: string;
  email: string;
  careers_email: string;
  address: string;
  po_box: string;
  weekday_hours: string;
  weekend_hours: string;
  facebook: string;
  twitter: string;
  instagram: string;
  linkedin: string;
  youtube: string;
  whatsapp: string;
  webmail_url: string;
  primary_color: string;
  secondary_color: string;
  accent_color: string;
  highlight_color: string;
  tawk_enabled: string;
  tawk_id: string;
  google_analytics: string;
  google_maps_url: string;
}

interface Props {
  settings: SettingsData;
}

const defaultSettings: SettingsData = {
  company_name: "PrimeVolt Electric Co. Ltd",
  tagline: "Reliable Workmanship & Ethical Business Practices",
  description: "",
  phone: "+255 XXX XXX XXX",
  fax: "+255 XXX XXX XXX",
  email: "info@primevolt.co.tz",
  careers_email: "careers@primevolt.co.tz",
  address: "Dar es Salaam, Tanzania",
  po_box: "P.O. Box XXXX",
  weekday_hours: "Monday - Friday: 8:00 AM - 5:00 PM",
  weekend_hours: "Saturday: 8:00 AM - 1:00 PM",
  facebook: "",
  twitter: "",
  instagram: "",
  linkedin: "",
  youtube: "",
  whatsapp: "",
  webmail_url: "",
  primary_color: "#4671b0",
  secondary_color: "#2b4c7e",
  accent_color: "#FBC02D",
  highlight_color: "#E53935",
  tawk_enabled: "1",
  tawk_id: "",
  google_analytics: "",
  google_maps_url: "",
};

export default function Settings({ settings: initialSettings }: Props) {
  const [activeSection, setActiveSection] = useState("general");
  const [settings, setSettings] = useState<SettingsData>({
    ...defaultSettings,
    ...initialSettings,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setSettings({ ...settings, [e.target.name]: e.target.value });
    setSaved(false);
  };

  const handleSave = () => {
    setIsSubmitting(true);
    router.put("/admin/settings", settings as Record<string, any>, {
      onSuccess: () => setSaved(true),
      onFinish: () => setIsSubmitting(false),
    });
  };

  const handleReset = () => {
    setSettings({ ...defaultSettings, ...initialSettings });
    setSaved(false);
  };

  const navItems = [
    { id: "general", icon: "fa-cog", label: "General" },
    { id: "contact", icon: "fa-address-card", label: "Contact Info" },
    { id: "social", icon: "fa-share-alt", label: "Social Media" },
    { id: "appearance", icon: "fa-palette", label: "Appearance" },
    { id: "integrations", icon: "fa-plug", label: "Integrations" },
  ];

  return (
    <AdminLayout title="Site Settings">
      <div className="settings-grid">
        {/* Settings Navigation */}
        <div className="settings-nav">
          {navItems.map((item) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              className={`settings-nav-item ${activeSection === item.id ? "active" : ""}`}
              onClick={(e) => {
                e.preventDefault();
                setActiveSection(item.id);
              }}
            >
              <i className={`fas ${item.icon}`}></i> {item.label}
            </a>
          ))}
        </div>

        {/* Settings Content */}
        <div className="settings-content">
          {/* General Settings */}
          {activeSection === "general" && (
            <div className="settings-section">
              <h3>General Settings</h3>
              <p>Basic information about your company</p>
              <div className="form-group">
                <label>Company Name</label>
                <input
                  type="text"
                  name="company_name"
                  value={settings.company_name}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label>Tagline</label>
                <input
                  type="text"
                  name="tagline"
                  value={settings.tagline}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label>Company Description</label>
                <textarea
                  name="description"
                  value={settings.description}
                  onChange={handleChange}
                ></textarea>
              </div>
            </div>
          )}

          {/* Contact Information */}
          {activeSection === "contact" && (
            <div className="settings-section">
              <h3>Contact Information</h3>
              <p>How customers can reach you</p>
              <div className="form-row">
                <div className="form-group">
                  <label>Phone Number</label>
                  <input
                    type="text"
                    name="phone"
                    value={settings.phone}
                    onChange={handleChange}
                  />
                </div>
                <div className="form-group">
                  <label>Fax Number</label>
                  <input
                    type="text"
                    name="fax"
                    value={settings.fax}
                    onChange={handleChange}
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Email Address</label>
                <input
                  type="email"
                  name="email"
                  value={settings.email}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label>Careers Email</label>
                <input
                  type="email"
                  name="careers_email"
                  value={settings.careers_email}
                  onChange={handleChange}
                />
                <small>Email for job applications (shown on About page)</small>
              </div>
              <div className="form-group">
                <label>Physical Address</label>
                <textarea
                  name="address"
                  value={settings.address}
                  onChange={handleChange}
                ></textarea>
              </div>
              <div className="form-group">
                <label>P.O. Box</label>
                <input
                  type="text"
                  name="po_box"
                  value={settings.po_box}
                  onChange={handleChange}
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Working Hours (Weekdays)</label>
                  <input
                    type="text"
                    name="weekday_hours"
                    value={settings.weekday_hours}
                    onChange={handleChange}
                  />
                </div>
                <div className="form-group">
                  <label>Working Hours (Weekend)</label>
                  <input
                    type="text"
                    name="weekend_hours"
                    value={settings.weekend_hours}
                    onChange={handleChange}
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Webmail URL</label>
                <input
                  type="url"
                  name="webmail_url"
                  placeholder="https://mail.primevolt.co.tz"
                  value={settings.webmail_url}
                  onChange={handleChange}
                />
                <small>Staff webmail link (displayed in footer)</small>
              </div>
            </div>
          )}

          {/* Social Media */}
          {activeSection === "social" && (
            <div className="settings-section">
              <h3>Social Media Links</h3>
              <p>Connect your social media accounts</p>
              <div className="social-input">
                <i className="fab fa-facebook-f"></i>
                <input
                  type="url"
                  name="facebook"
                  placeholder="https://facebook.com/primevolt"
                  value={settings.facebook}
                  onChange={handleChange}
                />
              </div>
              <div className="social-input">
                <i className="fa-brands fa-x-twitter"></i>
                <input
                  type="url"
                  name="twitter"
                  placeholder="https://x.com/primevolt"
                  value={settings.twitter}
                  onChange={handleChange}
                />
              </div>
              <div className="social-input">
                <i className="fab fa-instagram"></i>
                <input
                  type="url"
                  name="instagram"
                  placeholder="https://instagram.com/primevolt"
                  value={settings.instagram}
                  onChange={handleChange}
                />
              </div>
              <div className="social-input">
                <i className="fab fa-linkedin-in"></i>
                <input
                  type="url"
                  name="linkedin"
                  placeholder="https://linkedin.com/company/primevolt"
                  value={settings.linkedin}
                  onChange={handleChange}
                />
              </div>
              <div className="social-input">
                <i className="fab fa-youtube"></i>
                <input
                  type="url"
                  name="youtube"
                  placeholder="https://youtube.com/@primevolt"
                  value={settings.youtube}
                  onChange={handleChange}
                />
              </div>
              <div className="social-input">
                <i className="fab fa-whatsapp"></i>
                <input
                  type="text"
                  name="whatsapp"
                  placeholder="+255 XXX XXX XXX"
                  value={settings.whatsapp}
                  onChange={handleChange}
                />
              </div>
              <small className="form-hint">
                WhatsApp number for chat button
              </small>
            </div>
          )}

          {/* Appearance */}
          {activeSection === "appearance" && (
            <div className="settings-section">
              <h3>Appearance</h3>
              <p>Customize your website colors</p>
              <div className="form-row">
                <div className="form-group">
                  <label>Primary Color</label>
                  <div className="color-picker-group">
                    <input
                      type="color"
                      className="color-picker"
                      value={settings.primary_color}
                      onChange={(e) => {
                        setSettings({
                          ...settings,
                          primary_color: e.target.value,
                        });
                        setSaved(false);
                      }}
                    />
                    <input
                      type="text"
                      className="color-value"
                      value={settings.primary_color}
                      onChange={(e) => {
                        setSettings({
                          ...settings,
                          primary_color: e.target.value,
                        });
                        setSaved(false);
                      }}
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label>Secondary Color</label>
                  <div className="color-picker-group">
                    <input
                      type="color"
                      className="color-picker"
                      value={settings.secondary_color}
                      onChange={(e) => {
                        setSettings({
                          ...settings,
                          secondary_color: e.target.value,
                        });
                        setSaved(false);
                      }}
                    />
                    <input
                      type="text"
                      className="color-value"
                      value={settings.secondary_color}
                      onChange={(e) => {
                        setSettings({
                          ...settings,
                          secondary_color: e.target.value,
                        });
                        setSaved(false);
                      }}
                    />
                  </div>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Accent Color</label>
                  <div className="color-picker-group">
                    <input
                      type="color"
                      className="color-picker"
                      value={settings.accent_color}
                      onChange={(e) => {
                        setSettings({
                          ...settings,
                          accent_color: e.target.value,
                        });
                        setSaved(false);
                      }}
                    />
                    <input
                      type="text"
                      className="color-value"
                      value={settings.accent_color}
                      onChange={(e) => {
                        setSettings({
                          ...settings,
                          accent_color: e.target.value,
                        });
                        setSaved(false);
                      }}
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label>Highlight Color</label>
                  <div className="color-picker-group">
                    <input
                      type="color"
                      className="color-picker"
                      value={settings.highlight_color}
                      onChange={(e) => {
                        setSettings({
                          ...settings,
                          highlight_color: e.target.value,
                        });
                        setSaved(false);
                      }}
                    />
                    <input
                      type="text"
                      className="color-value"
                      value={settings.highlight_color}
                      onChange={(e) => {
                        setSettings({
                          ...settings,
                          highlight_color: e.target.value,
                        });
                        setSaved(false);
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Integrations */}
          {activeSection === "integrations" && (
            <div className="settings-section">
              <h3>Integrations</h3>
              <p>Third-party services and tools</p>
              <div className="toggle-switch">
                <div className="toggle-switch-info">
                  <h4>Tawk.to Live Chat</h4>
                  <p>Enable live chat widget on your website</p>
                </div>
                <label className="toggle">
                  <input
                    type="checkbox"
                    checked={settings.tawk_enabled === "1"}
                    onChange={(e) => {
                      setSettings({
                        ...settings,
                        tawk_enabled: e.target.checked ? "1" : "0",
                      });
                      setSaved(false);
                    }}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>
              <div className="form-group">
                <label>Tawk.to Property ID</label>
                <input
                  type="text"
                  name="tawk_id"
                  placeholder="Enter your Tawk.to Property ID"
                  value={settings.tawk_id}
                  onChange={handleChange}
                />
                <small>Get this from your Tawk.to dashboard</small>
              </div>
              <div className="form-group">
                <label>Google Analytics ID</label>
                <input
                  type="text"
                  name="google_analytics"
                  placeholder="G-XXXXXXXXXX"
                  value={settings.google_analytics}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label>Google Maps Embed URL</label>
                <input
                  type="text"
                  name="google_maps_url"
                  placeholder="https://www.google.com/maps/embed?..."
                  value={settings.google_maps_url}
                  onChange={handleChange}
                />
              </div>
            </div>
          )}

          {/* Save Bar */}
          <div className="save-bar">
            {saved && (
              <span className="save-success">
                <i className="fas fa-check"></i> Saved!
              </span>
            )}
            <button
              className="btn btn-secondary"
              onClick={handleReset}
              disabled={isSubmitting}
            >
              Reset
            </button>
            <button
              className="btn btn-primary"
              onClick={handleSave}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <i className="fas fa-spinner fa-spin"></i> Saving...
                </>
              ) : (
                <>
                  <i className="fas fa-save"></i> Save Changes
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
