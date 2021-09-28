import React, { useReducer, useEffect } from 'react'
import './App.css';
import { API, graphqlOperation } from 'aws-amplify'
import { v4 as uuid } from 'uuid'

import { listTalks as ListTalks } from './graphql/queries'
import { createTalk as CreateTalk } from './graphql/mutations'
import { onCreateTalk as OnCreateTalk } from './graphql/subscriptions'

//video: https://www.youtube.com/watch?v=HZUlQ7Z2xHQ

const CLIENT_ID = uuid()

const initialState = {
  name: '', description: '', speakerName: '', speakerBio: '', talks: []
}

function reducer(state, action) {
  switch (action.type) {
    case 'SET_TALKS':
      return { ...state, talks: action.talks }
    case 'SET_INPUT':
      return { ...state, [action.key]: action.value }
    case 'CLEAR_INPUT':
      return { ...initialState, talks: state.talks }
    case 'ADD_TALK':
      return { ...state, talks: [...state.talks, action.talk] }
    default:
      break;
  }
}

function App() {
  const [state, dispatch] = useReducer(reducer, initialState)

  useEffect(() => {
    getData()
    const subscription = API.graphql(graphqlOperation(OnCreateTalk)).subscribe({
      next: (eventData) => {
        const talk = eventData.value.data.onCreateTalk
        if (talk.clientId === CLIENT_ID) return
        dispatch({ type: 'ADD_TALK', talk })
      }
    })
    return () => subscription.unsubscribe()
  }, [])

  async function getData() {
    try {
      const talkData = await API.graphql(graphqlOperation(ListTalks))
      console.log('talkData:', talkData)
      dispatchEvent({ type: 'SET_TALKS', talks: talkData.data.listTalks.items })
    } catch (error) {
      console.log('error fetching talks...', error)
    }
  }

  async function createTalk() {
    const { name, description, speakerName, speakerBio } = state
    if (name === '' || description === '' || speakerBio === '' || speakerName === '') return

    const talk = { name, description, speakerBio, speakerName, clientId: CLIENT_ID }
    const talks = [...state.talks, talk]
    dispatch({ type: 'SET_TALKS', talks })
    dispatch({ type: 'CLEAR_INPUT' })

    try {
      await API.graphql(graphqlOperation(CreateTalk, { input: talk }))
      console.log('item created!')
    } catch (error) {
      console.log('error creating talk...', error)
    }
  }

  function onChange(e) {
    dispatch({ type: 'SET_INPUT', key: e.target.name, value: e.target.value })
  }
  return (
    <div className="App">
      <input type="text"
        name='name'
        onChange={onChange}
        value={state.name}
        placeholder='name'
      />
      <input type="text"
        name='description'
        onChange={onChange}
        value={state.description}
        placeholder='description'
      />
      <input type="text"
        name='speakerName'
        onChange={onChange}
        value={state.speakerName}
        placeholder='Speaker Name'
      />
      <input type="text"
        name='speakerBio'
        onChange={onChange}
        value={state.speakerBio}
        placeholder='speaker Bio'
      />

      <button onClick={createTalk} >Create Talk</button>
      <div>
        {
          state.talks.map((talk, index) => (
            <div key={index}>
              <h3>{talk.speakerName}</h3>
              <h5>{talk.name}</h5>
              <p>{talk.description}</p>
            </div>
          ))
        }
      </div>
    </div>
  );
}

export default App;
