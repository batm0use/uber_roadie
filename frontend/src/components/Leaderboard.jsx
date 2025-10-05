import React from 'react'
import PropTypes from 'prop-types'

/**
 * Leaderboard component.
 * Renders either a summary (percentile + remaining) if `summary` is provided,
 * otherwise renders a list of leaderboard `items`.
 * @param {{items: Array<{id:number,name:string,score:number}>, summary: {remaining:number,percentile:number}}} props
 * @returns {JSX.Element}
 */
export default function Leaderboard({ items, summary }) {
  if (summary) {
    const { remaining, percentile } = summary
    return (
      <div className="leaderboard-summary">
        <p>You are better than <strong>{percentile}%</strong> of users.</p>
        <p>You have <strong>{remaining}</strong> trips remaining to get a bonus.</p>
      </div>
    )
  }

  const list = Array.isArray(items) ? items : []
  return (
    <div className="leaderboard-list">
      <h3>Top drivers</h3>
      <ol>
        {list.map(it => (
          <li key={it.id}>{it.name} — <strong>{it.score}</strong></li>
        ))}
      </ol>
    </div>
  )
}

Leaderboard.propTypes = {
  items: PropTypes.arrayOf(PropTypes.shape({ id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]), name: PropTypes.string, score: PropTypes.oneOfType([PropTypes.number, PropTypes.string]) })),
  summary: PropTypes.shape({ remaining: PropTypes.number, percentile: PropTypes.number }),
}


