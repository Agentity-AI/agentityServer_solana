function AlertCard({id,title,description,dataTime,severity}) {
  console.log("AlertCard Props:", {id,title,description,dataTime, severity});
  return (
    <div className={`card ${severity==="high"?"bg-[#41060e]":severity==="medium"?"bg-[#3b3f0633]":"bg-[#085f3333]"} border border-[#da6161] rounded-lg p-4 ${severity==="high"?"border-red-500":severity==="medium"?"border-yellow-500":"border-green-500"}`}>
    <div className="card-body">
      <h2 className="card-title">{title}</h2>
      <p>{description}</p>
      <p className="text-sm text-gray-400 mt-2">{dataTime}</p>
    </div>
  </div>
  )
}

export default AlertCard