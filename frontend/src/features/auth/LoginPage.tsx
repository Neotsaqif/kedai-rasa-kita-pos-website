import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Store, Lock, User, ShieldAlert, ArrowRight } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login } = useApp();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) {
      setErrorMsg('Please enter your username');
      return;
    }
    if (!password) {
      setErrorMsg('Please enter your password');
      return;
    }

    setIsLoading(true);
    setErrorMsg('');

    setTimeout(() => {
      const res = login(username, password);
      if (!res.success) {
        setErrorMsg(res.message || 'Incorrect username or password.');
      }
      setIsLoading(false);
    }, 200);
  };

  const handleFillDemo = (user: string, pass: string) => {
    setUsername(user);
    setPassword(pass);
    setErrorMsg('');
  };

  return (
    <div className="min-h-screen w-full bg-zinc-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Card */}
        <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm p-6 sm:p-7 space-y-6">
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="mx-auto w-12 h-12 rounded-xl bg-zinc-900 flex items-center justify-center text-orange-500 shadow-xs">
              <Store className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-zinc-900 tracking-tight">
                Kedai Rasa Kita
              </h1>
              <p className="text-xs text-zinc-500">
                Point of Sale System
              </p>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3.5">
            <Input
              label="Username"
              placeholder="e.g. admin or cashier"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
                if (errorMsg) setErrorMsg('');
              }}
              leftIcon={<User className="w-4 h-4" />}
              autoComplete="username"
              required
            />

            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (errorMsg) setErrorMsg('');
              }}
              leftIcon={<Lock className="w-4 h-4" />}
              autoComplete="current-password"
              required
            />

            {errorMsg && (
              <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <Button
              type="submit"
              variant="accent"
              fullWidth
              size="md"
              disabled={isLoading}
              icon={<ArrowRight className="w-4 h-4" />}
              iconPosition="right"
              className="mt-1"
            >
              {isLoading ? 'Signing In...' : 'Sign In'}
            </Button>
          </form>

          {/* Demo Quick Logins */}
          <div className="pt-4 border-t border-zinc-100 space-y-2">
            <p className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider text-center">
              Quick Demo Accounts
            </p>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleFillDemo('admin', 'admin123')}
                className="p-2.5 text-left rounded-lg border border-zinc-200 bg-zinc-50 hover:bg-zinc-100 hover:border-zinc-300 transition-colors cursor-pointer text-xs"
              >
                <span className="font-semibold text-zinc-900 block">Admin</span>
                <span className="text-[10px] text-zinc-500 font-mono">admin / admin123</span>
              </button>

              <button
                type="button"
                onClick={() => handleFillDemo('cashier', 'cashier123')}
                className="p-2.5 text-left rounded-lg border border-zinc-200 bg-zinc-50 hover:bg-zinc-100 hover:border-zinc-300 transition-colors cursor-pointer text-xs"
              >
                <span className="font-semibold text-zinc-900 block">Cashier</span>
                <span className="text-[10px] text-zinc-500 font-mono">cashier / cashier123</span>
              </button>
            </div>
          </div>
        </div>

        <p className="text-center text-[11px] text-zinc-400 mt-3">
          Kedai Rasa Kita &copy; {new Date().getFullYear()}
        </p>
      </div>
    </div>
  );
};
