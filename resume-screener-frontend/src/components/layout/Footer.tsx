import { Link } from "react-router-dom";

export const Footer = () => {
    return (
        <footer className="w-full bg-muted/50 dark:bg-white/5 text-muted-foreground border-t border-border shadow-inner transition-colors">
            <div className="mx-auto max-w-7xl px-6 py-16 grid grid-cols-1 md:grid-cols-4 gap-10">
                {/* Product */}
                <div>
                    <h4 className="mb-4 text-sm font-semibold text-foreground uppercase tracking-wide">Product</h4>
                    <ul className="space-y-2 text-sm">
                        <li><Link to="/features" className="hover:underline">Features</Link></li>
                        <li><Link to="/pricing" className="hover:underline">Pricing</Link></li>
                        <li><Link to="/faq" className="hover:underline">FAQ</Link></li>
                    </ul>
                </div>

                {/* Company */}
                <div>
                    <h4 className="mb-4 text-sm font-semibold text-foreground uppercase tracking-wide">Company</h4>
                    <ul className="space-y-2 text-sm">
                        <li><Link to="/about" className="hover:underline">About</Link></li>
                        <li><Link to="/blog" className="hover:underline">Blog</Link></li>
                        <li><Link to="/careers" className="hover:underline">Careers</Link></li>
                    </ul>
                </div>

                {/* Resources */}
                <div>
                    <h4 className="mb-4 text-sm font-semibold text-foreground uppercase tracking-wide">Resources</h4>
                    <ul className="space-y-2 text-sm">
                        <li><Link to="/help" className="hover:underline">Help Center</Link></li>
                        <li><Link to="/api" className="hover:underline">API Docs</Link></li>
                        <li><Link to="/feedback" className="hover:underline">Feedback</Link></li>
                    </ul>
                </div>

                {/* Legal */}
                <div>
                    <h4 className="mb-4 text-sm font-semibold text-foreground uppercase tracking-wide">Legal</h4>
                    <ul className="space-y-2 text-sm">
                        <li><Link to="/privacy" className="hover:underline">Privacy Policy</Link></li>
                        <li><Link to="/terms" className="hover:underline">Terms of Service</Link></li>
                        <li className="flex gap-3 pt-2">
                            <a href="#" className="hover:underline">Twitter</a>
                            <a href="#" className="hover:underline">LinkedIn</a>
                        </li>
                    </ul>
                </div>
            </div>

            {/* Bottom Note */}
            <div className="text-center text-xs text-muted-foreground py-6 border-t border-border">
                © {new Date().getFullYear()} ScanHire AI. All rights reserved.
            </div>
        </footer>

    );
};
