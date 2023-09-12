import { useEffect, useState } from 'react';
import io from 'socket.io-client';
import axios from 'axios';

const socket = io.connect("http://localhost:5800");

function App() {
  const [quizDefaultSize, setQuizDefaultSize] = useState()
  const [quizzes, setQuizzes] = useState([]);
 
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [backgroundColor, setBackgroundColor] = useState("bg-black");
  const [activeCursor, setActiveCursor] = useState("");
  const [canStartTimer, setCanStartTimer] = useState(false);
  const [count, setCount] = useState(18);
  const [hidTimer, setHidTimer] = useState("hidden");

  const currentNumber = 0
  const quizStatus = () => {
    let statu
    if(quizzes.length == quizDefaultSize){
      statu = true
    } else if (quizzes.length == 1 ){
      statu = "finish"
    }
    else{
      statu = "continue"
    }
    return statu
  }

  const envoyer = () => {
    if (selectedQuiz == null) {
      alert("Veuillez choisir une question!");
    } else if(currentNumber !== selectedQuiz - 1) {
      alert("veuillez choisir dans l'ordre")
    } else{
      const quizPerId = quizzes[selectedQuiz - 1];
      socket.emit("send_message", { message: quizPerId, statu: quizStatus()});
      setCanStartTimer(true);
      setHidTimer("");
      setQuizzes(prevQuizzes => prevQuizzes.filter((quigz, index) => index !== selectedQuiz - 1));
    }
     
  };

  const disconnect = () => {
    socket.disconnect()()
    console.log("le socket est deconnecté")
  }

  const getQuizzes = async () => {
    try {
      const response = await axios.get("http://192.168.252.146:3000/api/quiz");
      setQuizzes(response.data);
      setQuizDefaultSize(response.data.length)
     
    } catch (e) {
      console.log(e);
    }
  };

  const wait = () => {
    const intervalId = setInterval(() => {
      setCount(current => --current);
    }, 1000);
    return intervalId;
  };

  useEffect(() => {
    getQuizzes();
  }, []);

  useEffect(() => {
    let intervalId;

    if (count === -1) {
      clearInterval(intervalId);
      setCanStartTimer(false);
      setCount(18);
      setHidTimer("hidden");
    }

    if (canStartTimer) {
      intervalId = wait();
    }
    if (count !== 18) {
      setActiveCursor("cursor-not-allowed pointer-events-none opacity-10");
    } else if (count === 18) {
      setActiveCursor("");
    }

    return () => {
      clearInterval(intervalId);
    };
  }, [canStartTimer, count]);

  return (
    <div className='flex justify-center h-screen  items-center bg-slate-100'>
      <div className='w-[30rem]'>
        <p className='font-bold text-orange-600'>Entrez un numéro de question </p>
        <div className='flex'>
          <select className='w-[50rem] p-2' onChange={(e) => setSelectedQuiz(e.target.selectedIndex)}>
            <option value={1}>Sélectionnez une question</option>
            {quizzes.map((quiz) => (
              <option key={quiz.id} className='text-orange-700'>
                {quiz.label}
              </option>
            ))}
          </select>
          <button className={`${backgroundColor} p-1 text-white px-5 h-9 rounded-md ml-10 ${activeCursor}`} onClick={envoyer}>Envoyer</button>
        </div>
      </div>

      <div className={`absolute top-[30rem] border p-3 w-10 h-10 rounded-full flex items-center justify-center bg-orange-600 text-white ${hidTimer}`}>
        {count}
      </div>
    </div>
  );
}

export default App;
