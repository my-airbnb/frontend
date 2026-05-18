import Link from "next/link"
import { Home, Globe, Instagram, Twitter, Facebook } from "lucide-react"

const footerLinks = {
  support: [
    { label: "Help Center", href: "#" },
    { label: "Safety information", href: "#" },
    { label: "Cancellation options", href: "#" },
    { label: "Our COVID-19 Response", href: "#" },
    { label: "Supporting people with disabilities", href: "#" },
  ],
  community: [
    { label: "Disaster relief housing", href: "#" },
    { label: "Combating discrimination", href: "#" },
    { label: "Invite friends", href: "#" },
  ],
  hosting: [
    { label: "Host your home", href: "#" },
    { label: "Host an experience", href: "#" },
    { label: "Responsible hosting", href: "#" },
    { label: "Resource Center", href: "#" },
    { label: "Community Center", href: "#" },
  ],
  about: [
    { label: "Newsroom", href: "#" },
    { label: "Learn about new features", href: "#" },
    { label: "Careers", href: "#" },
    { label: "Investors", href: "#" },
  ],
}

export function Footer() {
  return (
    <footer className="border-t border-border bg-card">
      <div className="container mx-auto px-4 lg:px-8">
        {/* Links Grid */}
        <div className="grid grid-cols-2 gap-8 py-12 md:grid-cols-4">
          <div>
            <h3 className="mb-4 text-sm font-semibold text-foreground">Support</h3>
            <ul className="space-y-3">
              {footerLinks.support.map((link) => (
                <li key={link.label}>
                  <Link 
                    href={link.href} 
                    className="text-sm text-muted-foreground hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="mb-4 text-sm font-semibold text-foreground">Community</h3>
            <ul className="space-y-3">
              {footerLinks.community.map((link) => (
                <li key={link.label}>
                  <Link 
                    href={link.href} 
                    className="text-sm text-muted-foreground hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="mb-4 text-sm font-semibold text-foreground">Hosting</h3>
            <ul className="space-y-3">
              {footerLinks.hosting.map((link) => (
                <li key={link.label}>
                  <Link 
                    href={link.href} 
                    className="text-sm text-muted-foreground hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="mb-4 text-sm font-semibold text-foreground">Airbnb</h3>
            <ul className="space-y-3">
              {footerLinks.about.map((link) => (
                <li key={link.label}>
                  <Link 
                    href={link.href} 
                    className="text-sm text-muted-foreground hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="flex flex-col gap-4 border-t border-border py-6 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:gap-6">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary">
                <Home className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="font-semibold text-foreground">Airbnb</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2026 Airbnb, Inc. · Privacy · Terms · Sitemap
            </p>
          </div>
          <div className="flex items-center gap-4">
            <button className="flex items-center gap-2 text-sm font-medium text-foreground hover:underline">
              <Globe className="h-4 w-4" />
              English (US)
            </button>
            <div className="flex items-center gap-3">
              <Link href="#" className="text-foreground hover:text-muted-foreground transition-colors">
                <Facebook className="h-5 w-5" />
              </Link>
              <Link href="#" className="text-foreground hover:text-muted-foreground transition-colors">
                <Twitter className="h-5 w-5" />
              </Link>
              <Link href="#" className="text-foreground hover:text-muted-foreground transition-colors">
                <Instagram className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
