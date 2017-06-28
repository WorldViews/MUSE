let button = document.createElement('button');
button.textContent = 'CLICK TO BEGIN';
button.style.position = 'absolute';
button.style.left = 'calc(50% - 50px)';
button.style.bottom = '20px';
button.style.width = '100px';
button.style.border = '0';
button.style.padding = '8px';
button.style.cursor = 'pointer';
button.style.backgroundColor = '#000';
button.style.color = '#fff';
button.style.fontFamily = 'sans-serif';
button.style.fontSize = '13px';
button.style.fontStyle = 'normal';
button.style.textAlign = 'center';
button.style.zIndex = '999';

export default (pointerLockControls, ) => {
  function handlePointerLockChange(e) {
    pointerLockControls.enabled =
      !!(
        document.pointerLockElement ||
        document.mozPointerLockElement ||
        document.webkitPointerLockElement
      );

    if (!pointerLockControls.enabled) {
      button.style.display = 'inline';
    }
  }

  function handlePointerLockError(e) {
    console.log('error while requesting pointer lock');
  }

  document.addEventListener('pointerlockchange', handlePointerLockChange);
  document.addEventListener('mozpointerlockchange', handlePointerLockChange);
  document.addEventListener('webkitpointerlockchange', handlePointerLockChange);

  document.addEventListener('pointerlockerror', handlePointerLockError);
  document.addEventListener('mozpointerlockerror', handlePointerLockError);
  document.addEventListener('webkitpointerlockerror', handlePointerLockError);

  document.body.appendChild(button);

  button.addEventListener('click', e => {
    if (!pointerLockControls.enabled) {
      button.style.display = 'none';
      document.body.requestPointerLock();
    }
  });
};
