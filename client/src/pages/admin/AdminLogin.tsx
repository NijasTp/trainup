import React, { useState } from 'react';
import { Mail, Lock, Shield, Loader2, Eye, EyeOff, Dumbbell } from 'lucide-react';
import { loginAdmin } from '@/services/authService';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { login } from '@/redux/slices/adminAuthSlice';
// Card Components
const Card = ({ className, children }: { className?: string; children: React.ReactNode }) => (
  <div className={`rounded-lg ${className}`}>{children}</div>
);

const CardHeader = ({ className, children }: { className?: string; children: React.ReactNode }) => (
  <div className={`p-6 ${className}`}>{children}</div>
);

const CardContent = ({ className, children }: { className?: string; children: React.ReactNode }) => (
  <div className={`p-6 pt-0 ${className}`}>{children}</div>
);

const CardTitle = ({ className, children }: { className?: string; children: React.ReactNode }) => (
  <h3 className={`text-2xl font-semibold leading-none tracking-tight ${className}`}>{children}</h3>
);

const CardDescription = ({ className, children }: { className?: string; children: React.ReactNode }) => (
  <p className={`text-sm text-muted-foreground ${className}`}>{children}</p>
);

// Button Component
const Button = ({
  className,
  children,
  onClick,
  disabled,
  type = "button"
}: {
  className?: string;
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
}) => {
  return (
    <button
      type={type}
      className={`inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ${className}`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
};

// Input Component
const Input = ({
  className,
  type = "text",
  placeholder,
  value,
  onChange,
  id
}: {
  className?: string;
  type?: string;
  placeholder?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  id?: string;
}) => {
  return (
    <input
      id={id}
      type={type}
      className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
    />
  );
};

// Label Component
const Label = ({ className, children, htmlFor }: { className?: string; children: React.ReactNode; htmlFor?: string }) => (
  <label
    htmlFor={htmlFor}
    className={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ${className}`}
  >
    {children}
  </label>
);

// Logo Component
const Logo = ({ className }: { className?: string }) => (
  <div className={`flex items-center ${className}`}>
    <Dumbbell />
    <div className="text-3xl font-bold text-white">
      <span className="text-[#4B8B9B]">Train</span>up
    </div>
  </div>
);

// Main Admin Login Component
function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await loginAdmin(email, password);
      dispatch(login(res.admin));
      toast.success("Login successful");
      navigate("/admin/dashboard");
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#1F2A44] flex items-center justify-center p-4">
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&display=swap');
          body {
            font-family: 'Poppins', sans-serif;
          }
          .animate-fade-in {
            animation: fadeIn 0.5s ease-out;
          }
          @keyframes fadeIn {
            0% { opacity: 0; transform: translateY(10px); }
            100% { opacity: 1; transform: translateY(0); }
          }
          .animate-float {
            animation: float 3s ease-in-out infinite;
          }
          @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-10px); }
          }
        `}
      </style>

      <div className="w-full max-w-md space-y-6 animate-fade-in">
        <div className="text-center">
          <Logo className="justify-center mb-6" />
        </div>

        <Card className="bg-[#111827] border border-[#4B8B9B]/30 shadow-xl">
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto w-20 h-20 bg-gradient-to-br from-[#4B8B9B]/20 to-[#001C30]/20 rounded-full flex items-center justify-center animate-float">
              <Shield className="h-10 w-10 text-[#4B8B9B]" />
            </div>
            <CardTitle className="text-white text-3xl font-bold tracking-tight">
              Admin Portal
            </CardTitle>
            <CardDescription className="text-[#4B8B9B] text-lg">
              Sign in to access the admin dashboard
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-white text-sm font-medium">
                  Email Address
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-[#4B8B9B]" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="admin@trainup.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 bg-[#1F2A44]/50 border-[#4B8B9B]/30 text-white placeholder:text-gray-500 focus:border-[#4B8B9B] focus:ring-[#4B8B9B]/20"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-white text-sm font-medium">
                  Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-[#4B8B9B]" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10 bg-[#1F2A44]/50 border-[#4B8B9B]/30 text-white placeholder:text-gray-500 focus:border-[#4B8B9B] focus:ring-[#4B8B9B]/20"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#4B8B9B] hover:text-white transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>



              <Button
                type="submit"
                disabled={loading || !email || !password}
                className="w-full bg-[#001C30] text-white text-lg font-semibold py-3 rounded-lg hover:bg-gradient-to-r hover:from-[#001C30] hover:to-[#1F2A44] transition duration-300 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  <>
                    <Shield className="h-5 w-5 mr-2" />
                    Sign In
                  </>
                )}
              </Button>
            </form>

            <div className="mt-6 pt-6 border-t border-[#4B8B9B]/20">
              <div className="text-center text-sm text-gray-400">
                <p>Protected area. Authorized personnel only.</p>
                <p className="mt-2">
                  Need help? Contact{' '}
                  <a href="mailto:support@trainup.com" className="text-[#4B8B9B] hover:text-white transition-colors">
                    support@trainup.com
                  </a>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="text-center text-xs text-gray-500">
          <p>© 2024 Trainup. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}

export default AdminLogin;