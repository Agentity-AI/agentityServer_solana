function Modal({ open, onClose, children }) {
  if (!open) return null;

  return (
    <div
      className="absolute inset-0 z-1 flex justify-center -mb-60 bg-[#0f0f0f]/60 "
      onClick={onClose}           // close when clicking backdrop
    >
      <div
        className="bg-base-200  rounded-xl shadow-2xl w-full h-full max-w-[40rem] p-6 "
        onClick={(e) => e.stopPropagation()}  // prevent closing when clicking inside
      >
        {children}
      </div>
    </div>
  );
}

export default Modal;
