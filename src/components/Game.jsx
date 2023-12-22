import {React, useState, useEffect} from 'react';
import GameCode from './GameCode'
import axios from 'axios'
import xImage from '../assets/x-tic-tac-toe.png';
import ResultModal from './ResultModal'
import pusher from 'pusher-js'

function Game(props) {
  const token = localStorage.getItem('authToken');
  const [joining, setJoining] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [gameData, setGameData] = useState(null);
  const [creatingGame, setCreatingGame] = useState(false);
  const [finalMessage, setFinalMessage] = useState(null);
  const pusher = new Pusher('e14e4a96349c6d630001', {
    cluster: 'us2',
    encrypted: true,
  });
  
  useEffect(() => {
    getCurrentGame()
    //pusher.disconnect()
  },[])

  const renderSquare = (index) => {
    let symbol = ''
    if(gameData && gameData.game.player_1_moves.includes(index)) {
      symbol = <img className="h-[80px] w-[80px]" src={xImage} alt='X'></img>
    }else if(gameData && gameData.game.player_2_moves.includes(index)) {
      symbol = <div className="h-[85px] w-[85px] bg-green-500 rounded-full flex items-center justify-center"><div className="h-[55px] w-[55px] bg-gray-800 rounded-full"></div></div>
    }
    return (
      <button
        onClick={() => makeMove(index)}
        className="p-[10px] text-white w-[150px] h-[150px] flex items-center justify-center"
        key={index}
      >
        {symbol}
      </button>
    );
  };

  const getCurrentGame = async () => {
    const response = await axios.get(`http://127.0.0.1:8000/api/current-game/?id=${props.currentUser.id}`);

    if(response.data.gameData) {
      const channel = pusher.subscribe(`game_${response.data.gameData.game.id}`);
      setGameData(response.data.gameData)
      setPlaying(true)
      channel.bind('player.moved', (data) => { 
        setGameData(prevGameData => ({
          ...prevGameData,
          game: {
            ...data.game
          },
        }));
      })
      channel.bind('game.over', (data) => {
        if(data.finalResults.tie) {
          setFinalMessage('Tie!')
          console.log('tie')
        }else if(props.currentUser.id == data.finalResults.winner.id){
          setFinalMessage('You Win!')
        }else{
          setFinalMessage('You Lose!')
        }
        channel.unsubscribe()
      })
    }else {
      console.log(response.data)
    }
  };

  const sendMoveToDatabase = async (index) => {
    const response = await axios.post('http://127.0.0.1:8000/api/make-move/', {
        index: index,
        id: gameData.game.id
        }, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Token ${token}`,
        },
    })
  }

  const makeMove = async (index) => {
    if(playing){
      if(props.currentUser.id == gameData.game.player_1_id && !gameData.game.player_2_moves.includes(index) && !gameData.game.player_1_moves.includes(index) && gameData.game.turn == 1) {
        sendMoveToDatabase(index)
      }else if(props.currentUser.id == gameData.game.player_2_id && !gameData.game.player_2_moves.includes(index) && !gameData.game.player_1_moves.includes(index) && gameData.game.turn  == 2) { 
        sendMoveToDatabase(index)
      }else{
        console.log('Invalid Move')
      }
    }
  }

  const joinGame = async (e) => {
    e.preventDefault()
    setJoining(true);
    const gameCode = e.target.gameCode.value
    try{
      const response = await axios.post('http://127.0.0.1:8000/api/join-game/', {
        code: gameCode
        }, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Token ${token}`,
            },
      });
      setJoining(false);
      getCurrentGame()
    } catch (err) {
      console.error(err);
    }
  }

  const leaveGame = async () => {
    setPlaying(false);
    const response = await axios.post('http://127.0.0.1:8000/api/end-game/', {
      id: gameData.game.id
    });
    setGameData(null)
    pusher.unsubscribe(`game_${gameData.game.id}`)
  }

  const startGame = async () => {
    if(creatingGame) {
      setCreatingGame(false)
    }
    try {
      const response = await axios.post('http://127.0.0.1:8000/api/start-game/', null, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${token}`,
        },
      });
      setCreatingGame(true);
      setGameData(response.data)

      const channel = pusher.subscribe(`game_${response.data.game.id}`);
      channel.bind('player.joined', (data) => {
        channel.unbind('player.joined')
        setCreatingGame(false)
        getCurrentGame()
        console.log('Player joined');
      });
      
    } catch (error) {
      console.error(error);
    }
  };
  
  return (
    <>
      <div>
        {creatingGame && gameData &&
          <GameCode gameData={gameData} leaveGame={leaveGame}/>
        }
      </div>
      <div>
        {finalMessage &&
          <ResultModal finalMessage={finalMessage}/>
        }
      </div>

      <div className=" relative w-full flex justify-center">
        <div>
          {!playing && (
            <>
              <form className="flex 1 absolute right-0 gap-x-2" onSubmit={joinGame}>
                <input name="gameCode" placeholder="Game Code..." className="py-1 px-3 rounded border border-gray-500 text-white bg-gray-800 focus:outline-none focus:ring-0"></input>
                <div className="flex 1 right-0">
                  {!joining && (
                    <button
                      type="submit"
                      className="bg-indigo-500 text-gray-100 py-1 px-3 hover:bg-indigo-400 hover:text-white rounded"
                      disabled={joining}
                    >
                      Join
                    </button>
                  )}{joining && (
                    <svg aria-hidden="true" className="w-8 h-8 text-gray-200 animate-spin dark:text-gray-600 fill-indigo-600" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/>
                      <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill"/>
                    </svg>
                  )}
                </div>
              </form>
              <button onClick={startGame} className="flex 1 absolute left-0 bg-indigo-500 text-gray-100 py-1 px-3 hover:bg-indigo-400 hover:text-white rounded">Start Game</button>
            </>
          )}
        </div>
        <div>
          {playing && (
            <>
              <div className="flex 1 absolute left-0 text-xl text-white">{gameData.player1.username}</div>
              <div className="flex 1 absolute right-0 text-xl text-white">{gameData.player2.username}</div>
              <button onClick={leaveGame} className="absolute left-0 bottom-0 flex 1 bottom-0 bg-red-400 text-gray-100 py-1 px-3 hover:bg-red-500 hover:text-white rounded">Leave Game</button>
            </>
          )}
        </div>
          <div className="board">
            <div className="flex">
              <div className="border-r-8 border-b-8 border-indigo-400">{renderSquare(0)}</div>
              <div className="border-r-8 border-b-8 border-indigo-400">{renderSquare(1)}</div>
              <div className="border-b-8 border-indigo-400">{renderSquare(2)}</div>
            </div>
            <div className="flex">
              <div className="border-r-8 border-b-8 border-indigo-400">{renderSquare(3)}</div>
              <div className="border-r-8 border-b-8 border-indigo-400">{renderSquare(4)}</div>
              <div className="border-b-8 border-indigo-400">{renderSquare(5)}</div>
            </div>
            <div className="flex">
              <div className="border-r-8 border-indigo-400">{renderSquare(6)}</div>
              <div className="border-r-8 border-indigo-400">{renderSquare(7)}</div>
              <div>{renderSquare(8)}</div>
            </div>
          </div>
      </div>
        
      
    </>
  );
}

export default Game;
