export interface IAdminService {
  login(email: string, password: string): Promise<{
    admin: {
      _id: string;
      name: string;
      email: string;
      role: "admin";
    };
    accessToken:string,
   refreshToken:string
  }>;
  updateTokenVersion(adminId: string): Promise<void>;
}
