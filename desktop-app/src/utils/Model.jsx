import React from 'react'

const Model = ({children , show , onHide}) => {
  return (
    <>
    {show && <div className="model">
        
        <div className="model-container">
        {children}
        </div>
        </div>}
    </>
  )
}

export default Model