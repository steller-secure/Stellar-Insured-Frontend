import React from 'react'

const Loading = () => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
      <div className='flex gap-4 items-center'>
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-white" />
        <h1>Loading Page...</h1>
      </div>
    </div>
  )
}

export default Loading
