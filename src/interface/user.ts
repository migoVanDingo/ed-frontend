export interface IPayloadCreateUser {
    email: string;
    username?: string; // Optional, can be derived from email
    idp_uid?: string; // IDP UID for social logins
}

export interface IEditUser {
    firstName?: string;
    lastName?: string;
    username?: string;
    bio?: string;
    profilePictureUrl?: string;
    email?: string;
    password?: string;
    isPublic?: boolean;
    isEmailVerified?: boolean;
    isTwoFactorEnabled?: boolean;
    isEmailNotificationsEnabled?: boolean;
    isPushNotificationsEnabled?: boolean;
    isDarkModeEnabled?: boolean;
    isAccountActive?: boolean;
    isAccountLocked?: boolean;
    isAccountSuspended?: boolean;
    isAccountDeleted?: boolean;
    isAccountDeactivated?: boolean;
    isAccountPending?: boolean;
    isAccountVerified?: boolean;
}