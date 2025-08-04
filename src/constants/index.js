// User role definitions
export const USER_ROLES = {
  ADMIN: 'admin',
  EDITOR: 'editor',
  CONTRIBUTOR: 'contributor',
  DONORS: 'donors',
  GUEST: 'guest'
};

// Permission levels 1 Means Powerful and 5 Means Least Powerful
export const PERMISSION_LEVELS = {
  [USER_ROLES.ADMIN]: 1,
  [USER_ROLES.EDITOR]: 2,
  [USER_ROLES.CONTRIBUTOR]: 3,
  [USER_ROLES.DONORS]: 4,
  [USER_ROLES.GUEST]: 5
};