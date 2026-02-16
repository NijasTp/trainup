export const Role = {
    USER: "user",
    TRAINER: "trainer",
    ADMIN: "admin",
    GYM: "gym"
} as const;

export type RoleValue = typeof Role[keyof typeof Role];
