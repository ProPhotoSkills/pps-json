import fs from "node:fs";
import path from "node:path";

const headerFile = path.join(process.cwd(), "Header", "20260824_Header-GH-gl.json");

function readHeaderAssets() {
  const source = fs.readFileSync(headerFile, "utf8");
  const images = [...source.matchAll(/\"src\":\"([^\"]+)\"/g)].map((match) => match[1]);
  const links = [...source.matchAll(/\"linkUrl\":\"([^\"]+)\"/g)].map((match) => match[1]);
  const languages = [...source.matchAll(/ppsSetLanguage\\u0026quot;([^\\]+?)\\u0026quot;/g)].map((match) => match[1].toUpperCase());

  return {
    logo: images.find((image) => image.includes("ProPhotoSkills_Logo")) ?? "https://prophotoskills.github.io/pps-assets/images/ProPhotoSkills_Logo.png",
    login: images.find((image) => image.includes("login_website")) ?? "https://prophotoskills.github.io/pps-assets/images/login_website.png",
    logoLink: links.find((link) => link.endsWith("/pps/")) ?? "https://prophotoskills.github.io/pps/",
    loginLink: links.find((link) => link.includes("login-web")) ?? "https://prophotoskills.github.io/pps/login-web/",
    languages: languages.length ? languages : ["EN", "DE", "FR", "ES", "PT", "IT", "EL", "JA"],
  };
}

export default function SiteHeader() {
  const header = readHeaderAssets();

  return (
    <header className="site-header">
      <a className="site-logo" href={header.logoLink} aria-label="ProPhotoSkills Startseite">
        <img src={header.logo} alt="ProPhotoSkills" />
      </a>
      <nav className="language-nav" aria-label="Sprachauswahl">
        {header.languages.map((language, index) => (
          <a key={`${language}-${index}`} href="#" className={language === "DE" ? "active" : undefined}>
            {language}
          </a>
        ))}
      </nav>
      <a className="login-link" href={header.loginLink}>
        <img src={header.login} alt="" aria-hidden="true" />
        <span>Login</span>
      </a>
    </header>
  );
}
