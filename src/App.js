import React, { useState, useEffect } from 'react'
import logo from './logo.svg';
import './App.css';
import { listTalks as ListTalks } from './graphql/queries'
import { API, graphqlOperation } from 'aws-amplify'

//video: https://www.youtube.com/watch?v=HZUlQ7Z2xHQ
function App() {
  const [talks, setTalks] = useState([])

  useEffect(() => {
    getData()
  }, [])

  async function getData() {
    try {
      const talkData = await API.graphql(graphqlOperation(ListTalks))
      console.log('talkData:', talkData)
      setTalks(talkData.data.listTalks.items)
    } catch (error) {
      console.log('error fetching talks...', error)
    }
  }

  return (
    <div className="App">
      {
        talks.map((talk, index) => (
          <div>
            <h3>{talk.speakerName}</h3>
            <h5>{talk.name}</h5>
            <p>{talk.description}</p>
          </div>
        ))
      }
    </div>
  );
}

export default App;
