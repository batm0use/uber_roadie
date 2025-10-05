import React, { useState, useRef, useEffect } from 'react'
import api from './../api'
import PropTypes from 'prop-types'

/**
 * Assistant chat component.
 * Handles composing messages, sending them to the assistant API, and rendering replies.
 * @returns {JSX.Element}
 */
export default function Assistant({ extraContent, extraContentRides }){
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(false)
  const scrollRef = useRef(null)
  const lastRef = useRef(null)

  // helper to add message
  function pushMessage(role, text){
    const id = `${Date.now()}-${Math.random().toString(36).slice(2,9)}`
    setMessages(prev => [...prev, { id, role, text }])
    if (role === "assistant")
      api.playTTS(text).then();
  }
  // scroll to bottom when messages update
  useEffect(() => {
    const last = lastRef.current
    if(last){
      last.scrollIntoView({ behavior: 'smooth', block: 'end' })
    } else if (scrollRef.current){
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  async function send(){
    const trimmed = input.replace(/\n+$/,'')
    if(!trimmed.trim()) return
    setLoading(true)
    pushMessage('user', input)
    setInput('')
    try{
      const resp = await api.sendMessageToAssistant(input)
      // backend may return either a string or an object like { response: '...' }
      let replyText = 'ok'
      if (resp) {
        if (typeof resp === 'string') replyText = resp
        else if (typeof resp === 'object') replyText = resp.response ?? resp.reply ?? resp.message ?? JSON.stringify(resp)
        else replyText = String(resp)
      }
      pushMessage('assistant', replyText)
    }catch(e){
      pushMessage('assistant', 'Error sending message')
      console.error(e)
    }finally{
      setLoading(false)
    }
  }

  // handle Enter (send) and Shift+Enter (newline)
  function handleKeyDown(e){
    if(e.key === 'Enter' && !e.shiftKey){
      e.preventDefault()
      send()
    }
  }

  return (
    <div className="assistant">
      <div className="messages" ref={scrollRef}>
        {messages.map((m, idx) => (
          <div key={m.id} className={`msg ${m.role}`} ref={idx === messages.length - 1 ? lastRef : null}>
            <div className="msg-text">{m.text}</div>
          </div>
        ))}

        {/* Render any externally injected content (e.g., carousel) as part of the chat */}
        {extraContent}
        {extraContentRides}
      </div>

      <div className="compose">
        <textarea
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask the assistant..."
          rows={3}
        />
        <div className="compose-actions">
          <button onClick={send} disabled={loading}>{loading ? '...' : 'Send'}</button>
        </div>
      </div>
    </div>
  )

}

Assistant.propTypes = {
  extraContent: PropTypes.node,
}

Assistant.defaultProps = {
  extraContent: null,
}
