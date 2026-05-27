export default function VerifyEmailPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50 px-4">
      <div className="w-full max-w-sm text-center">
        <div className="inline-flex w-16 h-16 rounded-2xl bg-indigo-50 items-center justify-center mb-6 text-3xl">
          ✉️
        </div>
        <h1 className="text-2xl font-bold text-slate-900 mb-3">Check your email</h1>
        <p className="text-slate-500 text-sm leading-relaxed">
          We sent a verification link to your email address. Click it to activate your account.
          The link expires in 24 hours.
        </p>
        <p className="text-slate-400 text-xs mt-6">
          Didn&apos;t get it? Check your spam folder.
        </p>
      </div>
    </div>
  );
}
