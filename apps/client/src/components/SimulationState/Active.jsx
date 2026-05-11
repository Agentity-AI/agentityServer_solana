import { Loader } from 'lucide-react'
function Active() {
  return (
    <div className='px-4 pt-2'>
        <h1 className='text-2xl font-bold mb-4'>Simulations Running</h1>
        <div className='flex gap-3'> <Loader className="w-6 h-6 text-[#0d59a5] animate-spin" />
         <span className='text-[#0d59a5]'>Executing Liquidity Pool simulation...</span></div>
        
    </div>
  )
}

export default Active