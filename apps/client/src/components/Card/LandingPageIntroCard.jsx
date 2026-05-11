function LandingPageIntroCard({ title, description }) {
  return (
    <div className="bg-[#0f0f0f] p-6 rounded-lg shadow-lg w-[15em]">
      <h2 className="mx-auto text-xl font-bold text-white">{title}</h2>
      <p className="mx-auto text-gray-300 mt-2">{description}</p>
    </div>
  )
}

export default LandingPageIntroCard