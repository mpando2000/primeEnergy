import { Head, usePage } from "@inertiajs/react";
import MainLayout from "@/Layouts/MainLayout";
import { useLanguage } from "@/contexts/LanguageContext";

interface PageBanner {
  id: number;
  page_key: string;
  page_name: string;
  image_url: string | null;
}

interface SiteSettings {
  company_name?: string;
}

interface MDProfile {
  id: number;
  title: string;
  image_path: string;
  description: string | null;
}

interface Props {
  mdProfile: MDProfile | null;
}

export default function ManagingDirector({ mdProfile }: Props) {
  const { t } = useLanguage();
  const props = usePage().props as unknown as {
    pageBanners: Record<string, PageBanner>;
    siteSettings?: SiteSettings;
  };
  const { pageBanners, siteSettings } = props;

  // Use database image or fallback to default
  const mdImage = mdProfile?.image_path || "/chairperson.jpg";
  const mdName = mdProfile?.title || t("md.signature.name");
  const companyName = siteSettings?.company_name || t("md.signature.company");
  const bannerImage =
    pageBanners?.md?.image_url ||
    "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=1600&h=300&fit=crop";

  const pillars = [
    {
      icon: "fa-users",
      title: t("md.pillars.people.title"),
      description: t("md.pillars.people.description"),
    },
    {
      icon: "fa-cogs",
      title: t("md.pillars.processes.title"),
      description: t("md.pillars.processes.description"),
    },
    {
      icon: "fa-handshake",
      title: t("md.pillars.partnerships.title"),
      description: t("md.pillars.partnerships.description"),
    },
  ];

  const highlights = [
    t("md.highlights.crb"),
    t("md.highlights.acct"),
    t("md.highlights.experience"),
    t("md.highlights.projects"),
  ];

  return (
    <MainLayout currentPage={t("nav.about")}>
      <Head title={t("md.pageTitle")} />

      {/* Page Banner */}
      <section
        style={{ position: "relative", height: "250px", overflow: "hidden" }}
      >
        <img
          src={bannerImage}
          alt="Managing Director Banner"
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
        <div className="banner-overlay"></div>
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            textAlign: "center",
            color: "#ffffff",
          }}
        >
          <h1
            style={{
              fontSize: "42px",
              textShadow: "2px 2px 4px rgba(0,0,0,0.3)",
              margin: 0,
              fontWeight: "bold",
            }}
          >
            {t("md.bannerTitle")}
          </h1>
        </div>
      </section>

      {/* Main Content */}
      <section style={{ padding: "60px 0" }}>
        <div
          style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 20px" }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "300px 1fr",
              gap: "50px",
            }}
            className="md-grid"
          >
            {/* MD Sidebar */}
            <div
              style={{ display: "flex", flexDirection: "column", gap: "25px" }}
              className="md-sidebar"
            >
              <div
                style={{
                  background: "#f5f5f5",
                  borderRadius: "12px",
                  overflow: "hidden",
                  textAlign: "center",
                }}
              >
                <div
                  style={{ width: "100%", height: "350px", overflow: "hidden" }}
                >
                  <img
                    src={mdImage}
                    alt="Managing Director"
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                </div>
                <div style={{ padding: "20px" }}>
                  <h3
                    className="text-theme-primary"
                    style={{ fontSize: "22px", marginBottom: "5px" }}
                  >
                    {mdName}
                  </h3>
                  <p
                    style={{
                      color: "#4671b0",
                      fontSize: "14px",
                      fontWeight: "500",
                      margin: "0 0 5px",
                    }}
                  >
                    {t("md.signature.title")}
                  </p>
                  <p style={{ color: "#666", fontSize: "14px", margin: 0 }}>
                    {companyName}
                  </p>
                </div>
              </div>

              <div
                className="bg-theme-primary"
                style={{
                  color: "#ffffff",
                  padding: "25px",
                  borderRadius: "12px",
                }}
              >
                <h4
                  className="text-theme-accent"
                  style={{ marginBottom: "15px", fontSize: "18px" }}
                >
                  {t("md.highlights.title")}
                </h4>
                <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
                  {highlights.map((item, index) => (
                    <li
                      key={index}
                      style={{
                        marginBottom: "12px",
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                      }}
                    >
                      <i className="fas fa-check-circle text-theme-accent"></i>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* MD Message */}
            <div>
              <h2
                className="theme-heading text-theme-primary"
                style={{ fontSize: "32px", marginBottom: "30px" }}
              >
                {t("md.title")}
              </h2>

              <div
                className="theme-border-left"
                style={{
                  background: "#f5f5f5",
                  padding: "30px",
                  borderRadius: "0 12px 12px 0",
                  margin: "30px 0",
                }}
              >
                <i
                  className="fas fa-quote-left text-theme-primary"
                  style={{
                    fontSize: "24px",
                    marginBottom: "10px",
                    display: "block",
                  }}
                ></i>
                <p
                  className="text-theme-primary"
                  style={{ fontSize: "20px", fontStyle: "italic", margin: 0 }}
                >
                  {t("md.quote")}
                </p>
              </div>

              <p
                style={{
                  marginBottom: "20px",
                  color: "#555",
                  fontSize: "16px",
                }}
              >
                {t("md.greeting")}
              </p>
              <p
                style={{
                  marginBottom: "20px",
                  color: "#555",
                  fontSize: "16px",
                }}
              >
                {t("md.p1")}
              </p>
              <p
                style={{
                  marginBottom: "20px",
                  color: "#555",
                  fontSize: "16px",
                }}
              >
                {t("md.p2")}
              </p>
              <p
                style={{
                  marginBottom: "20px",
                  color: "#555",
                  fontSize: "16px",
                }}
              >
                {t("md.p3")}
              </p>

              {/* Pillars */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(3, 1fr)",
                  gap: "25px",
                  margin: "40px 0",
                }}
                className="pillars-grid"
              >
                {pillars.map((pillar, index) => (
                  <div
                    key={index}
                    style={{
                      background: "#f5f5f5",
                      padding: "25px",
                      borderRadius: "12px",
                      textAlign: "center",
                    }}
                  >
                    <div
                      className="bg-theme-primary"
                      style={{
                        width: "70px",
                        height: "70px",
                        borderRadius: "50%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        margin: "0 auto 15px",
                      }}
                    >
                      <i
                        className={`fas ${pillar.icon}`}
                        style={{ color: "#ffffff", fontSize: "28px" }}
                      ></i>
                    </div>
                    <h4
                      className="text-theme-primary"
                      style={{ marginBottom: "10px" }}
                    >
                      {pillar.title}
                    </h4>
                    <p style={{ fontSize: "14px", color: "#666", margin: 0 }}>
                      {pillar.description}
                    </p>
                  </div>
                ))}
              </div>

              <p
                style={{
                  marginBottom: "20px",
                  color: "#555",
                  fontSize: "16px",
                }}
              >
                {t("md.p4")}
              </p>
              <p
                style={{
                  marginBottom: "20px",
                  color: "#555",
                  fontSize: "16px",
                }}
              >
                {t("md.p5")}
              </p>

              {/* Signature */}
              <div
                style={{
                  marginTop: "40px",
                  paddingTop: "30px",
                  borderTop: "2px solid #f5f5f5",
                }}
              >
                <p style={{ marginBottom: "10px", color: "#555" }}>
                  {t("md.signature.regards")}
                </p>
                <p
                  className="text-theme-primary"
                  style={{
                    fontSize: "18px",
                    fontWeight: "bold",
                    margin: "10px 0 5px",
                  }}
                >
                  {mdName}
                </p>
                <p
                  style={{
                    color: "#4671b0",
                    fontSize: "14px",
                    margin: "0 0 5px",
                  }}
                >
                  {t("md.signature.title")}
                </p>
                <p style={{ color: "#666", fontSize: "14px", margin: 0 }}>
                  {companyName}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <style>{`
                .md-grid { display: grid; grid-template-columns: 300px 1fr; gap: 50px; }
                .pillars-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 25px; }
                @media (max-width: 992px) {
                    .md-grid { grid-template-columns: 1fr !important; }
                    .md-sidebar { flex-direction: row !important; flex-wrap: wrap; }
                    .md-sidebar > div { flex: 1; min-width: 250px; }
                    .pillars-grid { grid-template-columns: 1fr !important; }
                }
                @media (max-width: 768px) {
                    .md-sidebar { flex-direction: column !important; }
                    .md-grid h1 { font-size: 28px !important; }
                }
            `}</style>
    </MainLayout>
  );
}
