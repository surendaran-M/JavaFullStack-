export const getOrCreateGuestId = () => {
  try {
    const existing = sessionStorage.getItem("guestId");
    if (existing) return existing;
  } catch {
    // ignore
  }

  let guestId = "";

  try {
    if (typeof crypto !== "undefined" && crypto.randomUUID) {
      guestId = crypto.randomUUID();
    }
  } catch {
    // ignore
  }

  if (!guestId) {
    guestId = `guest_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
  }

  try {
    sessionStorage.setItem("guestId", guestId);
  } catch {
    // ignore
  }

  // Migrate legacy key used in older code paths
  try {
    const legacyKey = "cart_guest";
    const legacyCart = localStorage.getItem(legacyKey);
    if (legacyCart) {
      localStorage.setItem(`cart_${guestId}`, legacyCart);
      localStorage.removeItem(legacyKey);
    }
  } catch {
    // ignore
  }

  return guestId;
};

export const getCartOwnerId = (user) => {
  if (user?.id !== undefined && user?.id !== null) return user.id;
  return getOrCreateGuestId();
};

