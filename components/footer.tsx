export default function Footer() {
  return (
    <footer className="border-t py-8 md:py-12">
      <div className="container max-w-screen-2xl">
        <div className="grid gap-8 md:grid-cols-4">
          <div>
            <h3 className="text-lg font-semibold">SSMP</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              School Sports Management Platform
            </p>
          </div>
          <div>
            <h4 className="text-sm font-semibold">Navigation</h4>
            <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
              <li><a href="/" className="hover:text-foreground">Home</a></li>
              <li><a href="/competitions" className="hover:text-foreground">Competitions</a></li>
              <li><a href="/standings" className="hover:text-foreground">Standings</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold">Legal</h4>
            <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-foreground">Privacy</a></li>
              <li><a href="#" className="hover:text-foreground">Terms</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold">Contact</h4>
            <p className="mt-4 text-sm text-muted-foreground">
              Questions? Reach out to your competition administrator.
            </p>
          </div>
        </div>
        <div className="mt-8 border-t pt-8 text-center text-sm text-muted-foreground">
          <p>&copy; 2024 SSMP. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
