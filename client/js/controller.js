import {
  stepGameEngine,
  setMovement,
  startGame,
  deleteWall,
  wallArr,
  loadLevel,
  addWall,
} from './gameEngine.js';

import {
  initViewports,
  togglePauseMenu,
  displayLevelBrowser,
  displayLevelEditor,
  displayGameScreen,
  returnToMenu,
} from './view.js';


/**
 * This function runs after the page has loaded in the browser and initializsed the code.
 * it loads a default level and sets the game running to true so the game runs.
 */

async function init() {
  console.log('controller: init');
  addEventListeners();
  const firstPersonViewport = document.querySelector('#first-person-view');
  const topDownViewport = document.querySelector('#top-down-view');
  await loadSelectedLevel(1);
  initViewports(topDownViewport, firstPersonViewport);
  startGame(true);
}


/**
 * This function takes a click event and returns the coordinates of that click on the
 * canvas. It is used to draw walls in the level editor as the user clicks where they
 * would like the wall to start and finish.
 * @param {event} event The click event which triggered this function to be called
 * @returns {object} coords An object of the coordinates of the click on the canvas
 */

function getMousePosition(event) {
  const canvas = document.querySelector('#top-down-view');
  const rect = canvas.getBoundingClientRect(); // gets distance from window to canvas
  const scaleX = canvas.width / rect.width; // gets the scale difference
  const scaleY = canvas.height / rect.height;
  return {
    x: Math.floor((event.clientX - rect.left) * scaleX),
    y: Math.floor((event.clientY - rect.top) * scaleY),
  };
}

/**
 * This function is called when a click event is fired on the main view canvas and the
 * page is in the level editor. This funciton is the same one used for the start and end
 * coordinates of a wall. The function will check if this is the start or the end of a
 * wall with the dataset.point1 variable which will be not-set or set. If point1 == 'set'
 * the click will be processed as the second part of a wall and this wall will be pushed
 * to the current running level. The point1 will then be reset to 'not-set' so the next
 * wall can be drawn.
 * @param {event} event click event
 */

function getLineCoords(event) {
  const mousePosition = getMousePosition(event);
  const tdv = document.querySelector('#top-down-view');
  if (tdv.dataset.point1 === 'not-set' || tdv.dataset.point1 == null) {
    tdv.dataset.x1 = mousePosition.x;
    tdv.dataset.y1 = mousePosition.y;
    tdv.dataset.point1 = 'set';
  } else {
    tdv.dataset.x2 = mousePosition.x;
    tdv.dataset.y2 = mousePosition.y;
    addWall({
      x1: Number(tdv.dataset.x1),
      y1: Number(tdv.dataset.y1),
      x2: Number(tdv.dataset.x2),
      y2: Number(tdv.dataset.y2),
    });
    tdv.dataset.point1 = 'not-set';
  }
}

/**
 * This function loads all the levels from the server and returns them as an array.
 * @returns {Array} levels An array of all the levels in the database from the server.
 */

async function selectLevels() {
  let levels;
  try {
    levels = await fetch('/getLevel').then(res => res.json()).then(data => data);
  } catch (e) {
    levels = [{
      id: 1,
      level_data: [],
    }];
  }
  return levels;
}

/**
 * This function selects a level from an array based on the parameter id and loads that
 * level into the current running game state.
 * @param {number} id the id of the required level
 */

async function loadSelectedLevel(id) {
  const levels = await selectLevels();
  for (const level of levels) {
    if (level.id === id) {
      loadLevel(level.level_data);
      return;
    }
  }
}

/**
 * Function to the current save level by sending it to the server. The name of the level
 * will be input by the user via a window prompt. This function allows users to save
 * levels created in the level editor.
 */

async function sendLevel() {
  const levelName = prompt('Please enter level name!', 'some default name');
  const data = {
    levelname: levelName,
    data: JSON.stringify(wallArr()),
  };
  let response;
  try {
    response = await fetch('createLevel', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
  } catch (e) {
    response = 'Error, unable to contact database for post';
  }
  try {
    await response.json().then(() => {
      alert('Level ' + levelName + ' sent successfully!');
    }).catch(e => {
      console.log('controller: error sending level');
      alert('There was an error when sending level to the database! Error: ' + e);
    });
  } catch (e) {
    response += '\nError, unable to get message from database';
    return response;
  }
}

/**
  * parseInput handles click or keyup / keydown events and sends them to be processsed.
  * The event types are split to break up the size of the switch statements processing
  * the inputs.
  * @param {event} event the keyboard or mouse event.
  */

function parseInput(event) {
  if (event.type === 'keyup' || event.type === 'keydown') parseKeyboardInput(event);
  if (event.type === 'click') parseClick(event);
}

/**
 * Function to process click events. These can be on buttons or the canvas element in the
 * level editor.
 * @param {event} event a click event
 */

async function parseClick(event) {
  switch (event.target.id) {
    case 'to-level-editor':
      displayLevelEditor();
      break;
    case 'to-play-game':
      displayGameScreen();
      break;
    case 'browse-levels':
      displayLevelBrowser(await selectLevels());
      break;
    case 'delete-tool':
      deleteWall();
      break;
    case 'quit-button':
      displayGameScreen();
      break;
    case 'save-button':
      sendLevel();
      break;
    case 'top-down-view':
      getLineCoords(event);
      break;
    case 'menu-return':
      returnToMenu();
      break;
  }
  switch (event.target.className) {
    case 'level-browser-item':
      loadSelectedLevel(Number(event.target.dataset.id));
      stepGameEngine();
  }
}

/**
 * Function to process keyup or keydown events. In the current version of the game these
 * functions are limited to movement and pausing the game though more controls will be
 * added over the course of further development.
 * @param {event} event a keyup or keydown event
 */

function parseKeyboardInput(event) {
  let bool;
  if (event.type === 'keydown') bool = true;
  if (event.type === 'keyup') bool = false;
  switch (event.key) {
    case 'w':
      setMovement('forwards', bool);
      break;
    case 'a':
      setMovement('left', bool);
      break;
    case 's':
      setMovement('backwards', bool);
      break;
    case 'd':
      setMovement('right', bool);
      break;
    case 'p':
      if (event.type === 'keydown') {
        startGame('toggle');
        togglePauseMenu();
      }
      break;
  }
}

/**
 * This function adds the event listeners to the page required for the controller to parse
 * input from the user.
 */

function addEventListeners() {
  document.addEventListener('keydown', parseInput);
  document.addEventListener('keyup', parseInput);
  document.addEventListener('click', parseInput);
}

window.addEventListener('load', init);

export { parseInput };

// testing

export {
  init,
};
