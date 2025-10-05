import React from 'react'
import PropTypes from 'prop-types'

/**
 * Notifications (toasts) list rendered in bottom-left.
 * @param {{items:Array<{id:string,title:string,message:string}>, onClose:Function}} props
 * @returns {JSX.Element}
 */
export default function Notifications({ items, onClose }){
  return (
    <div className="notifications-wrapper">
      {items.map(n => (
        <div key={n.id} className="notification">
          <button className="notification-close" onClick={() => onClose(n.id)}>×</button>
          <div className="notification-body">
            <div className="notification-title">{n.title}</div>
            <div className="notification-message">{n.message}</div>
          </div>
        </div>
      ))}
    </div>
  )
}

Notifications.propTypes = {
  items: PropTypes.arrayOf(PropTypes.shape({ id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]), title: PropTypes.string, message: PropTypes.string })),
  onClose: PropTypes.func.isRequired,
}

Notifications.defaultProps = {
  items: [],
}
