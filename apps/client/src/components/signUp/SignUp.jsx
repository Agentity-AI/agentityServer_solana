import { useState } from "react";
import AuthDialog from "../auth/AuthDialog";

function SignUp() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="btn btn-ghost h-10 min-h-0 rounded-lg border-none bg-[#14f195] px-6 text-[#05110c] hover:bg-[#35f7a6]"
      >
        <span className="text-base font-semibold">Sign up</span>
      </button>
      {open && <AuthDialog mode="register" onClose={() => setOpen(false)} />}
    </>
  );
}

export default SignUp;
