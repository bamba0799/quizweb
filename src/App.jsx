import { useEffect, useState } from 'react';
import io from 'socket.io-client';
import axios from 'axios';

const socket = io.connect("http://192.168.252.91:7100");//socket connexion

function App() {
  const [quizId, setQuizId] = useState(1)
  const [quizStatu, setQuizStatu] = useState(false)
  console.log("est-il fini?",quizStatu)

  const [i, setI] = useState(0)
  const begin = () => {
    setI(0)
  }

  const getQuizzes = async () => {
    let numberOfquestion
    // l'id du quiz est l'id de celui le plus recent
    try {
      const respon = await axios.get(`http://192.168.252.91:3100/api/quiz/${quizId}?fields=questions,responses`);
      console.log("jjjdshfdhhjsd",respon.data)
      numberOfquestion = respon.data.questions.length
      console.log("le numberOfquestion", numberOfquestion, "le i ", i)

      if(i < numberOfquestion){
        socket.emit("send_message", {question:respon.data.questions[i],quizId,statu:"admin", toUsers:"clients", numberOfquestion, rankOfQuestion:i, finish: i + 1 == numberOfquestion ? true : false})
      }
      else{
        setQuizStatu(true)
      }
         
    } catch (e) {
      console.log("errer",e);
    }
  };

  function sendQuiz(question){
    socket.emit("send_message", {question:question, statu:"admin", toUsers:"clients"})
  }

  useEffect(() => {
      getQuizzes()
      const id = setTimeout(() => {
        setI((current) => ++current)
      },18000)
    return () => clearTimeout(id)
  }, [i]);
 

  useEffect(() => {
     socket.on('receive_message', (msg) => {
      console.log("jbfhbhwbxchn",msg)

    });
  }, [])

  // if (allQuiz == null) {
  //   return null
  // }

  return (
   <div >
    {/* <div className='p-20'>
      {<div>{allQuiz.label}</div>}
     {
       allQuiz.questions.map((q)=> (
        <button key={q.id} onClick={() => {sendQuiz(q)}} className='block justify-center items-center w-full bg-orange-700 mt-7 py-10 font-bold text-2xl '>
          <div className='text-white'>{q.label} {q.length}</div> 
        </button>
      ))
    }
    </div> */}
    <div className='flex items-center gf h-screen justify-center'>
      <button onClick={() => begin()} className=' text-white bg-black w-60 h-10 '>Commencer</button>
    </div>
   </div>
  );
}

export default App;
