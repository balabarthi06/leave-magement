import maleProfile from '../assets/images/male-profile.png';
import femaleProfile from '../assets/images/female-profile.png';

/**
 * Resolves avatar URL for a given user according to gender and custom upload:
 * 1. If user has a custom uploaded `profile_image` (or custom `photo`/`avatar`), display that.
 * 2. If gender is "Male", return default male avatar asset.
 * 3. Otherwise (e.g., "Female" or default), return default female avatar asset.
 */
export const getUserAvatar = (user) => {
  if (!user) return femaleProfile;

  // If explicit custom uploaded profile picture is provided
  if (user.profile_image) {
    return user.profile_image;
  }

  // Legacy fallback checks for custom uploads (non-default URLs)
  const legacyImage = user.photo || user.avatar;
  if (legacyImage && !legacyImage.includes('unsplash.com') && !legacyImage.includes('male-profile') && !legacyImage.includes('female-profile')) {
    return legacyImage;
  }

  // Gender based fallback
  if (user.gender === 'Male') {
    return maleProfile;
  }

  return femaleProfile;
};
