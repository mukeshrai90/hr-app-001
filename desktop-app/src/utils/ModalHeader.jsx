import React from 'react'

import CloseButton from 'react-bootstrap/CloseButton';

const ModalHeader = ({children  , onHide}) => {
  return (
    <div className="modal-header">{children}
    
    <CloseButton onClick={onHide}>

    </CloseButton>
    </div>
  )
}

export default ModalHeader