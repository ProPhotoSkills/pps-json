export default function SiteHeader() {
  return (
    <header className="site-header">
      <a className="site-logo" href="https://prophotoskills.github.io/pps/" aria-label="ProPhotoSkills Startseite">
        <img src="https://prophotoskills.github.io/pps-assets/images/ProPhotoSkills_Logo.png" alt="ProPhotoSkills" />
      </a>
      <nav className="language-nav" aria-label="Sprachauswahl">
        <a href="#">EN</a>
        <a href="#" className="active">DE</a>
        <a href="#">FR</a>
        <a href="#">ES</a>
        <a href="#">PT</a>
        <a href="#">IT</a>
        <a href="#">EL</a>
        <a href="#">JA</a>
      </nav>
      <a className="login-link" href="https://prophotoskills.github.io/pps/login-web/">
        <img src="https://prophotoskills.github.io/pps-assets/images/login_website.png" alt="" aria-hidden="true" />
        <span>Login</span>
      </a>
    </header>
  );
}
