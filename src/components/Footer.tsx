// src/components/landing/FooterSection.tsx

const FooterSection = () => {
  return (
    <footer className="bg-background border-t border-border text-foreground">
      <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-3 gap-10">

        {/* Branding & description */}
        <div className="space-y-4">
          <h3 className="text-2xl font-bold text-primary">College<span className="text-orange-400">Mart</span></h3>
          <p className="text-sm text-muted-foreground">
            Your campus marketplace to buy, sell and share essentials with ease.
          </p>
        </div>

        {/* Quick Info */}
        <div className="space-y-2">
          <h4 className="font-semibold">Platform</h4>
          <ul className="space-y-1 text-sm text-muted-foreground">
            <li>Secure Campus-only Access</li>
            <li>Fast Listings</li>
            <li>Verified Users</li>
          </ul>
        </div>

        {/* Contact Info */}
        <div className="space-y-2">
          <h4 className="font-semibold">Support</h4>
          <ul className="space-y-1 text-sm text-muted-foreground">
            <li>Email: support@collegemart.app</li>
            <li>Location: Your College Campus</li>
            <li>Feedback: Open to ideas!</li>
          </ul>
        </div>
      </div>

      {/* Bottom line */}
      <div className="border-t border-border text-center py-4 text-sm text-muted-foreground">
        &copy; {new Date().getFullYear()} CollegeMart · Built with ❤️ for Students
      </div>
    </footer>
  );
};

export default FooterSection;
