"use client";

import { usePublicAuth } from "../../../../contexts/PublicAuthContext";
import { useEditorContext } from "../../context";
import { MenuIcon, User, LogIn, ShoppingCart, X, Trash2 } from "lucide-react";
import { useState, useEffect } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "../../../ui/popover";
import { useCart } from "../../../../contexts/CartContext";
import { EditorButtonWithoutEditor } from "../Button";
import { useAudioPlayer } from "../../../../contexts/AudioPlayerContext";

function PageHeaderContent({
  logo,
  background,
  showCart = true,
}: {
  logo?: string;
  background?: string;
  showCart?: boolean;
}) {
  const { profile, themeSettings, navigate } = useEditorContext();
  const { user, logout } = usePublicAuth();
  const { cartItems, removeFromCart, isCartOpen, setCartOpen } = useCart();
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const { currentTrack } = useAudioPlayer();

  const toggleSidebar = () => {
    setSidebarOpen(!isSidebarOpen);
  };

  const toggleCart = () => {
    setCartOpen((prev) => !prev);
  };

  // Calculate total cost
  const totalCost = cartItems.reduce((total, item) => total + item.price * item.quantity, 0);

  // Prevent body scrolling when sidebars are open
  useEffect(() => {
    if (isSidebarOpen || isCartOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    // Cleanup on unmount
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isSidebarOpen, isCartOpen]);

  return (
    <>
      <div className="flex items-center justify-between">
        <div onClick={() => navigate("/")} className="cursor-pointer">
          {logo ? (
            <img src={logo} alt="Logo" width={100} height={100} />
          ) : (
            <div className="text-xl font-bold">{profile?.name?.toUpperCase()}</div>
          )}
        </div>

        <ul className="items-center gap-4 hidden @md:flex">
          {themeSettings.headerLinks.map((link) => (
            <li className="cursor-pointer" key={link.href} onClick={() => navigate(link.href)}>
              {link.label}
            </li>
          ))}
          {/* Cart Icon */}
          {showCart && (
            <li className="relative">
              <div
                className="cursor-pointer hover:opacity-80 transition-opacity relative"
                onClick={toggleCart}
                aria-label="Cart"
              >
                <ShoppingCart size={20} />
                {cartItems.length > 0 && (
                  <span
                    className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5 min-w-[18px] text-center"
                    style={{ fontSize: 11 }}
                  >
                    {cartItems.length}
                  </span>
                )}
              </div>
            </li>
          )}
          <li>
            <Popover>
              <PopoverTrigger asChild>
                <div className="cursor-pointer hover:opacity-80 transition-opacity">
                  <User size={20} />
                </div>
              </PopoverTrigger>
              <PopoverContent
                className="w-64 p-4 focus:outline-none"
                align="end"
                style={{
                  backgroundColor: themeSettings.colors.background,
                  color: themeSettings.colors.text,
                  borderColor: themeSettings.colors.primary,
                }}
              >
                {user ? (
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <p className="font-medium text-sm" style={{ color: themeSettings.colors.text }}>
                        {user.firstName} {user.lastName}
                      </p>
                      <p className="text-xs" style={{ color: themeSettings.colors.text }}>
                        {user.email}
                      </p>
                    </div>
                    <div
                      className="pt-2 border-t flex flex-col gap-2 items-start"
                      style={{ borderColor: themeSettings.colors.primary }}
                    >
                      <button
                        onClick={() => navigate("/account")}
                        className="text-sm hover:opacity-80 transition-opacity focus:outline-none cursor-pointer"
                        style={{ color: themeSettings.colors.primary }}
                      >
                        My Account
                      </button>
                      <button
                        onClick={() => logout()}
                        className="text-sm hover:opacity-80 transition-opacity focus:outline-none cursor-pointer"
                        style={{ color: themeSettings.colors.primary }}
                      >
                        Log out
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div
                      className="pt-2 flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
                      style={{ color: themeSettings.colors.text }}
                    >
                      <button
                        onClick={() => navigate("/login")}
                        className="text-sm cursor-pointer focus:outline-none flex items-center gap-2"
                        style={{ color: themeSettings.colors.primary }}
                        tabIndex={-1}
                      >
                        <LogIn size={16} color={themeSettings.colors.primary} className="" />
                        Log in
                      </button>
                    </div>
                  </div>
                )}
              </PopoverContent>
            </Popover>
          </li>
        </ul>

        <div className="items-center gap-4 flex @md:hidden">
          {/* Cart Icon Mobile */}
          {showCart && (
            <div className="relative cursor-pointer" onClick={toggleCart} aria-label="Cart">
              <ShoppingCart size={20} />
              {cartItems.length > 0 && (
                <span
                  className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5 min-w-[18px] text-center"
                  style={{ fontSize: 11 }}
                >
                  {cartItems.length}
                </span>
              )}
            </div>
          )}
          <Popover>
            <PopoverTrigger asChild>
              <div className="cursor-pointer hover:opacity-80 transition-opacity">
                <User size={20} />
              </div>
            </PopoverTrigger>
            <PopoverContent
              className="w-64 p-4 focus:outline-none"
              align="end"
              style={{
                backgroundColor: themeSettings.colors.background,
                color: themeSettings.colors.text,
                borderColor: themeSettings.colors.primary,
              }}
            >
              {user ? (
                <div className="space-y-3">
                  <div className="space-y-1">
                    <p className="font-medium text-sm" style={{ color: themeSettings.colors.text }}>
                      {user.firstName} {user.lastName}
                    </p>
                    <p className="text-xs" style={{ color: themeSettings.colors.text }}>
                      {user.email}
                    </p>
                  </div>
                  <div
                    className="pt-2 border-t flex flex-col gap-2 items-start"
                    style={{ borderColor: themeSettings.colors.primary }}
                  >
                    <button
                      onClick={() => navigate("/account")}
                      className="text-sm hover:opacity-80 transition-opacity focus:outline-none"
                      style={{ color: themeSettings.colors.primary }}
                    >
                      My Account
                    </button>
                    <button
                      onClick={() => logout()}
                      className="text-sm hover:opacity-80 transition-opacity focus:outline-none cursor-pointer"
                      style={{ color: themeSettings.colors.primary }}
                    >
                      Log out
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div
                    className="pt-2 flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
                    style={{ color: themeSettings.colors.text }}
                  >
                    <LogIn size={16} color={themeSettings.colors.primary} className="" />
                    <button
                      onClick={() => navigate("/login")}
                      className="text-sm cursor-pointer focus:outline-none"
                      style={{ color: themeSettings.colors.primary }}
                      tabIndex={-1}
                    >
                      Log in
                    </button>
                  </div>
                </div>
              )}
            </PopoverContent>
          </Popover>

          <div className=" cursor-pointer" onClick={toggleSidebar}>
            <MenuIcon />
          </div>
        </div>
      </div>

      {/* Cart Sidebar */}
      {isCartOpen && (
        <>
          <div className="fixed inset-0 z-50 bg-black/30" onClick={toggleCart} aria-label="Close cart sidebar" />
          <aside
            className="fixed top-0 right-0 h-full w-full max-w-md  z-50 shadow-lg flex flex-col animate-slide-in overflow-hidden"
            style={{
              background: themeSettings.colors.background,
              color: themeSettings.colors.text,
              borderLeft: `2px solid ${themeSettings.colors.primary}`,
              transition: "transform 0.3s cubic-bezier(.4,0,.2,1)",
            }}
          >
            <div
              className="flex items-center justify-between p-4 border-b flex-shrink-0"
              style={{ borderColor: themeSettings.colors.primary }}
            >
              <h2 className="text-lg font-bold">My Cart</h2>
              <button onClick={toggleCart} aria-label="Close cart" className="cursor-pointer">
                <X size={24} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-[200px]">
              {cartItems.length === 0 ? (
                <div className="text-center">Your cart is empty.</div>
              ) : (
                cartItems.map((item) => (
                  <div
                    key={item.productId + item.productVariantId + String(item.isGift) + (item.recipientEmail || "")}
                    className="flex gap-4 items-start border-b pb-4 relative"
                    style={{ borderColor: themeSettings.colors.primary }}
                  >
                    <img
                      src={item.coverImage || "/placeholder.png"}
                      alt={item.title}
                      className="w-16 h-16 object-cover rounded"
                      style={{ borderRadius: themeSettings.cornerRadius }}
                    />
                    <div className="flex-1 min-w-0 pr-8">
                      <div
                        onClick={() => {
                          navigate(`/products/${item.productId}`);
                        }}
                        className="font-semibold truncate cursor-pointer hover:underline"
                      >
                        {item.title}
                      </div>
                      <div className="text-sm opacity-80">${item.price.toFixed(2)}</div>
                      {item.color && item.size && (
                        <div
                          className="text-xs mt-1 flex items-center gap-2"
                          style={{ color: themeSettings.colors.primary }}
                        >
                          <div className="w-4 h-4 rounded-full" style={{ backgroundColor: item.color }}></div>
                          {item.size}
                        </div>
                      )}
                      {item.isGift && (
                        <div className="text-xs mt-1" style={{ color: themeSettings.colors.primary }}>
                          Gift for {item.recipientName} ({item.recipientEmail})
                        </div>
                      )}
                      <div className="text-xs mt-1 opacity-70">Qty: {item.quantity}</div>
                    </div>
                    <button
                      onClick={() => removeFromCart(item.productVariantId, item.isGift, item.recipientEmail)}
                      className="absolute top-0 right-0 p-1 rounded transition-colors cursor-pointer"
                      style={{ color: themeSettings.colors.primary }}
                      aria-label="Remove item"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))
              )}
            </div>
            {/* Cart Total */}
            {cartItems.length > 0 && (
              <div
                className="absolute left-0 right-0 p-4 border-t"
                style={{
                  borderColor: themeSettings.colors.primary,
                  background: themeSettings.colors.background,
                  bottom: currentTrack ? "80px" : "0",
                }}
              >
                <div className="flex justify-between items-center mb-4">
                  <span className="text-lg font-semibold">Total:</span>
                  <span className="text-lg font-bold" style={{ color: themeSettings.colors.primary }}>
                    ${totalCost.toFixed(2)}
                  </span>
                </div>
                <EditorButtonWithoutEditor
                  text="Checkout"
                  fullWidth
                  onClick={() => {
                    navigate("/checkout");
                    setCartOpen(false);
                  }}
                />
              </div>
            )}
          </aside>
          <style>{`
            @keyframes slide-in {
              from { transform: translateX(100%); }
              to { transform: translateX(0); }
            }
            .animate-slide-in {
              animation: slide-in 0.3s cubic-bezier(.4,0,.2,1);
            }
          `}</style>
        </>
      )}

      {isSidebarOpen && (
        <>
          <div className="fixed inset-0 bg-[#00000080] bg-opacity-50 z-50" onClick={toggleSidebar} />
          <aside
            className="fixed top-0 left-0 h-full w-3/4 max-w-xs bg-white z-50 shadow-lg flex flex-col animate-slide-in-left"
            style={{
              background: background || themeSettings.colors.background,
              color: themeSettings.colors.text,
              borderRight: `2px solid ${themeSettings.colors.primary}`,
              transition: "transform 0.3s cubic-bezier(.4,0,.2,1)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="mb-4 p-4 border-b flex items-center justify-between"
              style={{ borderColor: themeSettings.colors.primary }}
            >
              {logo ? (
                <img src={logo} alt="Logo" width={100} height={100} />
              ) : (
                <div className="text-xl font-bold">{profile?.name?.toUpperCase()}</div>
              )}
              <button onClick={toggleSidebar} aria-label="Close cart">
                <X size={24} />
              </button>
            </div>
            <ul className="flex flex-col gap-4 p-4">
              {themeSettings.headerLinks.map((link) => (
                <li
                  className="cursor-pointer"
                  key={link.href}
                  onClick={() => {
                    navigate(link.href);
                    toggleSidebar();
                  }}
                >
                  {link.label}
                </li>
              ))}
            </ul>
          </aside>
          <style>{`
            @keyframes slide-in-left {
              from { transform: translateX(-100%); }
              to { transform: translateX(0); }
            }
            .animate-slide-in-left {
              animation: slide-in-left 0.3s cubic-bezier(.4,0,.2,1);
            }
          `}</style>
        </>
      )}
    </>
  );
}

export default PageHeaderContent;
