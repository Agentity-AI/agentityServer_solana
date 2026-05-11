
function Activity({title, description, time, state}) {
  return (
    <div className="h-15 py-2 px-4 border border-[#271c1c] rounded-lg w-[98%] mx-auto
     bg-[#1b1717] flex justify-between">
        <div className={`mt-4 p-1 -mr-80 rounded-full w-1 h-1 ${state === "warning" ? "bg-[#ffaa01]" : state === "info" ? "bg-[#06ff38]" : "bg-[#ff3007]"}`}></div>
      <div className="">
        <h3 className="font-medium text-[#f3eded]">{title}</h3>
        <p className="text-sm text-[#888383]">{description}</p>
      </div>
      <div className="flex mt-2">
        <div className={` flex justify-center rounded-2xl h-7 w-25 px-4 mr-4 ${state === "warning" ? "bg-[#3b2d0f]" : state === "info" ? "bg-[#0f2715]" : "bg-[#2c1f1d]"}`}>
      <div className={`text-sm  mt-1  ${state === "warning" ? "text-[#eda616]" : state === "info" ? "text-[#0b8a24]" : "text-[#e14020]"}`}>
          {state}
        </div></div>
      <p className="text-xs text-[#615e5e] mt-1">{time}</p>
      </div>
    </div>
  )
}

export default Activity