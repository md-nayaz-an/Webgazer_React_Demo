import { useContext, useEffect, useState } from "react";
import "./calib.css";
import webgazerContext from "./webgazerContext";

function App() {

  const webgazer = useContext(webgazerContext);

  useEffect(() => {
    const resizeCanvas = () => {
      const canvas = document.getElementById('plotting_canvas');
      const context = canvas.getContext('2d');
      context.clearRect(0, 0, canvas.width, canvas.height);
      
      canvas.width = window.innerWidth - 20;
      canvas.height = window.innerHeight - 20;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);

  const [points, setPoints] = useState(false);
  
  useEffect(() => {
    async function startGaze() {
      // webgazer.params.storingPoints = false;
      await webgazer
        .setRegression("ridge")
        .setGazeListener((data, clock) => {
          if (data) {
            if (0 < data.x && data.x < window.innerWidth && 0 < data.y && data.y < window.innerHeight ){ 
                setPoints(true);
                //console.log(points, data.x, screen[0], data.y, screen[1]);
            } else { 
              setPoints(false);
            }
            
          } else { 
            setPoints(false);
          }
          
        })
        .saveDataAcrossSessions(true)
        .addMouseEventListeners()
        .showVideo(false)
        //.begin();
        
    }

    if(webgazer !== null)
      startGaze();
    return () => {
      window.addEventListener("beforeunload", () => {
        if(webgazer !== null)
          webgazer.end();
      });
    };
  }, [webgazer]);

  useEffect(() => {
    setActiveButtonIndex(generateRandomIndex());
  }, []);
  

  // Fisher-Yates shuffle algorithm
  function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  const rows = 5; // Number of rows
  const buttonsInRow = [3, 2, 3, 2, 3]; // Number of buttons in each row
  const clickLimit = 1; // Click limit to disable buttons

  const [numbers] = useState(shuffleArray(Array.from({ length: 13 }, (_, index) => index)));
  const [shuffleIndex, setShuffleIndex] = useState(0);

  const [clicksArray, setClicksArray] = useState(Array(13).fill(0));
  const [activeButtonIndex, setActiveButtonIndex] = useState(-1);


  // Function to generate a random index for the next active button
  const generateRandomIndex = () => {
    if(shuffleIndex >= 13)
      return -1;

    let num = numbers[shuffleIndex];
    setShuffleIndex(shuffleIndex + 1);

    console.log(num);
    return num;
  };
  
  
  const handleButtonClick = (buttonIndex) => {
    const newClicksArray = [...clicksArray];
    newClicksArray[buttonIndex] += 1;
    setClicksArray(newClicksArray);

    // Check if the click limit is reached for the clicked button
    if (newClicksArray[buttonIndex] >= clickLimit) {
      setActiveButtonIndex(generateRandomIndex());
    }
  
    // Check if all buttons have reached the click limit
    if (newClicksArray.every((clicks) => clicks >= clickLimit)) {
      console.log('All buttons completed');
      setActiveButtonIndex(-1);
    }
  };

  const calculateButtonIndex = (rowIndex, buttonInRow) => {
    let index = 0;
    for (let i = 0; i < rowIndex; i++) {
      index += buttonsInRow[i];
    }
    index += buttonInRow;
    return index;
  };

  const renderButtons = () => {
    return Array.from({ length: rows }, (_, rowIndex) => (
      <div key={rowIndex}>
        {Array.from({ length: buttonsInRow[rowIndex] }, (_, buttonInRow) => {
          const buttonIndex = calculateButtonIndex(rowIndex, buttonInRow);
          return (
            <button
              key={buttonInRow}
              title="calibration_buttons"
              onClick={() => handleButtonClick(buttonIndex)}
              disabled={points === false && activeButtonIndex !== null && activeButtonIndex !== buttonIndex}
              className={`button ${points !== false && activeButtonIndex !== null && activeButtonIndex === buttonIndex ? 'active' : ''} ${clicksArray[buttonIndex] >= clickLimit ? 'completed' : ''}`}
            ></button>
          );
        })}
      </div>
    ));
  };

  return (
    <>
      <canvas id="plotting_canvas" width="500" height="500" ></canvas>
      <div
        className="calib_canvas"
      >
        {renderButtons()}
      </div>
    </>
  );
}

export default App;
