import React from 'react'
import PropTypes from 'prop-types'

/**
 * Carousel to display delivery options inside the chat area.
 * Styled to be the maximum reasonable width of the chat column.
 * @param {{items:Array, onSelect:Function, selectedId: (string|number)}} props
 */
export default function Carousel({ items, onSelect, selectedId }){
  if(!items || items.length === 0) return <div className="carousel-empty">No deliveries</div>

  return (
    <div className="carousel-wrapper">
      <div className="carousel-inner">
        {items.map(it => (
          <div key={it.id} className={`carousel-card ${selectedId === it.id ? 'selected' : ''}`}>
            <button className="carousel-card-btn" onClick={(e) => { e.stopPropagation(); onSelect(it) }}>
              <div className="carousel-card-header">
                <div className="carousel-name">{it.name}</div>
              </div>
              <div className="carousel-etas">
                <div className="eta">Food: <strong>{it.eta_food} min</strong></div>
                <div className="eta">Arrive: <strong>{it.eta_arrive} min</strong></div>
              </div>
              <div className="carousel-extra">{it.extra_info}</div>
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

Carousel.propTypes = {
  items: PropTypes.array,
  onSelect: PropTypes.func,
  selectedId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
}

Carousel.defaultProps = { items: [], onSelect: () => {}, selectedId: null }
