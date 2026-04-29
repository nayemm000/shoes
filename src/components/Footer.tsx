import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="bg-gray-50 border-t border-gray-100 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          {/* Brand */}
          <div className="col-span-1 md:col-span-1">
            <Link to="/" className="flex items-center space-x-2 mb-6">
              <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">S</span>
              </div>
              <span className="font-bold text-xl tracking-tight">SoleSphere</span>
            </Link>
            <p className="text-gray-500 text-sm leading-relaxed mb-6">
              Premium footwear for every journey. We combine innovative technology with timeless style to keep you moving forward.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-bold text-sm uppercase tracking-wider mb-6">Shop</h4>
            <ul className="space-y-4">
              <li><Link to="/shop" className="text-gray-600 hover:text-black text-sm transition-colors">Running</Link></li>
              <li><Link to="/shop" className="text-gray-600 hover:text-black text-sm transition-colors">Casual</Link></li>
              <li><Link to="/shop" className="text-gray-600 hover:text-black text-sm transition-colors">Basketball</Link></li>
              <li><Link to="/shop" className="text-gray-600 hover:text-black text-sm transition-colors">Outdoor</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-sm uppercase tracking-wider mb-6">Support</h4>
            <ul className="space-y-4">
              <li><Link to="/tracking" className="text-gray-600 hover:text-black text-sm transition-colors">Order Tracking</Link></li>
              <li><Link to="#" className="text-gray-600 hover:text-black text-sm transition-colors">Returns & Exchanges</Link></li>
              <li><Link to="#" className="text-gray-600 hover:text-black text-sm transition-colors">Shipping Info</Link></li>
              <li><Link to="#" className="text-gray-600 hover:text-black text-sm transition-colors">Contact Us</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-sm uppercase tracking-wider mb-6">Newsletter</h4>
            <p className="text-gray-500 text-sm mb-4">Join our community for exclusive drops and offers.</p>
            <form className="flex space-x-2">
              <input
                type="email"
                placeholder="Email address"
                className="flex-1 bg-white border border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-black"
              />
              <button className="bg-black text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors">
                Join
              </button>
            </form>
          </div>
        </div>

        <div className="border-t border-gray-200 pt-8 flex flex-col md:flex-row justify-between items-center text-gray-400 text-xs">
          <p>© 2026 SoleSphere. All rights reserved.</p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <Link to="#" className="hover:text-black transition-colors">Privacy Policy</Link>
            <Link to="#" className="hover:text-black transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
