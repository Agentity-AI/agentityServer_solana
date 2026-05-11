import { useState } from "react";
import { X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Loading } from "../loading/Loading";
import { authentication } from "../../store/zustant/useZustandHook";

function AuthDialog({ mode, onClose }) {
  const isRegister = mode === "register";
  const navigate = useNavigate();
  const { loginUser, registerUser, loading } = authentication();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const handleChange = (field) => (event) => {
    setForm((prev) => ({
      ...prev,
      [field]: event.target.value,
    }));
  };

  async function handleSubmit(event) {
    event.preventDefault();

    const payload = {
      email: form.email.trim().toLowerCase(),
      password: form.password,
      ...(isRegister ? { name: form.name.trim() } : {}),
    };

    const ok = isRegister
      ? await registerUser(payload)
      : await loginUser(payload);

    if (ok) {
      onClose?.();
      navigate("/dashboard");
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
      <div className="w-full max-w-md rounded-lg border border-white/10 bg-[#0f0f0f] p-6 shadow-2xl">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-white">
              {isRegister ? "Create account" : "Log in"}
            </h2>
            <p className="text-sm text-gray-400">
              {isRegister ? "Start your Agentity workspace." : "Welcome back."}
            </p>
          </div>

          <button
            type="button"
            className="rounded-full p-2 text-gray-400 hover:bg-white/10 hover:text-white"
            onClick={onClose}
            aria-label="Close authentication dialog"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          {isRegister && (
            <label className="block text-sm text-gray-300">
              <span className="mb-1 block">Name</span>
              <input
                className="w-full rounded-md border border-white/10 bg-black/40 px-3 py-2 text-white outline-none focus:border-[#14f195]"
                value={form.name}
                onChange={handleChange("name")}
                minLength={2}
                required
              />
            </label>
          )}

          <label className="block text-sm text-gray-300">
            <span className="mb-1 block">Email</span>
            <input
              className="w-full rounded-md border border-white/10 bg-black/40 px-3 py-2 text-white outline-none focus:border-[#14f195]"
              type="email"
              value={form.email}
              onChange={handleChange("email")}
              required
            />
          </label>

          <label className="block text-sm text-gray-300">
            <span className="mb-1 block">Password</span>
            <input
              className="w-full rounded-md border border-white/10 bg-black/40 px-3 py-2 text-white outline-none focus:border-[#14f195]"
              type="password"
              value={form.password}
              onChange={handleChange("password")}
              minLength={6}
              required
            />
          </label>

          <button
            type="submit"
            className="flex w-full items-center justify-center rounded-md bg-[#14f195] px-4 py-2 font-semibold text-[#05110c] hover:bg-[#35f7a6] disabled:cursor-not-allowed disabled:opacity-70"
            disabled={loading}
          >
            {loading ? <Loading /> : isRegister ? "Create account" : "Log in"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default AuthDialog;
