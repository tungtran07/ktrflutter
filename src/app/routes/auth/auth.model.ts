export class Auth {
  // public loginName: string;
  // public userId: string;
  // private tokenString: string;
  // private issuedAt: Date;
  // private expiresAt: Date;

  constructor(
    public userId: string,
    public level: number,
    private tokenString: string,
    private expiresAt: Date,
    private issuedAt: Date,
    public userModel: any,
  ) {}

  get token(): string {
    if (!this.expiresAt || new Date() > this.expiresAt) {
      return null;
    }
    return this.tokenString;
  }
}
