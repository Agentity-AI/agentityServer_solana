function WorkComponent({id, title, description}) {
  return (
    <div className="p-4 border-none bg-[#0f0f0f] rounded-lg">
        <div className="w-8 h-8 rounded-full bg-[#202051] p-3 mb-2">
            <span className="text-white font-bold text-2xl">{id}</span>
        </div>
      <h3 className="text-xl font-bold">{title}</h3>
      <p className="mt-2 text-gray-600">{description}</p>
    </div>
  )
}

export default WorkComponent