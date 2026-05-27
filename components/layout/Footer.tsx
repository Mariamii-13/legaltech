export function Footer() {
  return (
    <footer className="border-t bg-gray-900 text-gray-400 py-12 px-4">
      <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-sm">
        <div>
          <p className="font-bold text-white mb-3">SmartDocs.ge</p>
          <p className="text-sm leading-relaxed">Legal documents for Georgian businesses and individuals.</p>
        </div>
        <div>
          <p className="font-semibold text-white mb-3">Documents</p>
          <ul className="space-y-2">
            <li className="hover:text-white cursor-pointer">Labor Contract</li>
            <li className="hover:text-white cursor-pointer">NDA</li>
            <li className="hover:text-white cursor-pointer">Lease Agreement</li>
            <li className="hover:text-white cursor-pointer">Service Contract</li>
          </ul>
        </div>
        <div>
          <p className="font-semibold text-white mb-3">Company</p>
          <ul className="space-y-2">
            <li className="hover:text-white cursor-pointer">About</li>
            <li className="hover:text-white cursor-pointer">Pricing</li>
            <li className="hover:text-white cursor-pointer">Contact</li>
          </ul>
        </div>
        <div>
          <p className="font-semibold text-white mb-3">Legal</p>
          <ul className="space-y-2">
            <li className="hover:text-white cursor-pointer">Privacy Policy</li>
            <li className="hover:text-white cursor-pointer">Terms of Service</li>
            <li className="hover:text-white cursor-pointer">Georgian Law Compliance</li>
          </ul>
        </div>
      </div>
      <div className="max-w-6xl mx-auto mt-8 pt-8 border-t border-gray-800 text-center text-xs">
        © 2026 SmartDocs.ge — Georgia&apos;s Legal Document Platform. All rights reserved.
      </div>
    </footer>
  );
}
